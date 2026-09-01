import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  Keyboard, 
  Command, 
  Compass, 
  Shield, 
  Activity, 
  BookOpen, 
  FileText, 
  Settings, 
  History, 
  Search,
  ExternalLink,
  Zap,
  GitCompare,
  User,
  Clock,
  Mic
} from 'lucide-react';
import { cn } from '../lib/utils';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutItem {
  keys: string[];
  label: string;
  category: string;
  path?: string;
  actionDesc?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export default function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('');

  const allShortcuts: ShortcutItem[] = [
    // Navigation
    { keys: ['Ctrl', 'K'], label: 'Open Global Search & Command Palette', category: 'Navigation', icon: Command, actionDesc: 'Universal search across tests, metrics, and logs' },
    { keys: ['Ctrl', 'D'], label: 'Overview Dashboard & Health Status', category: 'Navigation', path: '/dashboard', icon: Compass, actionDesc: 'System summary, active health probes & KPIs' },
    { keys: ['Alt', 'R'], label: 'Red Team Lab & Automated Scans', category: 'Navigation', path: '/red-team', icon: Shield, actionDesc: 'Adversarial tests and scheduled audits' },
    { keys: ['Ctrl', 'M'], label: 'Drift Surveillance & Stability', category: 'Navigation', path: '/monitoring', icon: Activity, actionDesc: 'Embedding drift and threshold telemetry' },
    { keys: ['Ctrl', 'B'], label: 'Knowledge Base & OWASP Catalog', category: 'Navigation', path: '/knowledge', icon: BookOpen, actionDesc: 'Governance articles and mitigation guidelines' },
    { keys: ['Ctrl', 'P'], label: 'Compliance Reports & Executive PDF', category: 'Navigation', path: '/reports', icon: FileText, actionDesc: 'ISO/IEC 42001 & NIST AI RMF reports' },
    { keys: ['Ctrl', 'L'], label: 'Activity Log & Full Audit Trail', category: 'Navigation', path: '/activity-log', icon: History, actionDesc: 'Chronological security event logs' },
    { keys: ['Alt', 'S'], label: 'Platform & Alert Policy Settings', category: 'Navigation', path: '/settings', icon: Settings, actionDesc: 'Drift thresholds and notification preferences' },
    { keys: ['Alt', 'C'], label: 'Adversarial Test Comparison View', category: 'Navigation', path: '/red-team/compare?test1=1&test2=2', icon: GitCompare, actionDesc: 'Side-by-side prompt injection diff' },
    
    // Actions & Operations
    { keys: ['Shift', 'N'], label: 'Create New Red Team Security Test', category: 'Actions', path: '/red-team', icon: Shield, actionDesc: 'Configure and dispatch an adversarial attack probe' },
    { keys: ['Shift', 'S'], label: 'Schedule Recurring Security Audit', category: 'Actions', path: '/red-team', icon: Clock, actionDesc: 'Set cron-based automated vulnerability scans' },
    { keys: ['Shift', 'R'], label: 'Recalculate Model Drift Baseline', category: 'Actions', path: '/monitoring', icon: Activity, actionDesc: 'Re-sync current embedding distributions' },
    { keys: ['Shift', 'H'], label: 'Trigger AI Model Health Probes', category: 'Actions', path: '/dashboard', icon: Zap, actionDesc: 'Ping all connected model endpoints in real-time' },

    // Voice Commands
    { keys: ['Voice', '"Dashboard"'], label: 'Navigate to Overview Dashboard', category: 'Voice Commands', path: '/dashboard', icon: Mic, actionDesc: 'Speak "Go to Dashboard" or "Open Dashboard"' },
    { keys: ['Voice', '"Red Team"'], label: 'Navigate to Red Team Security Lab', category: 'Voice Commands', path: '/red-team', icon: Mic, actionDesc: 'Speak "Go to Red Team" or "Adversarial Tests"' },
    { keys: ['Voice', '"Monitoring"'], label: 'Navigate to Drift Surveillance', category: 'Voice Commands', path: '/monitoring', icon: Mic, actionDesc: 'Speak "Go to Monitoring" or "Model Drift"' },
    { keys: ['Voice', '"Reports"'], label: 'Navigate to Compliance Reports', category: 'Voice Commands', path: '/reports', icon: Mic, actionDesc: 'Speak "Open Reports" or "Audit Reports"' },
    { keys: ['Voice', '"Activity"'], label: 'Navigate to Audit Logs', category: 'Voice Commands', path: '/activity-log', icon: Mic, actionDesc: 'Speak "Open Activity Log" or "Logs"' },
    { keys: ['Voice', '"Settings"'], label: 'Navigate to Platform Settings', category: 'Voice Commands', path: '/settings', icon: Mic, actionDesc: 'Speak "Open Settings" or "Alerts"' },

    // General & Controls
    { keys: ['Shift', '?'], label: 'Open Keyboard Shortcuts Overlay', category: 'General', actionDesc: 'Toggle this comprehensive hotkeys catalog' },
    { keys: ['Esc'], label: 'Close Active Modal / Dropdown', category: 'General', actionDesc: 'Dismiss current overlay or search dialogue' },
    { keys: ['↑', '↓'], label: 'Navigate Lists & Command Results', category: 'General', actionDesc: 'Move selection up or down' },
    { keys: ['Enter'], label: 'Confirm Selection / Trigger Action', category: 'General', actionDesc: 'Execute selected command' }
  ];

  const filteredShortcuts = useMemo(() => {
    if (!filter.trim()) return allShortcuts;
    const q = filter.toLowerCase();
    return allShortcuts.filter(s => 
      s.label.toLowerCase().includes(q) || 
      s.category.toLowerCase().includes(q) ||
      (s.actionDesc && s.actionDesc.toLowerCase().includes(q)) ||
      s.keys.some(k => k.toLowerCase().includes(q))
    );
  }, [filter]);

  const categories = ['Navigation', 'Actions', 'Voice Commands', 'General'];

  if (!isOpen) return null;

  const handleShortcutClick = (shortcut: ShortcutItem) => {
    if (shortcut.path) {
      navigate(shortcut.path);
      onClose();
    }
  };

  return (
    <div
      id="keyboard-shortcuts-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/70 backdrop-blur-xs p-4 animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="keyboard-shortcuts-modal"
        className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white dark:bg-gray-900 shadow-2xl border border-gray-200 dark:border-gray-700 transition-all text-left flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 px-6 py-4 bg-gray-50/50 dark:bg-gray-800/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-xs">
              <Keyboard className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Keyboard Shortcuts & Navigation Overlay
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold">
                  Shift + ?
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Registered command shortcuts for high-velocity platform operation. Click any route to jump.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Filter Input */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter shortcuts by key, name, or action..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              autoFocus
            />
          </div>
        </div>

        {/* Shortcuts List */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1">
          {categories.map((cat) => {
            const catItems = filteredShortcuts.filter(s => s.category === cat);
            if (catItems.length === 0) return null;

            return (
              <div key={cat} className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                    {cat} Commands
                  </h4>
                  <span className="text-[10px] text-gray-400">{catItems.length} shortcuts</span>
                </div>

                <div className="grid grid-cols-1 gap-1.5">
                  {catItems.map((sc, idx) => {
                    const Icon = sc.icon;
                    return (
                      <div
                        key={idx}
                        onClick={() => handleShortcutClick(sc)}
                        className={cn(
                          "flex items-center justify-between py-2 px-3 rounded-xl transition-all border border-transparent",
                          sc.path 
                            ? "hover:bg-indigo-50/70 dark:hover:bg-indigo-950/40 hover:border-indigo-100 dark:hover:border-indigo-900/40 cursor-pointer group" 
                            : "hover:bg-gray-50 dark:hover:bg-gray-800/40"
                        )}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {Icon && (
                            <div className="p-1 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                              <Icon className="h-3.5 w-3.5" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 flex items-center gap-1.5">
                              <span>{sc.label}</span>
                              {sc.path && <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-indigo-500" />}
                            </div>
                            {sc.actionDesc && (
                              <p className="text-[11px] text-gray-400 truncate mt-0.5">
                                {sc.actionDesc}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 flex-shrink-0 ml-3">
                          {sc.keys.map((k, i) => (
                            <kbd
                              key={i}
                              className="min-w-[24px] px-2 py-1 text-center font-mono text-xs font-bold rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 shadow-2xs group-hover:border-indigo-300 dark:group-hover:border-indigo-700"
                            >
                              {k}
                            </kbd>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {filteredShortcuts.length === 0 && (
            <div className="text-center py-10 text-gray-400 text-xs">
              No shortcuts found matching "{filter}"
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-gray-50 dark:bg-gray-800/60 border-t border-gray-200 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <span>Press <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 font-mono text-[11px] font-semibold text-gray-700 dark:text-gray-300">Esc</kbd> to dismiss</span>
            <span>&bull;</span>
            <span className="hidden sm:inline">Use <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 font-mono text-[11px] font-semibold text-gray-700 dark:text-gray-300">Shift + ?</kbd> anywhere</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs transition-colors shadow-2xs"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
}
