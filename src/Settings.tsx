import { useEffect, useState } from 'react';
import { Save, Loader2, Check, Clock, RefreshCw, ShieldCheck, AlertTriangle } from 'lucide-react';
import api from './lib/api';
import { useAuth } from './context/AuthContext';

export default function Settings() {
  const { secondsRemaining, extendSession, isExtendingSession, simulateExpiryWarning } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    alert_threshold: 80,
    email_notifications: true,
    digest_frequency: 'daily',
  });
  const [message, setMessage] = useState('');
  const [sessionMsg, setSessionMsg] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/settings');
        if (res.data) setSettings(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await api.post('/settings', settings);
      setMessage('Settings saved successfully.');
      setTimeout(() => setMessage(''), 3000);
    } catch (e) {
      console.error(e);
      setMessage('Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const handleManualExtend = async () => {
    const success = await extendSession();
    if (success) {
      setSessionMsg('Session successfully extended for 15 minutes');
      setTimeout(() => setSessionMsg(''), 4000);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading settings...</div>;

  const minutesLeft = Math.floor(secondsRemaining / 60);
  const secsLeft = secondsRemaining % 60;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:truncate sm:text-3xl sm:tracking-tight">Global Settings</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Configure platform-wide thresholds, security session lifecycle, and notifications.</p>
      </div>

      {/* Platform Alert Configuration */}
      <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Drift & Alert Policies</h3>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Alert Threshold (%)</label>
            <div className="mt-1">
              <input
                type="number"
                min="0"
                max="100"
                value={settings.alert_threshold}
                onChange={e => setSettings({...settings, alert_threshold: parseInt(e.target.value) || 0})}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2 border"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Trigger alerts when model drift score exceeds this value.</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Digest Frequency</label>
            <select
              value={settings.digest_frequency}
              onChange={e => setSettings({...settings, digest_frequency: e.target.value})}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white p-2 border"
            >
              <option value="realtime">Real-time</option>
              <option value="daily">Daily Digest</option>
              <option value="weekly">Weekly Summary</option>
            </select>
          </div>

          <div className="flex items-center">
            <input
              id="email_notifications"
              type="checkbox"
              checked={settings.email_notifications}
              onChange={e => setSettings({...settings, email_notifications: e.target.checked})}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="email_notifications" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">Enable Email Notifications</label>
          </div>

          <div className="pt-2 flex items-center">
            <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50 transition-colors">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Changes
            </button>
            {message && <span className="ml-4 text-sm text-green-600 dark:text-green-400 flex items-center"><Check className="h-4 w-4 mr-1"/>{message}</span>}
          </div>
        </form>
      </div>

      {/* Session Security & Expiry Controls */}
      <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg p-6 border border-gray-200 dark:border-gray-700 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Authentication Session & Security Lifecycle</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Automated 60-second expiration warning and zero-trust session extension.
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 text-xs font-mono font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded-md border border-indigo-200 dark:border-indigo-800">
            {minutesLeft}m {secsLeft}s left
          </span>
        </div>

        <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
          Kavach monitors JWT token validity and emits a non-blocking toast warning <strong className="text-indigo-600 dark:text-indigo-400">60 seconds before session expiration</strong>. Users can instantly renew their session token without losing unsaved testing parameters.
        </p>

        <div className="flex items-center gap-3 pt-2 flex-wrap">
          <button
            type="button"
            onClick={handleManualExtend}
            disabled={isExtendingSession}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm active:scale-95 disabled:opacity-50 transition-all"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isExtendingSession ? 'animate-spin' : ''}`} />
            {isExtendingSession ? 'Renewing Token...' : 'Extend Session (15m)'}
          </button>

          <button
            type="button"
            onClick={simulateExpiryWarning}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 hover:bg-amber-100 rounded-lg active:scale-95 transition-all"
          >
            <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
            Simulate 60s Expiration Warning
          </button>
        </div>

        {sessionMsg && (
          <div className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 font-medium animate-in fade-in">
            <Check className="h-4 w-4" />
            {sessionMsg}
          </div>
        )}
      </div>
    </div>
  );
}
