'use client';

import { Sparkles, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';

interface Meeting {
  meeting_id: string;
  title: string;
  scheduled_at?: string | null;
  duration_minutes?: number | null;
  status?: string;
}

interface MeetingCardProps {
  meeting: Meeting;
  onClick?: () => void;
}

export default function MeetingCard({ meeting, onClick }: MeetingCardProps) {
  const startTime = meeting.scheduled_at ? new Date(meeting.scheduled_at) : null;
  const endTime =
    startTime && meeting.duration_minutes
      ? new Date(startTime.getTime() + meeting.duration_minutes * 60_000)
      : null;

  return (
    <div className="meeting-entry" onClick={onClick} role="button" tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick?.(); }}>
      <p className="meeting-entry-title">{meeting.title}</p>
      {startTime && (
        <>
          <p className="meeting-entry-sub">
            {format(startTime, 'EEEE, MMM d')}
          </p>
          <p className="meeting-entry-sub">
            {format(startTime, 'HH:mm')} - {endTime ? format(endTime, 'HH:mm') : 'TBD'}
          </p>
        </>
      )}
      <p className="meeting-entry-host">Host: Local User</p>

      <div className="meeting-entry-actions">
        <button
          className="ai-pill"
          onClick={(e) => e.stopPropagation()}
          aria-label="AI Companion"
        >
          <Sparkles size={12} />
          AI Companion
          <ChevronDown size={11} style={{ color: 'var(--text-tertiary)' }} />
        </button>
      </div>
    </div>
  );
}
