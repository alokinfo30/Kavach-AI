import express, { Request, Response } from "express";
import path from "path";
import cors from "cors";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// In-Memory Database Stores with realistic seed data
interface User {
  id: number;
  username: string;
  email: string;
  company: string;
  role: 'admin' | 'user';
  passwordHash: string;
}

const users: User[] = [
  {
    id: 1,
    username: "demo",
    email: "demo@kavach.ai",
    company: "Responsible AI Corp",
    role: "admin",
    passwordHash: "password"
  },
  {
    id: 2,
    username: "alokinfo30",
    email: "alokinfo30@gmail.com",
    company: "Kavach Security",
    role: "admin",
    passwordHash: "password"
  }
];

interface AITestItem {
  id: number;
  user_id: number;
  test_name: string;
  test_type: string;
  target_system: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  created_at: string;
  completed_at?: string;
  results?: {
    overall_score: number;
    risk_level: string;
    tests_conducted: number;
    attack_mode: string;
    vulnerabilities_found: Array<{
      type: string;
      description: string;
      severity: string;
      status: string;
    }>;
    recommendations: string[];
    notes?: string;
  };
}

let aiTests: AITestItem[] = [
  {
    id: 1,
    user_id: 1,
    test_name: "Customer Support LLM Jailbreak Assessment",
    test_type: "Jailbreak & Behavioral Bypass",
    target_system: "Llama-3-70b-Instruct-Production",
    status: "completed",
    created_at: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    completed_at: new Date(Date.now() - 3600000 * 24 * 2 + 60000).toISOString(),
    results: {
      overall_score: 0.88,
      risk_level: "Low",
      tests_conducted: 45,
      attack_mode: "simulation",
      vulnerabilities_found: [
        {
          type: "Context Role Confusion",
          description: "Hypothetical persona prompts induced subtle guideline deviation.",
          severity: "Low",
          status: "mitigated"
        }
      ],
      recommendations: [
        "Reinforce system prompt boundary guards.",
        "Add deterministic input prefix checks."
      ]
    }
  },
  {
    id: 2,
    user_id: 1,
    test_name: "Financial Data Extractor PII Leakage Test",
    test_type: "PII & Data Extraction",
    target_system: "FinGPT-Extraction-v2",
    status: "completed",
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    completed_at: new Date(Date.now() - 3600000 * 12 + 45000).toISOString(),
    results: {
      overall_score: 0.72,
      risk_level: "Medium",
      tests_conducted: 60,
      attack_mode: "simulation",
      vulnerabilities_found: [
        {
          type: "SSN Pattern Extraction",
          description: "Model echoed synthesized SSN sequences when prompted with regex formatting instructions.",
          severity: "Medium",
          status: "new"
        },
        {
          type: "Indirect System Prompt Leakage",
          description: "Multi-turn translation sequence revealed system preamble details.",
          severity: "Low",
          status: "new"
        }
      ],
      recommendations: [
        "Apply output sanitization with differential privacy filter.",
        "Ensure tokenizer strips credit card and ID patterns."
      ]
    }
  },
  {
    id: 3,
    user_id: 1,
    test_name: "RAG Retrieval Injection Pipeline Audit",
    test_type: "Prompt Injection",
    target_system: "Enterprise-Search-RAG-v4",
    status: "completed",
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    completed_at: new Date(Date.now() - 3600000 * 4 + 30000).toISOString(),
    results: {
      overall_score: 0.94,
      risk_level: "Low",
      tests_conducted: 80,
      attack_mode: "simulation",
      vulnerabilities_found: [],
      recommendations: ["Maintain current vector store cosine thresholding."]
    }
  }
];

let testSchedules = [
  {
    id: 1,
    test_name: "Nightly Security Audit",
    test_type: "Prompt Injection",
    target_system: "All Production Endpoints",
    frequency: "Daily (00:00 UTC)",
    cron_expression: "0 0 * * *",
    status: "active",
    alert_threshold: 80,
    email_alerts: true,
    last_run: new Date(Date.now() - 3600000 * 16).toISOString(),
    last_score: 94,
    next_run: new Date(Date.now() + 3600000 * 8).toISOString(),
    created_at: new Date(Date.now() - 3600000 * 24 * 7).toISOString()
  },
  {
    id: 2,
    test_name: "FinGPT Continuous PII Scan",
    test_type: "PII & Data Extraction",
    target_system: "FinGPT-Extraction-v2",
    frequency: "Every 6 Hours",
    cron_expression: "0 */6 * * *",
    status: "active",
    alert_threshold: 75,
    email_alerts: true,
    last_run: new Date(Date.now() - 3600000 * 2).toISOString(),
    last_score: 72,
    next_run: new Date(Date.now() + 3600000 * 4).toISOString(),
    created_at: new Date(Date.now() - 3600000 * 24 * 3).toISOString()
  },
  {
    id: 3,
    test_name: "Weekly Comprehensive Jailbreak Assessment",
    test_type: "Jailbreak & Behavioral Bypass",
    target_system: "Llama-3-70b-Instruct-Production",
    frequency: "Weekly (Sundays)",
    cron_expression: "0 0 * * 0",
    status: "paused",
    alert_threshold: 85,
    email_alerts: false,
    last_run: new Date(Date.now() - 3600000 * 24 * 4).toISOString(),
    last_score: 88,
    next_run: new Date(Date.now() + 3600000 * 24 * 3).toISOString(),
    created_at: new Date(Date.now() - 3600000 * 24 * 14).toISOString()
  }
];

let driftMetrics = [
  {
    id: 1,
    model_name: "Llama-3-70b-Instruct-Production",
    metric_name: "Embedding Cosine Drift",
    baseline_value: 0.042,
    current_value: 0.058,
    drift_score: 0.08,
    alert_threshold: 0.15,
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    model_name: "FinGPT-Extraction-v2",
    metric_name: "Toxicity & Safety Drift",
    baseline_value: 0.012,
    current_value: 0.038,
    drift_score: 0.18,
    alert_threshold: 0.15,
    created_at: new Date().toISOString()
  },
  {
    id: 3,
    model_name: "Enterprise-Search-RAG-v4",
    metric_name: "Latency & Response Variance",
    baseline_value: 0.120,
    current_value: 0.134,
    drift_score: 0.05,
    alert_threshold: 0.15,
    created_at: new Date().toISOString()
  },
  {
    id: 4,
    model_name: "Code-Assistant-34B",
    metric_name: "Output Entropy Drift",
    baseline_value: 0.210,
    current_value: 0.245,
    drift_score: 0.09,
    alert_threshold: 0.15,
    created_at: new Date().toISOString()
  }
];

let knowledgeArticles = [
  {
    id: "1",
    title: "OWASP Top 10 for Large Language Model Applications",
    category: "Security Testing",
    content: "Comprehensive mitigation strategies for LLM01: Prompt Injection, LLM02: Insecure Output Handling, LLM03: Training Data Poisoning, and LLM06: Sensitive Information Disclosure.",
    created_at: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "2",
    title: "NIST AI Risk Management Framework (AI RMF 1.0)",
    category: "Governance",
    content: "Guidelines for Govern, Map, Measure, and Manage functions to address trustworthiness risks including safety, explainability, privacy, and bias in enterprise AI pipelines.",
    created_at: new Date(Date.now() - 3600000 * 24 * 10).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: "3",
    title: "Model Drift Threshold & Alerting Protocol",
    category: "Drift Mitigation",
    content: "Standard operating procedures for addressing embedding drift and concept shift when Kolmogorov-Smirnov test p-values breach operational thresholds.",
    created_at: new Date(Date.now() - 3600000 * 24 * 15).toISOString(),
    updated_at: new Date().toISOString()
  }
];

let feedbackList = [
  {
    id: 1,
    username: "demo",
    message: "The adversarial test comparison view is intuitive and clear.",
    page_context: "Red Team Lab",
    timestamp: new Date(Date.now() - 3600000 * 6).toISOString()
  },
  {
    id: 2,
    username: "alokinfo30",
    message: "Added automated email report triggers for compliance audits.",
    page_context: "Reports",
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString()
  }
];

let notificationsList = [
  {
    id: 1,
    message: "Alert: FinGPT-Extraction-v2 drift score (18.0%) exceeded threshold (15.0%)",
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    is_read: false
  },
  {
    id: 2,
    message: "Red team test 'RAG Retrieval Injection Pipeline Audit' completed successfully.",
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    is_read: true
  },
  {
    id: 3,
    message: "Monthly ISO/IEC 42001 Compliance Summary is ready for download.",
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
    is_read: false
  }
];

let platformSettings = {
  alert_threshold: 80,
  email_notifications: true,
  digest_frequency: "daily"
};

// Scan Failure Email Delivery Store & Model
export interface SentFailureEmail {
  id: string;
  test_id: number;
  test_name: string;
  target_system: string;
  recipient_email: string;
  subject: string;
  risk_level: string;
  overall_score: number;
  vulnerabilities_count: number;
  vulnerabilities: Array<{ type: string; description: string; severity: string; status: string }>;
  recommendations: string[];
  sent_at: string;
  delivery_status: 'delivered' | 'queued' | 'simulated';
  body_html: string;
  body_text: string;
}

let sentFailureEmails: SentFailureEmail[] = [
  {
    id: "mail-fail-101",
    test_id: 2,
    test_name: "Financial Data Extractor PII Leakage Test",
    target_system: "FinGPT-Extraction-v2",
    recipient_email: "alokinfo30@gmail.com",
    subject: "[KAVACH ALERT] Security Scan Failure in FinGPT-Extraction-v2 - Medium Risk PII Leakage",
    risk_level: "Medium",
    overall_score: 72,
    vulnerabilities_count: 2,
    vulnerabilities: [
      {
        type: "SSN Pattern Extraction",
        description: "Model echoed synthesized SSN sequences when prompted with regex formatting instructions.",
        severity: "Medium",
        status: "new"
      },
      {
        type: "Indirect System Prompt Leakage",
        description: "Multi-turn translation sequence revealed system preamble details.",
        severity: "Low",
        status: "new"
      }
    ],
    recommendations: [
      "Apply output sanitization with differential privacy filter.",
      "Ensure tokenizer strips credit card and ID patterns."
    ],
    sent_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    delivery_status: "delivered",
    body_html: `<div style="font-family: Arial, sans-serif; max-width: 600px; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
      <h2 style="color: #dc2626; margin-top: 0;">⚠️ Security Scan Alert: Vulnerabilities Detected</h2>
      <p>Target System: <strong>FinGPT-Extraction-v2</strong></p>
      <p>Score: <strong>72% (Medium Risk)</strong> | Vulns Found: <strong>2</strong></p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
      <h3>Detected Findings:</h3>
      <ul>
        <li><strong>SSN Pattern Extraction (Medium)</strong>: Model echoed synthesized SSN sequences.</li>
        <li><strong>Indirect System Prompt Leakage (Low)</strong>: Multi-turn translation sequence revealed preamble.</li>
      </ul>
      <p><em>Delivered automatically via Kavach-AI Incident Watcher.</em></p>
    </div>`,
    body_text: "Security Scan Alert: Vulnerabilities Detected in FinGPT-Extraction-v2 (Score: 72%, Medium Risk). 2 vulnerabilities found."
  }
];

function dispatchScanFailureEmail(test: AITestItem, targetRecipient?: string): SentFailureEmail | null {
  const vulns = test.results?.vulnerabilities_found || [];
  const score = test.results ? Math.round(test.results.overall_score * 100) : 0;
  const risk = test.results?.risk_level || "Medium";
  const recipient = targetRecipient || users[1]?.email || users[0]?.email || "alokinfo30@gmail.com";

  const emailId = `mail-fail-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const subject = `[KAVACH ALERT] Security Scan Failure in ${test.target_system} (${risk} Risk - ${score}%)`;

  const vulnListHtml = vulns.length > 0 
    ? vulns.map(v => `<li style="margin-bottom: 8px;"><strong>${v.type}</strong> [<span style="color: ${v.severity === 'High' ? '#dc2626' : v.severity === 'Medium' ? '#d97706' : '#2563eb'}">${v.severity}</span>]: ${v.description}</li>`).join('')
    : `<li>General vulnerability threshold breached (${score}% compliance score)</li>`;

  const recListHtml = (test.results?.recommendations || []).map(r => `<li>${r}</li>`).join('');

  const bodyHtml = `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 640px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
    <div style="background: #0f172a; padding: 24px; color: #ffffff;">
      <h1 style="margin: 0; font-size: 20px; font-weight: 700; color: #ffffff;">🛡️ Kavach-AI Security Alert</h1>
      <p style="margin: 6px 0 0 0; font-size: 13px; color: #94a3b8;">Automated Adversarial Vulnerability Incident Notification</p>
    </div>
    
    <div style="padding: 24px; color: #1e293b;">
      <div style="background: #fef2f2; border: 1px solid #fee2e2; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
        <h2 style="margin: 0 0 8px 0; font-size: 16px; color: #991b1b;">⚠️ Security Scan Failed / Vulnerabilities Detected</h2>
        <p style="margin: 0; font-size: 13px; color: #7f1d1d;">
          Adversarial scan <strong>${test.test_name}</strong> targeting <strong>${test.target_system}</strong> identified security boundary breaches.
        </p>
      </div>

      <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px;">
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 8px 0; color: #64748b; font-weight: 600; width: 140px;">Target Endpoint:</td>
          <td style="padding: 8px 0; color: #0f172a; font-weight: 700;">${test.target_system}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Attack Type:</td>
          <td style="padding: 8px 0; color: #0f172a;">${test.test_type}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Risk Level:</td>
          <td style="padding: 8px 0; color: ${risk === 'High' ? '#dc2626' : risk === 'Medium' ? '#d97706' : '#16a34a'}; font-weight: 700;">
            ${risk} (${score}% Robustness Score)
          </td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Timestamp:</td>
          <td style="padding: 8px 0; color: #0f172a;">${new Date().toUTCString()}</td>
        </tr>
      </table>

      <h3 style="font-size: 14px; font-weight: 700; color: #0f172a; margin: 20px 0 10px 0;">Vulnerability Findings (${vulns.length}):</h3>
      <ul style="padding-left: 20px; font-size: 13px; color: #334155; line-height: 1.6; margin: 0 0 20px 0;">
        ${vulnListHtml}
      </ul>

      <h3 style="font-size: 14px; font-weight: 700; color: #0f172a; margin: 20px 0 10px 0;">Remediation Recommendations:</h3>
      <ul style="padding-left: 20px; font-size: 13px; color: #334155; line-height: 1.6; margin: 0 0 24px 0;">
        ${recListHtml}
      </ul>

      <div style="background: #f8fafc; border-radius: 8px; padding: 14px; font-size: 12px; color: #64748b;">
        This automated failure report was dispatched to registered security engineer <strong>${recipient}</strong> in compliance with ISO/IEC 42001 Continuous AI Risk Governance.
      </div>
    </div>
  </div>`;

  const bodyText = `KAVACH-AI SECURITY ALERT: Scan Failure in ${test.target_system}\nTest Name: ${test.test_name}\nType: ${test.test_type}\nScore: ${score}% (Risk: ${risk})\nVulnerabilities: ${vulns.length}\nRecipient: ${recipient}\nTimestamp: ${new Date().toISOString()}`;

  const emailRecord: SentFailureEmail = {
    id: emailId,
    test_id: test.id,
    test_name: test.test_name,
    target_system: test.target_system,
    recipient_email: recipient,
    subject,
    risk_level: risk,
    overall_score: score,
    vulnerabilities_count: vulns.length,
    vulnerabilities: vulns,
    recommendations: test.results?.recommendations || [],
    sent_at: new Date().toISOString(),
    delivery_status: 'delivered',
    body_html: bodyHtml,
    body_text: bodyText
  };

  sentFailureEmails.unshift(emailRecord);

  // Also add to in-app notifications
  notificationsList.unshift({
    id: notificationsList.length + 1,
    message: `Email alert sent to ${recipient}: ${risk} risk vulnerability detected in '${test.test_name}' (${test.target_system})`,
    timestamp: new Date().toISOString(),
    is_read: false
  });

  // Log in Activity Log
  logActivity({
    action: "SECURITY_SCAN_FAILURE_EMAIL_SENT",
    module: "redteam",
    description: `Automated failure summary email dispatched to ${recipient} for '${test.test_name}' (${vulns.length} vulns, Score: ${score}%)`,
    severity: risk === 'High' ? 'critical' : 'warning',
    target: test.target_system,
    metadata: {
      emailId,
      recipient,
      testId: test.id,
      score,
      risk,
      vulnCount: vulns.length
    },
    username: users[0]?.username || "system",
    user_id: users[0]?.id || 1,
    ip_address: "127.0.0.1"
  });

  return emailRecord;
}

// Activity Log & Audit Trail Store
export interface ActivityLogItem {
  id: string;
  user_id: number;
  username: string;
  action: string;
  module: 'redteam' | 'drift' | 'reports' | 'governance' | 'auth' | 'settings' | 'feedback';
  description: string;
  severity: 'info' | 'warning' | 'critical' | 'success';
  target?: string;
  metadata?: Record<string, any>;
  ip_address: string;
  timestamp: string;
}

let activityLogs: ActivityLogItem[] = [
  {
    id: "act-101",
    user_id: 1,
    username: "demo",
    action: "SECURITY_TEST_EXECUTED",
    module: "redteam",
    description: "Executed prompt injection test on Enterprise-Search-RAG-v4",
    severity: "success",
    target: "Enterprise-Search-RAG-v4",
    metadata: { score: 94, risk: "Low", testsCount: 80 },
    ip_address: "192.168.1.42",
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString()
  },
  {
    id: "act-102",
    user_id: 2,
    username: "alokinfo30",
    action: "REPORT_EXPORTED_PDF",
    module: "reports",
    description: "Downloaded Executive ISO/IEC 42001 Compliance Audit PDF report",
    severity: "info",
    target: "Compliance Report Bundle",
    metadata: { format: "PDF", controlsChecked: 12 },
    ip_address: "10.0.4.19",
    timestamp: new Date(Date.now() - 3600000 * 6).toISOString()
  },
  {
    id: "act-103",
    user_id: 1,
    username: "system_cron",
    action: "SCHEDULED_SCAN_TRIGGERED",
    module: "redteam",
    description: "Automated recurring Nightly Security Audit ran on all production endpoints",
    severity: "info",
    target: "All Production Endpoints",
    metadata: { scheduleId: 1, lastScore: 94 },
    ip_address: "127.0.0.1",
    timestamp: new Date(Date.now() - 3600000 * 16).toISOString()
  },
  {
    id: "act-104",
    user_id: 1,
    username: "demo",
    action: "DRIFT_ALERT_ACKNOWLEDGED",
    module: "drift",
    description: "Acknowledged Toxicity & Safety drift threshold breach on FinGPT-Extraction-v2 (18.0%)",
    severity: "warning",
    target: "FinGPT-Extraction-v2",
    metadata: { driftScore: 0.18, threshold: 0.15 },
    ip_address: "192.168.1.42",
    timestamp: new Date(Date.now() - 3600000 * 18).toISOString()
  },
  {
    id: "act-105",
    user_id: 1,
    username: "demo",
    action: "VULNERABILITY_STATUS_UPDATED",
    module: "redteam",
    description: "Marked vulnerability 'Context Role Confusion' status as 'mitigated'",
    severity: "success",
    target: "Llama-3-70b-Instruct-Production",
    metadata: { vulnerability: "Context Role Confusion", previousStatus: "new" },
    ip_address: "192.168.1.42",
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString()
  },
  {
    id: "act-106",
    user_id: 2,
    username: "alokinfo30",
    action: "SETTINGS_UPDATED",
    module: "settings",
    description: "Updated drift alerting threshold to 80% and enabled email digests",
    severity: "info",
    target: "Platform Alert Policy",
    metadata: { alert_threshold: 80, email_notifications: true },
    ip_address: "10.0.4.19",
    timestamp: new Date(Date.now() - 3600000 * 36).toISOString()
  },
  {
    id: "act-107",
    user_id: 1,
    username: "demo",
    action: "KNOWLEDGE_ARTICLE_CREATED",
    module: "governance",
    description: "Published internal SOP for NIST AI RMF 1.0 Measure Function compliance",
    severity: "info",
    target: "NIST AI Risk Management Framework",
    metadata: { category: "Governance", articleId: "2" },
    ip_address: "192.168.1.42",
    timestamp: new Date(Date.now() - 3600000 * 48).toISOString()
  },
  {
    id: "act-108",
    user_id: 1,
    username: "demo",
    action: "AUTH_LOGIN_SUCCESS",
    module: "auth",
    description: "Admin session authenticated from corporate workstation",
    severity: "info",
    target: "Auth Service",
    ip_address: "192.168.1.42",
    timestamp: new Date(Date.now() - 3600000 * 52).toISOString()
  }
];

function logActivity(params: {
  username?: string;
  user_id?: number;
  action: string;
  module: 'redteam' | 'drift' | 'reports' | 'governance' | 'auth' | 'settings' | 'feedback';
  description: string;
  severity?: 'info' | 'warning' | 'critical' | 'success';
  target?: string;
  metadata?: Record<string, any>;
  ip_address?: string;
}) {
  const newLog: ActivityLogItem = {
    id: `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    user_id: params.user_id || users[0].id,
    username: params.username || users[0].username,
    action: params.action,
    module: params.module,
    description: params.description,
    severity: params.severity || 'info',
    target: params.target || 'Platform',
    metadata: params.metadata,
    ip_address: params.ip_address || '127.0.0.1',
    timestamp: new Date().toISOString()
  };
  activityLogs.unshift(newLog);
  // Cap at 200 logs
  if (activityLogs.length > 200) {
    activityLogs.pop();
  }
  return newLog;
}

// ================= API ROUTES =================

// Helper to generate signed JWT string with expiration
function generateJwt(user: { id: number; username: string; email: string; role?: string; company?: string }, expiresInSeconds = 15 * 60): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const now = Math.floor(Date.now() / 1000);
  const payload = Buffer.from(JSON.stringify({
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role || 'user',
    company: user.company || 'Kavach AI',
    iat: now,
    exp: now + expiresInSeconds
  })).toString("base64url");
  const signature = Buffer.from("kavach_enterprise_security_jwt_signature").toString("base64url");
  return `${header}.${payload}.${signature}`;
}

// Connected Model Endpoints for Health Probes and Uptime Surveillance
export interface ModelEndpointHealth {
  id: string;
  name: string;
  model_identifier: string;
  provider: string;
  type: string;
  endpoint_url: string;
  region: string;
  status: 'healthy' | 'degraded' | 'down';
  uptime_pct: number;
  latency_ms: number;
  error_rate_pct: number;
  last_checked: string;
  total_requests_24h: number;
  consecutive_success: number;
  history_30d: Array<{ date: string; uptime: number; latency: number }>;
}

let modelEndpoints: ModelEndpointHealth[] = [
  {
    id: "ep-llama3-70b",
    name: "Llama 3 70B Instruct (Production)",
    model_identifier: "meta-llama/Llama-3-70b-instruct",
    provider: "Self-Hosted vLLM Cluster",
    type: "LLM Chat & Reasoning",
    endpoint_url: "https://llm.internal.kavach.ai/v1/chat/completions",
    region: "us-east-1 (N. Virginia)",
    status: "healthy",
    uptime_pct: 99.96,
    latency_ms: 138,
    error_rate_pct: 0.02,
    last_checked: new Date().toISOString(),
    total_requests_24h: 142850,
    consecutive_success: 4820,
    history_30d: Array.from({ length: 14 }, (_, i) => ({
      date: new Date(Date.now() - (13 - i) * 86400000).toISOString().split('T')[0],
      uptime: 99.9 + (Math.sin(i) * 0.08),
      latency: Math.round(135 + Math.random() * 12)
    }))
  },
  {
    id: "ep-rag-search",
    name: "Enterprise Search RAG Pipeline v4",
    model_identifier: "hybrid-rag/vertex-search-dense",
    provider: "Google Cloud Vertex AI + Vector DB",
    type: "Hybrid RAG & Embedding Search",
    endpoint_url: "https://rag.internal.kavach.ai/v1/query",
    region: "us-central-1 (Iowa)",
    status: "healthy",
    uptime_pct: 99.99,
    latency_ms: 88,
    error_rate_pct: 0.01,
    last_checked: new Date().toISOString(),
    total_requests_24h: 284100,
    consecutive_success: 9140,
    history_30d: Array.from({ length: 14 }, (_, i) => ({
      date: new Date(Date.now() - (13 - i) * 86400000).toISOString().split('T')[0],
      uptime: 99.98 + (Math.sin(i * 2) * 0.02),
      latency: Math.round(85 + Math.random() * 8)
    }))
  },
  {
    id: "ep-fingpt-extract",
    name: "FinGPT Document Extraction Engine",
    model_identifier: "fingpt-extraction-v2.4",
    provider: "Proprietary On-Premises GPU",
    type: "Financial NER & Structuring",
    endpoint_url: "https://fingpt.corp.kavach.ai/extract",
    region: "eu-west-1 (Ireland)",
    status: "degraded",
    uptime_pct: 98.85,
    latency_ms: 342,
    error_rate_pct: 1.15,
    last_checked: new Date().toISOString(),
    total_requests_24h: 68400,
    consecutive_success: 320,
    history_30d: Array.from({ length: 14 }, (_, i) => ({
      date: new Date(Date.now() - (13 - i) * 86400000).toISOString().split('T')[0],
      uptime: 98.7 + (Math.cos(i) * 0.25),
      latency: Math.round(330 + Math.random() * 35)
    }))
  },
  {
    id: "ep-code-assistant",
    name: "Code Security Assistant 34B",
    model_identifier: "deepseek-ai/deepseek-coder-33b",
    provider: "Dedicated GPU Node 04",
    type: "Code Audit & AST Analysis",
    endpoint_url: "https://code.internal.kavach.ai/v1/analyze",
    region: "us-west-2 (Oregon)",
    status: "healthy",
    uptime_pct: 99.92,
    latency_ms: 112,
    error_rate_pct: 0.04,
    last_checked: new Date().toISOString(),
    total_requests_24h: 92300,
    consecutive_success: 3120,
    history_30d: Array.from({ length: 14 }, (_, i) => ({
      date: new Date(Date.now() - (13 - i) * 86400000).toISOString().split('T')[0],
      uptime: 99.9 + (Math.sin(i * 1.5) * 0.05),
      latency: Math.round(110 + Math.random() * 10)
    }))
  },
  {
    id: "ep-gemini-enterprise",
    name: "Gemini 1.5 Pro Enterprise Gateway",
    model_identifier: "gemini-1.5-pro-preview-0514",
    provider: "Google Cloud Gemini API",
    type: "Multimodal Security & Audit",
    endpoint_url: "https://generativelanguage.googleapis.com/v1beta",
    region: "Global Anycast Multi-Region",
    status: "healthy",
    uptime_pct: 99.99,
    latency_ms: 76,
    error_rate_pct: 0.00,
    last_checked: new Date().toISOString(),
    total_requests_24h: 310500,
    consecutive_success: 12400,
    history_30d: Array.from({ length: 14 }, (_, i) => ({
      date: new Date(Date.now() - (13 - i) * 86400000).toISOString().split('T')[0],
      uptime: 99.99,
      latency: Math.round(75 + Math.random() * 6)
    }))
  }
];

// Health and Connectivity Diagnostics check
const startTime = Date.now();
const formatUptime = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${h}h ${m}m ${s}s`;
};

app.get(["/api/health", "/health", "/api/status", "/status"], (_req: Request, res: Response) => {
  const uptimeSeconds = Math.floor(process.uptime());
  const mem = process.memoryUsage();
  
  res.json({
    status: "healthy",
    service: "Kavach-AI Core Governance & Security API",
    environment: process.env.NODE_ENV || "production",
    version: "1.0.0",
    uptime_seconds: uptimeSeconds,
    uptime_human: formatUptime(uptimeSeconds),
    timestamp: new Date().toISOString(),
    node_version: process.version,
    memory: {
      heapUsedMB: Math.round((mem.heapUsed / 1024 / 1024) * 100) / 100,
      heapTotalMB: Math.round((mem.heapTotal / 1024 / 1024) * 100) / 100,
      rssMB: Math.round((mem.rss / 1024 / 1024) * 100) / 100
    },
    components: {
      api_gateway: "operational",
      auth_service: "operational",
      database: "operational",
      redteam_scanner: "operational",
      drift_telemetry: "operational",
      email_dispatcher: "operational"
    },
    active_sessions: users.length,
    monitored_models: modelEndpoints.length,
    completed_scans: aiTests.length,
    connectivity: {
      mode: "live_fullstack_server",
      ping_latency_ms: Math.floor(Math.random() * 6 + 4),
      port: PORT,
      host: "0.0.0.0"
    }
  });
});

// Auth Routes (mapped to both /api/auth/* and /auth/* for maximum resilience)
app.post(["/api/auth/login", "/auth/login"], (req: Request, res: Response) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username || u.email === username);
  if (!user || (user.passwordHash && user.passwordHash !== password && password !== "password")) {
    // If not matching and not demo password, allow default demo login for ease of testing
    if (username === "demo" || username === "admin") {
      const demoUser = users[0];
      const token = generateJwt(demoUser, 15 * 60);
      return res.json({
        access_token: token,
        token: token,
        expires_in: 15 * 60,
        expires_at: Date.now() + 15 * 60 * 1000,
        user: { id: demoUser.id, username: demoUser.username, email: demoUser.email, company: demoUser.company, role: demoUser.role }
      });
    }
    return res.status(401).json({ error: "Invalid username or password" });
  }

  const token = generateJwt(user, 15 * 60);
  res.json({
    access_token: token,
    token: token,
    expires_in: 15 * 60,
    expires_at: Date.now() + 15 * 60 * 1000,
    user: { id: user.id, username: user.username, email: user.email, company: user.company, role: user.role }
  });
});

app.post(["/api/auth/refresh", "/auth/refresh"], (req: Request, res: Response) => {
  // Refresh existing user session
  const authHeader = req.headers.authorization;
  let currentUser = users[0];
  
  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      const raw = authHeader.substring(7);
      const parts = raw.split('.');
      if (parts.length === 3) {
        const decoded = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf-8'));
        const matched = users.find(u => u.id === decoded.id || u.username === decoded.username);
        if (matched) currentUser = matched;
      }
    } catch {
      // ignore
    }
  }

  const refreshedToken = generateJwt(currentUser, 15 * 60);
  
  // Log the session extension audit trail
  logActivity({
    action: "SESSION_EXTENDED",
    module: "auth",
    description: `Authentication session token successfully extended for 15 minutes by user '${currentUser.username}'`,
    severity: "info",
    target: "Auth Session Token",
    metadata: { userId: currentUser.id, extensionMinutes: 15 },
    username: currentUser.username,
    user_id: currentUser.id,
    ip_address: req.ip || "127.0.0.1"
  });

  res.json({
    access_token: refreshedToken,
    token: refreshedToken,
    expires_in: 15 * 60,
    expires_at: Date.now() + 15 * 60 * 1000,
    message: "Session extended successfully for 15 minutes",
    user: { id: currentUser.id, username: currentUser.username, email: currentUser.email, company: currentUser.company, role: currentUser.role }
  });
});

app.post(["/api/auth/register", "/auth/register"], (req: Request, res: Response) => {
  const { username, email, password, company } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: "Username, email and password are required" });
  }
  const existing = users.find(u => u.username === username || u.email === email);
  if (existing) {
    return res.status(400).json({ error: "User or email already exists" });
  }
  const newUser: User = {
    id: users.length + 1,
    username,
    email,
    company: company || "Organization",
    role: "user",
    passwordHash: password
  };
  users.push(newUser);
  const token = generateJwt(newUser, 15 * 60);
  res.status(201).json({
    message: "Registration successful",
    access_token: token,
    token: token,
    expires_in: 15 * 60,
    expires_at: Date.now() + 15 * 60 * 1000,
    user: { id: newUser.id, username: newUser.username, email: newUser.email, company: newUser.company, role: newUser.role }
  });
});

app.get(["/api/auth/profile", "/api/user/profile"], (_req: Request, res: Response) => {
  const user = users[0];
  res.json({ id: user.id, username: user.username, email: user.email, company: user.company, role: user.role });
});

app.put(["/api/auth/profile", "/api/user/profile"], (req: Request, res: Response) => {
  const { email, company, password } = req.body;
  const user = users[0];
  if (email) user.email = email;
  if (company !== undefined) user.company = company;
  if (password) user.passwordHash = password;
  res.json({ message: "Profile updated successfully", user: { id: user.id, username: user.username, email: user.email, company: user.company, role: user.role } });
});

app.post("/api/auth/reset-password", (_req: Request, res: Response) => {
  res.json({ message: "Password has been successfully reset." });
});

// Dashboard Routes
app.get("/api/dashboard/stats", (_req: Request, res: Response) => {
  const securityTests = aiTests.length;
  const activeAlerts = driftMetrics.filter(m => m.drift_score > m.alert_threshold).length;
  const modelsMonitored = new Set(driftMetrics.map(m => m.model_name)).size;
  const healthyModels = driftMetrics.filter(m => m.drift_score <= m.alert_threshold).length;
  const complianceScore = Math.round(92 - (activeAlerts * 4));

  res.json({
    securityTests,
    activeAlerts,
    modelsMonitored,
    healthyModels,
    complianceScore
  });
});

app.get("/api/dashboard/chart-data", (_req: Request, res: Response) => {
  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const tests = [12, 19, 15, 27, 34, 18, 24];
  const alerts = [2, 4, 1, 6, 3, 2, 4];
  res.json({ labels, tests, alerts });
});

app.get("/api/dashboard/vulnerability-trend", (_req: Request, res: Response) => {
  const data = [
    { date: "2026-08-26", status: "new", count: 4 },
    { date: "2026-08-26", status: "in_progress", count: 2 },
    { date: "2026-08-26", status: "resolved", count: 8 },
    { date: "2026-08-27", status: "new", count: 6 },
    { date: "2026-08-27", status: "in_progress", count: 3 },
    { date: "2026-08-27", status: "resolved", count: 11 },
    { date: "2026-08-28", status: "new", count: 3 },
    { date: "2026-08-28", status: "in_progress", count: 5 },
    { date: "2026-08-28", status: "resolved", count: 14 },
    { date: "2026-08-29", status: "new", count: 5 },
    { date: "2026-08-29", status: "in_progress", count: 4 },
    { date: "2026-08-29", status: "resolved", count: 18 },
    { date: "2026-08-30", status: "new", count: 2 },
    { date: "2026-08-30", status: "in_progress", count: 3 },
    { date: "2026-08-30", status: "resolved", count: 22 },
    { date: "2026-08-31", status: "new", count: 4 },
    { date: "2026-08-31", status: "in_progress", count: 2 },
    { date: "2026-08-31", status: "resolved", count: 26 },
    { date: "2026-09-01", status: "new", count: 2 },
    { date: "2026-09-01", status: "in_progress", count: 3 },
    { date: "2026-09-01", status: "resolved", count: 29 }
  ];
  res.json(data);
});

// Telemetry & Real-Time Metrics (API Latency & Security Scan Duration)
app.get(["/api/dashboard/telemetry", "/api/dashboard/metrics/realtime"], (_req: Request, res: Response) => {
  const now = Date.now();
  const points = 12;
  const timeSeries = [];
  
  for (let i = points - 1; i >= 0; i--) {
    const time = new Date(now - i * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const jitter = Math.sin(i * 0.8) * 12 + Math.random() * 8;
    timeSeries.push({
      timestamp: time,
      p50: Math.round(48 + jitter),
      p95: Math.round(92 + jitter * 1.4 + Math.random() * 15),
      p99: Math.round(145 + jitter * 2.1 + Math.random() * 25),
      llamaLatency: Math.round(62 + jitter * 0.9),
      finGptLatency: Math.round(45 + jitter * 1.1),
      ragLatency: Math.round(84 + jitter * 1.3),
      scanDurationSeconds: Number((3.2 + Math.random() * 2.1 + (i % 3 === 0 ? 1.8 : 0)).toFixed(2)),
      payloadThroughput: Math.round(380 + Math.random() * 140)
    });
  }

  const scanTypeDurations = [
    { type: "Prompt Injection", avgDurationMs: 3420, p95DurationMs: 4850, testCount: 142, throughputSec: 85 },
    { type: "PII & Leakage", avgDurationMs: 2180, p95DurationMs: 3120, testCount: 96, throughputSec: 120 },
    { type: "Jailbreak Bypass", avgDurationMs: 4150, p95DurationMs: 5900, testCount: 118, throughputSec: 64 },
    { type: "Hallucination", avgDurationMs: 2840, p95DurationMs: 3960, testCount: 74, throughputSec: 92 },
    { type: "Deepfake Detection", avgDurationMs: 5200, p95DurationMs: 7400, testCount: 45, throughputSec: 40 }
  ];

  res.json({
    timeSeries,
    scanTypeDurations,
    currentAvgLatency: 54,
    currentP95Latency: 104,
    currentP99Latency: 168,
    avgScanDurationMs: 3558,
    activeConcurrentScans: 3,
    systemUptime: "99.98%",
    evaluatedPayloadsToday: 18450
  });
});

app.get("/api/dashboard/recent-activity", (_req: Request, res: Response) => {
  const testActivities = aiTests.map(t => ({
    activity_type: "test",
    description: `${t.test_name} (${t.test_type})`,
    status: t.status,
    created_at: t.created_at
  }));

  const logActivities = [
    {
      activity_type: "compliance",
      description: "Policy verification on ISO-42001 Standard",
      status: "SUCCESS",
      created_at: new Date(Date.now() - 3600000 * 8).toISOString()
    },
    {
      activity_type: "compliance",
      description: "Drift monitor automated sweep completed",
      status: "SUCCESS",
      created_at: new Date(Date.now() - 3600000 * 16).toISOString()
    }
  ];

  const all = [...testActivities, ...logActivities].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  res.json({
    activities: all,
    total: all.length,
    pages: 1,
    current_page: 1
  });
});

// Model Health & Live Endpoint Uptime Routes
app.get("/api/models/health", (_req: Request, res: Response) => {
  const total_endpoints = modelEndpoints.length;
  const healthy_count = modelEndpoints.filter(e => e.status === "healthy").length;
  const degraded_count = modelEndpoints.filter(e => e.status === "degraded").length;
  const down_count = modelEndpoints.filter(e => e.status === "down").length;
  
  const sumUptime = modelEndpoints.reduce((acc, curr) => acc + curr.uptime_pct, 0);
  const aggregate_uptime = Number((sumUptime / total_endpoints).toFixed(2));

  const sumLatency = modelEndpoints.reduce((acc, curr) => acc + curr.latency_ms, 0);
  const avg_latency_ms = Math.round(sumLatency / total_endpoints);

  const overall_status = down_count > 0 ? "critical" : degraded_count > 0 ? "degraded" : "operational";

  res.json({
    endpoints: modelEndpoints,
    summary: {
      overall_status,
      aggregate_uptime,
      avg_latency_ms,
      total_endpoints,
      healthy_count,
      degraded_count,
      down_count,
      last_probed_at: new Date().toISOString()
    }
  });
});

app.post(["/api/models/health/probe", "/api/models/health/probe/:id"], (req: Request, res: Response) => {
  const targetId = req.params.id || req.body.endpoint_id;
  const probedTime = new Date().toISOString();

  if (targetId && targetId !== "all") {
    const ep = modelEndpoints.find(e => e.id === targetId);
    if (!ep) {
      return res.status(404).json({ error: "Endpoint not found" });
    }
    // Simulate probe jitter
    const jitter = (Math.random() - 0.45) * 15;
    ep.latency_ms = Math.max(25, Math.round(ep.latency_ms + jitter));
    ep.last_checked = probedTime;
    ep.consecutive_success += 1;
    if (ep.latency_ms > 360) {
      ep.status = "degraded";
    } else {
      ep.status = "healthy";
    }

    logActivity({
      action: "MODEL_HEALTH_PROBED",
      module: "governance",
      description: `Active health probe executed on endpoint '${ep.name}' (${ep.latency_ms}ms, Status: ${ep.status})`,
      severity: ep.status === "healthy" ? "success" : "warning",
      target: ep.name,
      metadata: { endpointId: ep.id, latencyMs: ep.latency_ms, status: ep.status, uptime: ep.uptime_pct },
      username: users[0].username,
      user_id: users[0].id,
      ip_address: req.ip || "127.0.0.1"
    });

    return res.json({
      message: `Endpoint probe completed for ${ep.name}`,
      endpoint: ep,
      summary: {
        overall_status: modelEndpoints.some(e => e.status === "down") ? "critical" : modelEndpoints.some(e => e.status === "degraded") ? "degraded" : "operational",
        aggregate_uptime: Number((modelEndpoints.reduce((a, b) => a + b.uptime_pct, 0) / modelEndpoints.length).toFixed(2)),
        avg_latency_ms: Math.round(modelEndpoints.reduce((a, b) => a + b.latency_ms, 0) / modelEndpoints.length),
        probed_at: probedTime
      }
    });
  }

  // Probe all endpoints
  modelEndpoints.forEach(ep => {
    const jitter = (Math.random() - 0.48) * 12;
    ep.latency_ms = Math.max(30, Math.round(ep.latency_ms + jitter));
    ep.last_checked = probedTime;
    ep.consecutive_success += 1;
    if (ep.id === "ep-fingpt-extract") {
      ep.status = ep.latency_ms > 300 ? "degraded" : "healthy";
    } else {
      ep.status = ep.latency_ms > 350 ? "degraded" : "healthy";
    }
  });

  const sumUptime = modelEndpoints.reduce((acc, curr) => acc + curr.uptime_pct, 0);
  const aggregate_uptime = Number((sumUptime / modelEndpoints.length).toFixed(2));
  const avg_latency_ms = Math.round(modelEndpoints.reduce((a, b) => a + b.latency_ms, 0) / modelEndpoints.length);

  logActivity({
    action: "ALL_ENDPOINTS_HEALTH_PROBED",
    module: "governance",
    description: `Active comprehensive health ping executed on all ${modelEndpoints.length} AI model endpoints (Avg Latency: ${avg_latency_ms}ms, Uptime: ${aggregate_uptime}%)`,
    severity: "info",
    target: "All Connected Model Endpoints",
    metadata: { endpointCount: modelEndpoints.length, avgLatency: avg_latency_ms, aggregateUptime: aggregate_uptime },
    username: users[0].username,
    user_id: users[0].id,
    ip_address: req.ip || "127.0.0.1"
  });

  res.json({
    message: `Active health probe completed for all ${modelEndpoints.length} endpoints`,
    endpoints: modelEndpoints,
    summary: {
      overall_status: modelEndpoints.some(e => e.status === "down") ? "critical" : modelEndpoints.some(e => e.status === "degraded") ? "degraded" : "operational",
      aggregate_uptime,
      avg_latency_ms,
      total_endpoints: modelEndpoints.length,
      healthy_count: modelEndpoints.filter(e => e.status === "healthy").length,
      degraded_count: modelEndpoints.filter(e => e.status === "degraded").length,
      down_count: modelEndpoints.filter(e => e.status === "down").length,
      last_probed_at: probedTime
    }
  });
});

// Red Team Routes
app.get("/api/redteam/tests", (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const per_page = parseInt(req.query.per_page as string) || 10;
  const start = (page - 1) * per_page;
  const items = aiTests.slice(start, start + per_page);

  res.json({
    tests: items,
    total: aiTests.length,
    pages: Math.ceil(aiTests.length / per_page) || 1,
    current_page: page
  });
});

app.post("/api/redteam/test", (req: Request, res: Response) => {
  const { test_name, test_type, target_system } = req.body;
  if (!test_name || !test_type || !target_system) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const newTest: AITestItem = {
    id: aiTests.length + 1,
    user_id: 1,
    test_name,
    test_type,
    target_system,
    status: "pending",
    created_at: new Date().toISOString()
  };

  aiTests.unshift(newTest);
  logActivity({
    action: "SECURITY_TEST_CREATED",
    module: "redteam",
    description: `Created new ${test_type} security test for ${target_system}`,
    severity: "info",
    target: target_system,
    metadata: { testId: newTest.id, testName: test_name }
  });
  res.status(201).json({ message: "Test created", test: newTest });
});

app.post("/api/redteam/test/:id/run", (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const test = aiTests.find(t => t.id === id);
  if (!test) return res.status(404).json({ error: "Test not found" });

  test.status = "completed";
  test.completed_at = new Date().toISOString();

  // Dynamic vulnerability findings based on test type
  const isJailbreak = test.test_type.toLowerCase().includes("jailbreak");
  const isPromptInjection = test.test_type.toLowerCase().includes("injection");
  const isPII = test.test_type.toLowerCase().includes("pii") || test.test_type.toLowerCase().includes("leakage");

  const vulnerabilities: Array<{ type: string; description: string; severity: string; status: string }> = [];

  if (isPromptInjection) {
    vulnerabilities.push({
      type: "Indirect System Override",
      description: "Delimited markdown payload caused instruction hijacking in multi-turn test.",
      severity: "High",
      status: "new"
    });
  } else if (isPII) {
    vulnerabilities.push({
      type: "Anonymized Entity Re-identification",
      description: "Correlation query generated partial reconstructed corporate identifiers.",
      severity: "Medium",
      status: "new"
    });
  } else if (isJailbreak) {
    vulnerabilities.push({
      type: "Roleplay Hypothetical Bypass",
      description: "Adversarial fiction framing allowed soft policy evasion.",
      severity: "Low",
      status: "new"
    });
  } else {
    vulnerabilities.push({
      type: "Safety Boundary Inconsistency",
      description: "Edge-case perturbation generated partial non-compliant output.",
      severity: "Medium",
      status: "new"
    });
  }

  const overall_score = vulnerabilities.length > 0 ? (vulnerabilities[0].severity === 'High' ? 0.68 : 0.82) : 0.95;
  const risk_level = overall_score > 0.85 ? "Low" : overall_score > 0.70 ? "Medium" : "High";

  test.results = {
    overall_score,
    risk_level,
    tests_conducted: Math.floor(Math.random() * 30) + 30,
    attack_mode: "simulation",
    vulnerabilities_found: vulnerabilities,
    recommendations: [
      "Implement real-time guardrail classifiers on incoming prompt streams.",
      "Add automated post-generation PII scrubbing filters.",
      "Enforce deterministic token filtering on high-risk conversational branches."
    ]
  };

  logActivity({
    action: "SECURITY_TEST_COMPLETED",
    module: "redteam",
    description: `Executed adversarial test '${test.test_name}' on ${test.target_system}`,
    severity: risk_level === "High" ? "critical" : risk_level === "Medium" ? "warning" : "success",
    target: test.target_system,
    metadata: {
      testId: test.id,
      score: Math.round(overall_score * 100),
      risk: risk_level,
      vulnerabilitiesCount: vulnerabilities.length
    }
  });

  // Automated Email Service Integration: If test failed or vulnerabilities found, dispatch failure summary email
  let emailDispatched: SentFailureEmail | null = null;
  if (vulnerabilities.length > 0 || risk_level !== "Low") {
    emailDispatched = dispatchScanFailureEmail(test);
  }

  res.json({ message: "Test completed", results: test.results, email_dispatched: emailDispatched });
});

// Single Delete Test
app.delete("/api/redteam/test/:id", (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const existing = aiTests.find(t => t.id === id);
  if (!existing) {
    return res.status(404).json({ error: "Test not found" });
  }

  aiTests = aiTests.filter(t => t.id !== id);

  logActivity({
    action: "SECURITY_TEST_DELETED",
    module: "redteam",
    description: `Deleted security test '${existing.test_name}' (ID: ${id})`,
    severity: "warning",
    target: existing.target_system,
    metadata: { testId: id, testName: existing.test_name }
  });

  res.json({ message: "Test deleted successfully", deletedId: id });
});

// Bulk Delete Tests
app.post("/api/redteam/tests/bulk-delete", (req: Request, res: Response) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: "Invalid or empty IDs array" });
  }

  const numericIds = ids.map(id => Number(id));
  const beforeCount = aiTests.length;
  aiTests = aiTests.filter(t => !numericIds.includes(t.id));
  const deletedCount = beforeCount - aiTests.length;

  logActivity({
    action: "BULK_SECURITY_TESTS_DELETED",
    module: "redteam",
    description: `Bulk deleted ${deletedCount} adversarial security tests`,
    severity: "warning",
    target: "Adversarial Test Inventory",
    metadata: { deletedCount, deletedIds: numericIds }
  });

  res.json({ message: `Successfully deleted ${deletedCount} tests`, deletedCount, deletedIds: numericIds });
});

// Bulk Run Tests
app.post("/api/redteam/tests/bulk-run", (req: Request, res: Response) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: "Invalid or empty IDs array" });
  }

  const numericIds = ids.map(id => Number(id));
  const executedTests: AITestItem[] = [];
  const emailsSent: SentFailureEmail[] = [];

  numericIds.forEach(id => {
    const test = aiTests.find(t => t.id === id);
    if (test) {
      test.status = "completed";
      test.completed_at = new Date().toISOString();
      const vulns = [
        {
          type: test.test_type.includes("Jailbreak") ? "Roleplay Boundary Escape" : "Instruction Override",
          description: `Batch simulated attack identified policy escape on ${test.target_system}`,
          severity: "Medium",
          status: "new"
        }
      ];
      test.results = {
        overall_score: 0.79,
        risk_level: "Medium",
        tests_conducted: 40,
        attack_mode: "simulation",
        vulnerabilities_found: vulns,
        recommendations: ["Deploy strict multi-turn conversation guardrails."]
      };
      executedTests.push(test);
      const email = dispatchScanFailureEmail(test);
      if (email) emailsSent.push(email);
    }
  });

  logActivity({
    action: "BULK_SECURITY_TESTS_EXECUTED",
    module: "redteam",
    description: `Batch executed ${executedTests.length} adversarial tests with automated failure alerting`,
    severity: "info",
    target: "Bulk Test Runner",
    metadata: { executedCount: executedTests.length, emailsSentCount: emailsSent.length }
  });

  res.json({
    message: `Batch executed ${executedTests.length} tests`,
    executedCount: executedTests.length,
    tests: executedTests,
    emailsDispatched: emailsSent.length
  });
});

// Bulk Export Tests (JSON or CSV)
app.post("/api/redteam/tests/bulk-export", (req: Request, res: Response) => {
  const { ids, format = 'json' } = req.body;
  const numericIds = Array.isArray(ids) && ids.length > 0 ? ids.map(id => Number(id)) : aiTests.map(t => t.id);
  const selected = aiTests.filter(t => numericIds.includes(t.id));

  if (format === 'csv') {
    const header = "Test_ID,Test_Name,Test_Type,Target_System,Status,Overall_Score,Risk_Level,Tests_Conducted,Vulnerabilities_Count,Completed_At\n";
    const rows = selected.map(t => {
      const score = t.results ? Math.round(t.results.overall_score * 100) : "N/A";
      const risk = t.results ? t.results.risk_level : "Pending";
      const count = t.results ? t.results.tests_conducted : 0;
      const vulnCount = t.results?.vulnerabilities_found ? t.results.vulnerabilities_found.length : 0;
      return `"${t.id}","${t.test_name.replace(/"/g, '""')}","${t.test_type}","${t.target_system}","${t.status}","${score}%","${risk}","${count}","${vulnCount}","${t.completed_at || t.created_at}"`;
    }).join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="redteam_selected_tests_${new Date().toISOString().split('T')[0]}.csv"`);
    return res.send(header + rows);
  }

  // JSON format
  const exportPayload = {
    metadata: {
      generated_at: new Date().toISOString(),
      platform: "Kavach-AI",
      report_type: "Bulk Red Team Vulnerability Dataset",
      selected_count: selected.length,
      user_email: users[1]?.email || users[0]?.email
    },
    tests: selected
  };

  res.setHeader("Content-Type", "application/json");
  res.setHeader("Content-Disposition", `attachment; filename="redteam_selected_tests_${new Date().toISOString().split('T')[0]}.json"`);
  res.send(JSON.stringify(exportPayload, null, 2));
});

app.get("/api/redteam/test/:id", (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const test = aiTests.find(t => t.id === id);
  if (!test) return res.status(404).json({ error: "Test not found" });
  res.json(test);
});

app.get("/api/redteam/test/compare", (req: Request, res: Response) => {
  const test1_id = parseInt(req.query.test1_id as string || req.query.test1 as string);
  const test2_id = parseInt(req.query.test2_id as string || req.query.test2 as string);

  const test1 = aiTests.find(t => t.id === test1_id) || aiTests[0];
  const test2 = aiTests.find(t => t.id === test2_id) || aiTests[1] || aiTests[0];

  res.json({
    comparison: { test1, test2 }
  });
});

app.get("/api/redteam/schedules", (_req: Request, res: Response) => {
  res.json(testSchedules);
});

app.post("/api/redteam/schedules", (req: Request, res: Response) => {
  const { test_name, test_type, target_system, frequency, cron_expression, alert_threshold, email_alerts } = req.body;
  const newSchedule = {
    id: testSchedules.length + 1,
    test_name: test_name || "Automated Red Team",
    test_type: test_type || "Prompt Injection",
    target_system: target_system || "Production Model",
    frequency: frequency || "Daily (00:00 UTC)",
    cron_expression: cron_expression || "0 0 * * *",
    status: "active",
    alert_threshold: alert_threshold ? Number(alert_threshold) : 80,
    email_alerts: email_alerts !== undefined ? Boolean(email_alerts) : true,
    last_run: new Date().toISOString(),
    last_score: 90,
    next_run: new Date(Date.now() + 3600000 * 24).toISOString(),
    created_at: new Date().toISOString()
  };
  testSchedules.unshift(newSchedule);
  logActivity({
    action: "SCAN_SCHEDULE_CREATED",
    module: "redteam",
    description: `Configured automated scan schedule '${newSchedule.test_name}' (${newSchedule.frequency})`,
    severity: "info",
    target: newSchedule.target_system,
    metadata: { scheduleId: newSchedule.id, frequency: newSchedule.frequency }
  });
  res.status(201).json(newSchedule);
});

app.put("/api/redteam/schedules/:id/toggle", (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const schedule = testSchedules.find(s => s.id === id);
  if (!schedule) return res.status(404).json({ error: "Schedule not found" });
  schedule.status = schedule.status === "active" ? "paused" : "active";
  
  logActivity({
    action: "SCAN_SCHEDULE_TOGGLED",
    module: "redteam",
    description: `Scan schedule '${schedule.test_name}' changed to ${schedule.status}`,
    severity: schedule.status === "active" ? "info" : "warning",
    target: schedule.target_system,
    metadata: { scheduleId: schedule.id, status: schedule.status }
  });

  res.json({ message: `Schedule ${schedule.status}`, schedule });
});

app.post("/api/redteam/schedules/:id/run", (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const schedule = testSchedules.find(s => s.id === id);
  if (!schedule) return res.status(404).json({ error: "Schedule not found" });

  const newTest: AITestItem = {
    id: aiTests.length + 1,
    user_id: 1,
    test_name: `[Scheduled] ${schedule.test_name}`,
    test_type: schedule.test_type,
    target_system: schedule.target_system,
    status: "completed",
    created_at: new Date().toISOString(),
    completed_at: new Date().toISOString(),
    results: {
      overall_score: 0.91,
      risk_level: "Low",
      tests_conducted: 50,
      attack_mode: "simulation",
      vulnerabilities_found: [],
      recommendations: ["Scheduled recurring scan executed without critical anomalies."]
    }
  };

  aiTests.unshift(newTest);
  schedule.last_run = new Date().toISOString();
  schedule.last_score = 91;
  schedule.next_run = new Date(Date.now() + 3600000 * 24).toISOString();

  logActivity({
    action: "SCHEDULED_SCAN_TRIGGERED",
    module: "redteam",
    description: `Manual run of recurring scan '${schedule.test_name}' completed with score 91%`,
    severity: "success",
    target: schedule.target_system,
    metadata: { scheduleId: schedule.id, testId: newTest.id, score: 91 }
  });

  res.json({ message: "Scheduled scan executed successfully", test: newTest, schedule });
});

app.delete("/api/redteam/schedules/:id", (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  testSchedules = testSchedules.filter(s => s.id !== id);
  res.json({ message: "Schedule deleted" });
});

// Monitoring & Drift Routes
app.get("/api/monitoring/drift", (_req: Request, res: Response) => {
  res.json(driftMetrics);
});

app.post("/api/monitoring/generate", (_req: Request, res: Response) => {
  // Generate updated drift metrics
  const models = ["Llama-3-70b-Instruct-Production", "FinGPT-Extraction-v2", "Enterprise-Search-RAG-v4", "Code-Assistant-34B"];
  const metrics = ["Embedding Cosine Drift", "Toxicity & Safety Drift", "Latency & Variance", "Output Entropy Drift"];

  driftMetrics = models.map((model_name, i) => {
    const drift_score = Math.round((Math.random() * 0.22 + 0.02) * 1000) / 1000;
    return {
      id: i + 1,
      model_name,
      metric_name: metrics[i % metrics.length],
      baseline_value: 0.045,
      current_value: Math.round((0.045 + drift_score * 0.1) * 1000) / 1000,
      drift_score,
      alert_threshold: 0.15,
      created_at: new Date().toISOString()
    };
  });

  res.json({ message: "Generated drift analysis", metrics: driftMetrics });
});

app.post("/api/monitoring/alerts/resolve-all", (_req: Request, res: Response) => {
  driftMetrics = driftMetrics.map(m => ({
    ...m,
    drift_score: Math.min(m.drift_score, 0.08)
  }));
  res.json({ message: "All alerts marked as resolved" });
});

app.post("/api/monitoring/alerts/resolve-bulk", (req: Request, res: Response) => {
  const { ids } = req.body;
  if (Array.isArray(ids)) {
    driftMetrics = driftMetrics.map(m => ids.includes(m.id) ? { ...m, drift_score: Math.min(m.drift_score, 0.08) } : m);
  }
  res.json({ message: "Selected alerts resolved" });
});

// Knowledge Base & Graph
app.get("/api/knowledge", (_req: Request, res: Response) => {
  res.json(knowledgeArticles);
});

app.post("/api/knowledge", (req: Request, res: Response) => {
  const { title, content, category } = req.body;
  const newArticle = {
    id: String(knowledgeArticles.length + 1),
    title: title || "Untitled Article",
    content: content || "",
    category: category || "Governance",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  knowledgeArticles.unshift(newArticle);
  res.status(201).json(newArticle);
});

app.delete("/api/knowledge/:id", (req: Request, res: Response) => {
  const id = req.params.id;
  knowledgeArticles = knowledgeArticles.filter(a => a.id !== id);
  res.json({ message: "Article deleted" });
});

app.get("/api/knowledge/graph", (_req: Request, res: Response) => {
  res.json({
    nodes: [
      { id: "domain-governance", name: "AI Governance Framework", type: "domain", val: 1.0 },
      { id: "domain-security", name: "Adversarial Red Teaming", type: "domain", val: 0.9 },
      { id: "domain-drift", name: "Drift & Anomaly Detection", type: "domain", val: 0.85 },
      { id: "domain-compliance", name: "Regulatory Compliance", type: "domain", val: 0.95 },
      { id: "expert-owasp", name: "OWASP LLM Core", type: "expert", val: 0.7 },
      { id: "expert-nist", name: "NIST AI RMF", type: "expert", val: 0.8 },
      { id: "expert-iso", name: "ISO/IEC 42001 Lead", type: "expert", val: 0.75 },
      { id: "expert-security", name: "Red Team Architect", type: "expert", val: 0.65 }
    ],
    links: [
      { source: "domain-governance", target: "expert-nist" },
      { source: "domain-governance", target: "expert-iso" },
      { source: "domain-security", target: "expert-owasp" },
      { source: "domain-security", target: "expert-security" },
      { source: "domain-drift", target: "domain-security" },
      { source: "domain-compliance", target: "domain-governance" },
      { source: "expert-owasp", target: "domain-compliance" }
    ]
  });
});

// Reports Routes
app.get("/api/reports/compliance/pdf", (_req: Request, res: Response) => {
  const dummyPdf = `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj
4 0 obj << /Length 120 >> stream
BT
/F1 18 Tf
50 720 Td
(Kavach-AI Compliance and Security Audit Report) Tj
/F1 12 Tf
0 -30 Td
(Status: COMPLIANT | Overall Score: 92% | Date: ${new Date().toISOString().split('T')[0]}) Tj
ET
endstream
endobj
5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj
xref
0 6
0000000000 65535 f
0000000010 00000 n
0000000060 00000 n
0000000117 00000 n
0000000225 00000 n
0000000397 00000 n
trailer << /Size 6 /Root 1 0 R >>
startxref
470
%%EOF`;

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="compliance_report_${new Date().toISOString().split('T')[0]}.pdf"`);
  res.send(Buffer.from(dummyPdf, "utf-8"));
});

app.get(["/api/reports/compliance/csv", "/api/reports/compliance/export/csv"], (_req: Request, res: Response) => {
  const header = "Control_ID,Standard,Requirement,Status,Last_Audited,Risk_Level\n";
  const rows = [
    '"ISO-42001-A.6","ISO/IEC 42001","AI Risk Assessment & Mitigation Policies","COMPLIANT","2026-09-01","Low"',
    '"NIST-AI-RMF-1.1","NIST AI RMF 1.0","Model Bias and Fairness Metric Quantification","COMPLIANT","2026-08-30","Low"',
    '"OWASP-LLM-01","OWASP Top 10 for LLM","Prompt Injection Hardening and Boundary Checks","COMPLIANT","2026-09-01","Low"',
    '"OWASP-LLM-06","OWASP Top 10 for LLM","Sensitive Information Disclosure & PII Redaction","MITIGATED","2026-08-31","Medium"',
    '"EU-AI-ACT-Art15","EU AI Act","Cybersecurity and Technical Robustness Testing","COMPLIANT","2026-08-28","Low"'
  ].join("\n");

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="kavach_compliance_audit_${new Date().toISOString().split('T')[0]}.csv"`);
  res.send(header + rows);
});

app.get(["/api/reports/tests/csv", "/api/reports/redteam/csv"], (_req: Request, res: Response) => {
  const header = "Test_ID,Test_Name,Test_Type,Target_System,Status,Overall_Score,Risk_Level,Tests_Conducted,Vulnerabilities_Count,Created_At\n";
  const rows = aiTests.map(t => {
    const score = t.results ? Math.round(t.results.overall_score * 100) : "N/A";
    const risk = t.results ? t.results.risk_level : "Pending";
    const count = t.results ? t.results.tests_conducted : 0;
    const vulnCount = t.results?.vulnerabilities_found ? t.results.vulnerabilities_found.length : 0;
    return `"${t.id}","${t.test_name.replace(/"/g, '""')}","${t.test_type}","${t.target_system}","${t.status}","${score}%","${risk}","${count}","${vulnCount}","${t.created_at}"`;
  }).join("\n");

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="redteam_adversarial_tests_${new Date().toISOString().split('T')[0]}.csv"`);
  res.send(header + rows);
});

app.get(["/api/reports/redteam/pdf", "/api/reports/tests/pdf"], (_req: Request, res: Response) => {
  const dummyPdf = `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj
4 0 obj << /Length 120 >> stream
BT
/F1 18 Tf
50 720 Td
(Kavach-AI Adversarial Red Team Findings Report) Tj
/F1 12 Tf
0 -30 Td
(Total Tests: ${aiTests.length} | Completed Scans: ${aiTests.filter(t => t.status === 'completed').length} | Date: ${new Date().toISOString().split('T')[0]}) Tj
ET
endstream
endobj
5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj
xref
0 6
0000000000 65535 f
0000000010 00000 n
0000000060 00000 n
0000000117 00000 n
0000000225 00000 n
0000000397 00000 n
trailer << /Size 6 /Root 1 0 R >>
startxref
470
%%EOF`;

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="redteam_report_${new Date().toISOString().split('T')[0]}.pdf"`);
  res.send(Buffer.from(dummyPdf, "utf-8"));
});

app.get(["/api/reports/drift/csv", "/api/reports/monitoring/csv"], (_req: Request, res: Response) => {
  const header = "Metric_ID,Model_Name,Metric_Name,Baseline_Value,Current_Value,Drift_Score,Threshold,Alert_Triggered,Created_At\n";
  const rows = driftMetrics.map(m => {
    const alert = m.drift_score > m.alert_threshold ? "YES" : "NO";
    return `"${m.id}","${m.model_name}","${m.metric_name}","${m.baseline_value}","${m.current_value}","${(m.drift_score * 100).toFixed(1)}%","${(m.alert_threshold * 100).toFixed(1)}%","${alert}","${m.created_at}"`;
  }).join("\n");

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="model_drift_audit_${new Date().toISOString().split('T')[0]}.csv"`);
  res.send(header + rows);
});

app.get(["/api/reports/drift/pdf", "/api/reports/monitoring/pdf"], (_req: Request, res: Response) => {
  const dummyPdf = `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj
4 0 obj << /Length 120 >> stream
BT
/F1 18 Tf
50 720 Td
(Kavach-AI Model Drift & Health Audit Report) Tj
/F1 12 Tf
0 -30 Td
(Active Models: ${driftMetrics.length} | Threshold Alerts: ${driftMetrics.filter(m => m.drift_score > m.alert_threshold).length} | Date: ${new Date().toISOString().split('T')[0]}) Tj
ET
endstream
endobj
5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj
xref
0 6
0000000000 65535 f
0000000010 00000 n
0000000060 00000 n
0000000117 00000 n
0000000225 00000 n
0000000397 00000 n
trailer << /Size 6 /Root 1 0 R >>
startxref
470
%%EOF`;

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="drift_audit_report_${new Date().toISOString().split('T')[0]}.pdf"`);
  res.send(Buffer.from(dummyPdf, "utf-8"));
});

// JSON Export Routes for Raw Scan Data Analysis
app.get(["/api/reports/compliance/json", "/api/reports/compliance/export/json"], (_req: Request, res: Response) => {
  const complianceData = {
    metadata: {
      generated_at: new Date().toISOString(),
      report_type: "ISO/IEC 42001 & NIST AI RMF Compliance Audit",
      organization: "Kavach-AI Enterprise",
      auditor: users[0].username,
      total_controls: 5,
      overall_readiness_score: "94.2%",
      compliance_status: "COMPLIANT"
    },
    frameworks: [
      {
        framework: "ISO/IEC 42001:2023",
        scope: "Artificial Intelligence Management System (AIMS)",
        readiness: 96.0,
        controls: [
          {
            control_id: "ISO-42001-A.6",
            title: "AI Risk Assessment & Mitigation Policies",
            status: "COMPLIANT",
            last_audited: "2026-09-01",
            risk_level: "Low",
            evidence: "Continuous boundary classification on LLM endpoints"
          }
        ]
      },
      {
        framework: "NIST AI RMF 1.0",
        scope: "Govern, Map, Measure, Manage",
        readiness: 92.5,
        controls: [
          {
            control_id: "NIST-AI-RMF-1.1",
            title: "Model Bias and Fairness Metric Quantification",
            status: "COMPLIANT",
            last_audited: "2026-08-30",
            risk_level: "Low",
            evidence: "Differential demographic representation analysis automated"
          }
        ]
      },
      {
        framework: "OWASP Top 10 for LLMs",
        scope: "Adversarial Robustness & Vulnerability Management",
        readiness: 95.0,
        controls: [
          {
            control_id: "OWASP-LLM-01",
            title: "Prompt Injection Hardening and Boundary Checks",
            status: "COMPLIANT",
            last_audited: "2026-09-01",
            risk_level: "Low",
            evidence: "Delimited token parsing and prefix guardrails"
          },
          {
            control_id: "OWASP-LLM-06",
            title: "Sensitive Information Disclosure & PII Redaction",
            status: "MITIGATED",
            last_audited: "2026-08-31",
            risk_level: "Medium",
            evidence: "Differential privacy scrubbing filter deployed"
          }
        ]
      },
      {
        framework: "EU AI Act - Article 15",
        scope: "High-Risk AI System Cybersecurity & Technical Robustness",
        readiness: 93.0,
        controls: [
          {
            control_id: "EU-AI-ACT-Art15",
            title: "Cybersecurity and Technical Robustness Testing",
            status: "COMPLIANT",
            last_audited: "2026-08-28",
            risk_level: "Low",
            evidence: "Adversarial red teaming simulated per model release"
          }
        ]
      }
    ]
  };

  res.setHeader("Content-Type", "application/json");
  res.setHeader("Content-Disposition", `attachment; filename="kavach_compliance_audit_${new Date().toISOString().split('T')[0]}.json"`);
  res.send(JSON.stringify(complianceData, null, 2));
});

app.get(["/api/reports/redteam/json", "/api/reports/tests/json"], (_req: Request, res: Response) => {
  const redteamData = {
    metadata: {
      generated_at: new Date().toISOString(),
      report_type: "Raw Adversarial Security Testing & Vulnerability Dataset",
      organization: "Kavach-AI",
      total_tests_conducted: aiTests.length,
      completed_scans: aiTests.filter(t => t.status === "completed").length,
      average_robustness_score: Math.round(
        aiTests.reduce((acc, t) => acc + (t.results?.overall_score || 0.9), 0) / (aiTests.length || 1) * 100
      )
    },
    raw_scan_records: aiTests.map(t => ({
      test_id: t.id,
      test_name: t.test_name,
      test_type: t.test_type,
      target_endpoint: t.target_system,
      execution_status: t.status,
      created_at: t.created_at,
      completed_at: t.completed_at || null,
      telemetry: {
        robustness_score: t.results ? Math.round(t.results.overall_score * 100) : null,
        risk_level: t.results?.risk_level || "Pending",
        simulated_attack_iterations: t.results?.tests_conducted || 0,
        attack_mode: t.results?.attack_mode || "simulation"
      },
      vulnerabilities: t.results?.vulnerabilities_found || [],
      recommendations: t.results?.recommendations || []
    }))
  };

  res.setHeader("Content-Type", "application/json");
  res.setHeader("Content-Disposition", `attachment; filename="redteam_vulnerabilities_${new Date().toISOString().split('T')[0]}.json"`);
  res.send(JSON.stringify(redteamData, null, 2));
});

app.get(["/api/reports/drift/json", "/api/reports/monitoring/json"], (_req: Request, res: Response) => {
  const driftData = {
    metadata: {
      generated_at: new Date().toISOString(),
      report_type: "Raw Model Telemetry & Statistical Drift Vector Dataset",
      monitored_endpoints: driftMetrics.length,
      critical_alerts: driftMetrics.filter(m => m.drift_score > m.alert_threshold).length
    },
    telemetry_records: driftMetrics.map(m => ({
      metric_id: m.id,
      model_name: m.model_name,
      metric_dimension: m.metric_name,
      baseline_vector_value: m.baseline_value,
      current_vector_value: m.current_value,
      drift_score_normalized: m.drift_score,
      drift_score_percentage: `${(m.drift_score * 100).toFixed(2)}%`,
      alert_threshold: `${(m.alert_threshold * 100).toFixed(2)}%`,
      threshold_breached: m.drift_score > m.alert_threshold,
      timestamp: m.created_at
    }))
  };

  res.setHeader("Content-Type", "application/json");
  res.setHeader("Content-Disposition", `attachment; filename="model_drift_telemetry_${new Date().toISOString().split('T')[0]}.json"`);
  res.send(JSON.stringify(driftData, null, 2));
});

app.get("/api/reports/all/json", (_req: Request, res: Response) => {
  const fullAuditBundle = {
    platform: "Kavach-AI",
    generated_at: new Date().toISOString(),
    user: users[1]?.email || users[0]?.email,
    summary: {
      total_tests: aiTests.length,
      monitored_models: driftMetrics.length,
      compliance_readiness: "94.2%"
    },
    red_team_scans: aiTests,
    drift_telemetry: driftMetrics,
    knowledge_standards: knowledgeArticles
  };

  res.setHeader("Content-Type", "application/json");
  res.setHeader("Content-Disposition", `attachment; filename="kavach_full_audit_bundle_${new Date().toISOString().split('T')[0]}.json"`);
  res.send(JSON.stringify(fullAuditBundle, null, 2));
});

// Automated Failure Email Integration Endpoints
app.get("/api/email/failures", (_req: Request, res: Response) => {
  res.json({
    emails: sentFailureEmails,
    total: sentFailureEmails.length,
    registered_recipient: users[1]?.email || users[0]?.email
  });
});

app.post("/api/email/send-failure-summary", (req: Request, res: Response) => {
  const { test_id, recipient_email } = req.body;
  const test = aiTests.find(t => t.id === Number(test_id)) || aiTests[0];
  if (!test) {
    return res.status(404).json({ error: "No scan test record found to summarize" });
  }

  const emailRecord = dispatchScanFailureEmail(test, recipient_email);
  res.json({
    message: `Scan failure summary email successfully dispatched to ${emailRecord?.recipient_email || 'recipient'}`,
    email: emailRecord
  });
});

app.post("/api/redteam/test/:id/send-failure-email", (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const test = aiTests.find(t => t.id === id);
  if (!test) {
    return res.status(404).json({ error: "Test not found" });
  }

  const { recipient_email } = req.body;
  const emailRecord = dispatchScanFailureEmail(test, recipient_email);
  res.json({
    message: `Failure report dispatched for ${test.target_system}`,
    email: emailRecord
  });
});

app.post("/api/reports/compliance/email", (_req: Request, res: Response) => {
  res.json({ message: "Report successfully queued for email distribution to alokinfo30@gmail.com." });
});

// Global Search API
app.get("/api/search/global", (req: Request, res: Response) => {
  const query = String(req.query.q || "").toLowerCase().trim();
  if (!query) {
    return res.json({ tests: [], drift: [], knowledge: [], navigation: [] });
  }

  const matchingTests = aiTests.filter(t => 
    t.test_name.toLowerCase().includes(query) ||
    t.test_type.toLowerCase().includes(query) ||
    t.target_system.toLowerCase().includes(query)
  ).map(t => ({
    id: t.id,
    title: t.test_name,
    subtitle: `${t.test_type} • ${t.target_system}`,
    category: "Red Team Test",
    url: "/red-team",
    badge: t.status
  }));

  const matchingDrift = driftMetrics.filter(m =>
    m.model_name.toLowerCase().includes(query) ||
    m.metric_name.toLowerCase().includes(query)
  ).map(m => ({
    id: m.id,
    title: m.model_name,
    subtitle: `${m.metric_name} (${(m.drift_score * 100).toFixed(1)}% drift)`,
    category: "Monitoring Drift",
    url: "/monitoring",
    badge: m.drift_score > m.alert_threshold ? "Alert" : "Normal"
  }));

  const matchingKnowledge = knowledgeArticles.filter(a =>
    a.title.toLowerCase().includes(query) ||
    a.category.toLowerCase().includes(query) ||
    a.content.toLowerCase().includes(query)
  ).map(a => ({
    id: a.id,
    title: a.title,
    subtitle: a.category,
    category: "Knowledge Base",
    url: "/knowledge",
    badge: a.category
  }));

  const navItems = [
    { title: "Governance Overview", subtitle: "Main metrics & activity feed", category: "Navigation", url: "/dashboard", badge: "Ctrl+D" },
    { title: "Red Team Lab & Scans", subtitle: "Adversarial simulation & scheduled scans", category: "Navigation", url: "/red-team", badge: "Ctrl+R" },
    { title: "Model Drift Monitoring", subtitle: "Real-time drift & threshold alerts", category: "Navigation", url: "/monitoring", badge: "Ctrl+M" },
    { title: "Knowledge Base & Graph", subtitle: "Standards, NIST/OWASP & graph visualizer", category: "Navigation", url: "/knowledge", badge: "Ctrl+B" },
    { title: "Compliance Reports", subtitle: "Download PDF & CSV audits", category: "Navigation", url: "/reports", badge: "Ctrl+P" },
    { title: "Activity Log & Audit Trail", subtitle: "User action logs & accountability records", category: "Navigation", url: "/activity-log", badge: "Ctrl+L" },
    { title: "Platform Settings", subtitle: "Alert threshold & notification configs", category: "Navigation", url: "/settings", badge: "Settings" },
    { title: "User Profile", subtitle: "Account credentials & company", category: "Navigation", url: "/profile", badge: "Profile" },
    { title: "Test Comparison Tool", subtitle: "Side-by-side vulnerability diff", category: "Navigation", url: "/red-team/compare", badge: "Diff" }
  ].filter(n => n.title.toLowerCase().includes(query) || n.subtitle.toLowerCase().includes(query));

  res.json({
    tests: matchingTests,
    drift: matchingDrift,
    knowledge: matchingKnowledge,
    navigation: navItems,
    totalResults: matchingTests.length + matchingDrift.length + matchingKnowledge.length + navItems.length
  });
});

// Settings Routes
app.get("/api/settings", (_req: Request, res: Response) => {
  res.json(platformSettings);
});

app.post("/api/settings", (req: Request, res: Response) => {
  platformSettings = { ...platformSettings, ...req.body };
  logActivity({
    action: "PLATFORM_SETTINGS_UPDATED",
    module: "settings",
    description: `Updated platform settings: alert threshold ${platformSettings.alert_threshold}%, email notifications ${platformSettings.email_notifications ? 'enabled' : 'disabled'}`,
    severity: "info",
    target: "System Configuration",
    metadata: platformSettings
  });
  res.json({ message: "Settings saved", settings: platformSettings });
});

// Feedback Routes
app.get("/api/feedback", (_req: Request, res: Response) => {
  res.json(feedbackList);
});

app.post("/api/feedback", (req: Request, res: Response) => {
  const { message, page_context } = req.body;
  const newFeedback = {
    id: feedbackList.length + 1,
    username: users[0].username,
    message: message || "General feedback",
    page_context: page_context || "Dashboard",
    timestamp: new Date().toISOString()
  };
  feedbackList.unshift(newFeedback);
  res.status(201).json({ message: "Feedback submitted successfully", feedback: newFeedback });
});

app.delete("/api/feedback/:id", (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  feedbackList = feedbackList.filter(f => f.id !== id);
  res.json({ message: "Feedback deleted" });
});

app.get("/api/feedback/export/csv", (_req: Request, res: Response) => {
  const header = "id,username,message,page_context,timestamp\n";
  const rows = feedbackList.map(f => `"${f.id}","${f.username}","${f.message.replace(/"/g, '""')}","${f.page_context}","${f.timestamp}"`).join("\n");
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", 'attachment; filename="feedback_export.csv"');
  res.send(header + rows);
});

// Notifications Routes
app.get("/api/notifications", (_req: Request, res: Response) => {
  res.json(notificationsList);
});

app.post("/api/notifications/:id/read", (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  notificationsList = notificationsList.map(n => n.id === id ? { ...n, is_read: true } : n);
  res.json({ message: "Notification marked as read" });
});

// ================= ACTIVITY LOGS & AUDIT TRAIL API =================
app.get("/api/activity-logs", (req: Request, res: Response) => {
  const { module, severity, search } = req.query;
  const page = parseInt(req.query.page as string) || 1;
  const per_page = parseInt(req.query.per_page as string) || 15;

  let filtered = [...activityLogs];

  if (module && module !== "all") {
    filtered = filtered.filter(l => l.module === module);
  }

  if (severity && severity !== "all") {
    filtered = filtered.filter(l => l.severity === severity);
  }

  if (search) {
    const q = String(search).toLowerCase().trim();
    filtered = filtered.filter(l =>
      l.description.toLowerCase().includes(q) ||
      l.username.toLowerCase().includes(q) ||
      l.action.toLowerCase().includes(q) ||
      (l.target && l.target.toLowerCase().includes(q))
    );
  }

  const total = filtered.length;
  const pages = Math.ceil(total / per_page) || 1;
  const start = (page - 1) * per_page;
  const paginatedLogs = filtered.slice(start, start + per_page);

  // Compute stats across all logs
  const stats = {
    total: activityLogs.length,
    criticalCount: activityLogs.filter(l => l.severity === "critical").length,
    warningCount: activityLogs.filter(l => l.severity === "warning").length,
    successCount: activityLogs.filter(l => l.severity === "success").length,
    infoCount: activityLogs.filter(l => l.severity === "info").length,
    todayCount: activityLogs.filter(l => {
      const today = new Date().toISOString().split('T')[0];
      return l.timestamp.startsWith(today);
    }).length,
    uniqueActorsCount: new Set(activityLogs.map(l => l.username)).size
  };

  const modules = Array.from(new Set(activityLogs.map(l => l.module)));

  res.json({
    logs: paginatedLogs,
    total,
    pages,
    current_page: page,
    per_page,
    stats,
    modules
  });
});

app.post("/api/activity-logs", (req: Request, res: Response) => {
  const { action, module, description, severity, target, metadata } = req.body;
  if (!action || !module || !description) {
    return res.status(400).json({ error: "Missing required activity fields" });
  }

  const log = logActivity({
    action,
    module,
    description,
    severity: severity || 'info',
    target,
    metadata,
    username: users[0].username,
    user_id: users[0].id,
    ip_address: req.ip || "127.0.0.1"
  });

  res.status(201).json({ message: "Activity logged", log });
});

app.get("/api/activity-logs/export/csv", (_req: Request, res: Response) => {
  const header = "Log_ID,Timestamp,User_ID,Username,Action,Module,Severity,Target_Resource,Description,IP_Address\n";
  const rows = activityLogs.map(l => {
    return `"${l.id}","${l.timestamp}","${l.user_id}","${l.username}","${l.action}","${l.module}","${l.severity}","${(l.target || '').replace(/"/g, '""')}","${l.description.replace(/"/g, '""')}","${l.ip_address}"`;
  }).join("\n");

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="kavach_activity_audit_trail_${new Date().toISOString().split('T')[0]}.csv"`);
  res.send(header + rows);
});

// ================= VITE MIDDLEWARE & STATIC SERVING =================
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

start();
