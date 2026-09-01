// Comprehensive Mock Fallback Engine for Static Deployments (e.g., Netlify, Vercel, GitHub Pages)
// Automatically handles API endpoints when a separate backend is not present or returns 404/network errors.

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
  try {
    const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const expTime = Math.floor(Date.now() / 1000) + 24 * 60 * 60; // 24 hours
    const payload = btoa(JSON.stringify({
      sub: 1,
      id: 1,
      username: username || "demo",
      email: email || "demo@kavach.ai",
      role: "admin",
      exp: expTime,
      iat: Math.floor(Date.now() / 1000)
    }));
    const signature = btoa("kavach_ai_mock_signature");
    return `${header}.${payload}.${signature}`;
  } catch {
    return `mock_jwt_token_${Date.now()}`;
  }
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
    user_id: 1,
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
    user_id: 1,
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
    user_id: 1,
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
    user_id: 1,
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
    user_id: 1,
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

const INITIAL_MODEL_ENDPOINTS = [
  {
    id: "ep-llama3-prod",
    name: "Llama 3 70B Instruct Production",
    model_identifier: "meta-llama/Meta-Llama-3-70B-Instruct",
    provider: "AWS Bedrock / Dedicated Cluster",
    type: "Text Generation & Reasoning",
    endpoint_url: "https://bedrock-runtime.us-east-1.amazonaws.com/model/llama3-70b",
    region: "us-east-1 (N. Virginia)",
    status: "healthy",
    uptime_pct: 99.98,
    latency_ms: 142,
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
  // Robust URL cleaner
  let cleanUrl = url
    .replace(/^https?:\/\/[^\/]+/, '') // strip hostname
    .split('?')[0]; // strip query parameters
  
  if (cleanUrl.startsWith('/api/')) {
    cleanUrl = cleanUrl.substring(4);
  } else if (cleanUrl === '/api') {
    cleanUrl = '/';
  }

  if (!cleanUrl.startsWith('/')) {
    cleanUrl = '/' + cleanUrl;
  }

  const upperMethod = method.toUpperCase();

  // HEALTH & DIAGNOSTICS ENDPOINTS
  if ((cleanUrl === '/health' || cleanUrl === '/status') && upperMethod === 'GET') {
    const tests = getStorage('tests', INITIAL_TESTS);
    return {
      status: 200,
      data: {
        status: "healthy",
        service: "Kavach-AI Core Governance Engine",
        environment: "client_edge_fallback",
        version: "1.0.0",
        uptime_seconds: Math.floor((Date.now() - 1756700000000) / 1000) % 86400 + 3600,
        uptime_human: "4h 12m 35s",
        timestamp: new Date().toISOString(),
        node_version: "v20.15.0",
        memory: {
          heapUsedMB: 48.2,
          heapTotalMB: 76.5,
          rssMB: 118.0
        },
        components: {
          api_gateway: "operational",
          auth_service: "operational",
          database: "operational (local storage backed)",
          redteam_scanner: "operational",
          drift_telemetry: "operational",
          email_dispatcher: "operational"
        },
        active_sessions: 1,
        monitored_models: INITIAL_MODEL_ENDPOINTS.length,
        completed_scans: tests.length,
        connectivity: {
          mode: "client_edge_fallback",
          ping_latency_ms: Math.floor(Math.random() * 8 + 4),
          note: "Connected via Kavach Intelligent Edge Simulation"
        }
      }
    };
  }

  // MODEL HEALTH SURVEILLANCE ENDPOINTS
  if (cleanUrl === '/models/health' && upperMethod === 'GET') {
    const endpoints = getStorage('model_endpoints', INITIAL_MODEL_ENDPOINTS);
    const healthyCount = endpoints.filter((e: any) => e.status === 'healthy').length;
    const degradedCount = endpoints.filter((e: any) => e.status === 'degraded').length;
    const downCount = endpoints.filter((e: any) => e.status === 'down').length;
    const avgLatency = Math.round(endpoints.reduce((acc: number, cur: any) => acc + cur.latency_ms, 0) / (endpoints.length || 1));

    return {
      status: 200,
      data: {
        endpoints,
        summary: {
          overall_status: downCount > 0 ? 'critical' : degradedCount > 0 ? 'degraded' : 'operational',
          aggregate_uptime: 99.94,
          avg_latency_ms: avgLatency,
          total_endpoints: endpoints.length,
          healthy_count: healthyCount,
          degraded_count: degradedCount,
          down_count: downCount,
          last_probed_at: new Date().toISOString()
        }
      }
    };
  }

  if (cleanUrl === '/models/health/probe' && upperMethod === 'POST') {
    const endpoints = getStorage<any[]>('model_endpoints', INITIAL_MODEL_ENDPOINTS);
    endpoints.forEach(ep => {
      ep.last_checked = new Date().toISOString();
      ep.latency_ms = Math.round(ep.latency_ms * (0.95 + Math.random() * 0.1));
    });
    setStorage('model_endpoints', endpoints);
    const avgLatency = Math.round(endpoints.reduce((acc: number, cur: any) => acc + cur.latency_ms, 0) / (endpoints.length || 1));

    return {
      status: 200,
      data: {
        message: "All model health probes refreshed",
        endpoints,
        summary: {
          overall_status: 'operational',
          aggregate_uptime: 99.95,
          avg_latency_ms: avgLatency,
          total_endpoints: endpoints.length,
          healthy_count: endpoints.length - 1,
          degraded_count: 1,
          down_count: 0,
          last_probed_at: new Date().toISOString()
        }
      }
    };
  }

  if (cleanUrl.match(/^\/models\/health\/probe\/[a-zA-Z0-9_-]+$/) && upperMethod === 'POST') {
    const id = cleanUrl.split('/')[4];
    const endpoints = getStorage<any[]>('model_endpoints', INITIAL_MODEL_ENDPOINTS);
    const target = endpoints.find(e => e.id === id);
    if (target) {
      target.last_checked = new Date().toISOString();
      target.latency_ms = Math.round(target.latency_ms * (0.92 + Math.random() * 0.15));
      setStorage('model_endpoints', endpoints);
    }
    return {
      status: 200,
      data: {
        message: `Endpoint ${id} probed successfully`,
        endpoint: target
      }
    };
  }

  // AUTH ENDPOINTS
  if (cleanUrl === '/auth/login' && upperMethod === 'POST') {
    const { username, password } = data || {};
    const users = getStorage<MockUser[]>('users', INITIAL_USERS);
    const existing = users.find(u => u.username === username || u.email === username);

    const userToLogin = existing || {
      id: 1,
      username: username || "demo",
      email: username && username.includes('@') ? username : `${username || "demo"}@kavach.ai`,
      role: "admin",
      company: "Kavach-AI Enterprise",
      created_at: new Date().toISOString()
    };

    const token = generateMockToken(userToLogin.username, userToLogin.email);
    setStorage('current_user', userToLogin);
    localStorage.setItem('token', token);

    return {
      status: 200,
      data: {
        message: "Login successful (Edge Session)",
        access_token: token,
        token: token,
        expires_in: 15 * 60,
        expires_at: Date.now() + 15 * 60 * 1000,
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
    localStorage.setItem('token', token);

    return {
      status: 201,
      data: {
        message: "User registered successfully",
        access_token: token,
        token: token,
        expires_in: 15 * 60,
        expires_at: Date.now() + 15 * 60 * 1000,
        user: newUser
      }
    };
  }

  if (cleanUrl === '/auth/refresh' && upperMethod === 'POST') {
    const currentUser = getStorage<MockUser>('current_user', INITIAL_USERS[0]);
    const token = generateMockToken(currentUser.username, currentUser.email);
    localStorage.setItem('token', token);
    return {
      status: 200,
      data: {
        access_token: token,
        token: token,
        expires_in: 15 * 60,
        expires_at: Date.now() + 15 * 60 * 1000,
        message: "Session extended successfully",
        user: currentUser
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
        modelsMonitored: 5,
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
      user_id: 1,
      test_name: data?.test_name || "New Security Evaluation",
      test_type: data?.test_type || "Prompt Injection",
      target_system: data?.target_system || "GPT-4o",
      status: "running",
      created_at: new Date().toISOString(),
      results: null
    };

    tests.unshift(newTest);
    setStorage('tests', tests);

    // Auto-complete after brief simulation
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
    const id = parseInt(cleanUrl.split('/')[3], 10);
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
    const id = parseInt(cleanUrl.split('/')[3], 10);
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
    const filtered = tests.filter(t => !ids?.includes(t.id));
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
      if (ids?.includes(t.id)) {
        t.status = "completed";
        t.completed_at = new Date().toISOString();
      }
    });
    setStorage('tests', tests);
    return {
      status: 200,
      data: {
        message: `Executed ${ids?.length || 0} tests`,
        completedCount: ids?.length || 0,
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
