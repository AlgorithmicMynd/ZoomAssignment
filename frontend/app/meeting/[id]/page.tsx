/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { getMeeting, endMeeting } from '@/lib/api';
import { useRouter, useParams } from 'next/navigation';
import {
  Mic, MicOff, Video, VideoOff, Shield, Users,
  MessageCircle, Share2, Circle, LayoutGrid, ChevronUp
} from 'lucide-react';

const DEMO_PARTICIPANTS = [
  { name: 'Victoria Reyes', initials: 'VR', color: '#5B5BEB', muted: false },
  { name: 'Henry Park', initials: 'HP', color: '#16A34A', muted: false, activeSpeaker: true },
  { name: 'Marketing Huddle', initials: 'MH', color: '#DC2626', muted: true },
];

export default function MeetingRoom() {
  const params = useParams();
  const meetingId = params?.id as string;
  const router = useRouter();

  const [meeting, setMeeting] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [participantCount] = useState(DEMO_PARTICIPANTS.length);

  useEffect(() => {
    if (!meetingId) return;
    getMeeting(meetingId)
      .then((data) => setMeeting(data))
      .catch(() => router.replace('/'))
      .finally(() => setLoading(false));
  }, [meetingId, router]);

  if (loading) {
    return (
      <div style={{ height: '100vh', background: '#111113', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: '#A0A0A0', fontSize: 14 }}>Connecting to meeting…</span>
      </div>
    );
  }

  return (
    <div className="room-shell">
      {/* ── Top: participant gallery strip ── */}
      <div className="room-top-bar">
        <span className="room-title">Zoom Meeting</span>

        <div style={{ display: 'flex', gap: 8, flex: 1, justifyContent: 'center' }}>
          {DEMO_PARTICIPANTS.map((p) => (
            <div
              key={p.name}
              className={`participant-tile${p.activeSpeaker ? ' active-speaker' : ''}`}
            >
              <div className="participant-tile-avatar">
                <div
                  className="participant-initials"
                  style={{ background: p.color }}
                >
                  {p.initials}
                </div>
              </div>
              <div className="participant-tile-name">
                {p.muted && (
                  <MicOff size={10} style={{ color: '#E02828' }} />
                )}
                {p.name}
              </div>
            </div>
          ))}
        </div>

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

      {/* ── Main video stage ── */}
      <div className="room-main">
        {/* Big central tile — "you" */}
        <div style={{
          width: '100%', height: '100%', maxWidth: 900,
          background: 'linear-gradient(160deg, #1A1A2E 0%, #0D0D18 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative',
          borderRadius: 0,
          overflow: 'hidden',
        }}>
          {isVideoOff ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: 96, height: 96, borderRadius: '50%',
                background: 'linear-gradient(135deg, #5B5BEB 0%, #3B82F6 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px',
                fontSize: 36, fontWeight: 700, color: 'white',
              }}>
                HS
              </div>
              <p style={{ color: 'white', fontSize: 16, fontWeight: 600 }}>Harsh Shukla</p>
              <p style={{ color: '#A0A0A0', fontSize: 13, marginTop: 4 }}>Camera is off</p>
            </div>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: 96, height: 96, borderRadius: '50%',
                background: 'linear-gradient(135deg, #5B5BEB 0%, #3B82F6 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px',
                fontSize: 36, fontWeight: 700, color: 'white',
              }}>
                HS
              </div>
              <p style={{ color: 'white', fontSize: 16, fontWeight: 600 }}>Harsh Shukla</p>
              <p style={{ color: '#A0A0A0', fontSize: 13, marginTop: 4 }}>You</p>
            </div>
          )}

          {/* Meeting ID overlay bottom-right */}
          {meeting && (
            <div style={{
              position: 'absolute', bottom: 12, right: 16,
              background: 'rgba(0,0,0,0.5)', color: '#A0A0A0',
              fontSize: 11, padding: '4px 10px', borderRadius: 4,
            }}>
              Meeting ID: {meeting.meeting_id}
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom control bar ── */}
      <div className="room-bottom-bar">
        {/* Mute */}
        <div className="ctrl-btn-wrap">
          <button
            id="ctrl-mute"
            className={`ctrl-btn${isMuted ? ' muted' : ' active'}`}
            onClick={() => setIsMuted((v) => !v)}
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
            onClick={() => setIsVideoOff((v) => !v)}
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
          <span className="participant-count-badge">{participantCount}</span>
        </button>

        {/* Chat */}
        <button id="ctrl-chat" className="ctrl-btn active">
          <MessageCircle size={20} />
          <span>Chat</span>
        </button>

        {/* Share Screen — green */}
        <button id="ctrl-share" className="ctrl-btn share-screen">
          <Share2 size={20} />
          <span>Share Screen</span>
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
    </div>
  );
}
