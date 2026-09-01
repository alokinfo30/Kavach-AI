import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Clock, RefreshCw, LogOut, X, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';

export default function SessionExpiryToast() {
  const { 
    showExpiryWarning, 
    secondsRemaining, 
    extendSession, 
    isExtendingSession, 
    dismissExpiryWarning, 
    logout 
  } = useAuth();

  const [extendedSuccess, setExtendedSuccess] = useState(false);

  if (!showExpiryWarning && !extendedSuccess) return null;

  const handleExtend = async () => {
    const success = await extendSession();
    if (success) {
      setExtendedSuccess(true);
      setTimeout(() => {
        setExtendedSuccess(false);
      }, 3500);
    }
  };

  if (extendedSuccess) {
    return (
      <div 
        id="session-extension-success-toast"
        className="fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 bg-emerald-900/95 text-white border border-emerald-500/40 rounded-xl shadow-2xl backdrop-blur-md transition-all duration-300 animate-in slide-in-from-bottom-5"
        role="alert"
      >
        <div className="p-1.5 bg-emerald-500/20 text-emerald-300 rounded-lg">
          <CheckCircle2 className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-bold">Session Extended</p>
          <p className="text-[11px] text-emerald-200">Your authentication token has been renewed for 15 minutes.</p>
        </div>
      </div>
    );
  }

  // Calculate percentage of remaining 60 seconds
  const pct = Math.min(100, Math.max(0, (secondsRemaining / 60) * 100));
  const isUrgent = secondsRemaining <= 20;

  return (
    <div 
      id="session-expiry-warning-toast"
      className={cn(
        "fixed bottom-5 right-5 z-50 w-full max-w-md bg-gray-900/95 dark:bg-gray-950/95 text-white border rounded-2xl shadow-2xl backdrop-blur-xl p-4 transition-all duration-300 animate-in slide-in-from-bottom-6",
        isUrgent ? "border-red-500/60 ring-2 ring-red-500/20" : "border-amber-500/50 ring-1 ring-amber-500/20"
      )}
      role="alertdialog"
      aria-live="assertive"
      aria-labelledby="session-warning-title"
    >
      {/* Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gray-800 rounded-t-2xl overflow-hidden">
        <div 
          className={cn(
            "h-full transition-all duration-1000 ease-linear",
            isUrgent ? "bg-red-500" : "bg-amber-400"
          )}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex items-start justify-between gap-3 pt-1">
        <div className="flex items-start gap-3">
          <div className={cn(
            "p-2 rounded-xl flex-shrink-0 mt-0.5",
            isUrgent ? "bg-red-500/20 text-red-400 animate-pulse" : "bg-amber-500/20 text-amber-300"
          )}>
            {isUrgent ? <AlertTriangle className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h4 id="session-warning-title" className="text-sm font-bold text-white">
                Session Expiration Warning
              </h4>
              <span className={cn(
                "px-2 py-0.5 text-[11px] font-mono font-bold rounded-full",
                isUrgent ? "bg-red-500/30 text-red-300 border border-red-500/40" : "bg-amber-500/25 text-amber-200 border border-amber-500/30"
              )}>
                {secondsRemaining}s remaining
              </span>
            </div>
            
            <p className="text-xs text-gray-300 leading-relaxed">
              Your secure governance token will expire in <strong className="text-white font-mono">{secondsRemaining} seconds</strong> due to session limits. Extend now to preserve your current workflow.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={dismissExpiryWarning}
          className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition-colors"
          title="Dismiss for now"
          aria-label="Dismiss warning"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-800 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => logout()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-300 hover:text-white bg-transparent hover:bg-gray-800 rounded-lg transition-colors"
        >
          <LogOut className="h-3.5 w-3.5" />
          Log Out
        </button>

        <button
          type="button"
          onClick={handleExtend}
          disabled={isExtendingSession}
          className={cn(
            "inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-lg shadow-sm transition-all",
            "bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white active:scale-95",
            isExtendingSession && "opacity-75 cursor-not-allowed"
          )}
        >
          <RefreshCw className={cn("h-3.5 w-3.5", isExtendingSession && "animate-spin")} />
          {isExtendingSession ? "Extending..." : "Extend Session"}
        </button>
      </div>
    </div>
  );
}
