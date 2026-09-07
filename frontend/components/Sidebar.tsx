'use client';

import Link from 'next/link';
import { Home, Video, MessageCircle, Settings, MoreVertical, Zap } from 'lucide-react';

export default function Sidebar() {
  return (
    <aside className="w-20 bg-[#1C1C1E] border-r border-[#3A3A3C] flex flex-col items-center py-6 gap-8 h-screen sticky top-0">
      <Link href="/" className="text-white hover:bg-[#383838] p-3 rounded-lg transition">
        <Home size={24} />
        <span className="text-xs mt-1 text-[#A0A0A0]">Home</span>
      </Link>

      <button className="text-white hover:bg-[#383838] p-3 rounded-lg transition">
        <Zap size={24} />
        <span className="text-xs mt-1 text-[#A0A0A0]">ZoomMate</span>
      </button>

      <button className="text-white hover:bg-[#383838] p-3 rounded-lg transition">
        <Video size={24} />
        <span className="text-xs mt-1 text-[#A0A0A0]">Meetings</span>
      </button>

      <button className="text-white hover:bg-[#383838] p-3 rounded-lg transition">
        <MessageCircle size={24} />
        <span className="text-xs mt-1 text-[#A0A0A0]">Chat</span>
      </button>

      <button className="text-white hover:bg-[#383838] p-3 rounded-lg transition">
        <Zap size={24} />
        <span className="text-xs mt-1 text-[#A0A0A0]">Hub</span>
      </button>

      <button className="text-white hover:bg-[#383838] p-3 rounded-lg transition">
        <MoreVertical size={24} />
        <span className="text-xs mt-1 text-[#A0A0A0]">More</span>
      </button>

      <div className="flex-1"></div>

      <button className="text-white hover:bg-[#383838] p-3 rounded-lg transition">
        <Settings size={24} />
        <span className="text-xs mt-1 text-[#A0A0A0]">Settings</span>
      </button>
    </aside>
  );
}
