import { useState, useEffect } from 'react';
import { 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  Zap, 
  Server, 
  ShieldCheck, 
  Globe, 
  Clock, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Cpu
} from 'lucide-react';
import api from '../lib/api';
import { cn } from '../lib/utils';
import Tooltip from './Tooltip';

export interface ModelEndpointHealth {
  id: string;
  name: string;
  model_identifier: string;
  provider: string;
  type: string;
  endpoint_url: string;
  region: string;
  status: 'healthy' | 'degraded' | 'down';
  uptime_pct: number;
  latency_ms: number;
  error_rate_pct: number;
  last_checked: string;
  total_requests_24h: number;
  consecutive_success: number;
  history_30d: Array<{ date: string; uptime: number; latency: number }>;
}

export interface HealthSummary {
  overall_status: 'operational' | 'degraded' | 'critical';
  aggregate_uptime: number;
  avg_latency_ms: number;
  total_endpoints: number;
  healthy_count: number;
  degraded_count: number;
  down_count: number;
  last_probed_at: string;
}

export default function ModelHealthWidget() {
  const [endpoints, setEndpoints] = useState<ModelEndpointHealth[]>([]);
  const [summary, setSummary] = useState<HealthSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProbingAll, setIsProbingAll] = useState(false);
  const [probingId, setProbingId] = useState<string | null>(null);
  const [lastProbeMessage, setLastProbeMessage] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchHealth = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const res = await api.get('/models/health');
      setEndpoints(res.data.endpoints || []);
      setSummary(res.data.summary || null);
    } catch (err) {
      console.error('Failed to fetch model health endpoints', err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth(true);
  }, []);

  // Periodic health check auto-poll every 30s
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchHealth(false);
    }, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const probeAll = async () => {
    try {
      setIsProbingAll(true);
      const res = await api.post('/models/health/probe', {});
      setEndpoints(res.data.endpoints || []);
      setSummary(res.data.summary || null);
      setLastProbeMessage(`Comprehensive health probe completed at ${new Date().toLocaleTimeString()}`);
      setTimeout(() => setLastProbeMessage(null), 4000);
    } catch (err) {
      console.error('Probe all failed', err);
    } finally {
      setIsProbingAll(false);
    }
  };

  const probeEndpoint = async (id: string) => {
    try {
      setProbingId(id);
      const res = await api.post(`/models/health/probe/${id}`);
      if (res.data.endpoint) {
        setEndpoints(prev => prev.map(e => e.id === id ? res.data.endpoint : e));
      }
      if (res.data.summary) {
        setSummary(res.data.summary);
      }
    } catch (err) {
      console.error(`Probe failed for ${id}`, err);
    } finally {
      setProbingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Operational
          </span>
        );
      case 'degraded':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            Degraded Latency
          </span>
        );
      case 'down':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 border border-red-200/60 dark:border-red-800/60">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
            Offline
          </span>
        );
      default:
        return null;
    }
  };

  const getLatencyColor = (latency: number) => {
    if (latency < 100) return "text-emerald-600 dark:text-emerald-400";
    if (latency < 250) return "text-blue-600 dark:text-blue-400";
    return "text-amber-600 dark:text-amber-400";
  };

  return (
    <div 
      id="model-health-status-widget"
      className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-2xs overflow-hidden transition-all"
    >
      {/* Header Banner */}
      <div className="p-5 sm:p-6 border-b border-gray-100 dark:border-gray-700/60 bg-gradient-to-r from-gray-50/70 via-indigo-50/20 to-white dark:from-gray-900/50 dark:via-indigo-950/10 dark:to-gray-800">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-xs">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Connected AI Endpoints & Active Health Surveillance
                </h3>
                {summary && (
                  <span className={cn(
                    "px-2 py-0.5 text-[11px] font-bold rounded-full border",
                    summary.overall_status === 'operational'
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800"
                      : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800"
                  )}>
                    {summary.overall_status === 'operational' ? 'All Systems Operational' : 'Degraded Performance Detected'}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Active real-time latency pinging, 30-day uptime SLA tracking, and endpoint responsiveness.
              </p>
            </div>
          </div>

          {/* Action & Controls */}
          <div className="flex items-center gap-2 self-end sm:self-center">
            <Tooltip content="Toggle 30-second automated health polling">
              <button
                type="button"
                onClick={() => setAutoRefresh(prev => !prev)}
                className={cn(
                  "px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1.5",
                  autoRefresh 
                    ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800" 
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700"
                )}
              >
                <span className={cn("h-1.5 w-1.5 rounded-full", autoRefresh ? "bg-indigo-600 dark:bg-indigo-400 animate-ping" : "bg-gray-400")} />
                Auto-probe {autoRefresh ? 'ON' : 'OFF'}
              </button>
            </Tooltip>

            <button
              type="button"
              onClick={probeAll}
              disabled={isProbingAll || loading}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 disabled:opacity-50 rounded-lg shadow-2xs transition-all"
            >
              <Zap className={cn("h-3.5 w-3.5", isProbingAll && "animate-spin text-amber-300")} />
              {isProbingAll ? 'Probing All...' : 'Run Active Health Probe'}
            </button>
          </div>
        </div>

        {/* Global Summary KPI Bar */}
        {summary && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-gray-200/50 dark:border-gray-700/40">
            <div className="bg-white/80 dark:bg-gray-800/80 p-3 rounded-xl border border-gray-100 dark:border-gray-700/60 shadow-2xs">
              <div className="text-[11px] font-medium text-gray-500 dark:text-gray-400 flex items-center justify-between">
                <span>Aggregate Uptime</span>
                <TrendingUp className="h-3 w-3 text-emerald-500" />
              </div>
              <div className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                {summary.aggregate_uptime}%
              </div>
              <div className="text-[10px] text-gray-400 mt-0.5">SLA Target: 99.90%</div>
            </div>

            <div className="bg-white/80 dark:bg-gray-800/80 p-3 rounded-xl border border-gray-100 dark:border-gray-700/60 shadow-2xs">
              <div className="text-[11px] font-medium text-gray-500 dark:text-gray-400 flex items-center justify-between">
                <span>Avg Inference Latency</span>
                <Clock className="h-3 w-3 text-indigo-500" />
              </div>
              <div className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                {summary.avg_latency_ms} <span className="text-xs font-normal text-gray-500">ms</span>
              </div>
              <div className="text-[10px] text-gray-400 mt-0.5">Across {summary.total_endpoints} models</div>
            </div>

            <div className="bg-white/80 dark:bg-gray-800/80 p-3 rounded-xl border border-gray-100 dark:border-gray-700/60 shadow-2xs">
              <div className="text-[11px] font-medium text-gray-500 dark:text-gray-400 flex items-center justify-between">
                <span>Endpoint Health</span>
                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
              </div>
              <div className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                <span className="text-emerald-600 dark:text-emerald-400">{summary.healthy_count}</span> / {summary.total_endpoints}
              </div>
              <div className="text-[10px] text-gray-400 mt-0.5">
                {summary.degraded_count > 0 ? `${summary.degraded_count} degraded` : '100% online'}
              </div>
            </div>

            <div className="bg-white/80 dark:bg-gray-800/80 p-3 rounded-xl border border-gray-100 dark:border-gray-700/60 shadow-2xs">
              <div className="text-[11px] font-medium text-gray-500 dark:text-gray-400 flex items-center justify-between">
                <span>Last Health Probe</span>
                <RefreshCw className="h-3 w-3 text-gray-400" />
              </div>
              <div className="text-xs font-bold text-gray-900 dark:text-white mt-1.5 font-mono truncate">
                {new Date(summary.last_probed_at).toLocaleTimeString()}
              </div>
              <div className="text-[10px] text-gray-400 mt-0.5">Automated heartbeat</div>
            </div>
          </div>
        )}

        {lastProbeMessage && (
          <div className="mt-3 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs rounded-lg flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>{lastProbeMessage}</span>
          </div>
        )}
      </div>

      {/* Endpoints List */}
      <div className="divide-y divide-gray-100 dark:divide-gray-700/60">
        {loading ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400 flex flex-col items-center justify-center gap-2">
            <RefreshCw className="h-5 w-5 animate-spin text-indigo-600" />
            <span className="text-xs">Conducting model endpoint health checks...</span>
          </div>
        ) : endpoints.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-500">
            No connected AI model endpoints configured.
          </div>
        ) : (
          endpoints.map((ep) => {
            const isThisProbing = probingId === ep.id;

            return (
              <div 
                key={ep.id}
                className="p-4 sm:p-5 hover:bg-gray-50/60 dark:hover:bg-gray-750/50 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                {/* Left: Model Details */}
                <div className="space-y-1 min-w-0 max-w-xl">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                      {ep.name}
                    </h4>
                    {getStatusBadge(ep.status)}
                    <span className="text-[10px] font-mono px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                      {ep.model_identifier}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Server className="h-3 w-3 text-gray-400" />
                      {ep.provider}
                    </span>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1">
                      <Globe className="h-3 w-3 text-gray-400" />
                      {ep.region}
                    </span>
                    <span>&bull;</span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                      {ep.type}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-gray-400 font-mono pt-1">
                    <span className="truncate max-w-xs sm:max-w-md">{ep.endpoint_url}</span>
                  </div>
                </div>

                {/* Right: Metrics & Probe Button */}
                <div className="flex items-center justify-between lg:justify-end gap-5 flex-wrap lg:flex-nowrap border-t lg:border-t-0 pt-3 lg:pt-0 border-gray-100 dark:border-gray-700">
                  {/* Uptime % */}
                  <div className="text-right">
                    <div className="text-[10px] text-gray-400 uppercase font-semibold">Uptime SLA</div>
                    <div className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1">
                      <span>{ep.uptime_pct}%</span>
                    </div>
                    {/* Miniature 14-day health blocks */}
                    <div className="flex items-center gap-0.5 mt-1">
                      {ep.history_30d.map((day, idx) => (
                        <Tooltip key={idx} content={`${day.date}: ${day.uptime.toFixed(2)}% uptime (${day.latency}ms)`}>
                          <span 
                            className={cn(
                              "w-1.5 h-3 rounded-2xs inline-block transition-transform hover:scale-125 cursor-pointer",
                              day.uptime >= 99.5 ? "bg-emerald-500" : day.uptime >= 98.0 ? "bg-amber-500" : "bg-red-500"
                            )}
                          />
                        </Tooltip>
                      ))}
                    </div>
                  </div>

                  {/* Real-Time Latency */}
                  <div className="text-right min-w-[70px]">
                    <div className="text-[10px] text-gray-400 uppercase font-semibold">Live Latency</div>
                    <div className={cn("text-sm font-bold font-mono", getLatencyColor(ep.latency_ms))}>
                      {ep.latency_ms} ms
                    </div>
                    <div className="text-[10px] text-gray-400 mt-0.5">
                      Err: {ep.error_rate_pct}%
                    </div>
                  </div>

                  {/* Single Ping Probe Button */}
                  <Tooltip content={`Perform instant active health ping on ${ep.name}`}>
                    <button
                      type="button"
                      onClick={() => probeEndpoint(ep.id)}
                      disabled={isThisProbing || isProbingAll}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 active:scale-95 disabled:opacity-50 transition-all shadow-2xs"
                    >
                      <Zap className={cn("h-3 w-3", isThisProbing ? "animate-spin text-indigo-600" : "text-amber-500")} />
                      {isThisProbing ? 'Pinging...' : 'Ping'}
                    </button>
                  </Tooltip>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
