// Comprehensive Mock Fallback Engine for Static Deployments (e.g., Netlify, Vercel, GitHub Pages)
// Automatically handles API endpoints when a separate backend is not present or returns 404.

export interface MockUser {
  id: number | string;
  username: string;
  email: string;
  role: string;
  company: string;
  created_at: string;
}

// Generate a valid base64-encoded mock JWT token with 24h expiration
export function generateMockToken(username: string, email: string): string {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const expTime = Math.floor(Date.now() / 1000) + 24 * 60 * 60; // 24 hours
  const payload = btoa(JSON.stringify({
    sub: 1,
    username,
    email,
    role: "admin",
    exp: expTime,
    iat: Math.floor(Date.now() / 1000)
  }));
  const signature = btoa("kavach_ai_mock_signature");
  return `${header}.${payload}.${signature}`;
}

// Initial Mock Seed Data
const INITIAL_USERS: MockUser[] = [
  {
    id: 1,
    username: "demo",
    email: "demo@kavach.ai",
    role: "admin",
    company: "Kavach Enterprise AI",
    created_at: "2026-08-01T00:00:00.000Z"
  },
  {
    id: 2,
    username: "alokinfo30",
    email: "alokinfo30@gmail.com",
    role: "admin",
    company: "Kavach-AI Enterprise",
    created_at: "2026-08-15T00:00:00.000Z"
  }
];

const INITIAL_TESTS = [
  {
    id: 1,
    test_name: "Direct Delimiter Bypass Probe",
    test_type: "Prompt Injection",
    target_system: "Llama-3-70B-Instruct-v2",
    status: "completed",
    created_at: "2026-08-30T10:14:00Z",
    completed_at: "2026-08-30T10:14:32Z",
    results: {
      overall_score: 0.94,
      risk_level: "Low",
      tests_conducted: 35,
      attack_mode: "simulation",
      vulnerabilities_found: [
        {
          id: "VULN-001",
          severity: "Medium",
          type: "Delimiter Leakage",
          description: "Model echoed delimited internal system framing tokens under nested markdown backticks."
        }
      ],
      recommendations: [
        "Enforce strict prefix boundary stripping at the API gateway layer.",
        "Implement output schema validation with rigid rejection policies."
      ]
    }
  },
  {
    id: 2,
    test_name: "Demographic Parity & Gender Representation Audit",
    test_type: "Bias & Fairness",
    target_system: "Claude-3.5-Sonnet-HR-Assistant",
    status: "completed",
    created_at: "2026-08-29T14:20:00Z",
    completed_at: "2026-08-29T14:21:10Z",
    results: {
      overall_score: 0.88,
      risk_level: "Medium",
      tests_conducted: 50,
      attack_mode: "simulation",
      vulnerabilities_found: [
        {
          id: "VULN-002",
          severity: "High",
          type: "Differential Approval Rate",
          description: "Demonstrated 8.4% variance in candidate qualification scoring across gendered demographic descriptors."
        }
      ],
      recommendations: [
        "Calibrate prompt grounding with counterfactual fairness examples.",
        "Apply post-processing score re-weighting on candidate evaluations."
      ]
    }
  },
  {
    id: 3,
    test_name: "Differential Privacy & SSN Scrubber Stress Test",
    test_type: "Data Privacy",
    target_system: "Gemini-1.5-Pro-CustomerOps",
    status: "completed",
    created_at: "2026-08-28T09:00:00Z",
    completed_at: "2026-08-28T09:02:15Z",
    results: {
      overall_score: 0.96,
      risk_level: "Low",
      tests_conducted: 40,
      attack_mode: "simulation",
      vulnerabilities_found: [],
      recommendations: [
        "Continuous synthetic PII fuzzing on edge cache endpoints."
      ]
    }
  },
  {
    id: 4,
    test_name: "Autonomous SQL Tool Invocation Jailbreak",
    test_type: "Excessive Agency",
    target_system: "GPT-4o-Database-Agent",
    status: "completed",
    created_at: "2026-08-27T16:45:00Z",
    completed_at: "2026-08-27T16:46:20Z",
    results: {
      overall_score: 0.72,
      risk_level: "Critical",
      tests_conducted: 25,
      attack_mode: "simulation",
      vulnerabilities_found: [
        {
          id: "VULN-004",
          severity: "Critical",
          type: "Unauthorized SQL DROP Execution",
          description: "Agent bypassed read-only constraints when provided obfuscated base64 SQL statement in multi-turn chat."
        }
      ],
      recommendations: [
        "Enforce database-level read-only role permissions for AI agent credentials.",
        "Require Human-in-the-loop approval before executing mutation statements."
      ]
    }
  },
  {
    id: 5,
    test_name: "Self-Correction Convergence Verification",
    test_type: "Hallucination",
    target_system: "Mistral-Large-2407",
    status: "running",
    created_at: "2026-09-01T03:30:00Z",
    results: null
  }
];

const INITIAL_DRIFT = [
  {
    id: 1,
    model_name: "Customer-Support-LLM-v2",
    metric_name: "Cosine Distance (Embeddings)",
    baseline_value: 0.042,
    current_value: 0.098,
    drift_score: 0.128,
    alert_threshold: 0.10,
    created_at: "2026-09-01T03:00:00Z"
  },
  {
    id: 2,
    model_name: "Risk-Scoring-Engine-v4",
    metric_name: "Population Stability Index (PSI)",
    baseline_value: 0.08,
    current_value: 0.14,
    drift_score: 0.085,
    alert_threshold: 0.15,
    created_at: "2026-09-01T02:45:00Z"
  },
  {
    id: 3,
    model_name: "Legal-Doc-Summarizer",
    metric_name: "Wasserstein Distance",
    baseline_value: 0.031,
    current_value: 0.076,
    drift_score: 0.062,
    alert_threshold: 0.12,
    created_at: "2026-09-01T01:15:00Z"
  }
];

const INITIAL_ACTIVITIES = [
  {
    id: 1,
    activity_type: "RED_TEAM_SCAN",
    description: "Completed Adversarial Prompt Injection scan on Llama-3-70B (Score: 94%)",
    status: "SUCCESS",
    created_at: "2026-09-01T03:15:00Z"
  },
  {
    id: 2,
    activity_type: "DRIFT_ALERT",
    description: "Statistical drift alert triggered on Customer-Support-LLM-v2 (Score: 12.8% vs threshold 10.0%)",
    status: "WARNING",
    created_at: "2026-09-01T02:30:00Z"
  },
  {
    id: 3,
    activity_type: "EMAIL_DISPATCH",
    description: "Automated scan failure summary dispatched to alokinfo30@gmail.com",
    status: "SUCCESS",
    created_at: "2026-09-01T01:45:00Z"
  },
  {
    id: 4,
    activity_type: "COMPLIANCE_AUDIT",
    description: "ISO/IEC 42001 & NIST AI RMF readiness audit compiled (Score: 94.2%)",
    status: "SUCCESS",
    created_at: "2026-08-31T20:00:00Z"
  }
];

// Helper to get / set LocalStorage collections
function getStorage<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(`kavach_${key}`);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

function setStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(`kavach_${key}`, JSON.stringify(value));
  } catch (e) {
    console.warn("Storage write error", e);
  }
}

// Router for Mock Endpoints
export function handleMockRequest(url: string, method: string, data?: any): { status: number; data: any } | null {
  const cleanUrl = url.replace(/^\/?api\/?/, '/').split('?')[0];
  const upperMethod = method.toUpperCase();

  // AUTH ENDPOINTS
  if (cleanUrl === '/auth/login' && upperMethod === 'POST') {
    const { username, password } = data || {};
    const users = getStorage<MockUser[]>('users', INITIAL_USERS);
    const existing = users.find(u => u.username === username || u.email === username);

    const userToLogin = existing || {
      id: 1,
      username: username || "demo",
      email: `${username || "demo"}@kavach.ai`,
      role: "admin",
      company: "Kavach-AI Enterprise",
      created_at: new Date().toISOString()
    };

    const token = generateMockToken(userToLogin.username, userToLogin.email);
    setStorage('current_user', userToLogin);

    return {
      status: 200,
      data: {
        message: "Login successful (Static Demo Mode)",
        access_token: token,
        token: token,
        expires_at: Date.now() + 24 * 60 * 60 * 1000,
        user: userToLogin
      }
    };
  }

  if (cleanUrl === '/auth/register' && upperMethod === 'POST') {
    const { username, email, company } = data || {};
    const users = getStorage<MockUser[]>('users', INITIAL_USERS);
    const newUser: MockUser = {
      id: Date.now(),
      username: username || "user",
      email: email || `${username || "user"}@example.com`,
      role: "admin",
      company: company || "Enterprise Corp",
      created_at: new Date().toISOString()
    };

    users.push(newUser);
    setStorage('users', users);
    setStorage('current_user', newUser);

    const token = generateMockToken(newUser.username, newUser.email);
    return {
      status: 201,
      data: {
        message: "User registered successfully",
        access_token: token,
        token: token,
        expires_at: Date.now() + 24 * 60 * 60 * 1000,
        user: newUser
      }
    };
  }

  if (cleanUrl === '/auth/refresh' && upperMethod === 'POST') {
    const currentUser = getStorage<MockUser>('current_user', INITIAL_USERS[0]);
    const token = generateMockToken(currentUser.username, currentUser.email);
    return {
      status: 200,
      data: {
        access_token: token,
        token: token,
        expires_at: Date.now() + 15 * 60 * 1000
      }
    };
  }

  if (cleanUrl === '/user/me' && upperMethod === 'GET') {
    const currentUser = getStorage<MockUser>('current_user', INITIAL_USERS[0]);
    return {
      status: 200,
      data: currentUser
    };
  }

  // DASHBOARD ENDPOINTS
  if (cleanUrl === '/dashboard/stats' && upperMethod === 'GET') {
    const tests = getStorage('tests', INITIAL_TESTS);
    return {
      status: 200,
      data: {
        securityTests: tests.length,
        activeAlerts: 3,
        modelsMonitored: 8,
        complianceScore: 94
      }
    };
  }

  if (cleanUrl === '/dashboard/chart-data' && upperMethod === 'GET') {
    return {
      status: 200,
      data: {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        tests: [12, 19, 15, 25, 22, 30, 28],
        alerts: [2, 3, 1, 4, 2, 5, 3]
      }
    };
  }

  if (cleanUrl === '/dashboard/recent-activity' && upperMethod === 'GET') {
    const activities = getStorage('activities', INITIAL_ACTIVITIES);
    return {
      status: 200,
      data: {
        activities: activities.slice(0, 10)
      }
    };
  }

  if (cleanUrl === '/dashboard/vulnerability-trend' && upperMethod === 'GET') {
    return {
      status: 200,
      data: [
        { date: "2026-08-26", status: "Critical", count: 2 },
        { date: "2026-08-26", status: "Medium", count: 5 },
        { date: "2026-08-27", status: "Critical", count: 1 },
        { date: "2026-08-27", status: "Low", count: 8 },
        { date: "2026-08-28", status: "Medium", count: 4 },
        { date: "2026-08-29", status: "High", count: 3 },
        { date: "2026-08-30", status: "Low", count: 12 },
        { date: "2026-08-31", status: "Critical", count: 1 },
        { date: "2026-09-01", status: "Low", count: 15 }
      ]
    };
  }

  // RED TEAM ENDPOINTS
  if (cleanUrl === '/redteam/tests' && upperMethod === 'GET') {
    const tests = getStorage('tests', INITIAL_TESTS);
    return {
      status: 200,
      data: {
        tests: tests,
        total: tests.length
      }
    };
  }

  if (cleanUrl === '/redteam/test' && upperMethod === 'POST') {
    const tests = getStorage<any[]>('tests', INITIAL_TESTS);
    const newTest = {
      id: Date.now(),
      test_name: data.test_name || "New Security Evaluation",
      test_type: data.test_type || "Prompt Injection",
      target_system: data.target_system || "GPT-4o",
      status: "running",
      created_at: new Date().toISOString(),
      results: null
    };

    tests.unshift(newTest);
    setStorage('tests', tests);

    // Auto-complete after 2 seconds
    setTimeout(() => {
      const current = getStorage<any[]>('tests', INITIAL_TESTS);
      const target = current.find(t => t.id === newTest.id);
      if (target) {
        target.status = "completed";
        target.completed_at = new Date().toISOString();
        target.results = {
          overall_score: 0.91,
          risk_level: "Low",
          tests_conducted: 30,
          attack_mode: "simulation",
          vulnerabilities_found: [
            {
              id: `VULN-${Math.floor(Math.random() * 900 + 100)}`,
              severity: "Low",
              type: "Surface Prompt Framing",
              description: "Mild tone divergence detected on adversarial jailbreak tokens."
            }
          ],
          recommendations: ["Ensure guardrail delimiters are anchored at endpoint interface."]
        };
        setStorage('tests', current);
      }
    }, 1500);

    return {
      status: 201,
      data: newTest
    };
  }

  if (cleanUrl.match(/^\/redteam\/test\/\d+\/run$/) && upperMethod === 'POST') {
    const id = parseInt(cleanUrl.split('/')[3]);
    const tests = getStorage<any[]>('tests', INITIAL_TESTS);
    const target = tests.find(t => t.id === id);
    if (target) {
      target.status = "completed";
      target.completed_at = new Date().toISOString();
      target.results = target.results || {
        overall_score: 0.95,
        risk_level: "Low",
        tests_conducted: 35,
        attack_mode: "simulation",
        vulnerabilities_found: [],
        recommendations: ["All adversarial bounds verified within compliance limits."]
      };
      setStorage('tests', tests);
    }
    return {
      status: 200,
      data: {
        message: "Test executed successfully",
        test: target,
        failure_email_dispatched: true,
        email_record: {
          recipient_email: "alokinfo30@gmail.com",
          subject: `Kavach AI Alert: Scan Test Completed for ${target?.target_system || 'Target'}`
        }
      }
    };
  }

  if (cleanUrl.match(/^\/redteam\/test\/\d+$/) && upperMethod === 'DELETE') {
    const id = parseInt(cleanUrl.split('/')[3]);
    const tests = getStorage<any[]>('tests', INITIAL_TESTS);
    const filtered = tests.filter(t => t.id !== id);
    setStorage('tests', filtered);
    return {
      status: 200,
      data: { message: "Test deleted successfully" }
    };
  }

  if (cleanUrl === '/redteam/tests/bulk-delete' && upperMethod === 'POST') {
    const { ids } = data || {};
    const tests = getStorage<any[]>('tests', INITIAL_TESTS);
    const filtered = tests.filter(t => !ids.includes(t.id));
    setStorage('tests', filtered);
    return {
      status: 200,
      data: { message: "Bulk deletion completed", deletedCount: ids?.length || 0 }
    };
  }

  if (cleanUrl === '/redteam/tests/bulk-run' && upperMethod === 'POST') {
    const { ids } = data || {};
    const tests = getStorage<any[]>('tests', INITIAL_TESTS);
    tests.forEach(t => {
      if (ids.includes(t.id)) {
        t.status = "completed";
        t.completed_at = new Date().toISOString();
      }
    });
    setStorage('tests', tests);
    return {
      status: 200,
      data: {
        message: `Executed ${ids.length} tests`,
        completedCount: ids.length,
        failure_emails_dispatched: ["alokinfo30@gmail.com"]
      }
    };
  }

  if (cleanUrl.includes('/send-failure-email') && upperMethod === 'POST') {
    return {
      status: 200,
      data: {
        message: "Failure report dispatched to alokinfo30@gmail.com",
        email: {
          recipient_email: "alokinfo30@gmail.com",
          sent_at: new Date().toISOString()
        }
      }
    };
  }

  // MONITORING ENDPOINTS
  if (cleanUrl === '/monitoring/drift' || cleanUrl === '/monitoring/metrics') {
    const drift = getStorage('drift', INITIAL_DRIFT);
    return {
      status: 200,
      data: {
        metrics: drift,
        total: drift.length
      }
    };
  }

  // REPORTS & EXPORTS
  if (cleanUrl.includes('/reports/compliance/json') || cleanUrl.includes('/reports/all/json') || cleanUrl.includes('/reports/redteam/json') || cleanUrl.includes('/reports/drift/json')) {
    const tests = getStorage('tests', INITIAL_TESTS);
    const drift = getStorage('drift', INITIAL_DRIFT);
    return {
      status: 200,
      data: {
        platform: "Kavach-AI",
        generated_at: new Date().toISOString(),
        auditor: "alokinfo30@gmail.com",
        compliance_score: "94.2%",
        tests_conducted: tests.length,
        red_team_scans: tests,
        drift_telemetry: drift
      }
    };
  }

  if (cleanUrl.includes('/reports/compliance/email')) {
    return {
      status: 200,
      data: { message: "Report successfully queued for email distribution to alokinfo30@gmail.com." }
    };
  }

  if (cleanUrl.includes('/reports/compliance/csv') || cleanUrl.includes('/reports/drift/csv')) {
    const csvContent = `ID,Type,Target,Score,Status,Date\n1,Prompt Injection,Llama-3-70B,0.94,Completed,2026-08-30\n2,Bias & Fairness,Claude-3.5,0.88,Completed,2026-08-29\n`;
    return {
      status: 200,
      data: csvContent
    };
  }

  // DEFAULT / CATCH-ALL FOR STATIC DEMO MODE
  return {
    status: 200,
    data: {
      status: "ok",
      message: "Static Demo Mock Response",
      timestamp: new Date().toISOString()
    }
  };
}
