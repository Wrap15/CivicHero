'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { issueService } from '@/services/issueService';
import { 
  Shield, 
  Map, 
  PlusCircle, 
  Trophy, 
  LogOut, 
  Bell, 
  User, 
  Menu, 
  X, 
  CheckCircle,
  Building,
  BarChart3
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch notifications in mock/live mode
  useEffect(() => {
    if (!user || !mounted) return;
    const fetchNotifs = async () => {
      try {
        const list = await issueService.getUserNotifications(user.uid);
        setNotifications(list);
      } catch (err) {
        console.error(err);
      }
    };
    fetchNotifs();
    
    // Check for updates periodically
    const timer = setInterval(fetchNotifs, 10000);
    return () => clearInterval(timer);
  }, [user]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const handleMarkNotificationsRead = async () => {
    if (!user) return;
    await issueService.clearNotifications(user.uid);
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setShowNotifications(false);
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const isLinkActive = (path) => pathname === path;

  // Define links based on user role using translate helper t()
  const getNavLinks = () => {
    if (!user) return [];
    
    if (user.role === 'citizen') {
      return [
        { name: t('dashboard'), path: '/citizen/dashboard', icon: User },
        { name: t('reportIssue'), path: '/citizen/report', icon: PlusCircle },
        { name: t('liveMap'), path: '/citizen/map', icon: Map },
        { name: t('leaderboard'), path: '/citizen/leaderboard', icon: Trophy },
      ];
    } else if (user.role === 'official') {
      return [
        { name: t('officialDashboard'), path: '/government/dashboard', icon: Building },
        { name: t('departments'), path: '/government/departments', icon: CheckCircle },
        { name: t('analytics'), path: '/government/analytics', icon: BarChart3 },
      ];
    } else if (user.role === 'admin') {
      return [
        { name: t('adminControl'), path: '/admin/dashboard', icon: Shield },
        { name: t('users'), path: '/admin/users', icon: User },
        { name: t('fraudAlerts'), path: '/admin/fraud', icon: Shield },
      ];
    }
    return [];
  };

  const navLinks = getNavLinks();

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-zinc-800/50 px-4 py-3 md:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 group">
          <div className="bg-gradient-to-tr from-emerald-600 to-emerald-400 p-2 rounded-lg text-zinc-950 font-bold shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-all">
            CH
          </div>
          <div>
            <span className="font-extrabold text-xl bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              CivicHero
            </span>
            <span className="block text-[9px] text-emerald-400 tracking-widest uppercase font-bold">
              AI Hyperlocal Solver
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center space-x-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isLinkActive(link.path);
            return (
              <Link
                key={link.path}
                href={link.path}
                className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  active 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/40 border border-transparent'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Action Controls */}
        <div className="hidden md:flex items-center space-x-4">
          
          {/* Desktop Language Switcher */}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-zinc-905 border border-zinc-800/60 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 focus:outline-none focus:border-emerald-500 transition-colors"
          >
            <option value="en">English</option>
            <option value="hi">हिंदी (Hindi)</option>
            <option value="gu">ગુજરાતી (Gujarati)</option>
          </select>

          {mounted && user ? (
            <>
              {/* Gamification Level Display (Only for Citizens) */}
              {user.role === 'citizen' && (
                <div className="flex items-center space-x-3 bg-zinc-900/80 px-3 py-1.5 rounded-lg border border-zinc-800">
                  <div className="text-xs">
                    <span className="text-zinc-500 font-medium">{t('level')}</span>{' '}
                    <span className="text-emerald-400 font-bold">{user.level || 1}</span>
                  </div>
                  <div className="w-16 bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full transition-all duration-300"
                      style={{ width: `${(user.xp % 200) / 2}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-zinc-400 font-mono">
                    {user.xp || 0} XP
                  </div>
                  <div className="text-xs border-l border-zinc-800 pl-3 flex items-center space-x-1">
                    <span className="text-zinc-550 font-medium">Trust</span>
                    <span className="text-indigo-400 font-bold">{user.trustScore || 70}%</span>
                  </div>
                </div>
              )}

              {/* Notification Bell Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-850 rounded-lg relative transition-colors"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-emerald-500 text-black text-[9px] font-black rounded-full flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-3 w-80 glass-panel border border-zinc-800 rounded-xl p-4 shadow-2xl z-50">
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-2">
                      <span className="font-semibold text-sm">Notifications</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkNotificationsRead}
                          className="text-xs text-emerald-400 hover:underline"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-60 overflow-y-auto space-y-2">
                      {notifications.length === 0 ? (
                        <div className="text-center text-xs text-zinc-500 py-6">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div 
                            key={notif.id} 
                            className={`p-2.5 rounded-lg text-xs border transition-colors ${
                              notif.isRead 
                                ? 'bg-transparent border-transparent text-zinc-400' 
                                : 'bg-emerald-500/5 border-emerald-500/10 text-white'
                            }`}
                          >
                            <div className="font-bold flex items-center justify-between">
                              <span>{notif.title}</span>
                              <span className="text-[9px] text-zinc-500" suppressHydrationWarning>
                                {new Date(notif.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="mt-1 leading-relaxed text-zinc-300">{notif.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Identity Display */}
              <div className="flex items-center space-x-3 border-l border-zinc-800 pl-4">
                <img
                  src={user.avatarUrl}
                  alt={user.fullName}
                  className="w-8 h-8 rounded-full border border-emerald-500/30"
                />
                <div className="text-left">
                  <span className="block text-xs font-semibold text-zinc-200">
                    {user.fullName}
                  </span>
                  <span className="block text-[9px] text-zinc-500 capitalize">
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-1.5 text-zinc-500 hover:text-rose-400 transition-colors"
                  title={t('logout')}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                href="/login"
                className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
              >
                {t('login')}
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 text-sm bg-emerald-500 text-black font-semibold rounded-lg hover:bg-emerald-400 shadow-md shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all"
              >
                {t('joinPlatform')}
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="md:hidden flex items-center space-x-3">
          {mounted && user && unreadCount > 0 && (
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-3 pt-3 border-t border-zinc-800/80 space-y-2 pb-2">
          
          {/* Mobile Language Switcher */}
          <div className="px-4 py-1">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-350 focus:outline-none focus:border-emerald-500"
            >
              <option value="en">English</option>
              <option value="hi">हिंदी (Hindi)</option>
              <option value="gu">ગુજરાતી (Gujarati)</option>
            </select>
          </div>

          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isLinkActive(link.path);
            return (
              <Link
                key={link.path}
                href={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm transition-all ${
                  active 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/30'
                }`}
              >
                <Icon className="w-4.5 h-4.5" />
                <span>{link.name}</span>
              </Link>
            );
          })}
          
          {/* User Section in Mobile */}
          {mounted && user ? (
            <div className="pt-3 border-t border-zinc-800 space-y-3 px-4">
              <div className="flex items-center space-x-3">
                <img
                  src={user.avatarUrl}
                  alt={user.fullName}
                  className="w-10 h-10 rounded-full border border-emerald-500/30"
                />
                <div>
                  <span className="block text-sm font-semibold text-zinc-200">
                    {user.fullName}
                  </span>
                  <span className="block text-xs text-zinc-500 capitalize">
                    {user.role} ({user.xp || 0} XP)
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center justify-center space-x-2 py-2 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 rounded-lg text-sm font-medium transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span>{t('logout')}</span>
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-zinc-800 flex flex-col space-y-2 px-4">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 text-sm text-zinc-400 hover:text-white border border-zinc-850 rounded-lg hover:bg-zinc-900 transition-colors"
              >
                {t('login')}
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2 text-sm bg-emerald-500 text-black font-semibold rounded-lg hover:bg-emerald-400 transition-colors"
              >
                {t('joinPlatform')}
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
