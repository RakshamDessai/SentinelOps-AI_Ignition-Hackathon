export type RiskLevel = 'NOMINAL' | 'ELEVATED' | 'HIGH' | 'CRITICAL';

export interface MetricPoint {
  time: string;
  cpu: number; // percentage 0-100
  memory: number; // percentage 0-100
  dbPoolUtil: number; // percentage 0-100
  p99Latency: number; // milliseconds
  errorRate: number; // errors/sec or %
  lockWaitMs: number; // milliseconds
}

export interface LogEntry {
  id: string;
  timestamp: string;
  service: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'FATAL';
  message: string;
  traceId?: string;
  isCulprit?: boolean;
}

export interface TraceSpan {
  id: string;
  service: string;
  name: string;
  durationMs: number;
  status: 'OK' | 'SLOW' | 'ERROR';
  children?: TraceSpan[];
}

export interface CommitDeployment {
  hash: string;
  author: string;
  timestamp: string;
  message: string;
  service: string;
  changedFiles: string[];
  diffPreview: string;
  riskScore: number;
}

export interface DatabaseTelemetry {
  activeConnections: number;
  maxConnections: number;
  waitingThreads: number;
  slowQueryCount: number;
  deadlocks: number;
  topOffenderQuery: string;
}

export interface FailurePrediction {
  probability: number; // 0-100
  riskLevel: RiskLevel;
  predictedIncident: string;
  timeToFailureSec: number;
  confidence: number;
  affectedServices: string[];
  primaryAnomalyTrigger: string;
  earlyWarningSignals: string[];
}

export interface RootCauseAnalysis {
  culpritService: string;
  culpritCommit?: CommitDeployment;
  probableRootCause: string;
  confidence: number;
  causalChain: {
    step: number;
    layer: 'Deployment' | 'Application' | 'Database' | 'Infrastructure' | 'Client';
    title: string;
    detail: string;
  }[];
  explainableRationale: string;
  crossStackCorrelations: {
    signalA: string;
    signalB: string;
    correlationCoefficient: number;
    reasoning: string;
  }[];
}

export interface RemediationPlan {
  immediateActions: {
    id: string;
    title: string;
    command: string;
    impact: string;
    type: 'scale' | 'rollback' | 'circuit_break' | 'flush';
    estimatedMitigationTime: string;
  }[];
  permanentPatch: {
    prTitle: string;
    filePath: string;
    codeBefore: string;
    codeAfter: string;
    explanation: string;
  };
  postMortemReport: {
    incidentId: string;
    severity: 'P1-CRITICAL' | 'P2-HIGH' | 'P3-MODERATE';
    businessImpact: string;
    recoveryActionTaken: string;
    architecturalRecommendations: string[];
  };
}

export interface IncidentScenario {
  id: string;
  title: string;
  subtitle: string;
  category: 'Database Exhaustion' | 'Thread Starvation' | 'Memory Leak' | 'Deadlock / Cascading';
  systemContext: string;
  prediction: FailurePrediction;
  rootCause: RootCauseAnalysis;
  remediation: RemediationPlan;
  metrics: MetricPoint[];
  logs: LogEntry[];
  traces: TraceSpan[];
  deployment: CommitDeployment;
  database: DatabaseTelemetry;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  codeSnippet?: string;
}
