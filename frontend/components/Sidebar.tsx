'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Video, MessageCircle, Settings, MoreHorizontal, Zap } from 'lucide-react';

const navItems = [
  { icon: Home, label: 'Home', href: '/' },
  { icon: Zap, label: 'ZoomMate', href: '#' },
  { icon: Video, label: 'Meetings', href: '#' },
  { icon: MessageCircle, label: 'Chat', href: '#' },
  { icon: Zap, label: 'Hub', href: '#' },
  { icon: MoreHorizontal, label: 'More', href: '#' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      {navItems.map(({ icon: Icon, label, href }) => {
        const isActive = href === '/' ? pathname === '/' : false;
        return (
          <Link
            key={label}
            href={href}
            className={`sidebar-item${isActive ? ' active' : ''}`}
          >
            <span className="sidebar-icon">
              <Icon size={22} strokeWidth={1.5} />
            </span>
            <span className="sidebar-label">{label}</span>
          </Link>
        );
      })}

      <div className="sidebar-spacer" />

      <Link href="#" className="sidebar-item">
        <span className="sidebar-icon">
          <Settings size={22} strokeWidth={1.5} />
        </span>
        <span className="sidebar-label">Settings</span>
      </Link>
    </aside>
  );
}
