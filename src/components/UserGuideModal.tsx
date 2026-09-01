import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  X,
  Shield,
  ShieldAlert,
  Activity,
  FileText,
  History,
  Settings,
  Sparkles,
  ExternalLink,
  Keyboard,
  Download,
  Search,
  Zap,
  HelpCircle,
  Play
} from 'lucide-react';

interface UserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'tour' | 'checklist' | 'docs';
}

export default function UserGuideModal({ isOpen, onClose, initialTab = 'tour' }: UserGuideModalProps) {
  const [activeTab, setActiveTab] = useState<'tour' | 'checklist' | 'docs'>(initialTab);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('kavach_onboarding_tasks');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  const toggleTask = (taskId: string) => {
    const updated = { ...completedTasks, [taskId]: !completedTasks[taskId] };
    setCompletedTasks(updated);
    localStorage.setItem('kavach_onboarding_tasks', JSON.stringify(updated));
  };

  const handleFinishTour = () => {
    localStorage.setItem('kavach_tour_completed', 'true');
    onClose();
  };

  const tourSteps = [
    {
      title: 'Welcome to Kavach-AI Platform',
      badge: 'Getting Started',
      icon: Shield,
      color: 'from-indigo-500 to-purple-600',
      description:
        'Kavach-AI is an Enterprise Responsible AI (RAI) Operations and Security platform designed to test, monitor, and safeguard AI models against security vulnerabilities, model drift, and regulatory compliance risks.',
      highlights: [
        'Adversarial Red Teaming & LLM Vulnerability Scans',
        'Real-time Model Drift & Telemetry Monitoring',
        'EU AI Act, NIST AI RMF & OWASP Top 10 Governance',
        'Audit-ready PDF Compliance Reporting & Activity Logs'
      ],
      actionText: 'Explore Dashboard',
      actionRoute: '/dashboard'
    },
    {
      title: '1. Executive Dashboard & Risk Score',
      badge: 'Core Analytics',
      icon: Shield,
      color: 'from-blue-500 to-indigo-600',
      description:
        'Your command center provides real-time situational awareness over all registered AI models, attack surfaces, and active system alerts.',
      highlights: [
        'Composite AI Risk Score (0-100) based on severity and exposure',
        'Live system health widget tracking PostgreSQL, MongoDB, and Redis connections',
        'Instant counters for critical, high, medium, and low severity vulnerabilities',
        'Recent security audit feeds and rapid action shortcuts'
      ],
      actionText: 'Go to Dashboard',
      actionRoute: '/dashboard'
    },
    {
      title: '2. Adversarial AI Red Teaming',
      badge: 'Security Testing',
      icon: ShieldAlert,
      color: 'from-rose-500 to-red-600',
      description:
        'Conduct rigorous adversarial stress-testing on LLMs and ML endpoints using standardized and custom attack vectors to expose vulnerabilities before deployment.',
      highlights: [
        'Simulate Prompt Injection, Jailbreaks, System Prompt Extraction, and Bias',
        'Run single tests or schedule recurring automated scans',
        'Side-by-side Test Comparison matrix to evaluate prompt safety improvements',
        'Download individual test audit reports in PDF format'
      ],
      actionText: 'Launch Red Team Test',
      actionRoute: '/red-team'
    },
    {
      title: '3. Real-Time Monitoring & Drift Detection',
      badge: 'Telemetry & Alerts',
      icon: Activity,
      color: 'from-emerald-500 to-teal-600',
      description:
        'Keep continuous vigilance over live production models to detect performance degradation, data drift, and unexpected distribution shifts.',
      highlights: [
        'Track Data Drift, Concept Drift, and Feature Distribution shifts over time',
        'Configure live anomaly detection alerts with severity triage',
        'Inspect API latency, throughput, and token usage telemetry',
        'Automated alert dispatch to Slack and email'
      ],
      actionText: 'Open Monitoring',
      actionRoute: '/monitoring'
    },
    {
      title: '4. AI Knowledge Base & Governance',
      badge: 'Compliance Frameworks',
      icon: BookOpen,
      color: 'from-amber-500 to-orange-600',
      description:
        'Centralize model registries, compliance documentation, and interactive safety knowledge mapping.',
      highlights: [
        'Maintain a unified inventory of all enterprise LLMs and foundation models',
        'Map models to EU AI Act, NIST AI RMF, and OWASP LLM Top 10 standards',
        'Interactive AI Safety Knowledge Graph visualization',
        'Model cards, risk tiering, and governance checklist verification'
      ],
      actionText: 'View Knowledge Base',
      actionRoute: '/knowledge'
    },
    {
      title: '5. Audit & Compliance Reports',
      badge: 'Documentation',
      icon: FileText,
      color: 'from-cyan-500 to-blue-600',
      description:
        'Generate executive summaries and technical compliance documentation tailored for stakeholders, regulators, and security auditors.',
      highlights: [
        'One-click audit-ready PDF report generation using ReportLab',
        'Comprehensive breakdown of risk metrics, test histories, and mitigation roadmaps',
        'Direct email dispatch to compliance teams',
        'Historical archive of past generated reports'
      ],
      actionText: 'Generate Report',
      actionRoute: '/reports'
    },
    {
      title: '6. Activity Audit Trail & Enterprise Settings',
      badge: 'Security & Governance',
      icon: History,
      color: 'from-violet-500 to-purple-600',
      description:
        'Ensure end-to-end accountability with immutable audit logs, team controls, and system preferences.',
      highlights: [
        'Full activity audit trail capturing user actions, IP addresses, and timestamps',
        'Export audit trails to CSV for external SIEM integration',
        'Manage API keys, MongoDB / PostgreSQL connections, and notification preferences',
        'Global search (Ctrl+K) and keyboard shortcuts for rapid navigation'
      ],
      actionText: 'View Activity Log',
      actionRoute: '/activity-log'
    }
  ];

  const checklistItems = [
    {
      id: 'task_redteam',
      title: 'Execute Your First Red Team Scan',
      desc: 'Simulate a prompt injection or jailbreak attack on your model endpoint.',
      route: '/red-team'
    },
    {
      id: 'task_monitoring',
      title: 'Inspect Live Model Drift Metrics',
      desc: 'Check feature distribution and real-time security alerts in the Monitoring tab.',
      route: '/monitoring'
    },
    {
      id: 'task_knowledge',
      title: 'Explore the AI Safety Knowledge Graph',
      desc: 'Review regulatory compliance frameworks and safety benchmarks.',
      route: '/knowledge'
    },
    {
      id: 'task_report',
      title: 'Generate an Audit Compliance PDF',
      desc: 'Download an executive-ready compliance report for your leadership team.',
      route: '/reports'
    },
    {
      id: 'task_search',
      title: 'Try Global Quick Search (Ctrl + K)',
      desc: 'Quickly find any vulnerability, test, model, or setting instantly.',
      route: '/dashboard'
    }
  ];

  if (!isOpen) return null;

  const step = tourSteps[currentStep];
  const StepIcon = step.icon;
  const completedCount = Object.values(completedTasks).filter(Boolean).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                Kavach-AI User Guide & Onboarding
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Step-by-step walkthrough of features, tools, and best practices
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 bg-slate-50 dark:bg-slate-900/90 text-sm font-medium">
          <button
            onClick={() => setActiveTab('tour')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 cursor-pointer transition ${
              activeTab === 'tour'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Feature Walkthrough ({currentStep + 1}/{tourSteps.length})
          </button>
          <button
            onClick={() => setActiveTab('checklist')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 cursor-pointer transition ${
              activeTab === 'checklist'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            Quick Start Checklist ({completedCount}/{checklistItems.length})
          </button>
          <button
            onClick={() => setActiveTab('docs')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 cursor-pointer transition ${
              activeTab === 'docs'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Keyboard className="w-4 h-4" />
            Shortcuts & Cheat Sheet
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'tour' && (
            <div className="space-y-6">
              {/* Progress bar */}
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${((currentStep + 1) / tourSteps.length) * 100}%` }}
                />
              </div>

              {/* Step Card */}
              <div className="flex items-start gap-4">
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white shadow-lg flex-shrink-0`}
                >
                  <StepIcon className="w-7 h-7" />
                </div>
                <div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60 mb-1.5">
                    {step.badge}
                  </span>
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white">{step.title}</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>

              {/* Key Capabilities */}
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700/60">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Key Capabilities & Actions
                </h5>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {step.highlights.map((h, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Jump directly to feature */}
              {step.actionRoute && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40">
                  <div className="flex items-center gap-2 text-xs text-indigo-900 dark:text-indigo-300 font-medium">
                    <Zap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    Want to try this right now?
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      navigate(step.actionRoute);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 underline cursor-pointer"
                  >
                    {step.actionText} <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'checklist' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">New User Action Checklist</h4>
                  <p className="text-xs text-slate-500">Complete these foundational steps to maximize platform security</p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                  {Math.round((completedCount / checklistItems.length) * 100)}% Completed
                </span>
              </div>

              <div className="space-y-2.5">
                {checklistItems.map((item) => {
                  const isDone = !!completedTasks[item.id];
                  return (
                    <div
                      key={item.id}
                      className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                        isDone
                          ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40'
                          : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => toggleTask(item.id)}
                          className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition cursor-pointer ${
                            isDone
                              ? 'bg-emerald-500 border-emerald-500 text-white'
                              : 'border-slate-300 dark:border-slate-600 hover:border-indigo-500'
                          }`}
                        >
                          {isDone && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </button>
                        <div>
                          <p
                            className={`text-xs font-semibold ${
                              isDone ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-white'
                            }`}
                          >
                            {item.title}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{item.desc}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          onClose();
                          navigate(item.route);
                        }}
                        className="px-2.5 py-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 rounded-md transition cursor-pointer flex items-center gap-1"
                      >
                        Start <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'docs' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                  <h5 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Keyboard className="w-4 h-4 text-indigo-500" />
                    Essential Keyboard Shortcuts
                  </h5>
                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex justify-between"><span>Global Quick Search:</span> <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-700 border font-mono">Ctrl + K</kbd></div>
                    <div className="flex justify-between"><span>Shortcuts Help:</span> <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-700 border font-mono">Shift + ?</kbd></div>
                    <div className="flex justify-between"><span>Go to Dashboard:</span> <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-700 border font-mono">Ctrl + D</kbd></div>
                    <div className="flex justify-between"><span>Go to Red Team:</span> <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-700 border font-mono">Alt + R</kbd></div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                  <h5 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-emerald-500" />
                    Governance & Best Practices
                  </h5>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Always conduct Red Team simulations prior to deploying model prompt changes. Use automated scheduled tests for continuous regression defense.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <HelpCircle className="w-4 h-4 text-slate-400" />
            <span>Accessible anytime via header or Shift + ?</span>
          </div>

          <div className="flex items-center gap-2">
            {activeTab === 'tour' && currentStep > 0 && (
              <button
                onClick={() => setCurrentStep((prev) => prev - 1)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Back
              </button>
            )}

            {activeTab === 'tour' && currentStep < tourSteps.length - 1 ? (
              <button
                onClick={() => setCurrentStep((prev) => prev + 1)}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition flex items-center gap-1 cursor-pointer"
              >
                Next Step <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={handleFinishTour}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/30 transition flex items-center gap-1 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Complete Tour
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
