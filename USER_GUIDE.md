# Kavach-AI: Complete User Guide & Feature Manual

Welcome to **Kavach-AI**, an Enterprise Responsible AI (RAI) Operations and Security platform designed to stress-test, monitor, govern, and audit AI models against adversarial attacks, performance drift, and compliance risks.

---

## 🚀 1. Quick Start Guide for New Users

### Step 1: Account Registration
1. Navigate to `/register` (or `https://kavachbot.netlify.app/register`).
2. Enter your **Username**, **Email**, **Password**, and optional **Company Name**.
3. Click **Create an account**.
4. Upon successful registration, the **Interactive User Guide & Onboarding Tour** will automatically launch on your dashboard.

### Step 2: Key Navigation Hotkeys
- **Global Search**: `Ctrl + K` (or `Cmd + K`)
- **Open User Guide**: `Shift + G`
- **Shortcuts Cheatsheet**: `Shift + ?`
- **Jump to Dashboard**: `Ctrl + D`
- **Jump to Red Team**: `Alt + R`
- **Jump to Monitoring**: `Ctrl + M`

---

## 🛡️ 2. Platform Feature Walkthrough

### 1. Executive Dashboard (`/dashboard`)
The central command center for enterprise AI security posture:
- **Composite AI Risk Score (0-100)**: Real-time risk rating derived from vulnerability severity, attack exposure, and compliance adherence.
- **Backend & Database Status**: Live indicator tracking connectivity to PostgreSQL, MongoDB Atlas, and Redis.
- **Vulnerability Counters**: Summary of Critical, High, Medium, and Low severity findings across all registered models.
- **Live Telemetry & Activity Feed**: Real-time stream of model queries, security alerts, and system actions.

---

### 2. Adversarial AI Red Teaming (`/red-team`)
Stress-test your LLMs and foundation models against modern adversarial vectors:
- **Adversarial Attack Simulation**:
  - *Prompt Injection & System Prompt Extraction*
  - *Jailbreaking & Roleplay Bypass*
  - *Training Data Leakage & PII Extraction*
  - *Hallucination & Factual Drift*
  - *Toxicity, Bias & Harmful Output Scans*
- **Side-by-Side Test Comparison (`/red-team/compare`)**: Compare security test scores across multiple iterations or prompt versions.
- **Automated Scheduled Tests**: Configure recurring test intervals (hourly, daily, weekly) to prevent security regressions.
- **Download Test PDF**: Generate an audit-ready individual test report.

---

### 3. Real-Time Monitoring & Model Drift (`/monitoring`)
Continuous surveillance over models deployed in production:
- **Data Drift & Concept Drift Tracking**: Monitor statistical shifts in model input and output distributions over 7-day, 30-day, and 90-day windows.
- **Feature Distribution Analysis**: Identify specific feature distributions that have diverged from training baselines.
- **Active Security Alerts**: Receive instant notifications when anomalous prompts or drift thresholds are breached.
- **Performance Telemetry**: Monitor P95/P99 response latencies, throughput (requests/sec), and token usage.

---

### 4. AI Knowledge Base & Governance (`/knowledge`)
Centralize model documentation and regulatory compliance frameworks:
- **Model Inventory Registry**: Maintain exhaustive metadata, risk classifications, and maintainer details for all models.
- **Regulatory Framework Mapping**:
  - *EU AI Act (Transparency, High-Risk Assessment, Human Oversight)*
  - *NIST AI Risk Management Framework (Govern, Map, Measure, Manage)*
  - *OWASP Top 10 for LLMs & Generative AI*
- **Interactive Knowledge Graph**: Visual topology mapping relationships between models, datasets, vulnerability vectors, and compliance standards.

---

### 5. Audit & Compliance PDF Reports (`/reports`)
Produce documentation tailored for executives, auditors, and regulators:
- **Automated PDF Generation**: One-click generation of audit reports via ReportLab.
- **Comprehensive Audit Metrics**: Detailed scoring, vulnerability remediations, and compliance gap analysis.
- **Direct Email Dispatch**: Send compliance reports directly to legal and security teams.
- **Report History & Archive**: Download past reports anytime.

---

### 6. Activity Log & Audit Trail (`/activity-log`)
Enterprise governance with immutable traceability:
- **Full Action Logging**: Captures user IDs, timestamps, resource targets, and client IP addresses.
- **CSV Audit Export**: Export full activity logs with one click for external SIEM (Splunk, Datadog) ingestion.
- **Severity Filtering**: Filter events by `CRITICAL`, `WARNING`, `INFO`, and `SUCCESS`.

---

### 7. Profile & Enterprise Settings (`/settings` & `/profile`)
Customize your workspace:
- **API Key Management**: Securely configure and rotate OpenAI and external model provider keys.
- **Database & MongoDB Integrations**: Manage PostgreSQL connection strings and MongoDB Atlas telemetry clusters.
- **Alert Channels**: Configure email and webhook alert dispatch settings.
- **Theme Preferences**: Switch seamlessly between Light and Dark mode.

---

## 📱 3. Progressive Web App (PWA) & Mobile Installation
Kavach-AI is built as an offline-first PWA:
1. Visit `https://kavachbot.netlify.app/` on desktop or mobile.
2. Click the **Install App** button in the top navigation bar or the floating install banner.
3. Launch Kavach-AI directly from your home screen or desktop dock with offline asset support.
