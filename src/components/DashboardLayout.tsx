import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  ShieldAlert,
  Activity,
  BookOpen,
  FileText,
  Settings,
  User,
  LogOut,
  Menu,
  X,
  MessageSquare,
  Bell,
  GitCompare,
  Search,
  Keyboard,
  Sparkles,
  History,
  Download,
  WifiOff
} from 'lucide-react';
import GlobalSearchModal from './GlobalSearchModal';
import KeyboardShortcutsModal from './KeyboardShortcutsModal';
import Breadcrumbs from './Breadcrumbs';
import SessionExpiryToast from './SessionExpiryToast';
import VoiceNavigation from './VoiceNavigation';
import Tooltip from './Tooltip';
import { subscribeToOnlineStatus, subscribeToInstallPrompt, promptPWAInstall } from '../lib/pwa';

function DashboardLayout() {
  const { user, logout, isAuthenticated, simulateExpiryWarning } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [canInstallPwa, setCanInstallPwa] = useState(false);

  // PWA & Network listeners
  useEffect(() => {
    const unbindOnline = subscribeToOnlineStatus((online: boolean) => {
      setIsOnline(online);
    });

    const unbindInstall = subscribeToInstallPrompt((installable: boolean) => {
      setCanInstallPwa(installable);
    });

    return () => {
      unbindOnline();
      unbindInstall();
    };
  }, []);

  // Global Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);

      // Ctrl+K or Cmd+K -> Search
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
        return;
      }

      // '?' or Shift+'/' or Shift+'?' -> Shortcuts cheat sheet overlay
      if (e.key === '?' || (e.shiftKey && (e.key === '/' || e.key === '?' || e.code === 'Slash'))) {
        if (!isInput) {
          e.preventDefault();
          setShortcutsOpen((prev) => !prev);
          return;
        }
      }

      // Ignore standard letter hotkeys when typing in form text fields
      if (isInput) return;

      // Ctrl+D or Cmd+D -> Dashboard
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        navigate('/dashboard');
        return;
      }

      // Alt+R -> Red Team
      if (e.altKey && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        navigate('/red-team');
        return;
      }

      // Ctrl+M or Cmd+M -> Monitoring
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'm') {
        e.preventDefault();
        navigate('/monitoring');
        return;
      }

      // Ctrl+B or Cmd+B -> Knowledge Base
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        navigate('/knowledge');
        return;
      }

      // Ctrl+P or Cmd+P -> Reports
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        navigate('/reports');
        return;
      }

      // Ctrl+L or Cmd+L -> Activity Log
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        navigate('/activity-log');
        return;
      }

      // Alt+S -> Settings
      if (e.altKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        navigate('/settings');
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleInstallClick = async () => {
    const installed = await promptPWAInstall();
    if (installed) {
      setCanInstallPwa(false);
    }
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, shortcut: 'Ctrl+D' },
    { name: 'Red Team', href: '/red-team', icon: ShieldAlert, shortcut: 'Alt+R' },
    { name: 'Monitoring', href: '/monitoring', icon: Activity, shortcut: 'Ctrl+M' },
    { name: 'Knowledge Base', href: '/knowledge', icon: BookOpen, shortcut: 'Ctrl+B' },
    { name: 'Reports', href: '/reports', icon: FileText, shortcut: 'Ctrl+P' },
    { name: 'Activity Log', href: '/activity-log', icon: History, shortcut: 'Ctrl+L' },
    { name: 'Settings', href: '/settings', icon: Settings, shortcut: 'Alt+S' },
    ...(user?.role === 'admin' ? [{ name: 'Admin Feedback', href: '/admin/feedback', icon: MessageSquare }] : [])
  ];

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  const displayName = user?.username || user?.email || 'User';
  const displayRole = user?.role || 'User';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Global Search & Command Modal */}
      <GlobalSearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Keyboard Shortcuts Helper Modal (Shift + ?) */}
      <KeyboardShortcutsModal isOpen={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />

      {/* Token Expiration Warning Toast (60s countdown) */}
      <SessionExpiryToast />

      {/* Offline Alert Banner */}
      {!isOnline && (
        <div className="bg-amber-500 text-white px-4 py-1.5 text-center text-xs font-semibold flex items-center justify-center gap-2 sticky top-0 z-50">
          <WifiOff className="h-3.5 w-3.5" />
          <span>Offline mode active — Kavach PWA cached assets are serving offline requests.</span>
        </div>
      )}

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-500/30">
                K
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">Kavach AI</h1>
                <p className="text-[10px] text-gray-400 font-medium">Enterprise AI Security</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Search Trigger Button inside sidebar */}
          <div className="px-4 pt-4">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="w-full flex items-center justify-between px-3 py-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Search className="h-3.5 w-3.5 text-gray-400" />
                Quick Search...
              </span>
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-600 shadow-2xs">
                Ctrl+K
              </kbd>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 text-sm font-medium rounded-lg transition-colors group ${
                  isActive(item.href)
                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400 font-semibold shadow-2xs'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700/50'
                }`}
              >
                <div className="flex items-center">
                  <item.icon className="h-4 w-4 mr-3 flex-shrink-0" />
                  {item.name}
                </div>
                {item.shortcut && (
                  <span className="opacity-0 group-hover:opacity-100 text-[10px] font-mono text-gray-400 dark:text-gray-500 transition-opacity">
                    {item.shortcut}
                  </span>
                )}
              </Link>
            ))}
          </nav>

          {/* Shortcuts trigger & PWA Install in Sidebar Footer */}
          <div className="px-4 py-2 space-y-1.5 border-t border-gray-100 dark:border-gray-700/50">
            {canInstallPwa && (
              <button
                type="button"
                onClick={handleInstallClick}
                className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-md font-semibold transition-colors"
              >
                <span className="flex items-center gap-1.5">
                  <Download className="h-3.5 w-3.5" />
                  Install Web App (PWA)
                </span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setShortcutsOpen(true)}
              className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <Keyboard className="h-3.5 w-3.5" />
                Shortcuts Guide
              </span>
              <kbd className="text-[10px] font-mono text-gray-400 font-semibold">Shift+?</kbd>
            </button>
          </div>

          {/* User section */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            {isAuthenticated && user ? (
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <div className="h-9 w-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold text-sm shadow-xs">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="ml-3 overflow-hidden">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {displayName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{displayRole}</p>
                </div>
              </div>
            ) : null}
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <LogOut className="h-4 w-4 mr-2.5 text-gray-500" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar with Global Search Bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-xs lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400"
            >
              <Menu className="h-6 w-6" />
            </button>

            {/* Global Search Bar Trigger in Header */}
            <div className="w-64 sm:w-80 md:w-96">
              <button
                id="header-search-bar"
                type="button"
                onClick={() => setSearchOpen(true)}
                className="w-full flex items-center justify-between px-3.5 py-1.5 text-xs text-gray-400 bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-indigo-400 dark:hover:border-indigo-500 transition-all text-left shadow-2xs group"
              >
                <span className="flex items-center gap-2 text-gray-500 dark:text-gray-400 truncate">
                  <Search className="h-3.5 w-3.5 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                  Search tests, drift metrics, reports, audit logs...
                </span>
                <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-medium text-gray-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-2xs">
                  Ctrl+K
                </kbd>
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Voice Navigation Button */}
            <VoiceNavigation
              onOpenSearch={() => setSearchOpen(true)}
              onOpenShortcuts={() => setShortcutsOpen(true)}
            />

            {canInstallPwa && (
              <Tooltip content="Install Kavach AI as a standalone Progressive Web App">
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition-colors"
                >
                  <Download className="h-3.5 w-3.5" />
                  Install App
                </button>
              </Tooltip>
            )}

            <Tooltip content="Open Keyboard Shortcuts Reference (Shift + ?)">
              <button
                type="button"
                onClick={() => setShortcutsOpen(true)}
                title="Keyboard Shortcuts (Shift+?)"
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Keyboard className="h-4 w-4" />
              </button>
            </Tooltip>

            <Link
              to="/red-team/compare?test1=1&test2=2"
              className="hidden md:flex items-center text-xs font-medium px-3 py-1.5 rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <GitCompare className="h-3.5 w-3.5 mr-1.5 text-indigo-500" />
              Compare Tests
            </Link>

            <Link
              to="/profile"
              className="flex items-center text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <User className="h-4 w-4 mr-1.5" />
              Profile
            </Link>
          </div>
        </header>

        {/* Page content with Dynamic Breadcrumbs */}
        <main className="p-4 lg:p-8 max-w-7xl mx-auto">
          <Breadcrumbs />
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;


