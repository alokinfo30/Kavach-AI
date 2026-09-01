import React, { useState, useEffect } from 'react';
import {
  History,
  Search,
  Filter,
  Download,
  Shield,
  Activity,
  FileText,
  Lock,
  Settings,
  AlertTriangle,
  CheckCircle2,
  Info,
  XCircle,
  RefreshCw,
  Calendar,
  User,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Layers,
  ArrowUpDown
} from 'lucide-react';
import api from './lib/api';
import Tooltip from './components/Tooltip';
import { cn } from './lib/utils';
import { Link } from 'react-router-dom';

export interface ActivityItem {
  id: string;
  user_id: number;
  username: string;
  action: string;
  module: 'redteam' | 'drift' | 'reports' | 'governance' | 'auth' | 'settings' | 'feedback';
  description: string;
  severity: 'info' | 'warning' | 'critical' | 'success';
  target?: string;
  metadata?: Record<string, any>;
  ip_address: string;
  timestamp: string;
}

export default function ActivityLog() {
  const [logs, setLogs] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    criticalCount: 0,
    warningCount: 0,
    successCount: 0,
    infoCount: 0,
    todayCount: 0,
    uniqueActorsCount: 0
  });
  const [selectedLog, setSelectedLog] = useState<ActivityItem | null>(null);
  const [exporting, setExporting] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(currentPage),
        per_page: '12',
        ...(moduleFilter !== 'all' ? { module: moduleFilter } : {}),
        ...(severityFilter !== 'all' ? { severity: severityFilter } : {}),
        ...(search.trim() ? { search: search.trim() } : {})
      });

      const res = await api.get(`/activity-logs?${params.toString()}`);
      setLogs(res.data.logs || []);
      setTotalPages(res.data.pages || 1);
      setTotalCount(res.data.total || 0);
      if (res.data.stats) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error('Failed to load activity logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [currentPage, moduleFilter, severityFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchLogs();
  };

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const res = await api.get('/activity-logs/export/csv', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `kavach_activity_audit_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export CSV:', err);
    } finally {
      setExporting(false);
    }
  };

  const getModuleIcon = (module: string) => {
    switch (module) {
      case 'redteam':
        return <Shield className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />;
      case 'drift':
        return <Activity className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />;
      case 'reports':
        return <FileText className="h-4 w-4 text-purple-600 dark:text-purple-400" />;
      case 'auth':
        return <Lock className="h-4 w-4 text-amber-600 dark:text-amber-400" />;
      case 'settings':
        return <Settings className="h-4 w-4 text-gray-600 dark:text-gray-400" />;
      default:
        return <History className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
            <XCircle className="h-3 w-3" /> Critical
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <AlertTriangle className="h-3 w-3" /> Warning
          </span>
        );
      case 'success':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="h-3 w-3" /> Success
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <Info className="h-3 w-3" /> Info
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
            <History className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
              Activity Log & Audit Trail
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Immutable chronological record of security tests, policy adjustments, and operator actions.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <Tooltip content="Refresh audit log in real-time">
            <button
              type="button"
              onClick={() => fetchLogs()}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-2xs"
            >
              <RefreshCw className={cn("h-4 w-4 text-gray-500", loading && "animate-spin text-indigo-600")} />
              Refresh
            </button>
          </Tooltip>

          <Tooltip content="Download complete compliance and activity audit trail in CSV format">
            <button
              id="btn-export-activity-csv"
              type="button"
              onClick={handleExportCSV}
              disabled={exporting}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition-colors"
            >
              <Download className="h-4 w-4" />
              {exporting ? 'Exporting...' : 'Export Audit CSV'}
            </button>
          </Tooltip>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Audit Events</span>
            <Layers className="h-4 w-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{stats.total}</p>
          <p className="text-[11px] text-gray-400 mt-1">Logged across all modules</p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Critical & Warnings</span>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-2">
            {stats.criticalCount + stats.warningCount}
          </p>
          <p className="text-[11px] text-gray-400 mt-1">Requiring governance oversight</p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Actions Today</span>
            <Calendar className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{stats.todayCount}</p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1">Active operations</p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Active Operators</span>
            <User className="h-4 w-4 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{stats.uniqueActorsCount}</p>
          <p className="text-[11px] text-gray-400 mt-1">Authenticated accounts</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="w-full md:w-80 relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search action, actor, target..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-lg bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </form>

        {/* Filters */}
        <div className="flex items-center flex-wrap gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <Filter className="h-3.5 w-3.5" />
            <span>Module:</span>
          </div>
          <select
            value={moduleFilter}
            onChange={(e) => {
              setModuleFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-2.5 py-1.5 text-xs rounded-lg bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">All Modules</option>
            <option value="redteam">Red Team</option>
            <option value="drift">Drift Monitoring</option>
            <option value="reports">Reports & Audits</option>
            <option value="governance">Governance</option>
            <option value="auth">Authentication</option>
            <option value="settings">Settings</option>
          </select>

          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 ml-2">
            <span>Severity:</span>
          </div>
          <select
            value={severityFilter}
            onChange={(e) => {
              setSeverityFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-2.5 py-1.5 text-xs rounded-lg bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="warning">Warning</option>
            <option value="success">Success</option>
            <option value="info">Info</option>
          </select>
        </div>
      </div>

      {/* Logs Table / List */}
      <div className="rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto text-indigo-600 mb-2" />
            <p className="text-sm font-medium">Loading activity audit log...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <History className="h-8 w-8 mx-auto text-gray-400 mb-2" />
            <p className="text-base font-semibold text-gray-800 dark:text-gray-200">No activity events match your filters</p>
            <p className="text-xs text-gray-400 mt-1">Try broadening your search query or selecting 'All Modules'.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900/60 border-b border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Module</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Actor / IP</th>
                  <th className="px-4 py-3">Severity</th>
                  <th className="px-4 py-3 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60">
                {logs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-gray-50/80 dark:hover:bg-gray-700/40 transition-colors cursor-pointer"
                    onClick={() => setSelectedLog(log)}
                  >
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {getModuleIcon(log.module)}
                        <span className="capitalize font-medium text-gray-800 dark:text-gray-200">{log.module}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                      {log.action}
                    </td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white font-medium max-w-xs sm:max-w-md truncate">
                      {log.description}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-600 dark:text-gray-300">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold">{log.username}</span>
                        <span className="text-[11px] text-gray-400 font-mono">({log.ip_address})</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {getSeverityBadge(log.severity)}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLog(log);
                        }}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/60 text-xs text-gray-500 dark:text-gray-400">
          <span>Showing page {currentPage} of {totalPages} ({totalCount} total entries)</span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="p-1 rounded-md border border-gray-300 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="p-1 rounded-md border border-gray-300 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Detail Slideout / Modal for Event Inspection */}
      {selectedLog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-xs p-4"
          onClick={() => setSelectedLog(null)}
        >
          <div
            className="w-full max-w-xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                  <History className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">Audit Event Details</h3>
                  <p className="text-xs text-gray-400">Log ID: {selectedLog.id}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-400 block font-medium">Action Key</label>
                  <p className="font-mono font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5">{selectedLog.action}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-400 block font-medium">Severity</label>
                  <div className="mt-0.5">{getSeverityBadge(selectedLog.severity)}</div>
                </div>
                <div>
                  <label className="text-xs text-gray-400 block font-medium">Actor Account</label>
                  <p className="font-semibold text-gray-900 dark:text-white mt-0.5">{selectedLog.username} (ID: {selectedLog.user_id})</p>
                </div>
                <div>
                  <label className="text-xs text-gray-400 block font-medium">Source IP</label>
                  <p className="font-mono text-gray-700 dark:text-gray-300 mt-0.5">{selectedLog.ip_address}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-400 block font-medium">Target Resource</label>
                  <p className="font-medium text-gray-900 dark:text-white mt-0.5">{selectedLog.target || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-400 block font-medium">Timestamp</label>
                  <p className="text-gray-700 dark:text-gray-300 mt-0.5">{new Date(selectedLog.timestamp).toLocaleString()}</p>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 block font-medium">Event Description</label>
                <p className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 font-medium text-gray-900 dark:text-white mt-1">
                  {selectedLog.description}
                </p>
              </div>

              {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
                <div>
                  <label className="text-xs text-gray-400 block font-medium">Structured Metadata Payload</label>
                  <pre className="p-3 rounded-lg bg-gray-900 text-emerald-400 font-mono text-xs overflow-x-auto mt-1 border border-gray-800">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="px-6 py-3 bg-gray-50 dark:bg-gray-900/60 border-t border-gray-200 dark:border-gray-700 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition-colors"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
