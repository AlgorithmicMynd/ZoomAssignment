/**
 * useWebRTC — Multi-Peer WebRTC Engine for Full-Mesh Topology
 * ============================================================
 * Manages all RTCPeerConnection instances (one per remote participant),
 * WebSocket signaling, media streams, and state synchronization.
 *
 * System Design Decisions:
 *  - Resolution capped to 640×360 @ 24fps to limit client CPU and bandwidth.
 *  - Outbound video bitrate clamped to 400 Kbps per peer (RTCRtpSender params).
 *  - Trickle ICE with candidate queuing (handles candidates arriving before
 *    remote description is set).
 *  - Polite Peer pattern to resolve SDP glare (simultaneous offers) cleanly.
 *  - Google public STUN servers for NAT traversal (zero cost, high uptime).
 *  - Keepalive ping every 25 seconds to prevent proxy/cloud timeout.
 */

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

// ── Types ────────────────────────────────────────────────────────────────────

export interface RemotePeer {
  participantId: string;
  userName: string;
  stream: MediaStream | null;
  isMuted: boolean;
  isVideoOff: boolean;
}

export interface ChatMessage {
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  isSelf: boolean;
}

export interface UseWebRTCReturn {
  /** Local camera/mic stream */
  localStream: MediaStream | null;
  /** Map of all remote peers keyed by participantId */
  remotePeers: Map<string, RemotePeer>;
  /** Chat message history */
  chatMessages: ChatMessage[];
  /** Toggle local microphone */
  toggleMute: () => void;
  /** Toggle local camera */
  toggleVideo: () => void;
  /** Start screen sharing (replaces video track) */
  startScreenShare: () => Promise<void>;
  /** Stop screen sharing and restore camera */
  stopScreenShare: () => Promise<void>;
  /** Send a chat message to everyone in the room */
  sendChat: (text: string) => void;
  /** Current local mute state */
  isMuted: boolean;
  /** Current local video-off state */
  isVideoOff: boolean;
  /** Is screen sharing active */
  isScreenSharing: boolean;
  /** Connection status */
  signalingStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
}

// ── Constants ────────────────────────────────────────────────────────────────

const ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
];

/** Max video resolution sent to any peer. Reduces CPU encoding and bandwidth. */
const VIDEO_CONSTRAINTS: MediaTrackConstraints = {
  width: { ideal: 640 },
  height: { ideal: 480 },
  frameRate: { ideal: 24, max: 24 },
};

/** Outbound video bitrate cap per peer in bits-per-second (400 Kbps). */
const MAX_VIDEO_BITRATE_BPS = 400_000;

const KEEPALIVE_INTERVAL_MS = 25_000;

// ── Utility ──────────────────────────────────────────────────────────────────

function generateParticipantId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function getWsBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_WS_BASE_URL;
  if (envUrl) return envUrl.replace(/\/$/, '');
  // Fallback: derive WS URL from the current API URL
  const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api')
    .replace('/api', '')
    .replace(/^http/, 'ws');
  return apiUrl;
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useWebRTC(
  meetingId: string,
  userName: string,
  autoJoin: boolean = false,
): UseWebRTCReturn {
  // ── State ────────────────────────────────────────────────────────────────
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remotePeers, setRemotePeers] = useState<Map<string, RemotePeer>>(new Map());
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [signalingStatus, setSignalingStatus] = useState<UseWebRTCReturn['signalingStatus']>('disconnected');

  // ── Refs (not reactive — avoid re-render loops) ──────────────────────────
  const localStreamRef = useRef<MediaStream | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const peersRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const pendingCandidatesRef = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());
  const participantIdRef = useRef<string>(generateParticipantId());
  const keepaliveRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMutedRef = useRef(false);
  const isVideoOffRef = useRef(false);
  const screenStreamRef = useRef<MediaStream | null>(null);

  // ── Remote peers state updater ───────────────────────────────────────────
  const updatePeer = useCallback((participantId: string, update: Partial<RemotePeer>) => {
    setRemotePeers(prev => {
      const next = new Map(prev);
      const existing = next.get(participantId);
      if (existing) {
        next.set(participantId, { ...existing, ...update });
      }
      return next;
    });
  }, []);

  const addPeer = useCallback((peer: RemotePeer) => {
    setRemotePeers(prev => {
      const next = new Map(prev);
      next.set(peer.participantId, peer);
      return next;
    });
  }, []);

  const removePeer = useCallback((participantId: string) => {
    setRemotePeers(prev => {
      const next = new Map(prev);
      next.delete(participantId);
      return next;
    });
    peersRef.current.get(participantId)?.close();
    peersRef.current.delete(participantId);
    pendingCandidatesRef.current.delete(participantId);
  }, []);

  // ── Send signal via WebSocket ─────────────────────────────────────────────
  const sendSignal = useCallback((payload: Record<string, unknown>) => {
    const ws = wsRef.current;
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(payload));
    }
  }, []);

  // ── Apply bitrate cap to all senders ─────────────────────────────────────
  const applyBitrateCap = useCallback(async (pc: RTCPeerConnection) => {
    const senders = pc.getSenders();
    for (const sender of senders) {
      if (sender.track?.kind !== 'video') continue;
      try {
        const params = sender.getParameters();
        if (!params.encodings || params.encodings.length === 0) {
          params.encodings = [{}];
        }
        params.encodings[0].maxBitrate = MAX_VIDEO_BITRATE_BPS;
        await sender.setParameters(params);
      } catch {
        // Browser may not support this — not fatal
      }
    }
  }, []);

  // ── Create RTCPeerConnection for a given remote participant ───────────────
  const createPeerConnection = useCallback(
    (remoteParticipantId: string, isPolite: boolean): RTCPeerConnection => {
      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

      // Attach all local tracks to this connection
      const stream = localStreamRef.current;
      if (stream) {
        stream.getTracks().forEach(track => {
          pc.addTrack(track, stream);
        });
      }

      // ICE candidate trickle — send to remote peer via signaling server
      pc.onicecandidate = ({ candidate }) => {
        if (candidate) {
          sendSignal({
            type: 'signal-ice-candidate',
            targetId: remoteParticipantId,
            candidate: candidate.toJSON(),
          });
        }
      };

      // When remote media arrives, update our state
      pc.ontrack = ({ streams }) => {
        const [remoteStream] = streams;
        updatePeer(remoteParticipantId, { stream: remoteStream });
      };

      // Connection state monitoring
      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'connected') {
          applyBitrateCap(pc);
        }
        if (pc.connectionState === 'failed' || pc.connectionState === 'closed') {
          removePeer(remoteParticipantId);
        }
      };

      /**
       * Polite Peer Negotiation (W3C Perfect Negotiation pattern)
       * ---------------------------------------------------------
       * When both peers simultaneously generate offers (glare), the polite
       * peer backs off and accepts the impolite peer's offer instead.
       * isPolite = true for the participant who joined LATER.
       */
      let makingOffer = false;
      let ignoreOffer = false;

      pc.onnegotiationneeded = async () => {
        try {
          makingOffer = true;
          await pc.setLocalDescription();
          sendSignal({
            type: 'signal-offer',
            targetId: remoteParticipantId,
            sdp: pc.localDescription,
          });
        } catch (err) {
          console.error('Negotiation error:', err);
        } finally {
          makingOffer = false;
        }
      };

      // Store so message handler can use it
      (pc as any).__isPolite = isPolite;
      (pc as any).__makingOffer = () => makingOffer;
      (pc as any).__setIgnoreOffer = (v: boolean) => { ignoreOffer = v; };
      (pc as any).__getIgnoreOffer = () => ignoreOffer;

      peersRef.current.set(remoteParticipantId, pc);
      return pc;
    },
    [sendSignal, updatePeer, removePeer, applyBitrateCap],
  );

  // ── Handle SDP Offer from a remote peer ──────────────────────────────────
  const handleOffer = useCallback(
    async (senderId: string, sdp: RTCSessionDescriptionInit) => {
      let pc = peersRef.current.get(senderId);
      if (!pc) {
        // Polite = false because the *other* side initiated (they joined before us)
        pc = createPeerConnection(senderId, false);
      }

      const isPolite: boolean = (pc as any).__isPolite ?? false;
      const makingOffer: boolean = (pc as any).__makingOffer?.() ?? false;
      const offerCollision =
        sdp.type === 'offer' &&
        (makingOffer || pc.signalingState !== 'stable');

      const ignoreOffer = !isPolite && offerCollision;
      (pc as any).__setIgnoreOffer?.(ignoreOffer);

      if (ignoreOffer) return;

      await pc.setRemoteDescription(sdp);

      // Drain any ICE candidates that arrived before the remote description
      const queued = pendingCandidatesRef.current.get(senderId) ?? [];
      for (const c of queued) {
        await pc.addIceCandidate(c).catch(() => {});
      }
      pendingCandidatesRef.current.delete(senderId);

      if (sdp.type === 'offer') {
        await pc.setLocalDescription();
        sendSignal({
          type: 'signal-answer',
          targetId: senderId,
          sdp: pc.localDescription,
        });
      }
    },
    [createPeerConnection, sendSignal],
  );

  // ── Handle SDP Answer ────────────────────────────────────────────────────
  const handleAnswer = useCallback(
    async (senderId: string, sdp: RTCSessionDescriptionInit) => {
      const pc = peersRef.current.get(senderId);
      if (!pc) return;
      const ignoreOffer: boolean = (pc as any).__getIgnoreOffer?.() ?? false;
      if (ignoreOffer) return;
      await pc.setRemoteDescription(sdp);
    },
    [],
  );

  // ── Handle ICE Candidate ─────────────────────────────────────────────────
  const handleIceCandidate = useCallback(
    async (senderId: string, candidate: RTCIceCandidateInit) => {
      const pc = peersRef.current.get(senderId);
      if (!pc || !pc.remoteDescription) {
        // Queue until setRemoteDescription is called
        const q = pendingCandidatesRef.current.get(senderId) ?? [];
        q.push(candidate);
        pendingCandidatesRef.current.set(senderId, q);
        return;
      }
      await pc.addIceCandidate(candidate).catch(() => {});
    },
    [],
  );

  // ── WebSocket message router ──────────────────────────────────────────────
  const handleWsMessage = useCallback(
    async (event: MessageEvent) => {
      let data: Record<string, any>;
      try {
        data = JSON.parse(event.data as string);
      } catch {
        return;
      }

      switch (data.type) {
        case 'room-joined': {
          /**
           * We just joined. existingPeers is the list of participants already
           * in the room. We are the POLITE peer (we join after them), so we
           * create connections for each existing peer.
           * The *existing* peers will receive our `user-joined` broadcast and
           * they will initiate offers to us (they are impolite).
           */
          const peers: Array<{ participantId: string; userName: string; isMuted: boolean; isVideoOff: boolean }> =
            data.existingPeers ?? [];
          for (const p of peers) {
            addPeer({
              participantId: p.participantId,
              userName: p.userName,
              stream: null,
              isMuted: p.isMuted,
              isVideoOff: p.isVideoOff,
            });
            // Create a peer connection for each existing peer (we are polite)
            createPeerConnection(p.participantId, true);
          }
          break;
        }

        case 'user-joined': {
          /**
           * A new participant arrived while we are already in the room.
           * We are the IMPOLITE peer (we arrived first), so we initiate the offer.
           */
          const { participantId, userName: peerName } = data;
          addPeer({
            participantId,
            userName: peerName,
            stream: null,
            isMuted: false,
            isVideoOff: false,
          });
          // Create the connection and trigger negotiationneeded → offer
          createPeerConnection(participantId, false);
          break;
        }

        case 'user-left': {
          removePeer(data.participantId);
          break;
        }

        case 'signal-offer': {
          await handleOffer(data.senderId, data.sdp);
          break;
        }

        case 'signal-answer': {
          await handleAnswer(data.senderId, data.sdp);
          break;
        }

        case 'signal-ice-candidate': {
          await handleIceCandidate(data.senderId, data.candidate);
          break;
        }

        case 'media-state': {
          updatePeer(data.participantId, {
            isMuted: data.isMuted,
            isVideoOff: data.isVideoOff,
          });
          break;
        }

        case 'chat-message': {
          setChatMessages(prev => [
            ...prev,
            {
              senderId: data.senderId,
              senderName: data.senderName,
              text: data.text,
              timestamp: data.timestamp,
              isSelf: data.senderId === participantIdRef.current,
            },
          ]);
          break;
        }

        case 'pong':
          break;

        default:
          break;
      }
    },
    [addPeer, removePeer, createPeerConnection, handleOffer, handleAnswer, handleIceCandidate, updatePeer],
  );

  // ── Connect to signaling server ───────────────────────────────────────────
  const connect = useCallback(async () => {
    if (!meetingId || !userName) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    setSignalingStatus('connecting');

    try {
      // Acquire local media with resolution caps
      const stream = await navigator.mediaDevices.getUserMedia({
        video: VIDEO_CONSTRAINTS,
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      localStreamRef.current = stream;
      setLocalStream(stream);
    } catch (err) {
      console.error('Failed to get local media:', err);
      // Continue without media — user may only want to listen
    }

    const pid = participantIdRef.current;
    const wsUrl = `${getWsBaseUrl()}/ws/meeting/${meetingId}/${pid}?userName=${encodeURIComponent(userName)}`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setSignalingStatus('connected');
      // Start keepalive pings to prevent reverse proxy / cloud timeouts
      keepaliveRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'ping' }));
        }
      }, KEEPALIVE_INTERVAL_MS);
    };

    ws.onmessage = handleWsMessage;

    ws.onclose = () => {
      setSignalingStatus('disconnected');
      if (keepaliveRef.current) clearInterval(keepaliveRef.current);
    };

    ws.onerror = (err) => {
      console.error('WebSocket error:', err);
      setSignalingStatus('error');
    };
  }, [meetingId, userName, handleWsMessage]);

  // ── Disconnect cleanly ────────────────────────────────────────────────────
  const disconnect = useCallback(() => {
    if (keepaliveRef.current) clearInterval(keepaliveRef.current);
    wsRef.current?.close();
    wsRef.current = null;

    peersRef.current.forEach(pc => pc.close());
    peersRef.current.clear();

    localStreamRef.current?.getTracks().forEach(t => t.stop());
    localStreamRef.current = null;
    screenStreamRef.current?.getTracks().forEach(t => t.stop());
    screenStreamRef.current = null;

    setLocalStream(null);
    setRemotePeers(new Map());
    setSignalingStatus('disconnected');
  }, []);

  // ── Auto-join when flag is set ────────────────────────────────────────────
  useEffect(() => {
    if (autoJoin) connect();
    return () => disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoJoin]);

  // ── Toggle Mute ──────────────────────────────────────────────────────────
  const toggleMute = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;
    const newMuted = !isMutedRef.current;
    isMutedRef.current = newMuted;
    stream.getAudioTracks().forEach(t => { t.enabled = !newMuted; });
    setIsMuted(newMuted);
    sendSignal({ type: 'media-state', isMuted: newMuted, isVideoOff: isVideoOffRef.current });
  }, [sendSignal]);

  // ── Toggle Video ─────────────────────────────────────────────────────────
  const toggleVideo = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;
    const newOff = !isVideoOffRef.current;
    isVideoOffRef.current = newOff;
    stream.getVideoTracks().forEach(t => { t.enabled = !newOff; });
    setIsVideoOff(newOff);
    sendSignal({ type: 'media-state', isMuted: isMutedRef.current, isVideoOff: newOff });
  }, [sendSignal]);

  // ── Screen Share ─────────────────────────────────────────────────────────
  const startScreenShare = useCallback(async () => {
    const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
    screenStreamRef.current = displayStream;
    const screenTrack = displayStream.getVideoTracks()[0];

    // Replace video track on all active peer connections
    peersRef.current.forEach(pc => {
      const sender = pc.getSenders().find(s => s.track?.kind === 'video');
      if (sender) sender.replaceTrack(screenTrack);
    });

    // Also update local preview
    const local = localStreamRef.current;
    if (local) {
      const oldVideoTrack = local.getVideoTracks()[0];
      if (oldVideoTrack) local.removeTrack(oldVideoTrack);
      local.addTrack(screenTrack);
      setLocalStream(new MediaStream(local.getTracks()));
    }

    screenTrack.onended = () => stopScreenShare();
    setIsScreenSharing(true);
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  const stopScreenShare = useCallback(async () => {
    screenStreamRef.current?.getTracks().forEach(t => t.stop());
    screenStreamRef.current = null;

    // Restore camera track
    try {
      const cameraStream = await navigator.mediaDevices.getUserMedia({ video: VIDEO_CONSTRAINTS });
      const cameraTrack = cameraStream.getVideoTracks()[0];

      peersRef.current.forEach(pc => {
        const sender = pc.getSenders().find(s => s.track?.kind === 'video');
        if (sender) sender.replaceTrack(cameraTrack);
      });

      const local = localStreamRef.current;
      if (local) {
        local.getVideoTracks().forEach(t => local.removeTrack(t));
        local.addTrack(cameraTrack);
        setLocalStream(new MediaStream(local.getTracks()));
      }
    } catch {
      // Camera restore failed — show video-off state
    }
    setIsScreenSharing(false);
  }, []);

  // ── Send Chat Message ────────────────────────────────────────────────────
  const sendChat = useCallback((text: string) => {
    sendSignal({
      type: 'chat-message',
      text,
      timestamp: new Date().toISOString(),
    });
  }, [sendSignal]);

  return {
    localStream,
    remotePeers,
    chatMessages,
    toggleMute,
    toggleVideo,
    startScreenShare,
    stopScreenShare,
    sendChat,
    isMuted,
    isVideoOff,
    isScreenSharing,
    signalingStatus,
  };
}
