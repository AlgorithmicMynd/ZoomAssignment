'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import ActionButtons from '@/components/ActionButtons';
import MeetingCard from '@/components/MeetingCard';
import JoinMeetingModal from '@/components/modals/JoinMeetingModal';
import ScheduleMeetingModal from '@/components/modals/ScheduleMeetingModal';
import { createMeeting, getUpcomingMeetings, getRecentMeetings } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

export default function Home() {
  const [upcomingMeetings, setUpcomingMeetings] = useState<any[]>([]);
  const [recentMeetings, setRecentMeetings] = useState<any[]>([]);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadMeetings();
  }, []);

  const loadMeetings = async () => {
    try {
      const [upcoming, recent] = await Promise.all([
        getUpcomingMeetings(),
        getRecentMeetings(),
      ]);
      setUpcomingMeetings(upcoming);
      setRecentMeetings(recent);
    } catch (err) {
      console.error('Failed to load meetings', err);
    }
  };

  const handleNewMeeting = async () => {
    setLoading(true);
    try {
      const meeting = await createMeeting();
      router.push(`/meeting/${meeting.meeting_id}`);
    } catch (err) {
      console.error('Failed to create meeting', err);
    } finally {
      setLoading(false);
    }
  };

  const now = new Date();
  const displayTime = format(now, 'h:mm a');
  const displayDate = format(now, 'EEEE, d MMMM');

  return (
    <div className="flex h-screen bg-[#1C1C1E]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto px-12 py-8">
          {/* Pro tip banner */}
          <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-4 mb-8 flex justify-between items-center">
            <div>
              <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-semibold mr-3">PRO TIP</span>
              <span className="text-[#A0A0A0]">Accomplish more on your to-do list with Zoom Workplace Pro!</span>
            </div>
            <button className="text-[#A0A0A0] hover:text-white">×</button>
          </div>

          {/* Time display */}
          <div className="text-center mb-12">
            <div className="text-6xl font-bold text-white mb-2">{displayTime}</div>
            <div className="text-[#A0A0A0]">{displayDate}</div>
          </div>

          {/* Action buttons */}
          <ActionButtons
            onNewMeeting={handleNewMeeting}
            onJoinMeeting={() => setShowJoinModal(true)}
            onScheduleMeeting={() => setShowScheduleModal(true)}
          />

          {/* Calendar alert banner */}
          <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-4 mb-8 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="text-blue-400">ℹ</div>
              <span className="text-[#A0A0A0]">
                You haven't connected your calendar yet.
                <span className="text-blue-400 cursor-pointer ml-1 underline">Connect now</span>
              </span>
            </div>
            <button className="text-[#A0A0A0] hover:text-white">×</button>
          </div>

          {/* Upcoming meetings */}
          <div className="card">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#3A3A3C]">
              <div>
                <span className="mr-2">+</span>
                <span className="text-white font-semibold">Today {format(now, 'MMM d')} ▼</span>
              </div>
              <div className="flex items-center gap-2">
                <button className="text-[#A0A0A0] hover:text-white px-3 py-1 border border-[#3A3A3C] rounded-md">Today</button>
                <button className="text-[#A0A0A0] hover:text-white">←</button>
                <button className="text-[#A0A0A0] hover:text-white">→</button>
                <button className="text-[#A0A0A0] hover:text-white">⋯</button>
              </div>
            </div>

            {upcomingMeetings.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-[#A0A0A0] mb-4">☂️</div>
                <p className="text-[#A0A0A0] mb-4">No meetings scheduled.</p>
                <button
                  onClick={() => setShowScheduleModal(true)}
                  className="text-blue-400 hover:underline"
                >
                  + Schedule a meeting
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingMeetings.map((meeting) => (
                  <MeetingCard key={meeting.meeting_id} meeting={meeting} />
                ))}
              </div>
            )}

            <div className="text-[#A0A0A0] text-sm cursor-pointer hover:text-white mt-6 pt-4 border-t border-[#3A3A3C]">
              Open recordings {'>'}
            </div>
          </div>

          {/* Recent meetings */}
          {recentMeetings.length > 0 && (
            <div className="card mt-8">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#3A3A3C]">
                <h3 className="text-white font-semibold">Recent Meetings</h3>
              </div>
              <div className="space-y-3">
                {recentMeetings.map((meeting) => (
                  <MeetingCard key={meeting.meeting_id} meeting={meeting} />
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      <JoinMeetingModal isOpen={showJoinModal} onClose={() => setShowJoinModal(false)} />
      <ScheduleMeetingModal isOpen={showScheduleModal} onClose={() => { setShowScheduleModal(false); loadMeetings(); }} />
    </div>
  );
}
