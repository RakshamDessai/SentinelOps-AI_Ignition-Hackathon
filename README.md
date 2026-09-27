# 🛡️ SentinelOps AI
### Continuous Cross-Stack Software Failure Prediction & Autonomous Root-Cause Intelligence Platform

> **Ignite 1% Hackathon Submission**  
> **Track:** Open Innovation AI  
> **Team:**  
> - 👑 **Kaartikeya** (Team Lead & Full-Stack Architect)  
> - ⚡ **Sneha** (Systems & Database Reliability Engineer)  
> - 🧠 **Krushna** (AI Telemetry & Anomaly Modeling Engineer)  
> - 🛠️ **Raksh** (DevOps & Distributed Systems Engineer)  
>  
> **Organized by:** Ignition in AI Era • Student Tech & Careers • NxtGenSec

---

## 📌 Executive Summary

Modern enterprise software systems are deeply distributed across Kubernetes clusters, database pools, asynchronous message queues, and external APIs. When incidents occur, teams waste hours triaging fragmented telemetry—logs, infrastructure metrics, APM traces, and Git commits are analyzed in independent silos.

**SentinelOps AI** changes the paradigm from **reactive post-mortems** to **continuous proactive prediction and self-healing**. 

By continuously ingesting and cross-correlating signals across the entire software stack, SentinelOps:
1. **Detects abnormal behavior before failure:** Forecasts catastrophic failures (database pool starvation, memory exhaustion, deadlocks) 10 to 30 minutes before SLO breaches using multi-variate anomaly regressors.
2. **Identifies cross-stack root causes:** Pinpoints the exact Git commit, unclosed JDBC statement, or thread pool configuration rather than just alerting on surface symptoms.
3. **Generates explainable, actionable remediations:** Provides 1-click immediate self-healing mitigation (traffic shedding, rollbacks, connection reaping) along with auto-generated GitHub pull requests containing side-by-side defensive code patches.

---

## 🚀 Key Features

### 1. ⏳ Proactive Failure Prediction & Time-to-Failure (TTF) Gauge
- Real-time Bayesian failure probability calculation (0–100%).
- Predictive countdown timer forecasting exactly when capacity buffers (heap memory, connection pools, threadpools) will breach limits.
- Proactive early warning indicators detected before user-facing error rates spike.

### 2. 🔗 Cross-Stack Signal Correlation Topology
- Visual dynamic dependency graph connecting all layers:
  `Git Deployment` ➔ `Microservice Application` ➔ `Kubernetes Infrastructure` ➔ `Database Connection Pool` ➔ `Client Ingress Gateway`.
- Calculates statistical cross-correlation (Pearson coefficient $r$) between disparate signals (e.g., commit rollout vs. HikariCP active connection slope).

### 3. 🧩 End-to-End Causal Chain & Explainable AI
- Step-by-step diagnostic breakdown showing how a code change propagated across the stack.
- Side-by-side Git commit diff highlighting the culprit code lines.
- Database activity inspector reporting slow queries, thread wait blocks, and deadlocks.

### 4. ⚡ Autonomous Self-Healing & Pull Request Generator
- **Phase 1 (Immediate Mitigation):** 1-click execution of automated failovers, GitOps rollbacks (`kubectl rollout undo`), or circuit-breaker tripping.
- **Phase 2 (Permanent Code Fix):** Generates ready-to-merge GitHub Pull Requests with side-by-side diffs (e.g., wrapping raw JDBC in `try-with-resources` or adding LRU TTL caches).
- **Phase 3 (Enterprise Post-Mortem):** Generates structured incident reports (P1-Critical) with business impact, recovery actions, and architectural safeguards.

### 5. 🧪 Interactive Incident Simulator & Custom Log Ingestion
- Pre-loaded enterprise incidents:
  - *Scenario 1:* PostgreSQL Pool Starvation & 504 Gateway Timeout (E-Commerce)
  - *Scenario 2:* Synchronous Webhook Timeout & Worker Thread Starvation (Fintech)
  - *Scenario 3:* Distributed Cache Memory Leak & Pod OOMCrashLoop (Healthcare)
  - *Scenario 4:* Distributed Saga Inconsistent Lock Order & Deadlock Cascade (Logistics)
- **Live Custom Ingestion:** Paste any raw application logs, stack traces, or metrics to run real-time failure prediction.

### 6. 🤖 Interactive SRE Ops Copilot
- Conversational SRE assistant powered by Google Gemini (with deterministic SRE fallback).
- Ask: *"Why did auth-service latency surge?"*, *"What is the rollback command?"*, *"Explain the permanent code fix"*.

---

## 🏗️ Architecture

```
                               ┌────────────────────────────────────────────────────────┐
                               │             SentinelOps AI Ingestion Bus               │
                               └──────────────────────────┬─────────────────────────────┘
                                                          │
          ┌───────────────────────┬───────────────────────┼────────────────────────┬──────────────────────┐
          ▼                       ▼                       ▼                        ▼                      ▼
    [Git Commits]           [OpenTelemetry]        [Infra Metrics]          [PostgreSQL]             [App Logs]
(Commit Diffs / PRs)     (Traces / Spans / p99)    (CPU / Mem / K8s)    (Pools / Locks / Deadlocks)   (Stdout / Stderr)
          │                       │                       │                        │                      │
          └───────────────────────┴───────────────────────┼────────────────────────┴──────────────────────┘
                                                          │
                                                          ▼
                                      ┌───────────────────────────────────────┐
                                      │   Cross-Stack Correlation Engine      │
                                      │   - Pearson Signal Cross-Correlation  │
                                      │   - Multi-Variate Anomaly Detector    │
                                      │   - Time-to-Failure (TTF) Regressor   │
                                      └───────────────────┬───────────────────┘
                                                          │
                                                          ▼
                                      ┌───────────────────────────────────────┐
                                      │     Automated Root-Cause Ranker       │
                                      │  & Autonomous Self-Healing Pipeline   │
                                      └───────────────────┬───────────────────┘
                                                          │
                                ┌─────────────────────────┴─────────────────────────┐
                                ▼                                                   ▼
                  ┌───────────────────────────┐                       ┌───────────────────────────┐
                  │ ⚡ 1-Click Cluster Healing │                       │ 🛠️ Permanent Git PR Patch  │
                  │ (Rollback / Traffic Shed) │                       │ (Automated Code Fix)      │
                  └───────────────────────────┘                       └───────────────────────────┘
```

---

## 💻 Tech Stack

- **Framework:** Next.js 14 (App Router), React 18, TypeScript
- **Styling & UI:** Tailwind CSS, Lucide Icons, Glassmorphism & Cyber Dark Mode
- **Charts & Topology:** Pure high-performance responsive SVG timeseries & interactive causal graph
- **AI & Copilot:** Google Gemini 1.5 Flash API + Local SRE Heuristic Intelligence Engine
- **DevOps & Verification:** Node.js 24, GitOps webhook simulation

---

## 🛠️ Getting Started Locally

### Prerequisites
- Node.js 18+ (tested on Node 24.16)
- npm or pnpm

### Installation
```bash
# Clone the repository
git clone https://github.com/kaartikeya/sentinel-ops-ai.git
cd sentinel-ops-ai

# Install dependencies
npm install

# (Optional) Add your Gemini API key for live LLM reasoning
# If omitted, SentinelOps seamlessly uses its built-in SRE heuristic intelligence engine!
echo "GEMINI_API_KEY=your_key_here" > .env.local

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🏆 Hackathon Project Presentation Guide

1. **Start at Dashboard:** Point out the **Ignite 1% Hackathon** banner and team credits (Kaartikeya, Sneha, Krushna, Raksh).
2. **Observe Failure Prediction:** Point out the **94% Failure Risk** and the **countdown timer to failure (09:00)** before any 504 outage occurred.
3. **Inspect the Topology:** Show the **Signal Correlation Graph** linking Git commit `7e8b31a` to Postgres connection pool saturation and ingress 504 timeouts ($r = 0.98$).
4. **View Root Cause & Code Diff:** Switch to the **Culprit Code Diff** tab to show the exact unclosed JDBC connection.
5. **Demonstrate 1-Click Self-Healing:** Click **⚡ Self-Heal Now**, execute the rollback, and watch the system transition to **System Stabilized (12% Nominal Risk)**!
6. **Show Permanent PR & Post-Mortem:** Inspect the auto-generated PR with the `try-with-resources` fix and export the Markdown post-mortem report.
7. **Ask Ops Copilot:** Open the SRE Copilot and ask *"Why did this failure occur?"* or *"What is the rollback command?"*.

---

*SentinelOps AI — Built with passion for the Ignite 1% Hackathon (Ignition in AI Era).*
