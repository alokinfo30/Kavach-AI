import React, { useState, useEffect } from 'react';
import { Download, X, Shield, Sparkles } from 'lucide-react';
import { subscribeToInstallPrompt, promptPWAInstall } from '../lib/pwa';

export default function PWAInstallBanner() {
  const [canInstall, setCanInstall] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    const isDismissed = sessionStorage.getItem('pwa_banner_dismissed') === 'true';
    if (isDismissed) {
      setDismissed(true);
    }

    const unbind = subscribeToInstallPrompt((installable) => {
      setCanInstall(installable);
    });

    return () => unbind();
  }, []);

  const handleInstall = async () => {
    setInstalling(true);
    try {
      const accepted = await promptPWAInstall();
      if (accepted) {
        setCanInstall(false);
      }
    } finally {
      setInstalling(false);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('pwa_banner_dismissed', 'true');
  };

  if (!canInstall || dismissed) {
    return null;
  }

  return (
    <aside aria-label="Install Kavach-AI Application" className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="bg-slate-900/95 dark:bg-slate-950/95 text-white p-4 rounded-2xl shadow-2xl border border-indigo-500/30 backdrop-blur-md flex items-center justify-between gap-4 ring-1 ring-white/10">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 flex-shrink-0">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="font-semibold text-sm tracking-tight text-white">Install Kavach-AI</h4>
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <Sparkles className="w-2.5 h-2.5" /> PWA
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
              Install for faster offline access and a native desktop/mobile app experience.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleInstall}
            disabled={installing}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            {installing ? 'Installing...' : 'Install'}
          </button>
          <button
            onClick={handleDismiss}
            aria-label="Dismiss banner"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
