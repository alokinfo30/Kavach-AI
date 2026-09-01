import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ShieldAlert, RefreshCw, Home, LogOut, Copy, Check, ChevronDown, ChevronUp, Terminal } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  copied: boolean;
  showDetails: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    copied: false,
    showDetails: false,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[Kavach-AI Error Boundary Caught]:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      copied: false,
      showDetails: false,
    });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    this.handleReset();
    window.location.href = '/';
  };

  private handleClearAndRelogin = () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('kavach_current_user');
    } catch {
      // ignore
    }
    window.location.href = '/login';
  };

  private handleCopyDiagnostics = async () => {
    const { error, errorInfo } = this.state;
    const diagnosticPayload = {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      errorMessage: error?.message || 'Unknown error',
      errorStack: error?.stack || 'No stack trace',
      componentStack: errorInfo?.componentStack || 'No component stack',
    };

    try {
      await navigator.clipboard.writeText(JSON.stringify(diagnosticPayload, null, 2));
      this.setState({ copied: true });
      setTimeout(() => this.setState({ copied: false }), 3000);
    } catch (err) {
      console.error('Failed to copy diagnostics', err);
    }
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, errorInfo, copied, showDetails } = this.state;

      return (
        <div 
          id="kavach-error-boundary-screen"
          className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors"
        >
          <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden">
            {/* Incident Header */}
            <div className="p-6 sm:p-8 border-b border-gray-100 dark:border-gray-700/80 bg-red-50/50 dark:bg-red-950/20">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 shrink-0">
                  <ShieldAlert className="h-7 w-7" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                      Runtime Incident Intercepted
                    </h2>
                    <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-red-100 text-red-700 dark:bg-red-900/60 dark:text-red-300 border border-red-200 dark:border-red-800">
                      Isolated
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    Kavach-AI caught an unexpected UI or API exception. The state was isolated to safeguard your active session and prevent uncommitted data corruption.
                  </p>
                </div>
              </div>
            </div>

            {/* Error Message Box */}
            <div className="p-6 sm:p-8 space-y-6">
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700/80 font-mono text-xs text-red-600 dark:text-red-400 break-words">
                <span className="font-bold text-gray-700 dark:text-gray-300 block mb-1">Error Summary:</span>
                {error?.message || 'An unexpected rendering or network failure occurred.'}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 items-center">
                <button
                  id="btn-recover-state"
                  onClick={this.handleReset}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Try Again & Recover
                </button>

                <button
                  id="btn-reload-app"
                  onClick={this.handleReload}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 transition-colors"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Reload Window
                </button>

                <button
                  id="btn-go-home"
                  onClick={this.handleGoHome}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 transition-colors"
                >
                  <Home className="h-3.5 w-3.5" />
                  Return to Dashboard
                </button>

                <button
                  id="btn-clear-session"
                  onClick={this.handleClearAndRelogin}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-200 dark:border-amber-800 transition-colors ml-auto"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Reset Session
                </button>
              </div>

              {/* Diagnostic Collapsible */}
              <div className="pt-2 border-t border-gray-100 dark:border-gray-700/60">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => this.setState({ showDetails: !showDetails })}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                  >
                    <Terminal className="h-3.5 w-3.5" />
                    <span>{showDetails ? 'Hide technical diagnostics' : 'View technical diagnostics'}</span>
                    {showDetails ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  </button>

                  <button
                    type="button"
                    onClick={this.handleCopyDiagnostics}
                    className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-500" />
                        <span className="text-emerald-600 dark:text-emerald-400">Copied to Clipboard</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>Copy Diagnostic JSON</span>
                      </>
                    )}
                  </button>
                </div>

                {showDetails && (
                  <div className="mt-3 p-4 rounded-xl bg-gray-950 text-gray-200 font-mono text-[11px] max-h-60 overflow-y-auto space-y-2 border border-gray-800 shadow-inner">
                    <div>
                      <span className="text-gray-400 font-bold block mb-0.5">Stack Trace:</span>
                      <pre className="text-red-300 whitespace-pre-wrap">{error?.stack || 'No stack trace available'}</pre>
                    </div>
                    {errorInfo?.componentStack && (
                      <div className="pt-2 border-t border-gray-800">
                        <span className="text-gray-400 font-bold block mb-0.5">Component Stack:</span>
                        <pre className="text-gray-300 whitespace-pre-wrap">{errorInfo.componentStack}</pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Footer Support Info */}
            <div className="px-6 py-3 bg-gray-50/70 dark:bg-gray-900/40 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between text-[11px] text-gray-400">
              <span>Kavach-AI Diagnostics Engine v1.0</span>
              <span>Need help? Contact alokinfo30@gmail.com</span>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
