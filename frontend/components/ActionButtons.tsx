'use client';

import { Video, Plus, Calendar, Share2, FileText } from 'lucide-react';

interface ActionButtonsProps {
  onNewMeeting: () => void;
  onJoinMeeting: () => void;
  onScheduleMeeting: () => void;
}

export default function ActionButtons({ onNewMeeting, onJoinMeeting, onScheduleMeeting }: ActionButtonsProps) {
  return (
    <div className="flex gap-6 justify-center mb-12">
      <button
        onClick={onNewMeeting}
        className="btn-squircle bg-[#F26D21] hover:bg-[#E55A0E] flex flex-col items-center gap-2"
      >
        <Video size={32} />
        <span className="text-xs text-[#A0A0A0] mt-2">New meeting</span>
      </button>

      <button
        onClick={onJoinMeeting}
        className="btn-squircle bg-[#0E72ED] hover:bg-[#0557B8] flex flex-col items-center gap-2"
      >
        <Plus size={32} />
        <span className="text-xs text-[#A0A0A0] mt-2">Join</span>
      </button>

      <button
        onClick={onScheduleMeeting}
        className="btn-squircle bg-[#0E72ED] hover:bg-[#0557B8] flex flex-col items-center gap-2"
      >
        <Calendar size={32} />
        <span className="text-xs text-[#A0A0A0] mt-2">Schedule</span>
      </button>

      <button className="btn-squircle bg-[#0E72ED] hover:bg-[#0557B8] flex flex-col items-center gap-2">
        <Share2 size={32} />
        <span className="text-xs text-[#A0A0A0] mt-2">Share screen</span>
      </button>

      <button className="btn-squircle bg-[#0E72ED] hover:bg-[#0557B8] flex flex-col items-center gap-2">
        <FileText size={32} />
        <span className="text-xs text-[#A0A0A0] mt-2">My Notes</span>
      </button>
    </div>
  );
}
