import React, { useState } from 'react';
import {
  FileText,
  Download,
  Mail,
  Check,
  AlertCircle,
  Loader2,
  ShieldCheck,
  BarChart2,
  Table,
  FileSpreadsheet,
  Calendar,
  Sparkles,
  ArrowDownToLine,
  Send,
  Code2,
  FileCode,
  Copy,
  Eye,
  X
} from 'lucide-react';
import api from './lib/api';
import { cn } from './lib/utils';

export default function Reports() {
  const [downloading, setDownloading] = useState<string | null>(null);
  const [emailing, setEmailing] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [previewJson, setPreviewJson] = useState<{ title: string; data: any } | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleDownloadPDF = async (reportType: string) => {
    const key = `pdf-${reportType}`;
    setDownloading(key);
    setMessage(null);
    try {
      let endpoint = '/reports/compliance/pdf';
      if (reportType === 'drift') endpoint = '/reports/drift/pdf';
      if (reportType === 'redteam') endpoint = '/reports/redteam/pdf';

      const response = await api.get(endpoint, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `kavach_ai_${reportType}_report_${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      setMessage({ type: 'success', text: `${reportType.toUpperCase()} PDF report downloaded successfully.` });
    } catch (error) {
      console.error('Download error:', error);
      setMessage({ type: 'error', text: 'Failed to download PDF report. Please try again.' });
    } finally {
      setDownloading(null);
    }
  };

  const handleDownloadCSV = async (reportType: string) => {
    const key = `csv-${reportType}`;
    setDownloading(key);
    setMessage(null);
    try {
      let endpoint = '/reports/compliance/csv';
      if (reportType === 'drift') endpoint = '/reports/drift/csv';
      if (reportType === 'redteam') endpoint = '/reports/redteam/csv';

      const response = await api.get(endpoint, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/csv' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `kavach_ai_${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      setMessage({ type: 'success', text: `${reportType.toUpperCase()} CSV dataset exported successfully.` });
    } catch (error) {
      console.error('Download error:', error);
      setMessage({ type: 'error', text: 'Failed to export CSV report.' });
    } finally {
      setDownloading(null);
    }
  };

  const handleDownloadJSON = async (reportType: string) => {
    const key = `json-${reportType}`;
    setDownloading(key);
    setMessage(null);
    try {
      let endpoint = '/reports/compliance/json';
      if (reportType === 'drift') endpoint = '/reports/drift/json';
      if (reportType === 'redteam') endpoint = '/reports/redteam/json';
      if (reportType === 'all') endpoint = '/reports/all/json';

      const response = await api.get(endpoint);
      const jsonString = typeof response.data === 'string' ? response.data : JSON.stringify(response.data, null, 2);
      
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `kavach_ai_${reportType}_raw_scan_data_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      setMessage({ type: 'success', text: `${reportType.toUpperCase()} raw JSON scan payload downloaded successfully.` });
    } catch (error) {
      console.error('JSON Download error:', error);
      setMessage({ type: 'error', text: 'Failed to download raw JSON scan data.' });
    } finally {
      setDownloading(null);
    }
  };

  const handlePreviewJSON = async (reportType: string, title: string) => {
    setLoadingPreview(true);
    setMessage(null);
    try {
      let endpoint = '/reports/compliance/json';
      if (reportType === 'drift') endpoint = '/reports/drift/json';
      if (reportType === 'redteam') endpoint = '/reports/redteam/json';
      if (reportType === 'all') endpoint = '/reports/all/json';

      const response = await api.get(endpoint);
      setPreviewJson({
        title: `${title} - Raw JSON Data`,
        data: response.data
      });
    } catch (error) {
      console.error('Preview error:', error);
      setMessage({ type: 'error', text: 'Failed to load JSON preview.' });
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleCopyJson = () => {
    if (previewJson?.data) {
      navigator.clipboard.writeText(JSON.stringify(previewJson.data, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleEmailReport = async (reportType: string) => {
    setEmailing(reportType);
    setMessage(null);
    try {
      await api.post('/reports/compliance/email');
      setMessage({ type: 'success', text: `${reportType.toUpperCase()} report has been queued for email delivery to registered recipient (alokinfo30@gmail.com).` });
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Failed to queue report email delivery.' });
    } finally {
      setEmailing(null);
    }
  };

  const reportsList = [
    {
      title: 'Compliance & Governance Summary',
      description: 'Comprehensive audit trail of AI model security tests, compliance controls (ISO/IEC 42001, NIST AI RMF, EU AI Act), and remediation statuses.',
      icon: ShieldCheck,
      color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50',
      type: 'compliance',
      badge: 'ISO & NIST Ready',
      dataPoints: '12 compliance checks • 8 security tests'
    },
    {
      title: 'Adversarial Vulnerability Findings',
      description: 'Granular red-teaming breakdown including Prompt Injection attack payloads, Jailbreak responses, PII extraction vulnerabilities, and severity ratings.',
      icon: FileText,
      color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50',
      type: 'redteam',
      badge: 'OWASP Top 10',
      dataPoints: '15 test evaluations • 4 open vulns'
    },
    {
      title: 'Model Drift & Performance Audit',
      description: 'Detailed analysis of embedding cosine drift, semantic degradation anomalies, token latency spikes, and historical alert thresholds.',
      icon: BarChart2,
      color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50',
      type: 'drift',
      badge: 'Live Telemetry',
      dataPoints: '24h drift window • 6 model endpoints'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
              <FileSpreadsheet className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
                Reports & Audit Center
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                Generate, export, and distribute compliance summaries in JSON, CSV, and PDF formats for raw data analysis and stakeholder reporting.
              </p>
            </div>
          </div>
        </div>

        {/* Global Quick Export Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="btn-quick-export-json"
            type="button"
            onClick={() => handleDownloadJSON('all')}
            disabled={downloading !== null}
            className="inline-flex items-center gap-1.5 rounded-lg bg-white dark:bg-gray-800 px-3 py-2 text-xs sm:text-sm font-semibold text-gray-900 dark:text-white shadow-xs border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            {downloading === 'json-all' ? <Loader2 className="h-4 w-4 animate-spin text-amber-500" /> : <FileCode className="h-4 w-4 text-amber-500" />}
            Download Raw JSON
          </button>
          <button
            id="btn-quick-export-csv"
            type="button"
            onClick={() => handleDownloadCSV('compliance')}
            disabled={downloading !== null}
            className="inline-flex items-center gap-1.5 rounded-lg bg-white dark:bg-gray-800 px-3 py-2 text-xs sm:text-sm font-semibold text-gray-900 dark:text-white shadow-xs border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            {downloading === 'csv-compliance' ? <Loader2 className="h-4 w-4 animate-spin text-indigo-600" /> : <Table className="h-4 w-4 text-emerald-600" />}
            Export Full CSV
          </button>
          <button
            id="btn-quick-export-pdf"
            type="button"
            onClick={() => handleDownloadPDF('compliance')}
            disabled={downloading !== null}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 disabled:opacity-50 transition-colors"
          >
            {downloading === 'pdf-compliance' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Executive PDF
          </button>
        </div>
      </div>

      {/* Status Notification Banner */}
      {message && (
        <div className={cn(
          "rounded-xl p-4 border flex items-center gap-3 text-xs sm:text-sm transition-all",
          message.type === 'success'
            ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200"
            : "bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200"
        )}>
          {message.type === 'success' ? (
            <Check className="h-5 w-5 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
          )}
          <p className="font-medium">{message.text}</p>
        </div>
      )}

      {/* Reports Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {reportsList.map((item) => (
          <div
            key={item.title}
            className="rounded-2xl bg-white dark:bg-gray-800 shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className={cn("p-3 rounded-xl flex-shrink-0", item.color)}>
                  <item.icon className="h-6 w-6" />
                </div>
                <span className="px-2.5 py-1 text-[11px] font-semibold rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                  {item.badge}
                </span>
              </div>

              <h3 className="text-base font-bold text-gray-900 dark:text-white mt-4">
                {item.title}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
                {item.description}
              </p>

              <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-400 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{item.dataPoints}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handlePreviewJSON(item.type, item.title)}
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-medium"
                >
                  <Eye className="h-3 w-3" /> Preview JSON
                </button>
              </div>
            </div>

            {/* Export & Delivery Buttons */}
            <div className="p-6 pt-0 bg-gray-50/50 dark:bg-gray-800/60 border-t border-gray-100 dark:border-gray-700/60 space-y-2">
              <div className="grid grid-cols-3 gap-2 pt-4">
                {/* Download JSON Button */}
                <button
                  id={`btn-download-json-${item.type}`}
                  type="button"
                  onClick={() => handleDownloadJSON(item.type)}
                  disabled={downloading !== null}
                  title="Download Raw JSON Scan Data"
                  className="flex items-center justify-center gap-1.5 rounded-lg bg-white dark:bg-gray-700 px-2.5 py-2 text-xs font-semibold text-gray-900 dark:text-white shadow-2xs border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
                >
                  {downloading === `json-${item.type}` ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-500" />
                  ) : (
                    <Code2 className="h-3.5 w-3.5 text-amber-500" />
                  )}
                  JSON
                </button>

                {/* Download CSV Button */}
                <button
                  id={`btn-download-csv-${item.type}`}
                  type="button"
                  onClick={() => handleDownloadCSV(item.type)}
                  disabled={downloading !== null}
                  title="Download CSV Spreadsheet"
                  className="flex items-center justify-center gap-1.5 rounded-lg bg-white dark:bg-gray-700 px-2.5 py-2 text-xs font-semibold text-gray-900 dark:text-white shadow-2xs border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
                >
                  {downloading === `csv-${item.type}` ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-600" />
                  ) : (
                    <Table className="h-3.5 w-3.5 text-emerald-600" />
                  )}
                  CSV
                </button>

                {/* Download PDF Button */}
                <button
                  id={`btn-download-pdf-${item.type}`}
                  type="button"
                  onClick={() => handleDownloadPDF(item.type)}
                  disabled={downloading !== null}
                  title="Download PDF Document"
                  className="flex items-center justify-center gap-1.5 rounded-lg bg-white dark:bg-gray-700 px-2.5 py-2 text-xs font-semibold text-gray-900 dark:text-white shadow-2xs border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
                >
                  {downloading === `pdf-${item.type}` ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-600" />
                  ) : (
                    <Download className="h-3.5 w-3.5 text-indigo-600" />
                  )}
                  PDF
                </button>
              </div>

              {/* Email Delivery Button */}
              <button
                id={`btn-email-${item.type}`}
                type="button"
                onClick={() => handleEmailReport(item.type)}
                disabled={emailing !== null}
                className="flex items-center justify-center gap-1.5 w-full rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-500 disabled:opacity-50 transition-colors"
              >
                {emailing === item.type ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
                Email Report to Stakeholders
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Compliance Standard Coverage Overview Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              AI Security Framework Coverage & Raw Data Analysis
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Standards mapped and verified in exported JSON, CSV, and PDF audit bundles.
            </p>
          </div>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
            <Sparkles className="h-3.5 w-3.5" /> 100% Automated Mapping
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700">
            <p className="font-bold text-gray-900 dark:text-white">OWASP LLM AI Top 10</p>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              LLM01 Prompt Injection, LLM02 Sensitive Info Disclosure, LLM06 Excessive Agency.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700">
            <p className="font-bold text-gray-900 dark:text-white">NIST AI RMF 1.0</p>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Govern 1.2, Map 2.3, Measure 2.7, Manage 3.1 continuous risk mitigation controls.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700">
            <p className="font-bold text-gray-900 dark:text-white">ISO/IEC 42001:2023</p>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Artificial Intelligence Management System (AIMS) security verification.
            </p>
          </div>
        </div>
      </div>

      {/* Raw JSON Schema Preview Modal */}
      {previewJson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950">
              <div className="flex items-center gap-2">
                <Code2 className="h-5 w-5 text-amber-500" />
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">{previewJson.title}</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyJson}
                  className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 transition-colors"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? 'Copied' : 'Copy JSON'}
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewJson(null)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto font-mono text-xs text-gray-800 dark:text-gray-200 bg-gray-900 text-emerald-400">
              <pre className="whitespace-pre-wrap leading-relaxed">
                {JSON.stringify(previewJson.data, null, 2)}
              </pre>
            </div>

            <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Standard schema formatted for downstream SIEM, SOAR, and analytics pipelines.</span>
              <button
                type="button"
                onClick={() => setPreviewJson(null)}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-500 transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Notification Banner */}
      {message && (
        <div className={cn(
          "rounded-xl p-4 border flex items-center gap-3 text-xs sm:text-sm transition-all",
          message.type === 'success'
            ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200"
            : "bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200"
        )}>
          {message.type === 'success' ? (
            <Check className="h-5 w-5 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
          )}
          <p className="font-medium">{message.text}</p>
        </div>
      )}

      {/* Reports Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {reportsList.map((item) => (
          <div
            key={item.title}
            className="rounded-2xl bg-white dark:bg-gray-800 shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className={cn("p-3 rounded-xl flex-shrink-0", item.color)}>
                  <item.icon className="h-6 w-6" />
                </div>
                <span className="px-2.5 py-1 text-[11px] font-semibold rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600">
                  {item.badge}
                </span>
              </div>

              <h3 className="text-base font-bold text-gray-900 dark:text-white mt-4">
                {item.title}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
                {item.description}
              </p>

              <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-400 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                <span>{item.dataPoints}</span>
              </div>
            </div>

            {/* Export & Delivery Buttons */}
            <div className="p-6 pt-0 bg-gray-50/50 dark:bg-gray-800/60 border-t border-gray-100 dark:border-gray-700/60 space-y-2">
              <div className="grid grid-cols-3 gap-2 pt-4">
                {/* Download JSON Button */}
                <button
                  id={`btn-download-json-${item.type}`}
                  type="button"
                  onClick={() => handleDownloadJSON(item.type)}
                  disabled={downloading !== null}
                  className="flex items-center justify-center gap-1 rounded-lg bg-white dark:bg-gray-700 px-2 py-2 text-[11px] font-semibold text-gray-900 dark:text-white shadow-2xs border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
                >
                  {downloading === `json-${item.type}` ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Code2 className="h-3.5 w-3.5 text-amber-500" />
                  )}
                  JSON
                </button>

                {/* Download CSV Button */}
                <button
                  id={`btn-download-csv-${item.type}`}
                  type="button"
                  onClick={() => handleDownloadCSV(item.type)}
                  disabled={downloading !== null}
                  className="flex items-center justify-center gap-1 rounded-lg bg-white dark:bg-gray-700 px-2 py-2 text-[11px] font-semibold text-gray-900 dark:text-white shadow-2xs border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
                >
                  {downloading === `csv-${item.type}` ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Table className="h-3.5 w-3.5 text-emerald-600" />
                  )}
                  CSV
                </button>

                {/* Download PDF Button */}
                <button
                  id={`btn-download-pdf-${item.type}`}
                  type="button"
                  onClick={() => handleDownloadPDF(item.type)}
                  disabled={downloading !== null}
                  className="flex items-center justify-center gap-1 rounded-lg bg-white dark:bg-gray-700 px-2 py-2 text-[11px] font-semibold text-gray-900 dark:text-white shadow-2xs border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
                >
                  {downloading === `pdf-${item.type}` ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Download className="h-3.5 w-3.5 text-indigo-600" />
                  )}
                  PDF
                </button>
              </div>

              {/* Email Delivery Button */}
              <button
                id={`btn-email-${item.type}`}
                type="button"
                onClick={() => handleEmailReport(item.type)}
                disabled={emailing !== null}
                className="flex items-center justify-center gap-1.5 w-full rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-500 disabled:opacity-50 transition-colors"
              >
                {emailing === item.type ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
                Email Report to Stakeholders
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Compliance Standard Coverage Overview Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              AI Security Framework Coverage
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Standards mapped and verified in exported audit bundles.
            </p>
          </div>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
            <Sparkles className="h-3.5 w-3.5" /> 100% Automated Mapping
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700">
            <p className="font-bold text-gray-900 dark:text-white">OWASP LLM AI Top 10</p>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              LLM01 Prompt Injection, LLM02 Sensitive Info Disclosure, LLM06 Excessive Agency.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700">
            <p className="font-bold text-gray-900 dark:text-white">NIST AI RMF 1.0</p>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Govern 1.2, Map 2.3, Measure 2.7, Manage 3.1 continuous risk mitigation controls.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700">
            <p className="font-bold text-gray-900 dark:text-white">ISO/IEC 42001:2023</p>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Artificial Intelligence Management System (AIMS) security verification.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
