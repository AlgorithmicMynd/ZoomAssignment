'use client';

import { Search, Plus, Bell, Calendar, User } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-[#1C1C1E] border-b border-[#3A3A3C] px-8 py-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="text-white font-bold text-lg">zoom</div>
        <div className="text-[#A0A0A0] font-light">Workplace</div>
      </div>

      <div className="flex-1 max-w-sm mx-8">
        <div className="bg-[#2D2D2E] rounded-lg px-4 py-2 flex items-center gap-2 border border-[#3A3A3C]">
          <Search size={18} className="text-[#6A6A6A]" />
          <input
            type="text"
            placeholder="Search (⌘E)"
            className="bg-transparent text-white placeholder-[#6A6A6A] outline-none flex-1"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="text-[#A0A0A0] hover:text-white transition">
          <Plus size={24} />
        </button>
        <button className="text-[#A0A0A0] hover:text-white transition relative">
          <Bell size={24} />
        </button>
        <button className="text-[#A0A0A0] hover:text-white transition">
          <Calendar size={24} />
        </button>
        <button className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
          <User size={18} className="text-white" />
        </button>
      </div>
    </header>
  );
}
