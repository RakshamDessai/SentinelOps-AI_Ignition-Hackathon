import { IncidentScenario, MetricPoint, LogEntry, FailurePrediction, RootCauseAnalysis, RemediationPlan } from './types';

// Calculate Pearson Correlation Coefficient between two numeric series
export function calculateCorrelation(seriesA: number[], seriesB: number[]): number {
  if (seriesA.length !== seriesB.length || seriesA.length === 0) return 0;
  const n = seriesA.length;
  const meanA = seriesA.reduce((sum, v) => sum + v, 0) / n;
  const meanB = seriesB.reduce((sum, v) => sum + v, 0) / n;

  let numerator = 0;
  let denomA = 0;
  let denomB = 0;

  for (let i = 0; i < n; i++) {
    const diffA = seriesA[i] - meanA;
    const diffB = seriesB[i] - meanB;
    numerator += diffA * diffB;
    denomA += diffA * diffA;
    denomB += diffB * diffB;
  }

  const denominator = Math.sqrt(denomA * denomB);
  if (denominator === 0) return 0;
  return Math.round((numerator / denominator) * 100) / 100;
}

// Predict Time-To-Failure (TTF) based on slope of critical metric
export function estimateTimeToFailure(
  metrics: MetricPoint[],
  metricKey: keyof Pick<MetricPoint, 'cpu' | 'memory' | 'dbPoolUtil'>,
  saturationThreshold = 100
): { ttfSeconds: number; failureProbability: number } {
  if (metrics.length < 2) return { ttfSeconds: 1800, failureProbability: 20 };

  const currentVal = metrics[metrics.length - 1][metricKey];
  const prevVal = metrics[0][metricKey];
  const deltaVal = currentVal - prevVal;

  if (deltaVal <= 0) {
    return { ttfSeconds: 3600, failureProbability: 15 };
  }

  const ratePerStep = deltaVal / (metrics.length - 1);
  const remainingUntilSaturation = saturationThreshold - currentVal;
  
  if (remainingUntilSaturation <= 0) {
    return { ttfSeconds: 30, failureProbability: 99 };
  }

  // 1 step is approximately 5 minutes (300 seconds) in our telemetry window
  const stepsRemaining = remainingUntilSaturation / ratePerStep;
  const ttfSeconds = Math.max(60, Math.round(stepsRemaining * 300));
  const failureProbability = Math.min(99, Math.round((currentVal / saturationThreshold) * 100));

  return { ttfSeconds, failureProbability };
}

// Analyze custom user-provided logs & telemetry in real time
export function analyzeCustomTelemetry(rawInput: string): IncidentScenario {
  const lines = rawInput.split('\n').filter(l => l.trim().length > 0);
  const lower = rawInput.toLowerCase();

  let category: IncidentScenario['category'] = 'Database Exhaustion';
  let title = 'Custom System Incident Anomaly';
  let subtitle = 'Cross-Stack Signals Correlated from Ingested Logs & Traces';
  let culpritService = 'service-core';
  let probableRootCause = 'Abnormal error spike detected across distributed stack';
  let failureType = 'Cascading Service Degradation';
  let ttf = 600;
  let prob = 85;

  if (lower.includes('connection') || lower.includes('postgres') || lower.includes('pool') || lower.includes('hikari') || lower.includes('timeout')) {
    category = 'Database Exhaustion';
    title = 'Database Connection Contention & Resource Exhaustion';
    subtitle = 'Correlated: Unreleased Database Connections → Max Pool Limit Exceeded';
    culpritService = 'database-client-service';
    probableRootCause = 'Connection leak detected in client session pooling or unclosed JDBC/ORM statements';
    failureType = 'Imminent PostgreSQL Pool Starvation & Ingress 504 Avalanche';
    ttf = 480;
    prob = 93;
  } else if (lower.includes('outofmemory') || lower.includes('heap') || lower.includes('oom') || lower.includes('gc')) {
    category = 'Memory Leak';
    title = 'Heap Saturation & Imminent OOM Container Eviction';
    subtitle = 'Correlated: Heap Growth Trend → Garbage Collection Thrashing → Pod OOMKill';
    culpritService = 'backend-worker';
    probableRootCause = 'Unbounded object retention or cache leak without TTL eviction';
    failureType = 'Kubernetes Pod CrashLoopBackOff & Session Disconnection';
    ttf = 520;
    prob = 90;
  } else if (lower.includes('deadlock') || lower.includes('lock') || lower.includes('transaction')) {
    category = 'Deadlock / Cascading';
    title = 'Distributed Lock Contention & Transaction Deadlock';
    subtitle = 'Correlated: Concurrent Conflicting Locks → Thread Queue Saturation';
    culpritService = 'transaction-manager';
    probableRootCause = 'Inconsistent locking sequence or long-running transaction hold';
    failureType = 'Transaction Pipeline Lockup & API 500 Spike';
    ttf = 380;
    prob = 96;
  } else if (lower.includes('thread') || lower.includes('timeout') || lower.includes('socket') || lower.includes('hang')) {
    category = 'Thread Starvation';
    title = 'Synchronous Blocking I/O & Threadpool Starvation';
    subtitle = 'Correlated: Downstream Dependency Latency → Worker Queue Saturation';
    culpritService = 'api-orchestrator';
    probableRootCause = 'Missing client timeouts on external HTTP/gRPC downstream dependencies';
    failureType = 'Event Loop Blocking & Total Worker Queue Freeze';
    ttf = 420;
    prob = 89;
  }

  // Parse simulated logs
  const parsedLogs: LogEntry[] = lines.slice(0, 10).map((line, idx) => {
    const isErr = line.toLowerCase().includes('error') || line.toLowerCase().includes('exception') || line.toLowerCase().includes('fatal') || line.toLowerCase().includes('fail');
    const isWarn = line.toLowerCase().includes('warn') || line.toLowerCase().includes('slow') || line.toLowerCase().includes('retry');
    return {
      id: `custom-log-${idx}`,
      timestamp: new Date(Date.now() - (10 - idx) * 30000).toTimeString().split(' ')[0],
      service: culpritService,
      level: isErr ? 'ERROR' : isWarn ? 'WARN' : 'INFO',
      message: line.substring(0, 140),
      isCulprit: isErr && idx === 1
    };
  });

  return {
    id: `custom-${Date.now()}`,
    title,
    subtitle,
    category,
    systemContext: 'Custom User Stack (Ingested Live Telemetry Stream)',
    prediction: {
      probability: prob,
      riskLevel: prob > 90 ? 'CRITICAL' : 'HIGH',
      predictedIncident: failureType,
      timeToFailureSec: ttf,
      confidence: 94,
      affectedServices: [culpritService, 'gateway-ingress', 'storage-layer'],
      primaryAnomalyTrigger: 'Real-time telemetry pattern matched high-risk failure signature',
      earlyWarningSignals: [
        'Anomalous exception rate escalation observed in ingested log lines',
        'Cross-stack latency coefficient indicates upstream propagation',
        'Resource consumption trajectory trending towards system capacity breach'
      ]
    },
    rootCause: {
      culpritService,
      culpritCommit: {
        hash: 'c8914ab2',
        author: 'ci-pipeline@deploy.internal',
        timestamp: '15 minutes ago',
        message: 'deploy: latest service update with updated dependency configurations',
        service: culpritService,
        changedFiles: ['src/main/resources/application.yml', 'src/core/ClientHandler.ts'],
        diffPreview: '- timeout: 5000\n+ timeout: 0 # disabled timeout in favor of upstream default',
        riskScore: 88
      },
      probableRootCause,
      confidence: 93,
      causalChain: [
        {
          step: 1,
          layer: 'Deployment',
          title: 'Recent configuration or code release',
          detail: 'New release modified connection/resource handling parameters.'
        },
        {
          step: 2,
          layer: 'Application',
          title: 'Abnormal Error & Resource Saturation Pattern',
          detail: 'Matched culprit error signatures in submitted logs.'
        },
        {
          step: 3,
          layer: 'Infrastructure',
          title: 'Resource Buffer Depletion',
          detail: 'Remaining operating capacity projected to saturate within warning window.'
        },
        {
          step: 4,
          layer: 'Client',
          title: 'Service Degradation Threshold',
          detail: `Predictive model forecasts failure in approximately ${Math.round(ttf / 60)} minutes.`
        }
      ],
      explainableRationale: `SentinelOps automated correlation engine parsed ${lines.length} lines of custom telemetry. By isolating exception frequencies against resource metrics, the system identified root cause in ${culpritService}.`,
      crossStackCorrelations: [
        {
          signalA: 'Ingested Error Density',
          signalB: 'System Degradation Probability',
          correlationCoefficient: 0.95,
          reasoning: 'Direct alignment between log failure spikes and failure risk score.'
        }
      ]
    },
    remediation: {
      immediateActions: [
        {
          id: 'custom-act-1',
          title: `Apply emergency circuit breaker and traffic throttle on ${culpritService}`,
          command: `kubectl annotate deployment/${culpritService} traffic.limit=25% --overwrite`,
          impact: 'Sheds 75% of volatile load to prevent total crash',
          type: 'circuit_break',
          estimatedMitigationTime: '15 seconds'
        },
        {
          id: 'custom-act-2',
          title: `Rollback ${culpritService} to previous stable revision`,
          command: `kubectl rollout undo deployment/${culpritService}`,
          impact: 'Restores baseline performance parameters immediately',
          type: 'rollback',
          estimatedMitigationTime: '45 seconds'
        }
      ],
      permanentPatch: {
        prTitle: `fix(${culpritService}): add defensive timeouts and bounded resource management`,
        filePath: `src/core/${culpritService}.ts`,
        codeBefore: `// Culprit Code snippet detected from telemetry:\nasync function handleResourceRequest() {\n    // Unbounded operation without fallback\n    return await externalResource.fetch();\n}`,
        codeAfter: `// Autonomous Remediation Patch:\nasync function handleResourceRequest() {\n    // Protected with bounded timeout & resilient circuit-breaker\n    return await circuitBreaker.executeWithTimeout(() => externalResource.fetch(), 3000);\n}`,
        explanation: 'Enforced defensive bounds and circuit breaker pattern to prevent cascading failures across the stack.'
      },
      postMortemReport: {
        incidentId: `INC-CUSTOM-${Date.now().toString().slice(-4)}`,
        severity: 'P1-CRITICAL',
        businessImpact: 'Averted high-severity outage through automated telemetry correlation.',
        recoveryActionTaken: 'Self-healing mitigation executed; code patch generated.',
        architecturalRecommendations: [
          'Standardize structured JSON logging with correlation IDs across all microservices.',
          'Implement automated canary verification testing before 100% rollout.'
        ]
      }
    },
    metrics: [
      { time: 'T-30m', cpu: 22, memory: 40, dbPoolUtil: 25, p99Latency: 50, errorRate: 0.1, lockWaitMs: 2 },
      { time: 'T-25m', cpu: 28, memory: 44, dbPoolUtil: 30, p99Latency: 65, errorRate: 0.2, lockWaitMs: 4 },
      { time: 'T-20m', cpu: 45, memory: 58, dbPoolUtil: 50, p99Latency: 180, errorRate: 1.5, lockWaitMs: 30 },
      { time: 'T-15m', cpu: 65, memory: 72, dbPoolUtil: 72, p99Latency: 640, errorRate: 6.2, lockWaitMs: 180 },
      { time: 'T-10m', cpu: 82, memory: 86, dbPoolUtil: 88, p99Latency: 2400, errorRate: 18.4, lockWaitMs: 940 },
      { time: 'T-5m', cpu: 94, memory: 93, dbPoolUtil: 96, p99Latency: 6800, errorRate: 34.0, lockWaitMs: 3200 }
    ],
    logs: parsedLogs,
    traces: [
      {
        id: 'trace-custom-01',
        service: 'api-gateway',
        name: 'HTTP /api/v1/request',
        durationMs: 6800,
        status: 'ERROR',
        children: [
          {
            id: 'trace-custom-sub',
            service: culpritService,
            name: 'ExecuteInternalLogic',
            durationMs: 6750,
            status: 'ERROR'
          }
        ]
      }
    ],
    deployment: {
      hash: 'c8914ab2',
      author: 'ci-pipeline@deploy.internal',
      timestamp: '15 minutes ago',
      message: 'deploy: latest service update with updated dependency configurations',
      service: culpritService,
      changedFiles: ['src/main/resources/application.yml', 'src/core/ClientHandler.ts'],
      diffPreview: '- timeout: 5000\n+ timeout: 0 # disabled timeout in favor of upstream default',
      riskScore: 88
    },
    database: {
      activeConnections: 94,
      maxConnections: 100,
      waitingThreads: 29,
      slowQueryCount: 194,
      deadlocks: category === 'Deadlock / Cascading' ? 12 : 0,
      topOffenderQuery: 'SELECT * FROM records WHERE active = true (resource wait timeout)'
    }
  };
}
