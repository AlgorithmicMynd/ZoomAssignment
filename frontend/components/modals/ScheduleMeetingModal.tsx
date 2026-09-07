'use client';

import { useState } from 'react';
import { X, Maximize2 } from 'lucide-react';
import { createMeeting } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface ScheduleMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ScheduleMeetingModal({ isOpen, onClose }: ScheduleMeetingModalProps) {
  const [title, setTitle] = useState("Harsh Shukla's Zoom Meeting");
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [duration, setDuration] = useState(30);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSchedule = async () => {
    if (!startDate || !startTime) {
      setError('Please fill in date and time');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const scheduledAt = `${startDate}T${startTime}`;
      const meeting = await createMeeting({
        title,
        description,
        scheduled_at: scheduledAt,
        duration_minutes: duration,
      });

      router.refresh();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to schedule meeting');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#232325] flex justify-between items-center px-6 py-4 border-b border-[#3A3A3C]">
          <h2 className="text-2xl font-bold text-white">Schedule Meeting</h2>
          <div className="flex gap-2">
            <button className="text-[#A0A0A0] hover:text-white">
              <Maximize2 size={20} />
            </button>
            <button onClick={onClose} className="text-[#A0A0A0] hover:text-white">
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="px-6 py-6 space-y-6">
          {/* Info banner */}
          <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-3 flex gap-2">
            <div className="text-blue-400 text-sm">
              You haven't connected your calendar yet. <span className="text-blue-400 cursor-pointer underline">Connect now</span>
            </div>
          </div>

          {/* Title */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-base w-full text-lg font-semibold"
          />

          {/* Date/Time */}
          <div className="grid grid-cols-4 gap-3">
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input-base" />
            <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="input-base" />
            <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="input-base" />
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input-base" disabled />
          </div>

          {/* Timezone */}
          <select className="input-base w-full">
            <option>(GMT+05:30) Mumbai, Kolkata, ...</option>
          </select>

          {/* Repeat */}
          <div className="flex items-center gap-3">
            <label className="text-[#A0A0A0]">Repeat</label>
            <select className="input-base flex-1">
              <option>Never</option>
            </select>
          </div>

          {/* Invitees */}
          <div>
            <label className="text-white block mb-2">Invitees</label>
            <input type="text" placeholder="Add invitees" className="input-base w-full" />
          </div>

          {/* Meeting ID */}
          <div className="space-y-2">
            <label className="text-white block">Meeting ID</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="meeting-id" defaultChecked className="w-4 h-4" />
                <span className="text-white">Generate Automatically</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="meeting-id" className="w-4 h-4" />
                <span className="text-white">Personal Meeting ID ...</span>
              </label>
            </div>
          </div>

          {/* Meeting Agenda */}
          <div>
            <label className="text-white block mb-2">Meeting agenda</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add agenda"
              className="input-base w-full"
              rows={3}
            />
          </div>

          {/* Security */}
          <div className="space-y-2">
            <label className="text-white block">Meeting Security</label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4" />
              <span className="text-[#A0A0A0]">Waiting Room</span>
            </label>
          </div>

          {error && <p className="text-[#E02828] text-sm">{error}</p>}

          {/* Footer */}
          <div className="flex justify-between items-center sticky bottom-0 bg-[#232325] -mx-6 -mb-6 px-6 py-4 border-t border-[#3A3A3C]">
            <button className="text-blue-400 hover:underline">More Options</button>
            <button
              onClick={handleSchedule}
              disabled={loading}
              className="btn-primary disabled:opacity-50"
            >
              {loading ? 'Scheduling...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
