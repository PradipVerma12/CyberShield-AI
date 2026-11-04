'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, Search, Shield, User as UserIcon, LogOut, Settings, Check, X } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/api';
import toast from 'react-hot-toast';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/url-detector': 'URL Detector',
  '/email-analyzer': 'Email Analyzer',
  '/port-scanner': 'Port Scanner',
  '/password-checker': 'Password Checker',
  '/file-encryption': 'File Encryption',
  '/history': 'Scan History',
  '/reports': 'Reports',
  '/profile': 'Profile',
};

const NAV_SEARCH_ITEMS = [
  { label: 'Dashboard Overview', href: '/dashboard', description: 'Real-time security telemetry' },
  { label: 'URL Detector', href: '/url-detector', description: 'Scan malicious URLs & phishing links' },
  { label: 'Email Analyzer', href: '/email-analyzer', description: 'Analyze header & body for spam/phishing' },
  { label: 'Port Scanner', href: '/port-scanner', description: 'Discover open ports & exposed services' },
  { label: 'Password Checker', href: '/password-checker', description: 'Audit password strength & breach exposure' },
  { label: 'File Encryption', href: '/file-encryption', description: 'Client-side AES-256-GCM file encryption' },
  { label: 'Scan History', href: '/history', description: 'Search and inspect previous security scans' },
  { label: 'Reports', href: '/reports', description: 'Export security executive summaries (PDF/CSV)' },
  { label: 'Profile & Settings', href: '/profile', description: 'Manage account security & 2FA' },
];

interface Notification {
  id: string;
  title: string;
  time: string;
  read: boolean;
  type: 'warning' | 'info' | 'success';
}

export default function Topbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, refreshToken, logout } = useAuthStore();
  const title = PAGE_TITLES[pathname] ?? 'CyberShield AI';

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Dropdown states
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Sample notifications state
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: '1', title: 'New port scan completed with 2 open ports', time: '10m ago', read: false, type: 'warning' },
    { id: '2', title: 'Suspicious email detected in analysis', time: '1h ago', read: false, type: 'warning' },
    { id: '3', title: 'System security posture updated', time: '3h ago', read: true, type: 'info' },
  ]);

  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      if (refreshToken) await authService.logout(refreshToken);
    } catch {}
    logout();
    router.push('/login');
    toast.success('Logged out successfully');
  };

  const filteredSearch = NAV_SEARCH_ITEMS.filter(
    (item) =>
      item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <header
      className="flex items-center justify-between h-16 px-6 flex-shrink-0 relative z-40"
      style={{
        background: 'rgba(17,24,39,0.9)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Left: Page title */}
      <div className="flex items-center gap-3">
        <Shield className="text-blue-500" style={{ width: 20, height: 20 }} />
        <h1 className="text-lg font-semibold text-white">{title}</h1>
      </div>

      {/* Right: search + bell + avatar */}
      <div className="flex items-center gap-3">
        {/* Search Bar */}
        <div ref={searchRef} className="relative hidden md:block">
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all focus-within:border-blue-500/50"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <Search style={{ width: 14, height: 14, color: '#6B7280' }} />
            <input
              type="search"
              placeholder="Search features..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              className="bg-transparent outline-none text-sm w-44 focus:w-60 transition-all text-white placeholder-gray-500"
              aria-label="Search navigation"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setIsSearchOpen(false);
                }}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Search Dropdown */}
          {isSearchOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-gray-900 border border-white/10 shadow-2xl p-2 z-50">
              <p className="text-xs font-medium text-gray-500 px-3 py-1.5 uppercase tracking-wider">
                Quick Navigation
              </p>
              {filteredSearch.length === 0 ? (
                <div className="px-3 py-4 text-center text-sm text-gray-400">No matching modules found</div>
              ) : (
                filteredSearch.map((item) => (
                  <button
                    key={item.href}
                    onClick={() => {
                      router.push(item.href);
                      setIsSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/5 transition-colors flex flex-col gap-0.5"
                  >
                    <span className="text-sm font-medium text-gray-200">{item.label}</span>
                    <span className="text-xs text-gray-500 truncate">{item.description}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Notifications Dropdown */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setIsNotifOpen((v) => !v)}
            className="relative flex items-center justify-center w-9 h-9 rounded-xl transition-colors hover:bg-white/5"
            aria-label="Notifications"
          >
            <Bell style={{ width: 18, height: 18, color: '#9CA3AF' }} />
            {unreadCount > 0 && (
              <div
                className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full ring-2 ring-gray-900"
                style={{ background: '#EF4444' }}
              />
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-gray-900 border border-white/10 shadow-2xl z-50 overflow-hidden">
              <div className="p-3 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-white">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 text-xs font-bold bg-blue-500/20 text-blue-400 rounded-md">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" /> Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-white/5">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3 text-xs transition-colors ${
                      !n.read ? 'bg-blue-500/5' : 'hover:bg-white/5'
                    }`}
                  >
                    <p className="font-medium text-gray-200">{n.title}</p>
                    <p className="text-gray-500 mt-1">{n.time}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar Dropdown */}
        <div ref={profileRef} className="relative">
          <button
            onClick={() => setIsProfileOpen((v) => !v)}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold cursor-pointer transition-transform hover:scale-105 active:scale-95 ring-2 ring-transparent hover:ring-blue-500/50"
            style={{ background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', color: 'white' }}
            title={user?.name || 'User Profile'}
            aria-label="User menu"
          >
            {user?.name?.[0]?.toUpperCase() ?? 'U'}
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-gray-900 border border-white/10 shadow-2xl p-2 z-50">
              <div className="px-3 py-2 border-b border-white/5 mb-1">
                <p className="text-sm font-semibold text-white truncate">{user?.name || 'User'}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email || 'user@cybershield.ai'}</p>
              </div>
              <button
                onClick={() => {
                  router.push('/profile');
                  setIsProfileOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium text-gray-300 hover:bg-white/5 transition-colors flex items-center gap-2"
              >
                <UserIcon className="w-4 h-4 text-blue-400" />
                Profile Settings
              </button>
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2 mt-1"
              >
                <LogOut className="w-4 h-4" />
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
