'use client';
import { useState } from 'react';
import { User as UserIcon, Lock, Shield, ToggleLeft, ToggleRight, Check, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { authService } from '@/services/api';
import { useAuthStore } from '@/store/authStore';

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [toggling2FA, setToggling2FA] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }
    setUpdatingProfile(true);
    try {
      const res = await authService.updateProfile({ name });
      if (res.data.success) {
        setUser(res.data.user);
        toast.success('Profile updated');
      }
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error('Please fill in both password fields');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }
    setUpdatingPassword(true);
    try {
      const res = await authService.changePassword(currentPassword, newPassword);
      if (res.data.success) {
        toast.success('Password changed! Please sign in again with your new password.');
        setCurrentPassword('');
        setNewPassword('');
        // Server invalidated all refresh tokens, so logout cleanly
        setTimeout(() => {
          useAuthStore.getState().logout();
          window.location.href = '/login';
        }, 1500);
      }
    } catch (err: unknown) {
      const errData = (err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } })?.response?.data;
      let msg = errData?.message || '';
      if (!msg && errData?.errors) {
        msg = Object.values(errData.errors).flat().join('; ');
      }
      toast.error(msg || 'Password update failed');
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleToggle2FA = async () => {
    setToggling2FA(true);
    try {
      const res = await authService.toggle2FA();
      if (res.data.success && user) {
        setUser({ ...user, twoFactorEnabled: res.data.twoFactorEnabled });
        toast.success(res.data.message);
      }
    } catch {
      toast.error('Failed to update 2FA status');
    } finally {
      setToggling2FA(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="glass-card p-6 border border-white/5 flex items-center gap-4">
        <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
          <UserIcon className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Account Settings &amp; Security Profile</h1>
          <p className="text-xs text-gray-400 mt-1">Manage credential settings, 2FA status, and user metadata.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Edit Profile & Password */}
        <div className="space-y-6">
          {/* Edit Profile Form */}
          <div className="glass-card p-6 border border-white/5 space-y-4">
            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-blue-400" /> User Profile Information
            </h2>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Email Address (Read only)</label>
                <input
                  type="text"
                  value={user?.email || ''}
                  disabled
                  className="input-field opacity-60 cursor-not-allowed font-mono text-xs"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field text-xs"
                />
              </div>
              <button type="submit" disabled={updatingProfile} className="btn-primary py-2 text-xs">
                {updatingProfile ? 'Saving...' : 'Update Name'}
              </button>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="glass-card p-6 border border-white/5 space-y-4">
            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-2">
              <Lock className="w-4 h-4 text-purple-400" /> Update Password
            </h2>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field text-xs"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">New Password (min 8 chars, 1 uppercase, 1 number)</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field text-xs"
                />
              </div>
              <button type="submit" disabled={updatingPassword} className="btn-secondary py-2 text-xs">
                {updatingPassword ? 'Updating...' : 'Change Password'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Security Controls & 2FA */}
        <div className="space-y-6">
          {/* 2FA Card */}
          <div className="glass-card p-6 border border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-400" /> Two-Factor Authentication (2FA)
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Demo Only
              </span>
            </div>

            <p className="text-xs text-gray-400">
              Add an additional layer of security to your account using Time-based One-Time Passwords (TOTP).
            </p>

            <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5">
              <div>
                <p className="text-xs font-bold text-white">
                  2FA Status: {user?.twoFactorEnabled ? 'ENABLED' : 'DISABLED'}
                </p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  {user?.twoFactorEnabled ? 'Account protected with simulated TOTP' : 'Click to enable 2FA protection'}
                </p>
              </div>
              <button
                onClick={handleToggle2FA}
                disabled={toggling2FA}
                className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
                title="Toggle 2FA State"
              >
                {user?.twoFactorEnabled ? (
                  <ToggleRight className="w-8 h-8 text-emerald-400" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-gray-600" />
                )}
              </button>
            </div>
          </div>

          {/* Account Metadata Card */}
          <div className="glass-card p-6 border border-white/5 space-y-3">
            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Account Metadata</h2>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-gray-400 font-sans">Role</span>
                <span className="text-white uppercase font-bold">{user?.role || 'user'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-gray-400 font-sans">User ID</span>
                <span className="text-gray-300">{user?._id}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-400 font-sans">Session Active</span>
                <span className="text-emerald-400 font-bold">YES (JWT Verified)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
