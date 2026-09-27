import { IncidentScenario } from './types';

export async function askOpsCopilot(
  question: string,
  scenario: IncidentScenario,
  chatHistory: { sender: string; content: string }[]
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  if (apiKey) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: `You are SentinelOps AI - an advanced Site Reliability Engineering (SRE) and Autonomous Incident Intelligence Copilot.
You have continuous visibility into the full software stack:
- Current Active Incident Scenario: ${scenario.title} (${scenario.category})
- System Context: ${scenario.systemContext}
- Failure Probability: ${scenario.prediction.probability}% (${scenario.prediction.riskLevel})
- Predicted Failure: ${scenario.prediction.predictedIncident}
- Estimated Time to Failure: ${Math.round(scenario.prediction.timeToFailureSec / 60)} minutes
- Culprit Service: ${scenario.rootCause.culpritService}
- Probable Root Cause: ${scenario.rootCause.probableRootCause}
- Culprit Commit: ${scenario.rootCause.culpritCommit?.hash} by ${scenario.rootCause.culpritCommit?.author}: "${scenario.rootCause.culpritCommit?.message}"
- Explainable Rationale: ${scenario.rootCause.explainableRationale}
- Database Status: Active Conns: ${scenario.database.activeConnections}/${scenario.database.maxConnections}, Waiting Threads: ${scenario.database.waitingThreads}, Deadlocks: ${scenario.database.deadlocks}
- Immediate Actions: ${scenario.remediation.immediateActions.map(a => `${a.title} (${a.command})`).join('; ')}

User's Question: "${question}"

Provide a concise, highly technical, actionable SRE response. Use Markdown formatting, terminal commands, or code snippets when helpful.`
                }
              ]
            }
          ]
        })
      });

      if (response.ok) {
        const data = await response.json();
        const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (candidate) return candidate;
      }
    } catch (e) {
      console.warn('Gemini API call failed, falling back to local SRE intelligence engine', e);
    }
  }

  // Intelligent Local SRE Copilot Engine
  const q = question.toLowerCase();
  
  if (q.includes('why') || q.includes('root cause') || q.includes('cause') || q.includes('culprit')) {
    return `### 🔍 Root Cause Analysis for **${scenario.title}**
**Probable Culprit:** \`${scenario.rootCause.culpritService}\` (Confidence: **${scenario.rootCause.confidence}%**)

**The Causal Chain:**
${scenario.rootCause.causalChain.map(c => `${c.step}. **[${c.layer}]** ${c.title}: ${c.detail}`).join('\n')}

**Cross-Stack Correlation Evidence:**
${scenario.rootCause.crossStackCorrelations.map(c => `- **${c.signalA}** ↔ **${c.signalB}** (r = \`${c.correlationCoefficient}\`): ${c.reasoning}`).join('\n')}

> **Key takeaway:** The issue was triggered by commit \`${scenario.rootCause.culpritCommit?.hash}\` (*"${scenario.rootCause.culpritCommit?.message}"*).`;
  }

  if (q.includes('fix') || q.includes('remediat') || q.includes('solve') || q.includes('rollback') || q.includes('action')) {
    const immediate = scenario.remediation.immediateActions.map(a => 
      `- **${a.title}** (${a.estimatedMitigationTime})\n  \`\`\`bash\n  ${a.command}\n  \`\`\`\n  *Impact:* ${a.impact}`
    ).join('\n\n');

    return `### ⚡ Actionable Remediation Plan

#### Phase 1: Immediate Mitigation
${immediate}

#### Phase 2: Permanent Code Patch
- **Target File:** \`${scenario.remediation.permanentPatch.filePath}\`
- **PR Title:** \`${scenario.remediation.permanentPatch.prTitle}\`
- **Explanation:** ${scenario.remediation.permanentPatch.explanation}`;
  }

  if (q.includes('predict') || q.includes('time') || q.includes('failure') || q.includes('risk') || q.includes('ttf')) {
    return `### ⏳ Predictive Failure Telemetry
- **Failure Risk:** **${scenario.prediction.probability}%** (${scenario.prediction.riskLevel} ALERT)
- **Forecasted Incident:** ${scenario.prediction.predictedIncident}
- **Time-to-Failure (TTF):** Approximately **${Math.round(scenario.prediction.timeToFailureSec / 60)} minutes** remaining before full outage
- **Primary Trigger:** ${scenario.prediction.primaryAnomalyTrigger}

**Early Warning Indicators:**
${scenario.prediction.earlyWarningSignals.map(s => `- ⚠️ ${s}`).join('\n')}`;
  }

  if (q.includes('db') || q.includes('database') || q.includes('query') || q.includes('sql') || q.includes('deadlock')) {
    return `### 🗄️ Database Telemetry Breakdown
- **Active Connections:** \`${scenario.database.activeConnections} / ${scenario.database.maxConnections}\` (${Math.round((scenario.database.activeConnections/scenario.database.maxConnections)*100)}% capacity)
- **Waiting Threads:** \`${scenario.database.waitingThreads}\` blocked
- **Slow Query Count:** \`${scenario.database.slowQueryCount}\` queries exceeding 1000ms SLA
- **Deadlock Cycles:** \`${scenario.database.deadlocks}\`
- **Top Offender Query:**
\`\`\`sql
${scenario.database.topOffenderQuery}
\`\`\``;
  }

  if (q.includes('commit') || q.includes('deploy') || q.includes('git') || q.includes('diff')) {
    return `### 📦 Correlated Deployment Event
- **Commit Hash:** \`${scenario.rootCause.culpritCommit?.hash}\`
- **Author:** \`${scenario.rootCause.culpritCommit?.author}\` (${scenario.rootCause.culpritCommit?.timestamp})
- **Commit Message:** "${scenario.rootCause.culpritCommit?.message}"
- **Risk Score:** **${scenario.rootCause.culpritCommit?.riskScore}/100**
- **Files Modified:** ${scenario.rootCause.culpritCommit?.changedFiles.map(f => `\`${f}\``).join(', ')}

**Diff Summary:**
\`\`\`diff
${scenario.rootCause.culpritCommit?.diffPreview}
\`\`\``;
  }

  // Default response
  return `### 🛡️ SentinelOps SRE Copilot Response
Regarding your query about **${scenario.title}**:

The platform continuously monitors the telemetry stream across infrastructure metrics, OpenTelemetry spans, and Git releases. Currently, \`${scenario.rootCause.culpritService}\` is showing **${scenario.prediction.probability}% probability of cascading failure** with **${Math.round(scenario.prediction.timeToFailureSec / 60)} minutes** until full exhaustion.

**Recommended next steps:**
1. Execute immediate mitigation: \`${scenario.remediation.immediateActions[0]?.command}\`
2. Inspect the correlated commit: \`${scenario.rootCause.culpritCommit?.hash}\` in \`${scenario.remediation.permanentPatch.filePath}\`
3. Review the auto-generated PR in the **Remediation & Patch** drawer.

*You can ask me questions like:*
- *"Why did this failure occur?"*
- *"Show me the database queries and lock status"*
- *"What is the rollback command?"*
- *"Explain the permanent code fix"*`;
}
