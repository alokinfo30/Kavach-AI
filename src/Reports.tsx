import { useState } from 'react';
import { FileText, Download, Mail, Check, AlertCircle, Loader2, ShieldCheck, BarChart2 } from 'lucide-react';
import api from './lib/api';
import { cn } from './lib/utils';

export default function Reports() {
  const [downloading, setDownloading] = useState<string | null>(null);
  const [emailing, setEmailing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleDownload = async (reportType = 'compliance') => {
    setDownloading(reportType);
    setMessage(null);
    try {
      const response = await api.get('/reports/compliance/pdf', {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${reportType}_report_${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      setMessage({ type: 'success', text: 'Report downloaded successfully.' });
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Failed to download report.' });
    } finally {
      setDownloading(null);
    }
  };

  const handleEmail = async () => {
    setEmailing(true);
    setMessage(null);
    try {
      await api.post('/reports/compliance/email');
      setMessage({ type: 'success', text: 'Report has been queued for email delivery.' });
    } catch (error) {
      console.error(error);
      setMessage({ type: 'error', text: 'Failed to send email.' });
    } finally {
      setEmailing(false);
    }
  };

  const reportsList = [
    {
      title: 'Compliance Summary',
      description: 'Comprehensive audit trail of security tests, compliance logs, and ISO/NIST controls.',
      icon: ShieldCheck,
      color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40',
      type: 'compliance'
    },
    {
      title: 'Drift & Health Audit',
      description: 'Detailed analysis of model drift thresholds, degradation anomalies, and alert history.',
      icon: BarChart2,
      color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40',
      type: 'drift'
    },
    {
      title: 'Adversarial Test Findings',
      description: 'Red teaming attack results including Prompt Injection, Jailbreak, and PII leakage risks.',
      icon: FileText,
      color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40',
      type: 'redteam'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:truncate sm:text-3xl sm:tracking-tight">Reports Center</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Generate and distribute compliance, governance, and model audit reports.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {reportsList.map((item) => (
          <div key={item.title} className="rounded-lg bg-white dark:bg-gray-800 shadow overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col justify-between">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className={cn("p-3 rounded-lg flex-shrink-0", item.color)}>
                  <item.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{item.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{item.description}</p>
                </div>
              </div>
            </div>
            <div className="p-6 pt-0 flex flex-col gap-3">
              <button 
                onClick={() => handleDownload(item.type)} 
                disabled={downloading !== null} 
                className="flex items-center justify-center gap-2 w-full rounded-md bg-white dark:bg-gray-700 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
              >
                {downloading === item.type ? <Loader2 className="h-4 w-4 animate-spin"/> : <Download className="h-4 w-4" />}
                Download PDF
              </button>
              <button 
                onClick={handleEmail} 
                disabled={emailing} 
                className="flex items-center justify-center gap-2 w-full rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50 transition-colors"
              >
                {emailing ? <Loader2 className="h-4 w-4 animate-spin"/> : <Mail className="h-4 w-4" />}
                Email Report
              </button>
            </div>
          </div>
        ))}
      </div>

      {message && (
        <div className={cn("rounded-md p-4", message.type === 'success' ? "bg-green-50 dark:bg-green-950/40 text-green-800 dark:text-green-300" : "bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300")}>
          <div className="flex">
            <div className="flex-shrink-0">
              {message.type === 'success' ? (
                <Check className="h-5 w-5 text-green-500" aria-hidden="true" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500" aria-hidden="true" />
              )}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">
                {message.text}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
