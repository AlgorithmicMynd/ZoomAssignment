'use client';

import { useRouter } from 'next/navigation';
import {
  X, Pen, Trash2, MoreHorizontal, Maximize2,
  Clock, Video, MessageCircle, Sparkles, ChevronDown,
  MapPin, Users, Paperclip, FileText, AlignLeft
} from 'lucide-react';
import { format } from 'date-fns';

interface Meeting {
  meeting_id: string;
  title: string;
  passcode?: string | null;
  scheduled_at?: string | null;
  duration_minutes?: number | null;
  invite_link: string;
  status: string;
}


interface MeetingDetailPopupProps {
  meeting: Meeting | null;
  onClose: () => void;
}

export default function MeetingDetailPopup({ meeting, onClose }: MeetingDetailPopupProps) {
  const router = useRouter();

  if (!meeting) return null;

  const startTime = meeting.scheduled_at ? new Date(meeting.scheduled_at) : null;
  const endTime =
    startTime && meeting.duration_minutes
      ? new Date(startTime.getTime() + meeting.duration_minutes * 60_000)
      : null;

  const timeLabel = startTime
    ? `${format(startTime, 'EEEE MMMM d, HH:mm')} - ${endTime ? format(endTime, 'HH:mm') : 'TBD'}`
    : 'Instant meeting';

  const joinUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/meeting/${meeting.meeting_id}`;

  const handleStart = () => {
    router.push(`/meeting/${meeting.meeting_id}`);
    onClose();
  };

  return (
    <aside className="detail-popup">
      {/* Toolbar */}
      <div className="detail-popup-toolbar">
        <button className="action-icon-btn" title="Edit"><Pen size={15} /></button>
        <button className="action-icon-btn" title="Delete"><Trash2 size={15} /></button>
        <button className="action-icon-btn" title="More"><MoreHorizontal size={15} /></button>
        <button className="action-icon-btn" title="Expand"><Maximize2 size={15} /></button>
        <button className="action-icon-btn" title="Close" onClick={onClose}><X size={15} /></button>
      </div>

      <div className="detail-popup-content">
        {/* Title */}
        <h2 className="detail-popup-title">{meeting.title}</h2>

        {/* Time */}
        <div className="detail-section">
          <Clock size={16} className="detail-section-icon" />
          <p className="detail-section-text">{timeLabel}</p>
        </div>

        {/* Action buttons */}
        <div className="detail-section">
          <Video size={16} className="detail-section-icon" style={{ marginTop: 6 }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary btn-sm" onClick={handleStart}>
                <Video size={13} /> Start
              </button>
              <button className="btn btn-secondary btn-sm">
                <MessageCircle size={13} /> Chat
              </button>
              <button className="btn btn-secondary btn-sm">
                <Sparkles size={13} /> AI Companion <ChevronDown size={11} />
              </button>
            </div>
            <button className="btn-link" style={{ fontSize: 12.5 }}>View join info</button>
          </div>
        </div>

        <hr className="divider" />

        {/* Meeting Invite Info — ID + Passcode + copy invite */}
        <div className="detail-section" style={{ flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <MapPin size={16} className="detail-section-icon" style={{ flexShrink: 0 }} />
            <p className="form-label" style={{ margin: 0 }}>Join Info</p>
          </div>

          {/* Info card */}
          <div style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.09)',
            borderRadius: 8,
            padding: '12px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            marginLeft: 24,
          }}>
            {/* Join link */}
            <div>
              <p style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 2 }}>Join link</p>
              <a
                href={joinUrl}
                className="detail-link"
                onClick={(e) => { e.preventDefault(); navigator.clipboard.writeText(joinUrl); }}
                title="Click to copy link"
                style={{ fontSize: 12.5, wordBreak: 'break-all' }}
              >
                {joinUrl}
              </a>
            </div>

            <div style={{ display: 'flex', gap: 20 }}>
              {/* Meeting ID */}
              <div>
                <p style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 2 }}>Meeting ID</p>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '0.04em' }}>
                  {meeting.meeting_id}
                </p>
              </div>

              {/* Passcode */}
              {meeting.passcode && (
                <div>
                  <p style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 2 }}>Passcode</p>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '0.15em' }}>
                    {meeting.passcode}
                  </p>
                </div>
              )}
            </div>

            {/* Copy full invite button */}
            <button
              className="btn btn-secondary btn-sm"
              style={{ alignSelf: 'flex-start', marginTop: 2 }}
              onClick={() => {
                const text = [
                  `${meeting.title} - Zoom Meeting`,
                  ``,
                  `Join Zoom Meeting:`,
                  joinUrl,
                  ``,
                  `Meeting ID: ${meeting.meeting_id}`,
                  meeting.passcode ? `Passcode: ${meeting.passcode}` : '',
                ].filter(l => l !== undefined).join('\n');
                navigator.clipboard.writeText(text);
              }}
            >
              Copy Invite
            </button>
          </div>
        </div>

        {/* Invitees */}
        <div className="detail-section">
          <Users size={16} className="detail-section-icon" />
          <div>
            <p className="form-label" style={{ marginBottom: 8 }}>Invitees</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'linear-gradient(135deg, #5B5BEB, #3B82F6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 600, color: 'white',
                position: 'relative', flexShrink: 0,
              }}>
                HS
                <span style={{
                  position: 'absolute', bottom: 0, right: 0,
                  width: 9, height: 9, borderRadius: '50%',
                  background: '#2ECC71', border: '1.5px solid var(--bg-secondary)',
                }} />
              </div>
              <span className="detail-section-text">Local User (Host)</span>
            </div>
          </div>
        </div>

        <hr className="divider" />

        {/* Attachments */}
        <div className="detail-section">
          <Paperclip size={16} className="detail-section-icon" />
          <button className="btn-link">Add attachments</button>
        </div>

        {/* Agenda */}
        <div className="detail-section">
          <FileText size={16} className="detail-section-icon" />
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button className="btn-link">Create agenda</button>
            <span className="badge-new">NEW</span>
          </div>
        </div>

        <hr className="divider" />

        {/* Description */}
        <div className="detail-section">
          <AlignLeft size={16} className="detail-section-icon" />
          <div>
            <p className="form-label" style={{ marginBottom: 8 }}>Description</p>
            <hr className="divider" style={{ marginTop: 0, marginBottom: 8, width: 100 }} />
            <p className="detail-section-text" style={{ lineHeight: 1.7, fontSize: 12 }}>
              Local User is inviting you to a scheduled Zoom meeting.<br />
              Join Zoom Meeting<br />
              <a href={joinUrl} className="detail-link">{joinUrl}</a>
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
