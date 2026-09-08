/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect, useCallback } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import ActionButtons from '@/components/ActionButtons';
import MeetingCard from '@/components/MeetingCard';
import MeetingDetailPopup from '@/components/MeetingDetailPopup';
import JoinMeetingModal from '@/components/modals/JoinMeetingModal';
import ScheduleMeetingModal from '@/components/modals/ScheduleMeetingModal';
import { generateRandomName } from '@/lib/randomName';
import { createMeeting, getUpcomingMeetings, getRecentMeetings } from '@/lib/api';
import { useRouter } from 'next/navigation';

function useClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

function formatTime(d: Date) {
  const h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
}

function formatDate(d: Date) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]}`;
}

export default function Home() {
  const now = useClock();
  const [upcomingMeetings, setUpcomingMeetings] = useState<any[]>([]);
  const [recentMeetings, setRecentMeetings] = useState<any[]>([]);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<any | null>(null);
  const [proBannerVisible, setProBannerVisible] = useState(true);
  const [calBannerVisible, setCalBannerVisible] = useState(true);
  const router = useRouter();

  const loadMeetings = useCallback(async () => {
    try {
      const [upcoming, recent] = await Promise.all([
        getUpcomingMeetings(),
        getRecentMeetings(),
      ]);
      setUpcomingMeetings(upcoming || []);
      setRecentMeetings(recent || []);
    } catch (err) {
      console.error('Failed to load meetings', err);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadMeetings();
  }, [loadMeetings]);

  // Additional client-side classification:
  // If a meeting's scheduled_at is in the past but the backend still returned it in upcoming
  // (e.g. backend clock vs local clock skew), keep it sorted correctly.
  const nowMs = now.getTime();

  // Partition upcoming meetings: only truly future ones show in Today section
  const futureMeetings = upcomingMeetings.filter((m) => {
    if (!m.scheduled_at) return false;
    return new Date(m.scheduled_at).getTime() > nowMs;
  });

  // Past scheduled meetings (from upcoming list) merge into recent
  const pastFromUpcoming = upcomingMeetings.filter((m) => {
    if (!m.scheduled_at) return false;
    return new Date(m.scheduled_at).getTime() <= nowMs;
  });

  // Combined recent list: past-from-upcoming (newer) + backend recent, deduplicated
  const allRecentIds = new Set(recentMeetings.map((m: any) => m.meeting_id));
  const mergedRecent = [
    ...pastFromUpcoming.filter((m) => !allRecentIds.has(m.meeting_id)),
    ...recentMeetings,
  ].sort((a, b) => {
    const timeA = new Date(a.ended_at || a.scheduled_at || a.created_at).getTime();
    const timeB = new Date(b.ended_at || b.scheduled_at || b.created_at).getTime();
    return timeB - timeA;
  }).slice(0, 3);

  const handleNewMeeting = async () => {
    try {
      const meeting = await createMeeting({ title: `${generateRandomName()}'s Zoom Meeting` });
      router.push(`/meeting/${meeting.meeting_id}`);
    } catch (err) {
      alert('Failed to create meeting: ' + (err as Error).message);
    }
  };

  const handleScheduleClose = () => {
    setShowScheduleModal(false);
    loadMeetings();
  };

  return (
    <div className="layout-shell">
      <Sidebar />

      {/* Detail popup (left panel overlay over main content) */}
      {selectedMeeting && (
        <MeetingDetailPopup
          meeting={selectedMeeting}
          onClose={() => setSelectedMeeting(null)}
        />
      )}

      <div className="main-column">
        <Header />

        {/* Pro tip banner */}
        {proBannerVisible && (
          <div className="pro-tip-banner">
            <span className="pro-tip-badge">PRO TIP</span>
            <span className="pro-tip-text">
              Accomplish more on your to-do list with Zoom Workplace Pro! You&apos;ll get longer meetings, unlimited AI note-taking with My Notes, 10GB Cloud Storage, and more! Upgrade today.
            </span>
            <button className="pro-tip-close" onClick={() => setProBannerVisible(false)} aria-label="Dismiss">×</button>
          </div>
        )}

        {/* Scrollable content area */}
        <main className="dashboard-main">
          {/* All centered content */}
          <div className="dashboard-center">
            {/* Clock */}
            <div className="clock-area">
              <div className="clock-time">{formatTime(now)}</div>
              <div className="clock-date">{formatDate(now)}</div>
            </div>

            {/* Action buttons */}
            <ActionButtons
              onNewMeeting={handleNewMeeting}
              onJoinMeeting={() => setShowJoinModal(true)}
              onScheduleMeeting={() => setShowScheduleModal(true)}
            />

            {/* Calendar alert banner */}
            {calBannerVisible && (
              <div className="cal-banner">
                <span className="cal-banner-icon">ℹ</span>
                <span className="cal-banner-text">
                  You haven&apos;t connected your calendar yet. Connect now to manage all your meetings and events in one place.
                </span>
                <button className="cal-banner-close" onClick={() => setCalBannerVisible(false)} aria-label="Dismiss">×</button>
              </div>
            )}

            {/* ── Upcoming / Today meetings card ── */}
            <div className="meetings-card">
              {/* Row 1: + Today, Sep 7 ▾ */}
              <div className="meetings-card-header-top">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button
                    onClick={() => setShowScheduleModal(true)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: 18, lineHeight: 1, cursor: 'pointer', padding: 0 }}
                    aria-label="Add meeting"
                  >+</button>
                  <span className="meetings-card-title">
                    Today, {now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ▾
                  </span>
                </div>
              </div>

              {/* Row 2: 📅 Today ‹ › ··· */}
              <div className="meetings-card-header-nav">
                <button className="date-nav-btn">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                  Today
                </button>
              </div>

              {/* Body */}
              <div className="meetings-body">
                {futureMeetings.length === 0 ? (
                  <div className="meetings-empty">
                    <p className="meetings-empty-text">No meetings scheduled.</p>
                    <button
                      className="meetings-empty-link"
                      onClick={() => setShowScheduleModal(true)}
                    >
                      + Schedule a meeting
                    </button>
                  </div>
                ) : (
                  futureMeetings.map((m) => (
                    <MeetingCard
                      key={m.meeting_id}
                      meeting={m}
                      onClick={() => setSelectedMeeting(m)}
                    />
                  ))
                )}
              </div>
            </div>

            {/* ── Recent meetings ── */}
            {mergedRecent.length > 0 && (
              <div className="meetings-card" style={{ marginTop: 16 }}>
                <div className="meetings-card-header-top">
                  <span className="meetings-card-title">Recent Meetings</span>
                </div>
                <div className="meetings-body">
                  {mergedRecent.map((m) => (
                    <MeetingCard
                      key={m.meeting_id}
                      meeting={m}
                      onClick={() => setSelectedMeeting(m)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>{/* end .dashboard-center */}
        </main>
      </div>

      {/* Modals */}
      <JoinMeetingModal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
      />
      <ScheduleMeetingModal
        isOpen={showScheduleModal}
        onClose={handleScheduleClose}
      />
    </div>
  );
}
