'use client';

import { Sparkles, MessageCircle, MoreVertical } from 'lucide-react';
import { format } from 'date-fns';

interface Meeting {
  meeting_id: string;
  title: string;
  scheduled_at?: string;
  duration_minutes?: number;
}

export default function MeetingCard({ meeting }: { meeting: Meeting }) {
  const startTime = meeting.scheduled_at ? new Date(meeting.scheduled_at) : null;
  const endTime = startTime && meeting.duration_minutes ? new Date(startTime.getTime() + meeting.duration_minutes * 60000) : null;

  return (
    <div className="bg-[#2D2D2E] rounded-lg p-4 hover:bg-[#383838] transition">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="text-white font-semibold">{meeting.title}</h3>
          {startTime && (
            <>
              <p className="text-[#A0A0A0] text-sm">{format(startTime, 'EEEE, MMM d')}</p>
              <p className="text-[#A0A0A0] text-sm">
                {format(startTime, 'HH:mm')} - {endTime ? format(endTime, 'HH:mm') : 'TBD'}
              </p>
            </>
          )}
          <p className="text-[#6A6A6A] text-xs mt-1">Host: Harsh Shukla</p>
        </div>
      </div>
      <div className="flex gap-2 items-center">
        <button className="flex items-center gap-1 bg-[#1C1C1E] px-3 py-2 rounded-full text-sm text-white hover:bg-[#2D2D2E] transition">
          <Sparkles size={16} />
          AI Companion
        </button>
        <button className="text-[#A0A0A0] hover:text-white transition">
          <MessageCircle size={18} />
        </button>
        <button className="text-[#A0A0A0] hover:text-white transition">
          <MoreVertical size={18} />
        </button>
      </div>
    </div>
  );
}
