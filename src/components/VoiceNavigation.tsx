import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mic,
  MicOff,
  Volume2,
  Sparkles,
  Compass,
  Shield,
  Activity,
  BookOpen,
  FileText,
  History,
  Settings,
  GitCompare,
  Search,
  Keyboard,
  X,
  CheckCircle2,
  AlertCircle,
  Play
} from 'lucide-react';
import { cn } from '../lib/utils';

// Declare Web Speech API types
interface IWindow extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

interface VoiceNavigationProps {
  onOpenSearch?: () => void;
  onOpenShortcuts?: () => void;
}

interface VoiceCommandDef {
  keywords: string[];
  label: string;
  path?: string;
  action?: 'search' | 'shortcuts' | 'health';
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const VOICE_COMMANDS: VoiceCommandDef[] = [
  {
    keywords: ['dashboard', 'home', 'overview', 'main'],
    label: 'Overview Dashboard',
    path: '/dashboard',
    icon: Compass,
    description: 'Jump to system dashboard & KPIs'
  },
  {
    keywords: ['red team', 'redteam', 'security test', 'security tests', 'attacks', 'adversarial', 'probe'],
    label: 'Red Team Testing Lab',
    path: '/red-team',
    icon: Shield,
    description: 'Adversarial attack probes & automated scans'
  },
  {
    keywords: ['monitoring', 'drift', 'telemetry', 'surveillance', 'stability'],
    label: 'Drift Surveillance',
    path: '/monitoring',
    icon: Activity,
    description: 'Embedding drift & model stability monitoring'
  },
  {
    keywords: ['knowledge', 'knowledge base', 'docs', 'guidelines', 'owasp', 'mitigation'],
    label: 'Knowledge Base',
    path: '/knowledge',
    icon: BookOpen,
    description: 'OWASP LLM guides & compliance framework'
  },
  {
    keywords: ['report', 'reports', 'audit', 'compliance report', 'export'],
    label: 'Compliance Reports',
    path: '/reports',
    icon: FileText,
    description: 'ISO/IEC 42001 & NIST AI RMF audit reports'
  },
  {
    keywords: ['activity', 'activity log', 'logs', 'audit log', 'history'],
    label: 'Activity Audit Log',
    path: '/activity-log',
    icon: History,
    description: 'Chronological platform audit trail'
  },
  {
    keywords: ['settings', 'preferences', 'configuration', 'alerts'],
    label: 'Platform Settings',
    path: '/settings',
    icon: Settings,
    description: 'Thresholds, alert rules & preferences'
  },
  {
    keywords: ['compare', 'comparison', 'diff', 'compare tests'],
    label: 'Compare Tests',
    path: '/red-team/compare?test1=1&test2=2',
    icon: GitCompare,
    description: 'Side-by-side adversarial comparison'
  },
  {
    keywords: ['search', 'find', 'quick search', 'lookup'],
    label: 'Universal Search',
    action: 'search',
    icon: Search,
    description: 'Open global search palette'
  },
  {
    keywords: ['shortcuts', 'keyboard', 'hotkeys', 'help'],
    label: 'Shortcuts Guide',
    action: 'shortcuts',
    icon: Keyboard,
    description: 'Show keyboard shortcuts catalog'
  }
];

export default function VoiceNavigation({ onOpenSearch, onOpenShortcuts }: VoiceNavigationProps) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [matchedCommand, setMatchedCommand] = useState<VoiceCommandDef | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('Ready to listen');
  const [hasSpeechSupport, setHasSpeechSupport] = useState(true);
  const [micPermissionError, setMicPermissionError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);

  // Initialize SpeechRecognition instance
  useEffect(() => {
    const win = window as unknown as IWindow;
    const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setHasSpeechSupport(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setMicPermissionError(null);
        setStatusMessage('Listening... Speak a destination or command');
      };

      recognition.onresult = (event: any) => {
        let currentInterim = '';
        let currentFinal = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const result = event.results[i];
          if (result.isFinal) {
            currentFinal += result[0].transcript;
          } else {
            currentInterim += result[0].transcript;
          }
        }

        const heard = (currentFinal || currentInterim).trim();
        setTranscript(heard);
        setInterimTranscript(currentInterim);

        if (heard) {
          matchAndExecuteVoiceCommand(heard);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setMicPermissionError('Microphone access blocked or restricted in current frame.');
          setStatusMessage('Microphone access denied. You can test commands using the interactive buttons below.');
        } else if (event.error === 'no-speech') {
          setStatusMessage('No speech detected. Listening...');
        } else {
          setStatusMessage(`Speech status: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } catch (e) {
      console.warn('SpeechRecognition initialization error:', e);
      setHasSpeechSupport(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  // Match voice phrase to command definition
  const matchAndExecuteVoiceCommand = (rawText: string) => {
    const text = rawText.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').trim();

    // Clean filler words
    const cleanText = text
      .replace(/^(please|can you|navigate to|open|go to|take me to|show me|show|switch to)\s+/i, '')
      .trim();

    const matched = VOICE_COMMANDS.find(cmd => {
      return cmd.keywords.some(keyword => {
        const kw = keyword.toLowerCase();
        return text.includes(kw) || cleanText.includes(kw) || text === kw;
      });
    });

    if (matched) {
      setMatchedCommand(matched);
      setStatusMessage(`Navigating to: ${matched.label}`);

      // Short delay for visual feedback
      setTimeout(() => {
        executeCommand(matched);
      }, 700);
    }
  };

  const executeCommand = (cmd: VoiceCommandDef) => {
    if (cmd.path) {
      navigate(cmd.path);
    } else if (cmd.action === 'search' && onOpenSearch) {
      onOpenSearch();
    } else if (cmd.action === 'shortcuts' && onOpenShortcuts) {
      onOpenShortcuts();
    }

    // Stop listening and close modal smoothly
    stopListening();
    setTimeout(() => {
      setIsOpen(false);
      setMatchedCommand(null);
      setTranscript('');
    }, 400);
  };

  const startListening = () => {
    setMicPermissionError(null);
    setMatchedCommand(null);
    setTranscript('');
    setStatusMessage('Requesting microphone access...');

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (err: any) {
        // Recognition might already be running
        if (err.name === 'InvalidStateError') {
          recognitionRef.current.stop();
          setTimeout(() => recognitionRef.current.start(), 150);
        } else {
          console.warn('Failed to start speech recognition:', err);
        }
      }
    } else {
      setStatusMessage('Voice recognition is active in simulation mode.');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    setIsListening(false);
  };

  const toggleModal = () => {
    if (!isOpen) {
      setIsOpen(true);
      startListening();
    } else {
      stopListening();
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Header Button Trigger */}
      <button
        id="btn-voice-navigation"
        type="button"
        onClick={toggleModal}
        title="Voice Navigation & Assistant"
        className={cn(
          "relative p-2 rounded-lg transition-all duration-200 flex items-center justify-center gap-1 text-xs font-semibold shadow-2xs",
          isListening
            ? "bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 ring-2 ring-red-500/20"
            : "text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-700"
        )}
      >
        {isListening ? (
          <>
            <span className="relative flex h-2 w-2 mr-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <Mic className="h-4 w-4 animate-pulse" />
          </>
        ) : (
          <Mic className="h-4 w-4" />
        )}
      </button>

      {/* Voice Assistant Modal / Overlay */}
      {isOpen && (
        <div
          id="voice-navigation-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-xs p-4 animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              stopListening();
              setIsOpen(false);
            }
          }}
        >
          <div
            id="voice-navigation-modal"
            className="w-full max-w-lg overflow-hidden rounded-2xl bg-white dark:bg-gray-900 shadow-2xl border border-gray-200 dark:border-gray-700 transition-all text-left flex flex-col"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 px-6 py-4 bg-gray-50/70 dark:bg-gray-800/40">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-xs">
                  <Volume2 className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">
                      Voice Navigation & Assistant
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                      Web Speech API
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Navigate anywhere on Kavach AI using natural voice commands.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  stopListening();
                  setIsOpen(false);
                }}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Listening Visualizer */}
            <div className="p-6 text-center bg-gradient-to-b from-indigo-50/30 dark:from-indigo-950/20 to-transparent flex flex-col items-center justify-center">
              <div className="relative mb-4">
                {isListening && (
                  <div className="absolute inset-0 rounded-full bg-indigo-400/30 animate-ping" />
                )}
                <button
                  type="button"
                  onClick={isListening ? stopListening : startListening}
                  className={cn(
                    "relative h-16 w-16 rounded-full flex items-center justify-center shadow-lg transition-all transform hover:scale-105",
                    isListening
                      ? "bg-red-600 text-white ring-4 ring-red-300 dark:ring-red-900"
                      : "bg-indigo-600 text-white hover:bg-indigo-500"
                  )}
                >
                  {isListening ? (
                    <Mic className="h-7 w-7 animate-pulse" />
                  ) : (
                    <MicOff className="h-7 w-7 text-indigo-200" />
                  )}
                </button>
              </div>

              {/* Status text */}
              <div className="space-y-1">
                <p className="text-sm font-semibold text-gray-900 dark:text-white flex items-center justify-center gap-1.5">
                  {isListening ? (
                    <>
                      <Sparkles className="h-4 w-4 text-indigo-500 animate-spin" />
                      Listening for voice input...
                    </>
                  ) : (
                    'Microphone paused. Click to speak.'
                  )}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm">
                  {statusMessage}
                </p>
              </div>

              {/* Live Transcript Display */}
              <div className="mt-4 w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 min-h-[48px] flex items-center justify-center">
                {transcript ? (
                  <p className="text-sm font-medium text-indigo-600 dark:text-indigo-300 italic">
                    "{transcript}"
                  </p>
                ) : (
                  <p className="text-xs text-gray-400">
                    Try saying: <span className="font-semibold text-gray-600 dark:text-gray-300">"Go to Red Team"</span> or <span className="font-semibold text-gray-600 dark:text-gray-300">"Open Reports"</span>
                  </p>
                )}
              </div>

              {/* Matched Command Feedback */}
              {matchedCommand && (
                <div className="mt-3 p-2.5 w-full rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center gap-2 text-emerald-800 dark:text-emerald-200 text-xs font-semibold animate-in fade-in">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Matched: {matchedCommand.label} — Navigating now...</span>
                </div>
              )}

              {/* Mic Permission Warning */}
              {micPermissionError && (
                <div className="mt-3 p-2.5 w-full rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-start gap-2 text-amber-800 dark:text-amber-200 text-xs text-left">
                  <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0" />
                  <span>{micPermissionError} You can also click any sample command below to execute it immediately.</span>
                </div>
              )}
            </div>

            {/* Quick Command Chips */}
            <div className="p-5 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 max-h-56 overflow-y-auto">
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">
                Supported Voice Commands (Click to simulate)
              </p>
              <div className="grid grid-cols-2 gap-2">
                {VOICE_COMMANDS.map((cmd, idx) => {
                  const Icon = cmd.icon;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => executeCommand(cmd)}
                      className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:border-indigo-200 dark:hover:border-indigo-800 text-left transition-colors group flex items-start gap-2"
                    >
                      <div className="p-1 rounded bg-white dark:bg-gray-700 text-gray-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-300">
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 truncate">
                          "{cmd.keywords[0]}"
                        </p>
                        <p className="text-[10px] text-gray-400 truncate">
                          {cmd.label}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-3 bg-gray-50 dark:bg-gray-800/60 border-t border-gray-200 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400">
              <span className="text-[11px]">Powered by native Web Speech API & speech recognition</span>
              <button
                type="button"
                onClick={() => {
                  stopListening();
                  setIsOpen(false);
                }}
                className="px-3 py-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-md font-semibold text-xs text-gray-800 dark:text-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
