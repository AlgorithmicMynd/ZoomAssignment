'use client';

import { useState, useRef, useEffect } from 'react';
import { Video, Plus, Calendar, ChevronDown, ChevronRight } from 'lucide-react';

interface ActionButtonsProps {
  onNewMeeting: () => void;
  onJoinMeeting: () => void;
  onScheduleMeeting: () => void;
}

export default function ActionButtons({ onNewMeeting, onJoinMeeting, onScheduleMeeting }: ActionButtonsProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [submenuOpen, setSubmenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
        setSubmenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="action-row">

      {/* New meeting */}
      <div className="action-btn-wrap" ref={dropdownRef} style={{ position: 'relative' }}>
        <button
          id="btn-new-meeting"
          onClick={onNewMeeting}
          className="action-squircle orange"
          title="New meeting"
        >
          <Video size={28} strokeWidth={1.8} />
        </button>
        <span 
          className="action-label" 
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 2 }}
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          New meeting <span className="action-chevron"><ChevronDown size={11} /></span>
        </span>
        
        {dropdownOpen && (
          <div className="new-meeting-dropdown">
            <label className="nm-dropdown-item">
              <input type="checkbox" defaultChecked />
              Start with video
            </label>
            <label className="nm-dropdown-item">
              <input type="checkbox" />
              Use my personal meeting ID (PMI)
            </label>
            <div 
              className="nm-dropdown-item has-submenu"
              onMouseEnter={() => setSubmenuOpen(true)}
              onMouseLeave={() => setSubmenuOpen(false)}
            >
              <span className="pmi-number">973 470 9238</span>
              <ChevronRight size={14} />
              
              {submenuOpen && (
                <div className="nm-submenu">
                  <button className="nm-submenu-item">Copy meeting link</button>
                  <button className="nm-submenu-item">Copy ID</button>
                  <button className="nm-submenu-item">Copy invitation</button>
                  <div className="nm-separator" />
                  <button className="nm-submenu-item">PMI settings</button>
                </div>
              )}
            </div>
          </div>
        )}
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

    </div>
  );
}
