'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { joinMeeting } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface JoinMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function JoinMeetingModal({ isOpen, onClose }: JoinMeetingModalProps) {
  const [meetingId, setMeetingId] = useState('');
  const [displayName, setDisplayName] = useState('Harsh Shukla');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleJoin = async () => {
    if (!meetingId || !displayName) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await joinMeeting(meetingId, displayName);
      router.push(`/meeting/${meetingId}`);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to join meeting');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal w-full max-w-md">
        <div className="flex justify-between items-center mb-6 px-6 pt-6">
          <h2 className="text-2xl font-bold text-white">Join meeting</h2>
          <button onClick={onClose} className="text-[#A0A0A0] hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="px-6 pb-6 space-y-4">
          <input
            type="text"
            placeholder="Meeting ID or personal link name"
            value={meetingId}
            onChange={(e) => setMeetingId(e.target.value)}
            className="input-base w-full"
          />

          <input
            type="text"
            placeholder="Your name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="input-base w-full"
          />

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[#A0A0A0] cursor-pointer">
              <input type="checkbox" className="rounded" />
              <span className="text-sm">Don't connect to audio</span>
            </label>
            <label className="flex items-center gap-2 text-[#A0A0A0] cursor-pointer">
              <input type="checkbox" className="rounded" />
              <span className="text-sm">Turn off my video</span>
            </label>
          </div>

          {error && <p className="text-[#E02828] text-sm">{error}</p>}

          <div className="flex gap-2 justify-end pt-4">
            <button
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleJoin}
              disabled={loading}
              className="btn-primary disabled:opacity-50"
            >
              {loading ? 'Joining...' : 'Join'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
