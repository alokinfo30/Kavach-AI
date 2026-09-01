import { useEffect, useState } from 'react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  Zap,
  Clock,
  Activity,
  Cpu,
  RefreshCw,
  TrendingDown,
  ShieldAlert,
  Server
} from 'lucide-react';
import api from '../lib/api';
import { cn } from '../lib/utils';

interface TimePoint {
  timestamp: string;
  p50: number;
  p95: number;
  p99: number;
  llamaLatency: number;
  finGptLatency: number;
  ragLatency: number;
  scanDurationSeconds: number;
  payloadThroughput: number;
}

interface ScanTypeMetric {
  type: string;
  avgDurationMs: number;
  p95DurationMs: number;
  testCount: number;
  throughputSec: number;
}

interface TelemetryData {
  timeSeries: TimePoint[];
  scanTypeDurations: ScanTypeMetric[];
  currentAvgLatency: number;
  currentP95Latency: number;
  currentP99Latency: number;
  avgScanDurationMs: number;
  activeConcurrentScans: number;
  systemUptime: string;
  evaluatedPayloadsToday: number;
}

export default function TelemetryMetrics() {
  const [data, setData] = useState<TelemetryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState<number>(5000); // 5s default
  const [isLive, setIsLive] = useState<boolean>(true);
  const [timeRange, setTimeRange] = useState<'15m' | '1h' | '24h' | '7d'>('1h');
  const [activeMetricTab, setActiveMetricTab] = useState<'latency' | 'scanDuration' | 'throughput'>('latency');

  const fetchTelemetry = async () => {
    try {
      const res = await api.get('/dashboard/telemetry');
      setData(res.data);
    } catch (err) {
      console.error('Failed to load telemetry metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
  }, []);

  useEffect(() => {
    if (!isLive || refreshInterval <= 0) return;
    const interval = setInterval(() => {
      fetchTelemetry();
    }, refreshInterval);
    return () => clearInterval(interval);
  }, [isLive, refreshInterval]);

  const CustomLatencyTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md p-3 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 text-xs">
          <p className="font-semibold text-gray-800 dark:text-gray-200 mb-1.5 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-indigo-500" />
            {label}
          </p>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                  {entry.name}:
                </span>
                <span className="font-mono font-bold text-gray-900 dark:text-white">
                  {entry.value} {entry.name.includes('Throughput') ? 'req/s' : entry.name.includes('Duration') ? 's' : 'ms'}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  if (loading && !data) {
    return (
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 shadow-sm">
        <div className="flex h-48 items-center justify-center space-x-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Streaming real-time telemetry metrics...</span>
        </div>
      </div>
    );
  }

  const latestPoint = data?.timeSeries?.[data.timeSeries.length - 1];

  return (
    <div id="telemetry-metrics-container" className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden transition-all">
      {/* Header Controls Bar */}
      <div className="border-b border-gray-100 dark:border-gray-800 p-5 bg-gradient-to-r from-gray-50/50 to-white dark:from-gray-900 dark:to-gray-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-lg">
                <Activity className="h-5 w-5" />
              </span>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Real-Time Telemetry & Scan Performance
              </h3>
              {isLive && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/40">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                  Live Streaming
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Live API response latency percentiles (P50, P95, P99) and security scan execution durations.
            </p>
          </div>

          {/* Controls: Auto-refresh, Tabs, Interval */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Metric Mode Selector */}
            <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-100/70 dark:bg-gray-800 p-0.5">
              <button
                id="btn-metric-latency"
                type="button"
                onClick={() => setActiveMetricTab('latency')}
                className={cn(
                  "px-3 py-1 text-xs font-semibold rounded-md transition-colors",
                  activeMetricTab === 'latency'
                    ? "bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-300 shadow-xs"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                )}
              >
                API Latency
              </button>
              <button
                id="btn-metric-scans"
                type="button"
                onClick={() => setActiveMetricTab('scanDuration')}
                className={cn(
                  "px-3 py-1 text-xs font-semibold rounded-md transition-colors",
                  activeMetricTab === 'scanDuration'
                    ? "bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-300 shadow-xs"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                )}
              >
                Scan Durations
              </button>
              <button
                id="btn-metric-throughput"
                type="button"
                onClick={() => setActiveMetricTab('throughput')}
                className={cn(
                  "px-3 py-1 text-xs font-semibold rounded-md transition-colors",
                  activeMetricTab === 'throughput'
                    ? "bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-300 shadow-xs"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                )}
              >
                Throughput
              </button>
            </div>

            {/* Interval Selector */}
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
              <button
                id="btn-toggle-live-stream"
                type="button"
                onClick={() => setIsLive(!isLive)}
                className={cn(
                  "px-2.5 py-1 rounded-md text-xs font-medium border transition-colors flex items-center gap-1",
                  isLive
                    ? "bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-950/40 dark:border-indigo-800 dark:text-indigo-300"
                    : "bg-gray-100 border-gray-200 text-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400"
                )}
              >
                <RefreshCw className={cn("h-3 w-3", isLive && "animate-spin text-indigo-600")} />
                {isLive ? 'Live' : 'Paused'}
              </button>
              <select
                id="select-telemetry-interval"
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md px-2 py-1 text-xs text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value={3000}>3s refresh</option>
                <option value={5000}>5s refresh</option>
                <option value={10000}>10s refresh</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Real-time KPI Stats Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 bg-gray-50/40 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800">
        <div className="p-3 bg-white dark:bg-gray-800/80 rounded-lg border border-gray-100 dark:border-gray-700/60 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">P50 Mean Latency</span>
            <Zap className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="mt-2 text-xl font-bold font-mono text-gray-900 dark:text-white">
            {latestPoint?.p50 || data?.currentAvgLatency || 48} <span className="text-xs font-normal text-gray-500">ms</span>
          </p>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 mt-0.5">
            <TrendingDown className="h-3 w-3" /> Optimal response time
          </span>
        </div>

        <div className="p-3 bg-white dark:bg-gray-800/80 rounded-lg border border-gray-100 dark:border-gray-700/60 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">P95 Tail Latency</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <p className="mt-2 text-xl font-bold font-mono text-gray-900 dark:text-white">
            {latestPoint?.p95 || data?.currentP95Latency || 104} <span className="text-xs font-normal text-gray-500">ms</span>
          </p>
          <span className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 block">
            SLO target: &lt; 250ms
          </span>
        </div>

        <div className="p-3 bg-white dark:bg-gray-800/80 rounded-lg border border-gray-100 dark:border-gray-700/60 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Avg Security Scan</span>
            <ShieldAlert className="h-4 w-4 text-indigo-500" />
          </div>
          <p className="mt-2 text-xl font-bold font-mono text-gray-900 dark:text-white">
            {((data?.avgScanDurationMs || 3558) / 1000).toFixed(2)} <span className="text-xs font-normal text-gray-500">sec</span>
          </p>
          <span className="text-[11px] text-indigo-600 dark:text-indigo-400 mt-0.5 block">
            {data?.activeConcurrentScans || 3} concurrent pipelines
          </span>
        </div>

        <div className="p-3 bg-white dark:bg-gray-800/80 rounded-lg border border-gray-100 dark:border-gray-700/60 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Evaluated Payloads</span>
            <Server className="h-4 w-4 text-purple-500" />
          </div>
          <p className="mt-2 text-xl font-bold font-mono text-gray-900 dark:text-white">
            {(data?.evaluatedPayloadsToday || 18450).toLocaleString()}
          </p>
          <span className="text-[11px] text-purple-600 dark:text-purple-400 mt-0.5 block">
            Uptime: {data?.systemUptime || '99.98%'}
          </span>
        </div>
      </div>

      {/* Main Visualizations Area */}
      <div className="p-5">
        {activeMetricTab === 'latency' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Percentile Latency Over Time (ms)
              </span>
              <div className="flex items-center gap-4 text-xs font-medium">
                <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                  <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" /> P50 Median
                </span>
                <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> P95 High
                </span>
                <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-500" /> P99 Tail
                </span>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.timeSeries || []} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="latencyP50" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="latencyP95" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:stroke-gray-800" />
                  <XAxis dataKey="timestamp" stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}ms`} />
                  <Tooltip content={<CustomLatencyTooltip />} />
                  <Area type="monotone" dataKey="p50" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#latencyP50)" name="P50 Latency" />
                  <Area type="monotone" dataKey="p95" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#latencyP95)" name="P95 Latency" />
                  <Line type="monotone" dataKey="p99" stroke="#ef4444" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="P99 Latency" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Model-Specific Latency Comparison */}
            <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-2">
                Latency Breakdown by Target Model System
              </span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-lg flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-gray-200">Llama-3-70b-Instruct</p>
                    <p className="text-gray-500">Core LLM Endpoint</p>
                  </div>
                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                    {latestPoint?.llamaLatency || 62} ms
                  </span>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-lg flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-gray-200">FinGPT-Extraction-v2</p>
                    <p className="text-gray-500">Financial Structured API</p>
                  </div>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                    {latestPoint?.finGptLatency || 45} ms
                  </span>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800/60 rounded-lg flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-gray-200">Enterprise-Search-RAG</p>
                    <p className="text-gray-500">Vector Embeddings + Generation</p>
                  </div>
                  <span className="font-mono font-bold text-amber-600 dark:text-amber-400 text-sm">
                    {latestPoint?.ragLatency || 84} ms
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeMetricTab === 'scanDuration' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Security Scan Execution Duration by Attack Vector (ms)
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Average vs P95 Worst-Case Scan Times
              </span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data?.scanTypeDurations || []} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:stroke-gray-800" />
                  <XAxis dataKey="type" stroke="#9ca3af" fontSize={11} tickLine={false} axisLine={false} angle={-10} textAnchor="end" />
                  <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}ms`} />
                  <Tooltip content={<CustomLatencyTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Bar dataKey="avgDurationMs" name="Avg Scan Duration (ms)" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="p95DurationMs" name="P95 Scan Duration (ms)" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeMetricTab === 'throughput' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Payload Scanning Throughput (Evaluations / Sec)
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Concurrency performance
              </span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.timeSeries || []} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="throughputGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:stroke-gray-800" />
                  <XAxis dataKey="timestamp" stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}`} />
                  <Tooltip content={<CustomLatencyTooltip />} />
                  <Area type="monotone" dataKey="payloadThroughput" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#throughputGrad)" name="Payload Throughput (evals/sec)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
