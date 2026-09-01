// PWA Service Worker Registration and Offline State Manager

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

let deferredInstallPrompt: BeforeInstallPromptEvent | null = null;
const listeners = new Set<(canInstall: boolean) => void>();
const onlineListeners = new Set<(isOnline: boolean) => void>();

export function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('[PWA] Service Worker registered with scope:', reg.scope);
        })
        .catch((err) => {
          console.warn('[PWA] Service Worker registration failed:', err);
        });
    });

    // Handle install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredInstallPrompt = e as BeforeInstallPromptEvent;
      notifyInstallListeners(true);
    });

    window.addEventListener('appinstalled', () => {
      deferredInstallPrompt = null;
      notifyInstallListeners(false);
      console.log('[PWA] Kavach-AI installed to home screen.');
    });

    // Handle online / offline events
    window.addEventListener('online', () => {
      notifyOnlineListeners(true);
    });
    window.addEventListener('offline', () => {
      notifyOnlineListeners(false);
    });
  }
}

function notifyInstallListeners(canInstall: boolean) {
  listeners.forEach((listener) => listener(canInstall));
}

function notifyOnlineListeners(isOnline: boolean) {
  onlineListeners.forEach((listener) => listener(isOnline));
}

export function subscribeToInstallPrompt(callback: (canInstall: boolean) => void) {
  listeners.add(callback);
  callback(deferredInstallPrompt !== null);
  return () => {
    listeners.delete(callback);
  };
}

export function subscribeToOnlineStatus(callback: (isOnline: boolean) => void) {
  onlineListeners.add(callback);
  callback(typeof navigator !== 'undefined' ? navigator.onLine : true);
  return () => {
    onlineListeners.delete(callback);
  };
}

export async function promptPWAInstall(): Promise<boolean> {
  if (!deferredInstallPrompt) {
    return false;
  }
  try {
    await deferredInstallPrompt.prompt();
    const choiceResult = await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    notifyInstallListeners(false);
    return choiceResult.outcome === 'accepted';
  } catch (err) {
    console.error('[PWA] Error triggering install prompt:', err);
    return false;
  }
}
