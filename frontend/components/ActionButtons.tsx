'use client';

import { Video, Plus, Calendar, ArrowUpFromLine, PenLine, ChevronDown } from 'lucide-react';

interface ActionButtonsProps {
  onNewMeeting: () => void;
  onJoinMeeting: () => void;
  onScheduleMeeting: () => void;
}

export default function ActionButtons({ onNewMeeting, onJoinMeeting, onScheduleMeeting }: ActionButtonsProps) {
  return (
    <div className="action-row">

      {/* New meeting */}
      <div className="action-btn-wrap">
        <button
          id="btn-new-meeting"
          onClick={onNewMeeting}
          className="action-squircle orange"
          title="New meeting"
        >
          <Video size={28} strokeWidth={1.8} />
        </button>
        <span className="action-label">
          New meeting <span className="action-chevron"><ChevronDown size={11} /></span>
        </span>
      </div>

      {/* Join */}
      <div className="action-btn-wrap">
        <button
          id="btn-join-meeting"
          onClick={onJoinMeeting}
          className="action-squircle"
          title="Join a meeting"
        >
          <Plus size={28} strokeWidth={1.8} />
        </button>
        <span className="action-label">Join</span>
      </div>

      {/* Schedule */}
      <div className="action-btn-wrap">
        <button
          id="btn-schedule-meeting"
          onClick={onScheduleMeeting}
          className="action-squircle"
          title="Schedule a meeting"
        >
          {/* Calendar with "19" inside */}
          <span style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Calendar size={28} strokeWidth={1.8} />
            <span style={{
              position: 'absolute',
              fontSize: '10px',
              fontWeight: 700,
              marginTop: '6px',
            }}>19</span>
          </span>
        </button>
        <span className="action-label">Schedule</span>
      </div>

      {/* Share screen */}
      <div className="action-btn-wrap">
        <button className="action-squircle" title="Share screen">
          <ArrowUpFromLine size={26} strokeWidth={1.8} />
        </button>
        <span className="action-label">Share screen</span>
      </div>

      {/* My Notes */}
      <div className="action-btn-wrap">
        <button className="action-squircle" title="My Notes">
          <PenLine size={26} strokeWidth={1.8} />
        </button>
        <span className="action-label">My Notes</span>
      </div>

    </div>
  );
}
