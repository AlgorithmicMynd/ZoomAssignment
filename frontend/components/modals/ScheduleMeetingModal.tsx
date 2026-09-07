'use client';

import { useState } from 'react';
import { X, Maximize2, Info } from 'lucide-react';
import { createMeeting } from '@/lib/api';

interface ScheduleMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function todayStr() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function nowTimePlusMins(mins: number) {
  const d = new Date(Date.now() + mins * 60_000);
  return d.toTimeString().slice(0, 5);
}

export default function ScheduleMeetingModal({ isOpen, onClose }: ScheduleMeetingModalProps) {
  const [title, setTitle] = useState("Harsh Shukla's Zoom Meeting");
  const [startDate, setStartDate] = useState(todayStr());
  const [startTime, setStartTime] = useState(nowTimePlusMins(5));
  const [endTime, setEndTime] = useState(nowTimePlusMins(35));
  const [meetingIdType, setMeetingIdType] = useState<'auto' | 'personal'>('auto');
  const [agenda, setAgenda] = useState('');
  const [waitingRoom, setWaitingRoom] = useState(false);
  const [myNotes, setMyNotes] = useState(true);
  const [continuousChat, setContinuousChat] = useState(true);
  const [hostVideoOff, setHostVideoOff] = useState(true);
  const [participantVideoOff, setParticipantVideoOff] = useState(true);
  const [calendarType, setCalendarType] = useState<'outlook' | 'ical' | 'google' | 'other'>('outlook');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [calBannerVisible, setCalBannerVisible] = useState(true);

  const computeDuration = () => {
    try {
      const [sh, sm] = startTime.split(':').map(Number);
      const [eh, em] = endTime.split(':').map(Number);
      const diff = (eh * 60 + em) - (sh * 60 + sm);
      return diff > 0 ? diff : 30;
    } catch { return 30; }
  };

  const handleSave = async () => {
    if (!title.trim()) { setError('Meeting title is required'); return; }
    if (!startDate || !startTime) { setError('Please choose a date and time'); return; }

    setLoading(true);
    setError('');
    try {
      const scheduledAt = `${startDate}T${startTime}:00`;
      await createMeeting({
        title: title.trim(),
        description: agenda.trim() || undefined,
        scheduled_at: scheduledAt,
        duration_minutes: computeDuration(),
      });
      onClose();
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || 'Failed to schedule meeting');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-box md" style={{ display: 'flex', flexDirection: 'column' }}>

        {/* ── Sticky top ── */}
        {calBannerVisible && (
          <div className="cal-banner" style={{ margin: '14px 14px 0', borderRadius: 8 }}>
            <span className="cal-banner-icon"><Info size={15} /></span>
            <span className="cal-banner-text">
              You haven&apos;t connected your calendar yet.{' '}
              <span className="cal-banner-link">Connect now</span>
              {' '}to manage all your meetings and events in one place.
            </span>
            <button className="cal-banner-close" onClick={() => setCalBannerVisible(false)}>×</button>
          </div>
        )}

        <div style={{ overflowY: 'auto', flex: 1 }}>
          <div style={{ padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ flex: 1 }} />
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="action-icon-btn"><Maximize2 size={14} /></button>
              <button className="action-icon-btn" onClick={onClose}><X size={16} /></button>
            </div>
          </div>

          <div style={{ padding: '0 20px 0' }}>
            {/* Title input */}
            <input
              id="schedule-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="form-input title-input"
              style={{ marginBottom: 16 }}
            />

            {/* Date/time row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8, marginBottom: 10 }}>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="form-input" />
              <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="form-input" />
              <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="form-input" />
              <input type="date" value={startDate} readOnly className="form-input" style={{ opacity: 0.6 }} />
            </div>

            {/* Timezone */}
            <div style={{ marginBottom: 10 }}>
              <select className="form-select">
                <option>(GMT+05:30) Mumbai, Kolkata, Chennai, New Delhi</option>
              </select>
            </div>

            {/* Repeat */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)', minWidth: 50 }}>Repeat</span>
              <select className="form-select" style={{ maxWidth: 140 }}>
                <option>Never</option>
                <option>Daily</option>
                <option>Weekly</option>
                <option>Monthly</option>
              </select>
            </div>

            <hr className="divider" />

            {/* Invitees */}
            <div style={{ marginBottom: 16 }}>
              <label className="form-label">Invitees</label>
              <input type="text" placeholder="Add invitees" className="form-input" />
            </div>

            <hr className="divider" />

            {/* Meeting ID */}
            <div style={{ marginBottom: 16 }}>
              <label className="form-label">Meeting ID</label>
              <div style={{ display: 'flex', gap: 24 }}>
                <label className="form-radio">
                  <input
                    type="radio"
                    name="meeting-id-type"
                    checked={meetingIdType === 'auto'}
                    onChange={() => setMeetingIdType('auto')}
                  />
                  <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>Generate Automatically</span>
                </label>
                <label className="form-radio">
                  <input
                    type="radio"
                    name="meeting-id-type"
                    checked={meetingIdType === 'personal'}
                    onChange={() => setMeetingIdType('personal')}
                  />
                  <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>Personal Meeting ID 973 470 9238</span>
                </label>
              </div>
            </div>

            <hr className="divider" />

            {/* Meeting agenda */}
            <div style={{ marginBottom: 16 }}>
              <label className="form-label">Meeting agenda</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <button className="btn-link" style={{ fontSize: 13 }}>Create agenda</button>
                <span className="badge-new">NEW</span>
              </div>
              <textarea
                value={agenda}
                onChange={(e) => setAgenda(e.target.value)}
                placeholder="Add agenda / description"
                className="form-input"
                rows={3}
                style={{ resize: 'vertical' }}
              />
            </div>

            <hr className="divider" />

            {/* Attachments */}
            <div style={{ marginBottom: 16 }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                Attachments <Info size={13} style={{ color: 'var(--text-tertiary)' }} />
              </label>
              <button className="btn btn-secondary btn-sm">+ Add attachments</button>
            </div>

            <hr className="divider" />

            {/* Meeting Security */}
            <div style={{ marginBottom: 16 }}>
              <label className="form-label">Meeting Security</label>
              <label className="form-checkbox" style={{ marginBottom: 4 }}>
                <input type="checkbox" checked={waitingRoom} onChange={(e) => setWaitingRoom(e.target.checked)} />
                <span className="form-checkbox-label">Waiting Room</span>
              </label>
              <p className="form-sublabel" style={{ marginLeft: 23 }}>Only users admitted by the host can join the meeting</p>

              {/* Encryption */}
              <div style={{ marginTop: 12 }}>
                <label className="form-label">Encryption</label>
                <div style={{ display: 'flex', gap: 28 }}>
                  <label className="form-radio">
                    <input type="radio" name="enc" defaultChecked />
                    <span style={{ fontSize: 13, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      🛡️ Enhanced encryption <Info size={12} style={{ color: 'var(--text-tertiary)' }} />
                    </span>
                  </label>
                  <label className="form-radio">
                    <input type="radio" name="enc" />
                    <span style={{ fontSize: 13, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      🔒 End-to-end encryption <Info size={12} style={{ color: 'var(--text-tertiary)' }} />
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <hr className="divider" />

            {/* My Notes */}
            <div style={{ marginBottom: 16 }}>
              <label className="form-label">My Notes</label>
              <label className="form-checkbox">
                <input type="checkbox" checked={myNotes} onChange={(e) => setMyNotes(e.target.checked)} />
                <span className="form-checkbox-label">Allow everyone to use the meeting transcript with My Notes</span>
              </label>
            </div>

            <hr className="divider" />

            {/* Meeting chat */}
            <div style={{ marginBottom: 16 }}>
              <label className="form-label">Meeting chat</label>
              <label className="form-checkbox" style={{ marginBottom: 4 }}>
                <input type="checkbox" checked={continuousChat} onChange={(e) => setContinuousChat(e.target.checked)} />
                <span className="form-checkbox-label">Enable Continuous Meeting Chat <Info size={12} style={{ color: 'var(--text-tertiary)', display: 'inline' }} /></span>
              </label>
              <p className="form-sublabel" style={{ marginLeft: 23 }}>Added invitees will have access to the Meeting Group Chat before and after the meeting.</p>
            </div>

            <hr className="divider" />

            {/* Video */}
            <div style={{ marginBottom: 16 }}>
              <label className="form-label">Video</label>
              <div style={{ display: 'flex', gap: 40 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Host: {hostVideoOff ? 'Off' : 'On'}</span>
                  <label className="form-toggle">
                    <input type="checkbox" checked={!hostVideoOff} onChange={(e) => setHostVideoOff(!e.target.checked)} />
                    <div className="toggle-track"><div className="toggle-thumb" /></div>
                  </label>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Participant: {participantVideoOff ? 'Off' : 'On'}</span>
                  <label className="form-toggle">
                    <input type="checkbox" checked={!participantVideoOff} onChange={(e) => setParticipantVideoOff(!e.target.checked)} />
                    <div className="toggle-track"><div className="toggle-thumb" /></div>
                  </label>
                </div>
              </div>
            </div>

            <hr className="divider" />

            {/* Audio */}
            <div style={{ marginBottom: 16 }}>
              <label className="form-label">Audio</label>
              <label className="form-radio">
                <input type="radio" name="audio-type" defaultChecked />
                <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>Computer Audio</span>
              </label>
            </div>

            <hr className="divider" />

            {/* Calendar */}
            <div style={{ marginBottom: 20 }}>
              <label className="form-label">Calendar</label>
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                {(['ical', 'outlook', 'google', 'other'] as const).map((cal) => (
                  <label key={cal} className="form-radio">
                    <input
                      type="radio"
                      name="calendar-type"
                      checked={calendarType === cal}
                      onChange={() => setCalendarType(cal)}
                    />
                    <span style={{ fontSize: 13, color: 'var(--text-primary)', textTransform: 'capitalize' }}>
                      {cal === 'ical' ? 'iCal' : cal === 'google' ? 'Google Calendar' : cal === 'other' ? 'Other Calendars' : 'Outlook'}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Advanced */}
            <div style={{ marginBottom: 16 }}>
              <button className="btn-ghost btn" style={{ padding: '4px 0', fontSize: 13, gap: 6 }}>
                <span>›</span> <span>Advanced</span>
              </button>
            </div>

            {error && <p style={{ fontSize: 12, color: 'var(--red)', marginBottom: 12 }}>{error}</p>}
          </div>
        </div>

        {/* Sticky footer */}
        <div style={{
          borderTop: '1px solid var(--border-color)',
          padding: '12px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'var(--bg-secondary)',
          flexShrink: 0,
          borderRadius: '0 0 16px 16px',
        }}>
          <button className="btn-link">More Options</button>
          <button
            id="btn-schedule-save"
            className="btn btn-primary"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
