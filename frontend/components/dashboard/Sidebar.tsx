'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  LayoutDashboard,
  Link2,
  Mail,
  Server,
  KeyRound,
  Lock,
  History,
  FileBarChart,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/api';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { type: 'divider', label: 'Security Modules' },
  { href: '/url-detector', label: 'URL Detector', icon: Link2 },
  { href: '/email-analyzer', label: 'Email Analyzer', icon: Mail },
  { href: '/port-scanner', label: 'Port Scanner', icon: Server },
  { href: '/password-checker', label: 'Password Checker', icon: KeyRound },
  { href: '/file-encryption', label: 'File Encryption', icon: Lock },
  { type: 'divider', label: 'Reports & Data' },
  { href: '/history', label: 'Scan History', icon: History },
  { href: '/reports', label: 'Reports', icon: FileBarChart },
  { href: '/profile', label: 'Profile', icon: User },
] as const;

type NavItem =
  | { href: string; label: string; icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }> }
  | { type: 'divider'; label: string };

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, refreshToken, logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      if (refreshToken) await authService.logout(refreshToken);
    } catch {}
    logout();
    router.push('/login');
    toast.success('Logged out successfully');
  };

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="relative flex flex-col h-full flex-shrink-0"
      style={{
        background: 'rgba(17,24,39,0.95)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 p-4 h-16 overflow-hidden">
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="flex-shrink-0"
        >
          <Shield className="text-blue-500" style={{ width: 28, height: 28 }} />
        </motion.div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
              className="text-sm font-bold text-white whitespace-nowrap"
            >
              CyberShield AI
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed((v) => !v)}
        className="absolute -right-3 top-5 z-50 flex items-center justify-center w-6 h-6 rounded-full transition-colors"
        style={{
          background: '#1f2937',
          border: '1px solid rgba(255,255,255,0.1)',
          color: '#9CA3AF',
        }}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? (
          <ChevronRight style={{ width: 12, height: 12 }} />
        ) : (
          <ChevronLeft style={{ width: 12, height: 12 }} />
        )}
      </button>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto overflow-x-hidden">
        {(NAV_ITEMS as unknown as NavItem[]).map((item, idx) => {
          if ('type' in item) {
            return (
              <AnimatePresence key={`div-${idx}`}>
                {!collapsed && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-xs font-semibold uppercase tracking-wider px-3 pt-4 pb-1"
                    style={{ color: '#4B5563' }}
                  >
                    {item.label}
                  </motion.p>
                )}
              </AnimatePresence>
            );
          }

          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-item ${isActive ? 'active' : ''}`}
              title={collapsed ? item.label : undefined}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon
                style={{
                  width: 18,
                  height: 18,
                  flexShrink: 0,
                  color: isActive ? '#3B82F6' : '#6B7280',
                }}
              />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -5 }}
                    transition={{ duration: 0.15 }}
                    className="whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div
        className="p-3 border-t overflow-hidden"
        style={{ borderColor: 'rgba(255,255,255,0.06)' }}
      >
        <div className={`flex items-center gap-3 px-2 py-2 rounded-xl ${collapsed ? 'justify-center' : ''}`}>
          {/* Avatar */}
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
              color: 'white',
            }}
          >
            {user?.name?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -5 }}
                transition={{ duration: 0.15 }}
                className="flex-1 min-w-0"
              >
                <p className="text-sm font-medium text-white truncate">{user?.name ?? 'User'}</p>
                <p className="text-xs truncate" style={{ color: '#6B7280' }}>
                  {user?.email ?? ''}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <button
          onClick={handleLogout}
          className={`mt-2 flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm font-medium transition-all ${
            collapsed ? 'justify-center' : ''
          }`}
          style={{ color: '#EF4444' }}
          title={collapsed ? 'Logout' : undefined}
          aria-label="Log out"
        >
          <LogOut style={{ width: 16, height: 16, flexShrink: 0 }} />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                Log out
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
}
