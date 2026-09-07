'use client';

import { useState } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { joinMeeting } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface JoinMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function JoinMeetingModal({ isOpen, onClose }: JoinMeetingModalProps) {
  const [meetingId, setMeetingId] = useState('');
  const [displayName, setDisplayName] = useState('Harsh Shukla');
  const [noAudio, setNoAudio] = useState(false);
  const [noVideo, setNoVideo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const isJoinEnabled = meetingId.trim().length > 0 && displayName.trim().length > 0;

  const handleJoin = async () => {
    if (!isJoinEnabled) return;
    setLoading(true);
    setError('');
    try {
      // Strip spaces/dashes so "123-456-789" becomes "123456789" for lookup
      const cleanId = meetingId.replace(/[\s\-]/g, '');
      await joinMeeting(cleanId, displayName.trim());
      router.push(`/meeting/${cleanId}`);
      onClose();
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || 'Meeting not found. Check the ID and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isJoinEnabled) handleJoin();
    if (e.key === 'Escape') onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-box sm" onKeyDown={handleKeyDown}>
        {/* Header */}
        <div style={{ padding: '24px 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>Join meeting</h2>
          <button className="action-icon-btn" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Meeting ID dropdown-style input */}
          <div style={{ position: 'relative' }}>
            <input
              id="join-meeting-id"
              type="text"
              placeholder="Meeting ID or personal link name"
              value={meetingId}
              onChange={(e) => { setMeetingId(e.target.value); setError(''); }}
              className="form-input"
              autoFocus
            />
            <ChevronDown
              size={16}
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', pointerEvents: 'none' }}
            />
          </div>

          {/* Name */}
          <input
            id="join-display-name"
            type="text"
            placeholder="Your name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="form-input"
          />

          {/* Checkboxes */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <label className="form-checkbox">
              <input
                type="checkbox"
                checked={noAudio}
                onChange={(e) => setNoAudio(e.target.checked)}
              />
              <span className="form-checkbox-label">Don&apos;t connect to audio</span>
            </label>
            <label className="form-checkbox">
              <input
                type="checkbox"
                checked={noVideo}
                onChange={(e) => setNoVideo(e.target.checked)}
              />
              <span className="form-checkbox-label">Turn off my video</span>
            </label>
          </div>

          {error && (
            <p style={{ fontSize: 12, color: 'var(--red)', marginTop: -4 }}>{error}</p>
          )}

          {/* Footer buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, paddingTop: 4 }}>
            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button
              id="btn-join-confirm"
              className="btn btn-primary"
              onClick={handleJoin}
              disabled={!isJoinEnabled || loading}
            >
              {loading ? 'Joining…' : 'Join'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
