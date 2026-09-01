import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  X,
  ShieldAlert,
  Activity,
  BookOpen,
  FileText,
  Compass,
  ArrowRight,
  CornerDownLeft,
  Command,
  Loader2
} from 'lucide-react';
import api from '../lib/api';
import { cn } from '../lib/utils';

interface SearchResultItem {
  id?: string | number;
  title: string;
  subtitle: string;
  category: string;
  url: string;
  badge?: string;
}

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    tests: SearchResultItem[];
    drift: SearchResultItem[];
    knowledge: SearchResultItem[];
    navigation: SearchResultItem[];
  }>({
    tests: [],
    drift: [],
    knowledge: [],
    navigation: []
  });
  const [activeCategory, setActiveCategory] = useState<'all' | 'tests' | 'drift' | 'knowledge' | 'nav'>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      // Fetch initial default suggestions
      fetchSearchResults('');
    } else {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const fetchSearchResults = async (searchTerm: string) => {
    setLoading(true);
    try {
      if (!searchTerm.trim()) {
        // Default top quick links & recent tests
        setResults({
          tests: [
            { id: 1, title: 'Adversarial Jailbreak Assessment', subtitle: 'Llama-3-70b-Instruct • Completed', category: 'Red Team Test', url: '/red-team', badge: 'Completed' },
            { id: 2, title: 'PII Extraction & Prompt Injection', subtitle: 'FinGPT-v2 • Completed', category: 'Red Team Test', url: '/red-team', badge: 'Completed' }
          ],
          drift: [
            { id: 1, title: 'Llama-3-70b-Instruct-Production', subtitle: 'Embedding Cosine Drift (8.0%)', category: 'Monitoring Drift', url: '/monitoring', badge: 'Normal' },
            { id: 2, title: 'FinGPT-Extraction-v2', subtitle: 'Toxicity & Safety Drift (18.0%)', category: 'Monitoring Drift', url: '/monitoring', badge: 'Alert' }
          ],
          knowledge: [
            { id: '1', title: 'OWASP Top 10 for Large Language Models', subtitle: 'Security Testing', category: 'Knowledge Base', url: '/knowledge', badge: 'Guide' }
          ],
          navigation: [
            { title: 'Governance Overview', subtitle: 'Real-time telemetry and dashboard stats', category: 'Navigation', url: '/dashboard', badge: 'Ctrl+D' },
            { title: 'Red Team Security Lab', subtitle: 'Launch automated and scheduled adversarial scans', category: 'Navigation', url: '/red-team', badge: 'Ctrl+R' },
            { title: 'Model Drift Monitoring', subtitle: 'Live drift tracking & threshold management', category: 'Navigation', url: '/monitoring', badge: 'Ctrl+M' },
            { title: 'Knowledge Base', subtitle: 'AI governance standards & knowledge graph', category: 'Navigation', url: '/knowledge', badge: 'Ctrl+B' },
            { title: 'Audit Reports', subtitle: 'Export CSV & PDF compliance evaluations', category: 'Navigation', url: '/reports', badge: 'Ctrl+P' },
            { title: 'Platform Settings', subtitle: 'Notification channels and alert thresholds', category: 'Navigation', url: '/settings', badge: 'Settings' }
          ]
        });
      } else {
        const res = await api.get(`/search/global?q=${encodeURIComponent(searchTerm)}`);
        setResults({
          tests: res.data.tests || [],
          drift: res.data.drift || [],
          knowledge: res.data.knowledge || [],
          navigation: res.data.navigation || []
        });
      }
    } catch (err) {
      console.error('Search query failed:', err);
    } finally {
      setLoading(false);
      setSelectedIndex(0);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    fetchSearchResults(val);
  };

  const getFilteredItems = (): SearchResultItem[] => {
    if (activeCategory === 'tests') return results.tests;
    if (activeCategory === 'drift') return results.drift;
    if (activeCategory === 'knowledge') return results.knowledge;
    if (activeCategory === 'nav') return results.navigation;
    return [
      ...results.navigation,
      ...results.tests,
      ...results.drift,
      ...results.knowledge
    ];
  };

  const filteredItems = getFilteredItems();

  const handleSelect = (item: SearchResultItem) => {
    onClose();
    navigate(item.url);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filteredItems.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % (filteredItems.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        handleSelect(filteredItems[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Red Team Test':
        return <ShieldAlert className="h-4 w-4 text-indigo-500" />;
      case 'Monitoring Drift':
        return <Activity className="h-4 w-4 text-amber-500" />;
      case 'Knowledge Base':
        return <BookOpen className="h-4 w-4 text-emerald-500" />;
      default:
        return <Compass className="h-4 w-4 text-blue-500" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="global-search-backdrop"
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 bg-gray-900/60 backdrop-blur-xs p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="global-search-modal"
        className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-900 shadow-2xl border border-gray-200 dark:border-gray-700 transition-all text-left"
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="relative flex items-center border-b border-gray-200 dark:border-gray-800 px-4 py-3.5">
          <Search className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-3 flex-shrink-0" />
          <input
            id="global-search-input"
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder="Search tests, monitoring logs, reports, knowledge base, or press Ctrl+D..."
            className="w-full bg-transparent text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none"
          />
          {loading && <Loader2 className="h-4 w-4 text-indigo-500 animate-spin mr-2" />}
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                fetchSearchResults('');
              }}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 mr-1"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 text-[10px] font-medium text-gray-500 dark:text-gray-400">
            ESC
          </kbd>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 px-4 py-2 bg-gray-50/70 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800 overflow-x-auto text-xs">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={cn(
              "px-2.5 py-1 rounded-md font-medium transition-colors",
              activeCategory === 'all'
                ? "bg-indigo-600 text-white"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-200/60 dark:hover:bg-gray-700"
            )}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('tests')}
            className={cn(
              "px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1",
              activeCategory === 'tests'
                ? "bg-indigo-600 text-white"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-200/60 dark:hover:bg-gray-700"
            )}
          >
            <ShieldAlert className="h-3 w-3" /> Tests ({results.tests.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('drift')}
            className={cn(
              "px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1",
              activeCategory === 'drift'
                ? "bg-indigo-600 text-white"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-200/60 dark:hover:bg-gray-700"
            )}
          >
            <Activity className="h-3 w-3" /> Monitoring ({results.drift.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('knowledge')}
            className={cn(
              "px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1",
              activeCategory === 'knowledge'
                ? "bg-indigo-600 text-white"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-200/60 dark:hover:bg-gray-700"
            )}
          >
            <BookOpen className="h-3 w-3" /> Knowledge ({results.knowledge.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('nav')}
            className={cn(
              "px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1",
              activeCategory === 'nav'
                ? "bg-indigo-600 text-white"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-200/60 dark:hover:bg-gray-700"
            )}
          >
            <Compass className="h-3 w-3" /> Navigation ({results.navigation.length})
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-gray-100 dark:divide-gray-800">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-500 dark:text-gray-400">
              <Search className="h-8 w-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
              No results found for <span className="font-semibold text-gray-700 dark:text-gray-300">"{query}"</span>
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={`${item.category}-${item.title}-${idx}`}
                  id={`search-item-${idx}`}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors text-xs sm:text-sm",
                    isSelected
                      ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-100"
                      : "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/60"
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-md bg-white dark:bg-gray-800 shadow-2xs border border-gray-100 dark:border-gray-700 flex-shrink-0">
                      {getCategoryIcon(item.category)}
                    </div>
                    <div className="truncate">
                      <p className="font-semibold truncate text-gray-900 dark:text-white">
                        {item.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                    {item.badge && (
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[11px] font-medium border",
                        item.badge === 'Alert'
                          ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900"
                          : item.badge === 'Completed'
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900"
                          : "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                      )}>
                        {item.badge}
                      </span>
                    )}
                    <span className="text-gray-400 group-hover:text-indigo-600">
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Shortcut Bar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 dark:bg-gray-800/80 border-t border-gray-200 dark:border-gray-800 text-[11px] text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 shadow-2xs font-mono">↑</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 shadow-2xs font-mono">↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 shadow-2xs font-mono flex items-center">
                <CornerDownLeft className="h-2.5 w-2.5 mr-0.5" /> Enter
              </kbd>
              Open
            </span>
          </div>
          <span className="font-medium text-indigo-600 dark:text-indigo-400">
            Kavach AI Command Engine
          </span>
        </div>
      </div>
    </div>
  );
}
