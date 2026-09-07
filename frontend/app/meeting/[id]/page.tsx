'use client';

import { useEffect, useState } from 'react';
import { getMeeting, getRecentMeetings } from '@/lib/api';
import { useRouter, useParams } from 'next/navigation';
import { Mic, Video, Shield, Users, MessageCircle, Share2, Circle, MoreVertical, LogOut } from 'lucide-react';

export default function MeetingRoom() {
  const params = useParams();
  const meetingId = params.id as string;
  const router = useRouter();
  const [meeting, setMeeting] = useState<any>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [participantCount, setParticipantCount] = useState(1);

  useEffect(() => {
    loadMeeting();
  }, [meetingId]);

  const loadMeeting = async () => {
    try {
      const data = await getMeeting(meetingId);
      setMeeting(data);
    } catch (err) {
      console.error('Failed to load meeting', err);
      router.push('/');
    }
  };

  if (!meeting) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0A0A0A]">
        <div className="text-[#A0A0A0]">Loading meeting...</div>
      </div>
    );
  }

  const participants = ['You', 'Victoria Reyes', 'Henry Park'];

  return (
    <div className="h-screen bg-[#0A0A0A] flex flex-col">
      {/* Top participant bar */}
      <div className="bg-[#1C1C1E] border-b border-[#3A3A3C] px-6 py-4 flex items-center gap-4 overflow-x-auto">
        <div className="text-white text-sm font-semibold mr-4">Zoom Meeting</div>
        <div className="flex gap-3">
          {participants.slice(0, 3).map((name, i) => (
            <div key={i} className={`w-24 h-24 rounded-lg flex items-end justify-start p-2 ${i === 1 ? 'border-4 border-[#00FF00]' : 'border border-[#3A3A3C]'} bg-gradient-to-br from-gray-700 to-gray-900`}>
              <div className="bg-black/50 px-2 py-1 rounded text-xs text-white">{name}</div>
            </div>
          ))}
        </div>
        <button className="ml-auto text-white text-sm hover:bg-[#2D2D2E] px-3 py-2 rounded flex items-center gap-2">
          📊 View
        </button>
      </div>

      {/* Main video area */}
      <div className="flex-1 bg-[#0A0A0A] flex items-center justify-center relative overflow-hidden">
        <div className="w-full h-full max-w-4xl max-h-[600px] bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center relative">
          <div className="text-center">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 mx-auto mb-4 flex items-center justify-center">
              <span className="text-4xl">👤</span>
            </div>
            <p className="text-white text-lg font-semibold">You</p>
            <p className="text-[#A0A0A0] text-sm mt-1">Your video is {isVideoOn ? 'on' : 'off'}</p>
          </div>
        </div>
      </div>

      {/* Bottom control bar */}
      <div className="bg-[#1C1C1E] border-t border-[#3A3A3C] px-8 py-4 flex items-center justify-center gap-4">
        {/* Mute */}
        <div className="relative group">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className={`${isMuted ? 'bg-[#E02828]' : 'text-white'} p-3 rounded-full hover:bg-[#383838] transition`}
          >
            <Mic size={20} />
          </button>
          <button className="text-[#A0A0A0] text-xs ml-2 hover:text-white">▲</button>
        </div>

        {/* Stop Video */}
        <div className="relative group">
          <button
            onClick={() => setIsVideoOn(!isVideoOn)}
            className={`${!isVideoOn ? 'bg-[#E02828]' : 'text-white'} p-3 rounded-full hover:bg-[#383838] transition`}
          >
            <Video size={20} />
          </button>
          <button className="text-[#A0A0A0] text-xs ml-2 hover:text-white">▲</button>
        </div>

        <div className="w-px h-6 bg-[#3A3A3C]"></div>

        {/* Security */}
        <button className="text-white p-3 rounded-full hover:bg-[#383838] transition">
          <Shield size={20} />
        </button>

        {/* Participants */}
        <button className="text-white p-3 rounded-full hover:bg-[#383838] transition relative">
          <Users size={20} />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{participantCount}</span>
        </button>

        {/* Chat */}
        <button className="text-white p-3 rounded-full hover:bg-[#383838] transition">
          <MessageCircle size={20} />
        </button>

        {/* Share Screen */}
        <button className="bg-[#23D959] text-white p-3 rounded-full hover:bg-[#1AB147] transition flex items-center gap-2">
          <Share2 size={20} />
        </button>

        {/* Record */}
        <button className="text-white p-3 rounded-full hover:bg-[#383838] transition">
          <Circle size={20} />
        </button>

        {/* More */}
        <button className="text-white p-3 rounded-full hover:bg-[#383838] transition">
          <MoreVertical size={20} />
        </button>

        <div className="flex-1"></div>

        {/* End button */}
        <button
          onClick={() => router.push('/')}
          className="bg-[#E02828] text-white px-8 py-3 rounded-lg hover:bg-red-700 transition font-semibold flex items-center gap-2"
        >
          <LogOut size={18} />
          End
        </button>
      </div>
    </div>
  );
}
