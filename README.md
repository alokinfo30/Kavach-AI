# Kavach-AI: Enterprise Responsible AI (RAI) Operations & Security Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-indigo.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/Python-3.11%2B-blue.svg)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-18-cyan.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5-purple.svg)](https://vitejs.dev/)
[![Flask](https://img.shields.io/badge/Flask-3.0-green.svg)](https://flask.palletsprojects.com/)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-orange.svg)](https://kavachbot.netlify.app/)

> **Kavach-AI** is an all-in-one Enterprise Responsible AI (RAI) Operations, Security Testing, Model Drift Monitoring, and Regulatory Governance platform designed to safeguard LLMs, foundation models, and predictive ML systems across their entire lifecycle.

---

## 🌟 Why Kavach-AI? (The Importance of RAI Ops)

As enterprises rapidly deploy Large Language Models (LLMs) and Autonomous AI Agents into production, AI systems introduce severe new risk vectors:

1. **Adversarial & Security Threats**: LLMs are vulnerable to *Prompt Injection*, *Jailbreaking*, *System Prompt Extraction*, and *Training Data / PII Leaks*. Without continuous red teaming and active guardrails, attackers can bypass safety rules or exfiltrate private corporate data.
2. **Model Degradation & Silent Drift**: In production, input data distributions shift over time (*Data Drift*) and real-world relationships evolve (*Concept Drift*), causing hallucinations, inaccurate predictions, and silent system failures.
3. **Strict Global AI Regulations**: Mandates such as the **EU AI Act**, **NIST AI Risk Management Framework (AI RMF 1.0)**, **ISO/IEC 42001**, and **OWASP LLM Top 10** require organizations to maintain auditable proof of safety testing, model inventories, risk tiering, and human oversight.

**Kavach-AI bridges the gap between AI development and enterprise risk compliance**, giving security engineers, data scientists, and compliance officers a unified pane of glass to stress-test, monitor, govern, and audit AI deployments.

---

## 🛡️ Best Precautions & Mitigation Techniques Matrix

Kavach-AI goes beyond detecting vulnerabilities by dynamically generating tailored **Precautions & Defense Playbooks** for each security finding and audit report:

| Threat Vector | Recommended Precaution Technique | Category | Priority | Actionable Implementation Guide |
|:---|:---|:---|:---|:---|
| **Prompt Injection & Jailbreaks** | **Dual-LLM & Delimiter Sandwiching Guardrail** | Input Sanitization | `Immediate` | Wrap untrusted user inputs inside `<user_prompt>...</user_prompt>` XML tags and pass through an intent-classification guardrail model (Llama Guard / NeMo Guardrails) before execution. |
| **Prompt Injection & Jailbreaks** | **Instruction Hierarchy Enforcement** | Architecture Hardening | `High` | Enforce architectural priority where system-level constitutional policies strictly override runtime user context. |
| **Deepfakes & Synthetic Media** | **Cryptographic C2PA Watermarking** | Content Integrity | `Immediate` | Embed tamper-evident cryptographic provenance signatures (C2PA standard) into generated media at synthesis time. |
| **Deepfakes & Synthetic Media** | **Multi-Modal Liveness Verification** | Access Control | `High` | Deploy interactive challenge-response protocols and 3D facial mesh checks to block synthetic identity spoofing. |
| **Training Data Poisoning** | **Influence Function & Outlier Cleansing** | Data Governance | `Immediate` | Compute sample influence functions and Cook's distance across training batches to isolate and purge poisoned data points. |
| **Training Data Poisoning** | **Cryptographic Data Lineage Checksums** | Supply Chain Security | `High` | Enforce SHA-256 content addressing and verified supplier signing on all external training corpora before ingestion. |
| **Model Parameter Extraction** | **Projected Gradient Descent (PGD) Hardening** | Model Robustness | `Immediate` | Augment training batches with worst-case adversarial perturbations computed via multi-step PGD. |
| **Model Parameter Extraction** | **Differential Privacy & Logit Vector Masking** | Extraction Defense | `High` | Mask full confidence logit vectors from public API endpoints and enforce strict query rate budgets. |
| **PII Leakage & Hallucinations** | **Real-Time PII Scrubbing (Microsoft Presidio)** | Data Sanitization | `Immediate` | Intercept and redact Social Security numbers, API keys, passwords, and private tokens before model invocation. |
| **Model Drift & Degradation** | **Continuous PSI Telemetry & Automated Retraining** | Continuous Auditing | `High` | Compute Population Stability Index (PSI) and trigger automated alerts/canary rollbacks when PSI exceeds 0.25. |

---

## 🚀 Key Features

### 1. 🛡️ Adversarial AI Red Teaming & Attack Simulation
- **Multi-Vector Threat Testing**: Stress-test models against Prompt Injection, Jailbreak Bypass, System Prompt Extraction, Hallucinations, Toxicity, and Training Data Leakage.
- **Dynamic Precaution Engine**: Automatically pairs every vulnerability with prioritized remediation techniques and code playbooks.
- **Side-by-Side Test Comparison Matrix (`/red-team/compare`)**: Compare test runs across different models, prompt iterations, and safety guardrails to evaluate regression risks.
- **Automated Scheduled Audits**: Configure recurring automated security scans (Hourly, Daily, Weekly) with customizable alert thresholds.
- **Granular Test Audit Reports**: Generate and download individual test run audit reports in PDF format.

### 2. 📊 Executive Dashboard & Risk Posture
- **Composite AI Risk Score (0–100)**: Real-time risk metric synthesized from vulnerability severity, attack exposure, and compliance coverage.
- **Live Database & Service Health Monitoring**: Real-time status tracker for PostgreSQL, MongoDB Atlas, and Redis connectivity.
- **Vulnerability Triage Counters**: Real-time tracking of Critical, High, Medium, and Low severity issues across all registered models.

### 3. 📈 Real-Time Model Monitoring & Drift Detection
- **Statistical Drift Analysis**: Track Data Drift, Concept Drift, and Feature Distribution shifts over 7-day, 30-day, and 90-day timeframes.
- **Interactive Telemetry Graphs (Recharts)**: P50, P95, and P99 response latencies, throughput (requests/sec), and token consumption.
- **Automated Incident Alerting**: Trigger real-time anomaly alerts with configurable sensitivity thresholds.

### 4. 📚 AI Governance & Safety Knowledge Base
- **Central Model Inventory Registry**: Track model metadata, risk classifications, owners, training datasets, and maintainers.
- **Regulatory Framework Mapping**: Map models directly against:
  - **EU AI Act** (Transparency, High-Risk Assessment, Human Oversight)
  - **NIST AI RMF** (Govern, Map, Measure, Manage)
  - **OWASP Top 10 for LLMs & Generative AI**
- **Interactive Knowledge Graph**: Visual node-link topology mapping relationships between models, vulnerability surfaces, datasets, and compliance requirements.

### 5. 📑 Audit-Ready PDF & CSV Compliance Reports
- **Executive & Technical Report Generation**: One-click generation of formal compliance audit reports using ReportLab with embedded precaution recommendations.
- **Email Dispatch**: Direct dispatch of compliance summaries to security and legal teams.
- **Report History Archive**: Complete repository of past audit reports with instant re-download.

### 6. 📝 Immutable Activity Log & SIEM Audit Trail
- **End-to-End Traceability**: Captures user IDs, timestamps, affected resources, and client IP addresses.
- **One-Click CSV Export**: Export complete activity history for ingestion into SIEM tools (Splunk, Datadog, Elastic).

### 7. 🧭 Interactive User Guide & Onboarding Tour
- **Automated New User Walkthrough**: 7-step guided tour launching automatically upon new user registration.
- **Quick-Start Checklist**: Interactive progress checklist guiding users to run their first test, inspect drift, and generate compliance reports.
- **Cheat Sheet Reference**: Always accessible via top navigation, sidebar, or pressing `Shift + G`.

### 8. 📱 Progressive Web App (PWA) & Offline Capabilities
- **Desktop & Mobile Installable**: Install Kavach-AI as a native desktop or mobile application.
- **Service Worker Offline Caching**: Seamlessly caches static assets for offline operational resilience.
- **PWA Install Banner**: Custom install prompt across login and dashboard screens.

---

## ⚡ Global Keyboard Shortcuts

| Shortcut | Description | Destination |
|:---|:---|:---|
| `Ctrl + K` / `Cmd + K` | Global Quick Search & Command Palette | Search Across App |
| `Shift + G` | Open Interactive User Guide & Tour | User Guide Modal |
| `Shift + ?` | Open Keyboard Shortcuts Cheat Sheet | Shortcuts Modal |
| `Ctrl + D` | Jump to Executive Dashboard | `/dashboard` |
| `Alt + R` | Jump to Adversarial Red Team Lab | `/red-team` |
| `Ctrl + M` | Jump to Real-Time Drift Monitoring | `/monitoring` |
| `Ctrl + B` | Jump to Knowledge Base & Graph | `/knowledge` |
| `Ctrl + P` | Jump to Compliance PDF Reports | `/reports` |

---

## 🛠️ Local Development & Quick Start

### Prerequisites
- **Python 3.10+**
- **Node.js 18+**
- **PostgreSQL** or **SQLite** (local default)
- **MongoDB Atlas Connection URI** (Optional for local telemetry)

### 1. Clone Repository
```bash
git clone https://github.com/alokinfo30/Kavach-AI.git
cd Kavach-AI
```

### 2. Configure Environment Variables
Create a `.env` file in the project root:
```env
FLASK_ENV=development
SECRET_KEY=your-secure-secret-key
JWT_SECRET_KEY=your-secure-jwt-key
DATABASE_URL=sqlite:///rai_ops_dev.db
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/?appName=Cluster0
OPENAI_API_KEY=sk-... # Optional (Simulated mode active if not provided)
VITE_API_URL=http://localhost:5000
```

### 3. Run Backend (Flask)
```bash
# Set up virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r backend/requirements.txt

# Start backend server
python start_dev.py
```

### 4. Run Frontend (React + Vite)
```bash
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173` and the backend API at `http://localhost:5000`.

---

## 🚢 Production Deployment

### 1. Backend (Render / Docker)
The application includes a production-ready multi-stage `Dockerfile`:
- **Builder Stage**: `node:20-slim` builds frontend assets.
- **Production Stage**: `python:3.11-slim` runs Gunicorn with multi-threaded workers.

```bash
docker build -t kavach-ai .
docker run -p 8000:8000 --env-file .env kavach-ai
```

### 2. Frontend (Netlify)
- **Build Command**: `npm run build`
- **Publish Directory**: `dist`
- **Environment Variable**: `VITE_API_URL=https://<your-render-backend-url>.onrender.com`

---

## 📋 REST API Endpoints Overview

### Authentication & Users
- `POST /api/auth/register` — Create new user account
- `POST /api/auth/login` — Authenticate user and receive JWT access token
- `POST /api/auth/refresh` — Refresh expired access token
- `GET /api/auth/profile` — Fetch current user profile

### Red Teaming, Testing & Precautions
- `POST /api/redteam/test` — Execute single adversarial test (returns vulnerabilities and recommended precaution techniques)
- `GET /api/redteam/history` — Retrieve test execution history with precautions
- `GET /api/redteam/scheduled` — List automated scheduled tests
- `POST /api/redteam/schedule` — Create new scheduled recurring test
- `POST /api/redteam/scheduled/<id>/run` — Trigger immediate test execution

### Monitoring & Drift
- `GET /api/monitoring/drift` — Retrieve data and concept drift metrics
- `GET /api/monitoring/alerts` — Fetch active security & threshold alerts
- `POST /api/monitoring/alerts/resolve` — Acknowledge/resolve alerts

### Governance & Knowledge
- `GET /api/knowledge/models` — List registered AI models and risk tiers
- `GET /api/knowledge/graph` — Retrieve safety knowledge graph topology
- `GET /api/knowledge/compliance` — Fetch compliance framework checklist

### Compliance & Reports
- `GET /api/reports/list` — List generated compliance reports
- `POST /api/reports/generate` — Generate new audit PDF report with mitigation playbooks
- `GET /api/reports/<id>/download` — Download report PDF
- `GET /health` — Diagnostic health check (PostgreSQL, MongoDB, Redis)

---

## 📄 License
This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.
