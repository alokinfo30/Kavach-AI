import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Activity, Shield, AlertTriangle, CheckCircle, RefreshCcw, ExternalLink, HelpCircle, History } from 'lucide-react';
import api from './lib/api';
import { cn } from './lib/utils';
import TelemetryMetrics from './components/TelemetryMetrics';
import ModelHealthWidget from './components/ModelHealthWidget';
import BackendHealthWidget from './components/BackendHealthWidget';
import Tooltip from './components/Tooltip';

interface Stats {
  securityTests: number;
  activeAlerts: number;
  modelsMonitored: number;
  complianceScore: number;
}

interface ActivityItem {
  activity_type: string;
  description: string;
  status: string;
  created_at: string;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [vulnerabilityTrend, setVulnerabilityTrend] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = async (showRefresh = false) => {
    if (showRefresh) setIsRefreshing(true);
    try {
      const [statsRes, chartRes, activityRes, trendRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/dashboard/chart-data'),
        api.get('/dashboard/recent-activity?per_page=5'),
        api.get('/dashboard/vulnerability-trend')
      ]);

      setStats(statsRes.data);
      const formattedChartData = chartRes.data?.labels ? chartRes.data.labels.map((label: string, index: number) => ({
        name: label,
        tests: chartRes.data.tests?.[index] || 0,
        alerts: chartRes.data.alerts?.[index] || 0
      })) : [];
      setChartData(formattedChartData);
      setActivities(activityRes.data?.activities || []);
      setVulnerabilityTrend(Array.isArray(trendRes.data) ? trendRes.data : []);
    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formattedTrendData = useMemo(() => {
    const grouped: Record<string, any> = {};
    vulnerabilityTrend.forEach(item => {
      if (!grouped[item.date]) grouped[item.date] = { date: item.date };
      grouped[item.date][item.status] = item.count;
    });
    return Object.values(grouped).sort((a: any, b: any) => a.date.localeCompare(b.date));
  }, [vulnerabilityTrend]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 shadow-lg rounded-lg dark:bg-gray-800 dark:border-gray-700">
          <p className="text-sm font-bold text-gray-900 dark:text-white mb-2">
            {label}
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-xs font-medium" style={{ color: entry.color }}>
              {entry.name}: <span className="font-bold">{entry.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const cards = [
    {
      name: 'Compliance Score',
      value: `${stats?.complianceScore ?? 0}%`,
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-50 dark:bg-green-950/30',
      tooltip: 'Composite compliance posture score calculated from active NIST AI RMF and ISO/IEC 42001 governance controls.'
    },
    {
      name: 'Active Alerts',
      value: stats?.activeAlerts ?? 0,
      icon: AlertTriangle,
      color: 'text-amber-600',
      bg: 'bg-amber-50 dark:bg-amber-950/30',
      link: '/monitoring',
      tooltip: 'Statistical anomalies and metric drift breaches currently exceeding configured alert thresholds.'
    },
    {
      name: 'Security Tests',
      value: stats?.securityTests ?? 0,
      icon: Shield,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50 dark:bg-indigo-950/30',
      link: '/red-team',
      tooltip: 'Total adversarial jailbreak simulations, prompt injections, and scheduled red team tests.'
    },
    {
      name: 'Models Monitored',
      value: stats?.modelsMonitored ?? 0,
      icon: Activity,
      color: 'text-blue-600',
      bg: 'bg-blue-50 dark:bg-blue-950/30',
      link: '/monitoring',
      tooltip: 'Active enterprise LLM endpoints tracked under real-time latency and drift surveillance.'
    },
  ];

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Governance & Telemetry Overview</h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            Real-time compliance surveillance, adversarial testing metrics, and model health.
          </p>
        </div>
        <div className="flex items-center gap-3 self-start sm:self-center">
          <BackendHealthWidget />
          <Tooltip content="Refresh all dashboard statistics and real-time telemetry">
            <button 
              onClick={() => fetchData(true)}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors shadow-2xs"
            >
              <RefreshCcw className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin text-indigo-600")} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div key={card.name} className="overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-2xs transition-all border border-gray-100 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={cn("rounded-lg p-3", card.bg)}>
                    <card.icon className={cn("h-6 w-6", card.color)} />
                  </div>
                </div>
                <div className="ml-4 w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <span className="truncate text-xs font-medium text-gray-500 dark:text-gray-400">{card.name}</span>
                    <Tooltip content={card.tooltip}>
                      <HelpCircle className="h-3 w-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-help" />
                    </Tooltip>
                  </div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                    {card.link ? <Link to={card.link} className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">{card.value}</Link> : card.value}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Activity Chart */}
        <div className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-2xs lg:col-span-2 transition-colors border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold leading-6 text-gray-900 dark:text-white">7-Day Activity & Drift Trend</h3>
              <p className="text-xs text-gray-400">Security tests conducted vs drift anomaly alerts</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block"></span> Tests
              </span>
              <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span> Drift Alerts
              </span>
            </div>
          </div>
          <div className="h-72 w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTests" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorAlerts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d97706" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#d97706" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => val.includes('-') ? val.split('-').slice(1).join('/') : val} />
                <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:stroke-gray-700" />
                <RechartsTooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="tests" stroke="#4f46e5" fillOpacity={1} fill="url(#colorTests)" name="Security Tests" />
                <Area type="monotone" dataKey="alerts" stroke="#d97706" fillOpacity={1} fill="url(#colorAlerts)" name="Alerts" />
              </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-gray-400">No chart data available</div>
            )}
          </div>
        </div>

        {/* Vulnerability Status Trend */}
        <div className="rounded-xl bg-white dark:bg-gray-800 p-6 shadow-2xs lg:col-span-2 transition-colors border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold leading-6 text-gray-900 dark:text-white">Vulnerability Remediation & Lifecycle</h3>
              <p className="text-xs text-gray-400">Historical resolution velocity of identified red team findings</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                <span className="w-2.5 h-2.5 rounded-xs bg-red-500 inline-block"></span> New
              </span>
              <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                <span className="w-2.5 h-2.5 rounded-xs bg-amber-500 inline-block"></span> In Progress
              </span>
              <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
                <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500 inline-block"></span> Resolved
              </span>
            </div>
          </div>
          <div className="h-64 w-full">
            {formattedTrendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={formattedTrendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:stroke-gray-700" />
                  <XAxis dataKey="date" stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => val.includes('-') ? val.split('-').slice(1).join('/') : val} />
                  <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
                  <RechartsTooltip content={<CustomTooltip />} />
                  <Bar dataKey="new" stackId="a" fill="#ef4444" name="New" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="in_progress" stackId="a" fill="#f59e0b" name="In Progress" />
                  <Bar dataKey="resolved" stackId="a" fill="#10b981" name="Resolved" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-gray-400 border-2 border-dashed border-gray-100 dark:border-gray-800 rounded-lg">
                No remediation data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Connected AI Model Endpoints & Active Health Surveillance */}
      <ModelHealthWidget />

      {/* Real-time API Latency & Security Scan Duration Visualization */}
      <TelemetryMetrics />

      <div className="grid grid-cols-1 gap-8">
        {/* Recent Activity */}
        <div className="rounded-xl bg-white dark:bg-gray-800 shadow-2xs transition-colors border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/30">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Recent Activity & Audit Trail Highlights</h3>
            </div>
            <Link to="/activity-log" className="text-xs font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center gap-1">
              View Full Audit Log &rarr;
            </Link>
          </div>
          <ul role="list" className="divide-y divide-gray-100 dark:divide-gray-700/60 px-6">
            {activities.length === 0 ? (
              <li className="py-6 text-center text-xs text-gray-500">No recent activity</li>
            ) : (
              activities.map((item, idx) => (
                <li key={idx} className="flex gap-x-4 py-3.5">
                  <div className="min-w-0 flex-auto group">
                    <div className="flex items-center gap-x-2">
                      <Link 
                        to={item.activity_type === 'test' ? '/red-team' : '/monitoring'} 
                        className="text-xs font-semibold leading-5 text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1"
                      >
                        {item.description}
                        <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                      <span className={cn(
                        "inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-semibold ring-1 ring-inset",
                        item.status === 'completed' || item.status === 'SUCCESS' ? "bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-950/60 dark:text-green-300" : 
                        item.status === 'failed' ? "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-950/60 dark:text-red-300" : "bg-gray-50 text-gray-600 ring-gray-500/10 dark:bg-gray-800 dark:text-gray-300"
                      )}>
                        {item.status}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-[11px] leading-4 text-gray-400 font-mono">
                      {new Date(item.created_at).toLocaleString()}
                    </p>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
