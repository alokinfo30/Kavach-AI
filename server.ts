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
    cron_expression: "0 0 * * *",
    next_run: new Date(Date.now() + 3600000 * 8).toISOString()
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

// ================= API ROUTES =================

// Health check
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Auth Routes
app.post("/api/auth/login", (req: Request, res: Response) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username || u.email === username);
  if (!user || (user.passwordHash && user.passwordHash !== password && password !== "password")) {
    // If not matching and not demo password, allow default demo login for ease of testing
    if (username === "demo" || username === "admin") {
      const demoUser = users[0];
      return res.json({
        access_token: "mock-jwt-token-demo",
        user: { id: demoUser.id, username: demoUser.username, email: demoUser.email, company: demoUser.company, role: demoUser.role }
      });
    }
    return res.status(401).json({ error: "Invalid username or password" });
  }

  res.json({
    access_token: `mock-jwt-token-${user.id}`,
    user: { id: user.id, username: user.username, email: user.email, company: user.company, role: user.role }
  });
});

app.post("/api/auth/register", (req: Request, res: Response) => {
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
  res.status(201).json({ message: "Registration successful" });
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
      "Add automated post-generation PII scrubbing filters."
    ]
  };

  res.json({ message: "Test completed", results: test.results });
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
  const { test_name, test_type, target_system, cron_expression } = req.body;
  const newSchedule = {
    id: testSchedules.length + 1,
    test_name: test_name || "Automated Red Team",
    test_type: test_type || "Prompt Injection",
    target_system: target_system || "Production Model",
    cron_expression: cron_expression || "0 0 * * *",
    next_run: new Date(Date.now() + 3600000 * 24).toISOString()
  };
  testSchedules.push(newSchedule);
  res.status(201).json(newSchedule);
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

app.post("/api/reports/compliance/email", (_req: Request, res: Response) => {
  res.json({ message: "Report successfully queued for email distribution." });
});

// Settings Routes
app.get("/api/settings", (_req: Request, res: Response) => {
  res.json(platformSettings);
});

app.post("/api/settings", (req: Request, res: Response) => {
  platformSettings = { ...platformSettings, ...req.body };
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
