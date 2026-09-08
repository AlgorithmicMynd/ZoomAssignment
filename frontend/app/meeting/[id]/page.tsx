/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { getMeeting, endMeeting, joinMeeting } from '@/lib/api';
import { useWebRTC } from '@/lib/useWebRTC';
import { useRouter, useParams } from 'next/navigation';
import {
  Mic, MicOff, Video, VideoOff, Shield, Users,
  MessageCircle, Share2, Circle, LayoutGrid, ChevronUp,
  X, Send, Monitor,
} from 'lucide-react';

// ── Colour palette for participant avatars ────────────────────────────────────
const AVATAR_COLORS = [
  '#5B5BEB', '#16A34A', '#DC2626', '#D97706',
  '#0891B2', '#7C3AED', '#DB2777', '#059669',
];
function avatarColor(id: string): string {
  let hash = 0;
  for (const c of id) hash = (hash * 31 + c.charCodeAt(0)) & 0xffffffff;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

// ── Helper: attach MediaStream to a <video> ref ───────────────────────────────
function AttachedVideo({
  stream,
  muted = false,
  className,
  style,
}: {
  stream: MediaStream | null;
  muted?: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.srcObject = stream;
  }, [stream]);
  return (
    <video
      ref={ref}
      autoPlay
      playsInline
      muted={muted}
      className={className}
      style={style}
    />
  );
}

// ── Video Tile Component ──────────────────────────────────────────────────────
function VideoTile({
  participantId,
  userName,
  stream,
  isMuted,
  isVideoOff,
  isSelf = false,
}: {
  participantId: string;
  userName: string;
  stream: MediaStream | null;
  isMuted: boolean;
  isVideoOff: boolean;
  isSelf?: boolean;
}) {
  const initials = userName.slice(0, 2).toUpperCase() || 'U';
  const color = avatarColor(participantId);

  return (
    <div className={`video-tile${isSelf ? ' is-self' : ''}`}>
      {isVideoOff || !stream ? (
        <div className="video-tile-avatar">
          <div className="video-tile-initials" style={{ background: color }}>
            {initials}
          </div>
        </div>
      ) : (
        <AttachedVideo
          stream={stream}
          muted={isSelf}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      )}

      {isVideoOff && (
        <div className="video-tile-off-label">Camera off</div>
      )}

      {isMuted && (
        <div className="video-tile-mute-icon">
          <MicOff size={13} color="white" />
        </div>
      )}

      <div className="video-tile-name">
        {isMuted && <MicOff size={10} style={{ color: '#E02828', flexShrink: 0 }} />}
        {userName}{isSelf ? ' (You)' : ''}
      </div>
    </div>
  );
}

// ── Chat Panel ────────────────────────────────────────────────────────────────
function ChatPanel({
  messages,
  onSend,
  onClose,
}: {
  messages: any[];
  onSend: (text: string) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = () => {
    const text = draft.trim();
    if (!text) return;
    onSend(text);
    setDraft('');
  };

  return (
    <div className="chat-panel">
      <div className="chat-panel-header">
        <span className="chat-panel-title">In-Meeting Chat</span>
        <button className="chat-panel-close" onClick={onClose} title="Close Chat">
          <X size={18} />
        </button>
      </div>

      <div className="chat-messages">
        {messages.length === 0 && (
          <p style={{ color: '#606060', fontSize: 13, textAlign: 'center', marginTop: 24 }}>
            No messages yet. Say hello!
          </p>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`chat-msg${msg.isSelf ? ' self' : ''}`}>
            <div className="chat-msg-meta">
              <span className="chat-msg-sender">{msg.isSelf ? 'You' : msg.senderName}</span>
              <span className="chat-msg-time">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div className="chat-msg-text">{msg.text}</div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="chat-input-row">
        <input
          className="chat-input"
          placeholder="Type a message…"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
        />
        <button
          className="chat-send-btn"
          onClick={handleSend}
          disabled={!draft.trim()}
          title="Send"
        >
          <Send size={15} />
        </button>
      </div>
    </div>
  );
}

// ── Signaling Badge ────────────────────────────────────────────────────────────
function SignalingBadge({ status }: { status: string }) {
  const label: Record<string, string> = {
    connected: 'Live',
    connecting: 'Connecting…',
    disconnected: 'Offline',
    error: 'Error',
  };
  return (
    <div className={`signaling-badge ${status}`}>
      <div className="signaling-badge-dot" />
      {label[status] ?? status}
    </div>
  );
}

// ── Main Meeting Room Component ───────────────────────────────────────────────
export default function MeetingRoom() {
  const params = useParams();
  const meetingId = params?.id as string;
  const router = useRouter();

  const [meeting, setMeeting] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Pre-join state
  const [hasJoined, setHasJoined] = useState(false);
  const [userName, setUserName] = useState('Harsh Shukla');
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);

  // UI toggles (pre-join; post-join controlled via useWebRTC)
  const [preIsMuted, setPreIsMuted] = useState(false);
  const [preIsVideoOff, setPreIsVideoOff] = useState(false);
  const [preLocalStream, setPreLocalStream] = useState<MediaStream | null>(null);
  const preJoinVideoRef = useRef<HTMLVideoElement>(null);
  const preStreamRef = useRef<MediaStream | null>(null);

  // Chat state
  const [showChat, setShowChat] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // ── useWebRTC — only initialised after the user clicks "Join" ────────────
  const {
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
  } = useWebRTC(meetingId, userName, hasJoined);

  // ── Load meeting metadata ────────────────────────────────────────────────
  useEffect(() => {
    if (!meetingId) return;
    getMeeting(meetingId)
      .then(data => setMeeting(data))
      .catch(() => router.replace('/'))
      .finally(() => setLoading(false));
  }, [meetingId, router]);

  // ── Pre-join media (preview only — stopped when joining) ─────────────────
  useEffect(() => {
    if (hasJoined) return; // useWebRTC takes over once joined
    let stopped = false;
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then(stream => {
        if (stopped) { stream.getTracks().forEach(t => t.stop()); return; }
        preStreamRef.current = stream;
        setPreLocalStream(stream);
      })
      .catch(err => console.error('Pre-join media error:', err));
    return () => {
      stopped = true;
      preStreamRef.current?.getTracks().forEach(t => t.stop());
      preStreamRef.current = null;
    };
  }, [hasJoined]);

  // Sync pre-join stream with video element
  useEffect(() => {
    if (preJoinVideoRef.current && preLocalStream && !preIsVideoOff) {
      preJoinVideoRef.current.srcObject = preLocalStream;
    }
  }, [preLocalStream, preIsVideoOff]);

  // Sync pre-join mute/video toggles on preview stream
  useEffect(() => {
    if (!preLocalStream) return;
    preLocalStream.getAudioTracks().forEach(t => { t.enabled = !preIsMuted; });
    preLocalStream.getVideoTracks().forEach(t => { t.enabled = !preIsVideoOff; });
  }, [preIsMuted, preIsVideoOff, preLocalStream]);

  // ── Chat unread counter ──────────────────────────────────────────────────
  const prevMsgCount = useRef(0);
  useEffect(() => {
    if (!showChat && chatMessages.length > prevMsgCount.current) {
      setUnreadCount(c => c + (chatMessages.length - prevMsgCount.current));
    }
    prevMsgCount.current = chatMessages.length;
  }, [chatMessages.length, showChat]);

  const handleOpenChat = useCallback(() => {
    setShowChat(true);
    setUnreadCount(0);
  }, []);

  // ── Join handler ─────────────────────────────────────────────────────────
  const handleJoin = useCallback(async () => {
    // Stop pre-join preview stream before useWebRTC takes a new one
    preStreamRef.current?.getTracks().forEach(t => t.stop());
    preStreamRef.current = null;
    setPreLocalStream(null);

    // Register in DB
    try {
      await joinMeeting(meetingId, userName);
    } catch { /* non-blocking */ }

    setHasJoined(true);
  }, [meetingId, userName]);

  // ── Compute gallery layout ───────────────────────────────────────────────
  const selfId = 'self'; // stable key for local tile
  // Build array: [self, ...remote peers]
  const totalTiles = 1 + remotePeers.size;
  const galleryClass = `room-gallery peers-${Math.min(totalTiles, 6)}`;

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ height: '100vh', background: '#111113', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: '#A0A0A0', fontSize: 14 }}>Connecting to meeting…</span>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // PRE-JOIN SCREEN
  // ════════════════════════════════════════════════════════════════════════════
  if (!hasJoined) {
    return (
      <div className="pre-join-container">
        <div className="pre-join-modal">
          <div className="pre-join-header">
            <div className="pre-join-header-left" style={{ position: 'relative' }}>
              <button
                className="mac-dot mac-dot-close"
                onClick={() => setShowLeaveDialog(!showLeaveDialog)}
                aria-label="Close"
              />
              <button className="mac-dot mac-dot-min" aria-label="Minimize" />
              <button className="mac-dot mac-dot-max" aria-label="Maximize" />

              {showLeaveDialog && (
                <div className="leave-dialog-popup">
                  <button className="leave-dialog-btn-red" onClick={() => router.push('/')}>
                    Leave meeting
                  </button>
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '8px 12px 0' }}>
                    <button className="leave-dialog-link" onClick={() => setShowLeaveDialog(false)}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="pre-join-title">{meeting?.title || 'Zoom Meeting'}</div>
            <div style={{ width: 150 }} />
          </div>

          <div className="pre-join-video-wrapper">
            {preIsVideoOff ? (
              <div className="pre-join-video-off">
                <div className="pre-join-avatar">
                  {userName.slice(0, 2).toUpperCase() || 'U'}
                </div>
              </div>
            ) : (
              <video
                ref={preJoinVideoRef}
                autoPlay
                playsInline
                muted
                className="pre-join-video"
              />
            )}

            <div className="pre-join-controls-overlay">
              <button
                className={`pre-join-overlay-btn ${preIsMuted ? 'muted' : ''}`}
                onClick={() => setPreIsMuted(v => !v)}
              >
                {preIsMuted ? <MicOff size={20} /> : <Mic size={20} />}
                <span>Audio</span>
              </button>
              <button
                className={`pre-join-overlay-btn ${preIsVideoOff ? 'muted' : ''}`}
                onClick={() => setPreIsVideoOff(v => !v)}
              >
                {preIsVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
                <span>Video</span>
              </button>
            </div>
          </div>

          <div className="pre-join-device-selects">
            <div className="device-select">
              <Mic size={16} color="#A0A0A0" />
              <select className="device-dropdown" defaultValue="default">
                <option value="default">Default Microphone</option>
              </select>
            </div>
            <div className="device-select">
              <Video size={16} color="#A0A0A0" />
              <select className="device-dropdown" defaultValue="default">
                <option value="default">Default Camera</option>
              </select>
            </div>
          </div>

          <div className="pre-join-footer" style={{ justifyContent: 'flex-end' }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <input
                type="text"
                className="pre-join-name-input"
                placeholder="Enter your name"
                value={userName}
                onChange={e => setUserName(e.target.value)}
              />
              <button
                className="pre-join-start-btn"
                onClick={handleJoin}
                disabled={!userName.trim()}
              >
                Join Now
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // MEETING ROOM UI
  // ════════════════════════════════════════════════════════════════════════════
  return (
    <div className="room-shell">
      {/* ── Top bar ── */}
      <div className="room-top-bar">
        <span className="room-title">{meeting?.title || 'Zoom Meeting'}</span>

        <SignalingBadge status={signalingStatus} />

        <div style={{ flex: 1 }} />

        {meeting && (
          <span style={{ color: '#606060', fontSize: 11 }}>
            ID: {meeting.meeting_id}
          </span>
        )}

        <button
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: 'white', borderRadius: 6,
            padding: '5px 12px', fontSize: 12.5, cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          <LayoutGrid size={14} /> View
        </button>
      </div>

      {/* ── Screen share banner ── */}
      {isScreenSharing && (
        <div className="screen-share-badge">
          🖥 You are sharing your screen
        </div>
      )}

      {/* ── Gallery grid ── */}
      <div className="room-main">
        <div className={galleryClass} style={{ width: '100%', height: '100%' }}>
          {/* Local (self) tile */}
          <VideoTile
            key={selfId}
            participantId={selfId}
            userName={userName}
            stream={localStream}
            isMuted={isMuted}
            isVideoOff={isVideoOff}
            isSelf
          />

          {/* Remote peer tiles */}
          {Array.from(remotePeers.values()).map(peer => (
            <VideoTile
              key={peer.participantId}
              participantId={peer.participantId}
              userName={peer.userName}
              stream={peer.stream}
              isMuted={peer.isMuted}
              isVideoOff={peer.isVideoOff}
            />
          ))}
        </div>
      </div>

      {/* ── Bottom control bar ── */}
      <div className="room-bottom-bar">
        {/* Mute */}
        <div className="ctrl-btn-wrap">
          <button
            id="ctrl-mute"
            className={`ctrl-btn${isMuted ? ' muted' : ' active'}`}
            onClick={toggleMute}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
            <span>{isMuted ? 'Unmute' : 'Mute'}</span>
          </button>
          <button className="ctrl-caret" title="Audio settings"><ChevronUp size={12} /></button>
        </div>

        {/* Video */}
        <div className="ctrl-btn-wrap">
          <button
            id="ctrl-video"
            className={`ctrl-btn${isVideoOff ? ' muted' : ' active'}`}
            onClick={toggleVideo}
            title={isVideoOff ? 'Start Video' : 'Stop Video'}
          >
            {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
            <span>{isVideoOff ? 'Start Video' : 'Stop Video'}</span>
          </button>
          <button className="ctrl-caret" title="Video settings"><ChevronUp size={12} /></button>
        </div>

        <div className="ctrl-separator" />

        {/* Security */}
        <button id="ctrl-security" className="ctrl-btn active">
          <Shield size={20} />
          <span>Security</span>
        </button>

        {/* Participants */}
        <button id="ctrl-participants" className="ctrl-btn active" style={{ position: 'relative' }}>
          <Users size={20} />
          <span>Participants</span>
          <span className="participant-count-badge">{1 + remotePeers.size}</span>
        </button>

        {/* Chat */}
        <button
          id="ctrl-chat"
          className="ctrl-btn active"
          onClick={handleOpenChat}
          style={{ position: 'relative' }}
          title="Chat"
        >
          <MessageCircle size={20} />
          <span>Chat</span>
          {unreadCount > 0 && (
            <span className="chat-unread-badge">{unreadCount}</span>
          )}
        </button>

        {/* Screen Share */}
        <button
          id="ctrl-share"
          className={`ctrl-btn${isScreenSharing ? ' muted' : ' share-screen'}`}
          onClick={isScreenSharing ? stopScreenShare : startScreenShare}
          title={isScreenSharing ? 'Stop sharing' : 'Share Screen'}
        >
          {isScreenSharing ? <Monitor size={20} /> : <Share2 size={20} />}
          <span>{isScreenSharing ? 'Stop Share' : 'Share Screen'}</span>
        </button>

        {/* Record */}
        <button id="ctrl-record" className="ctrl-btn active">
          <Circle size={20} />
          <span>Record</span>
        </button>

        {/* Apps */}
        <button id="ctrl-apps" className="ctrl-btn active">
          <LayoutGrid size={20} />
          <span>Apps</span>
        </button>

        <div className="ctrl-spacer" />

        {/* End */}
        <button
          id="ctrl-end"
          className="ctrl-end-btn"
          onClick={async () => {
            try { await endMeeting(meetingId); } catch { /* best-effort */ }
            router.push('/');
          }}
          title="End meeting"
        >
          End
        </button>
      </div>

      {/* ── Chat panel ── */}
      {showChat && (
        <ChatPanel
          messages={chatMessages}
          onSend={sendChat}
          onClose={() => setShowChat(false)}
        />
      )}
    </div>
  );
}
