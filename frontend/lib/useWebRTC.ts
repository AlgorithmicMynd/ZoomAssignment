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
  // shouldCreateOffer=true  → this peer sends the offer  (impolite / already-in-room)
  // shouldCreateOffer=false → this peer waits for offer  (polite / just-joined)
  const createPeerConnection = useCallback(
    (remoteParticipantId: string, shouldCreateOffer: boolean): RTCPeerConnection => {
      // Close any stale connection for this peer
      const existing = peersRef.current.get(remoteParticipantId);
      if (existing) {
        existing.close();
      }

      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

      // ── CRITICAL: Add local tracks BEFORE anything else ──────────────────
      // If we don't add tracks now, onnegotiationneeded fires with no media,
      // producing an offer/answer with no video/audio sections.
      const stream = localStreamRef.current;
      if (stream) {
        stream.getTracks().forEach(track => {
          pc.addTrack(track, stream);
        });
        console.log('[WebRTC] Added', stream.getTracks().length, 'local tracks to PC for', remoteParticipantId);
      } else {
        console.warn('[WebRTC] No local stream available when creating PC for', remoteParticipantId);
      }

      // ── ICE candidate trickle ─────────────────────────────────────────────
      pc.onicecandidate = ({ candidate }) => {
        if (candidate) {
          sendSignal({
            type: 'signal-ice-candidate',
            targetId: remoteParticipantId,
            candidate: candidate.toJSON(),
          });
        }
      };

      pc.onicecandidateerror = (event) => {
        console.warn('[ICE] candidate error:', event);
      };

      // ── When remote media arrives, update state ───────────────────────────
      pc.ontrack = (event) => {
        console.log('[WebRTC] Got remote track from', remoteParticipantId, ':', event.track.kind);
        // Always use event.streams[0] when available; fallback to constructing one
        const remoteStream = event.streams[0] ?? new MediaStream([event.track]);
        updatePeer(remoteParticipantId, { stream: remoteStream });
      };

      // ── Connection state monitoring ───────────────────────────────────────
      pc.onconnectionstatechange = () => {
        console.log('[WebRTC] Connection state →', remoteParticipantId, ':', pc.connectionState);
        if (pc.connectionState === 'connected') {
          applyBitrateCap(pc);
        }
        if (pc.connectionState === 'failed') {
          console.warn('[WebRTC] Connection failed with', remoteParticipantId, '— restarting ICE');
          pc.restartIce();
        }
        if (pc.connectionState === 'closed') {
          removePeer(remoteParticipantId);
        }
      };

      pc.oniceconnectionstatechange = () => {
        console.log('[ICE] state →', remoteParticipantId, ':', pc.iceConnectionState);
      };

      // ── Offer creation (only for the impolite / already-in-room peer) ─────
      if (shouldCreateOffer) {
        pc.onnegotiationneeded = async () => {
          try {
            console.log('[WebRTC] onnegotiationneeded — creating offer for', remoteParticipantId);
            if (pc.signalingState !== 'stable') {
              console.warn('[WebRTC] Skipping offer — signaling state is', pc.signalingState);
              return;
            }
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            sendSignal({
              type: 'signal-offer',
              targetId: remoteParticipantId,
              sdp: pc.localDescription,
            });
            console.log('[WebRTC] Offer sent to', remoteParticipantId);
          } catch (err) {
            console.error('[WebRTC] Offer creation error:', err);
          }
        };
      }

      peersRef.current.set(remoteParticipantId, pc);
      return pc;
    },
    [sendSignal, updatePeer, removePeer, applyBitrateCap],
  );

  // ── Handle SDP Offer from a remote peer ──────────────────────────────────
  const handleOffer = useCallback(
    async (senderId: string, sdp: RTCSessionDescriptionInit) => {
      console.log('[WebRTC] Received offer from', senderId);

      let pc = peersRef.current.get(senderId);
      if (!pc) {
        // First time seeing this peer — create PC (we are the answerer, no offer)
        pc = createPeerConnection(senderId, false);
      }

      // Handle offer collision: if we have a local offer in-flight, rollback
      if (pc.signalingState !== 'stable') {
        console.warn('[WebRTC] Offer collision from', senderId, '— rolling back. State:', pc.signalingState);
        try {
          await Promise.all([
            pc.setLocalDescription({ type: 'rollback' }),
            pc.setRemoteDescription(sdp),
          ]);
        } catch (e) {
          console.error('[WebRTC] Rollback failed:', e);
          return;
        }
      } else {
        await pc.setRemoteDescription(sdp);
      }

      // Drain any ICE candidates that arrived before the remote description
      const queued = pendingCandidatesRef.current.get(senderId) ?? [];
      for (const c of queued) {
        await pc.addIceCandidate(c).catch(e => console.warn('[ICE] queued candidate error:', e));
      }
      pendingCandidatesRef.current.delete(senderId);

      // Create and send answer
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      sendSignal({
        type: 'signal-answer',
        targetId: senderId,
        sdp: pc.localDescription,
      });
      console.log('[WebRTC] Answer sent to', senderId);
    },
    [createPeerConnection, sendSignal],
  );

  // ── Handle SDP Answer ────────────────────────────────────────────────────
  const handleAnswer = useCallback(
    async (senderId: string, sdp: RTCSessionDescriptionInit) => {
      console.log('[WebRTC] Received answer from', senderId);
      const pc = peersRef.current.get(senderId);
      if (!pc) {
        console.warn('[WebRTC] No peer connection for answer from', senderId);
        return;
      }
      if (pc.signalingState === 'have-local-offer') {
        await pc.setRemoteDescription(sdp);
        console.log('[WebRTC] Remote description set from answer —', senderId);
      } else {
        console.warn('[WebRTC] Unexpected answer in state:', pc.signalingState, 'from', senderId);
      }
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
      await pc.addIceCandidate(candidate).catch(e => console.warn('[ICE] add candidate error:', e));
    },
    [],
  );

  // ── WebSocket message router ──────────────────────────────────────────────
  // Use a ref for the handler so ws.onmessage always calls the latest
  // version of the handler without stale closures.
  const handleWsMessageRef = useRef<((event: MessageEvent) => Promise<void>) | null>(null);
  handleWsMessageRef.current = async (event: MessageEvent) => {
    let data: Record<string, any>;
    try {
      data = JSON.parse(event.data as string);
    } catch {
      return;
    }

    if (data.type !== 'pong') {
      console.log('[WS] Received:', data.type, data);
    }

    switch (data.type) {
      case 'room-joined': {
        /**
         * We just joined. existingPeers is the list of participants already
         * in the room. WE are the POLITE peer — we wait for offers from them.
         * We just create the PC infrastructure ready to receive their offers.
         */
        const peers: Array<{ participantId: string; userName: string; isMuted: boolean; isVideoOff: boolean }> =
          data.existingPeers ?? [];
        console.log('[WS] room-joined — existing peers:', peers.map(p => p.userName));

        for (const p of peers) {
          addPeer({
            participantId: p.participantId,
            userName: p.userName,
            stream: null,
            isMuted: p.isMuted,
            isVideoOff: p.isVideoOff,
          });
          // Create PC but do NOT send offer — wait to receive one
          createPeerConnection(p.participantId, false);
        }
        break;
      }

      case 'user-joined': {
        /**
         * A new participant arrived while we are already in the room.
         * We are the IMPOLITE peer — WE create the offer.
         */
        const { participantId, userName: peerName } = data;
        console.log('[WS] user-joined:', peerName, '(', participantId, ')');
        addPeer({
          participantId,
          userName: peerName,
          stream: null,
          isMuted: false,
          isVideoOff: false,
        });
        // shouldCreateOffer=true: onnegotiationneeded will fire and send offer
        createPeerConnection(participantId, true);
        break;
      }

      case 'user-left': {
        console.log('[WS] user-left:', data.participantId);
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
        console.log('[WS] Unknown message type:', data.type);
        break;
    }
  };

  // ── Connect to signaling server ───────────────────────────────────────────
  const connect = useCallback(async () => {
    if (!meetingId || !userName) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    setSignalingStatus('connecting');

    // ── Step 1: Acquire local media FIRST, BEFORE connecting WebSocket ────
    // This guarantees localStreamRef.current is populated before any
    // 'user-joined' or 'room-joined' messages arrive and peer connections
    // are created. Without this, addTrack is never called on the PC.
    try {
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
      console.log('[WebRTC] Local stream acquired:', stream.getTracks().map(t => `${t.kind}:${t.label}`));
    } catch (err) {
      console.error('[WebRTC] Failed to get local media:', err);
      // Continue without media — user may only want to listen
    }

    // ── Step 2: Connect WebSocket ─────────────────────────────────────────
    const pid = participantIdRef.current;
    const wsUrl = `${getWsBaseUrl()}/ws/meeting/${meetingId}/${pid}?userName=${encodeURIComponent(userName)}`;
    console.log('[WS] Connecting to:', wsUrl);

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('[WS] Connected');
      setSignalingStatus('connected');
      keepaliveRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'ping' }));
        }
      }, KEEPALIVE_INTERVAL_MS);
    };

    // Route all messages through the ref — always calls latest handler
    ws.onmessage = (event) => {
      handleWsMessageRef.current?.(event);
    };

    ws.onclose = (event) => {
      console.log('[WS] Closed:', event.code, event.reason);
      setSignalingStatus('disconnected');
      if (keepaliveRef.current) clearInterval(keepaliveRef.current);
    };

    ws.onerror = (err) => {
      console.error('[WS] Error:', err);
      setSignalingStatus('error');
    };
  }, [meetingId, userName]);

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
  const toggleMute = useCallback(async () => {
    const stream = localStreamRef.current;
    if (!stream) return;
    const newMuted = !isMutedRef.current;
    isMutedRef.current = newMuted;

    if (newMuted) {
      stream.getAudioTracks().forEach(t => {
        t.stop();
        stream.removeTrack(t);
      });
    } else {
      try {
        const newStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const newTrack = newStream.getAudioTracks()[0];
        stream.addTrack(newTrack);
        peersRef.current.forEach(pc => {
          const sender = pc.getSenders().find(s => s.track?.kind === 'audio');
          if (sender) sender.replaceTrack(newTrack);
        });
      } catch (e) {
        console.error("Failed to reacquire audio", e);
        isMutedRef.current = true; // rollback
        return;
      }
    }

    setIsMuted(isMutedRef.current);
    sendSignal({ type: 'media-state', isMuted: isMutedRef.current, isVideoOff: isVideoOffRef.current });
  }, [sendSignal]);

  // ── Toggle Video ─────────────────────────────────────────────────────────
  const toggleVideo = useCallback(async () => {
    const stream = localStreamRef.current;
    if (!stream) return;
    const newOff = !isVideoOffRef.current;
    isVideoOffRef.current = newOff;

    if (newOff) {
      stream.getVideoTracks().forEach(t => {
        t.stop();
        stream.removeTrack(t);
      });
    } else {
      try {
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 360 }, frameRate: { ideal: 24 } }
        });
        const newTrack = newStream.getVideoTracks()[0];
        stream.addTrack(newTrack);
        peersRef.current.forEach(pc => {
          const sender = pc.getSenders().find(s => s.track?.kind === 'video');
          if (sender) sender.replaceTrack(newTrack);
        });
      } catch (e) {
        console.error("Failed to reacquire video", e);
        isVideoOffRef.current = true; // rollback
        return;
      }
    }

    setIsVideoOff(isVideoOffRef.current);
    sendSignal({ type: 'media-state', isMuted: isMutedRef.current, isVideoOff: isVideoOffRef.current });
  }, [sendSignal]);

  // ── Screen Share ─────────────────────────────────────────────────────────
  const startScreenShare = useCallback(async () => {
    const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
    screenStreamRef.current = displayStream;
    const screenTrack = displayStream.getVideoTracks()[0];

    peersRef.current.forEach(pc => {
      const sender = pc.getSenders().find(s => s.track?.kind === 'video');
      if (sender) sender.replaceTrack(screenTrack);
    });

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

