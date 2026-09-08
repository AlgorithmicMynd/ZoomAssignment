'use client';

import { useState } from 'react';
import { X, ChevronDown, Lock } from 'lucide-react';
import { joinMeeting } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface JoinMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/** Normalise user input → canonical XXX-XXX-XXX format the server uses. */
function normaliseId(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 9) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 9)}`;
  }
  return raw.trim();
}

/** Auto-format the input as the user types: inserts dashes at position 3 and 7 */
function autoFormatId(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 9);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export default function JoinMeetingModal({ isOpen, onClose }: JoinMeetingModalProps) {
  const [meetingId, setMeetingId] = useState('');
  const [displayName, setDisplayName] = useState('Harsh Shukla');
  const [passcode, setPasscode] = useState('');
  const [noAudio, setNoAudio] = useState(false);
  const [noVideo, setNoVideo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // Only enable Join when there are 9 digit characters entered
  const rawDigits = meetingId.replace(/\D/g, '');
  const isIdComplete = rawDigits.length === 9;
  const isJoinEnabled = isIdComplete && displayName.trim().length > 0;

  const handleIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMeetingId(autoFormatId(e.target.value));
    setError('');
  };

  const handleJoin = async () => {
    if (!isJoinEnabled) return;
    setLoading(true);
    setError('');
    try {
      const canonicalId = normaliseId(meetingId);
      await joinMeeting(canonicalId, displayName.trim(), passcode.trim() || undefined);
      router.push(`/meeting/${canonicalId}`);
      onClose();
    } catch (err: unknown) {
      const e = err as Error;
      if (e.message?.toLowerCase().includes('passcode') || e.message?.toLowerCase().includes('incorrect')) {
        setError('Incorrect passcode. Please check and try again.');
      } else {
        setError(e.message || 'Meeting not found. Check the ID and try again.');
      }
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

          {/* Meeting ID */}
          <div style={{ position: 'relative' }}>
            <input
              id="join-meeting-id"
              type="text"
              inputMode="numeric"
              placeholder="Meeting ID (e.g. 123-456-789)"
              value={meetingId}
              onChange={handleIdChange}
              className="form-input"
              autoFocus
            />
            <ChevronDown
              size={16}
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', pointerEvents: 'none' }}
            />
          </div>

          {/* Passcode — shown once ID is fully entered */}
          {isIdComplete && (
            <div style={{ position: 'relative' }}>
              <Lock
                size={14}
                style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', pointerEvents: 'none' }}
              />
              <input
                id="join-passcode"
                type="text"
                inputMode="numeric"
                placeholder="Meeting passcode"
                value={passcode}
                onChange={(e) => { setPasscode(e.target.value); setError(''); }}
                className="form-input"
                style={{ paddingLeft: 34 }}
              />
            </div>
          )}

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

