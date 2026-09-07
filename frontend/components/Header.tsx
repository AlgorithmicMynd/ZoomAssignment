'use client';

import { Search, Plus } from 'lucide-react';

export default function Header() {
  return (
    <header className="top-nav">
      {/* Left section */}
      <div style={{ display: 'flex', alignItems: 'center', flex: 1, gap: 4 }}>
        {/* Logo */}
        <div className="top-nav-logo" style={{ marginRight: 8 }}>
          <span className="logo-zoom">zoom</span>
          <span className="logo-workplace">Workplace</span>
        </div>

        {/* Nav arrows */}
        <div className="nav-btn-group" style={{ marginRight: 4 }}>
          <button className="nav-icon-btn" aria-label="Back">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button className="nav-icon-btn" aria-label="Forward">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
          <button className="nav-icon-btn" aria-label="History">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12a9 9 0 1 1 9 9M3 12V6m0 6H9" />
            </svg>
          </button>
        </div>
      </div>

      {/* Center section */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, gap: 8 }}>
        {/* Search */}
        <div className="search-bar" style={{ margin: 0 }}>
          <Search size={13} className="search-bar-icon" />
          <input type="text" placeholder="Search (⌘E)" aria-label="Search" />
        </div>

        <button className="nav-icon-btn" aria-label="New tab">
          <Plus size={16} />
        </button>
      </div>

      {/* Right section */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', flex: 1 }} className="nav-btn-group">
        <div className="nav-avatar" role="button" aria-label="User profile">
          HS
        </div>
      </div>
    </header>
  );
}
