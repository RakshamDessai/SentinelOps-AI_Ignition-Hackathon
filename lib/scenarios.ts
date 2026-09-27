import { IncidentScenario } from './types';

export const SCENARIOS: IncidentScenario[] = [
  {
    id: 'db-connection-exhaustion',
    title: 'PostgreSQL Pool Starvation & 504 Gateway Timeout',
    subtitle: 'Correlated: Git Commit v2.4.1 → Connection Leak → Pool Saturation → Cascading Drop',
    category: 'Database Exhaustion',
    systemContext: 'Global E-Commerce API Gateway & Checkout Microservices (Postgres RDS + Redis + Kubernetes)',
    prediction: {
      probability: 94,
      riskLevel: 'CRITICAL',
      predictedIncident: 'Total Checkout Outage & Cascading 504 Gateway Timeout Avalanche',
      timeToFailureSec: 540, // 9 mins
      confidence: 96,
      affectedServices: ['checkout-service', 'payment-gateway', 'postgres-primary', 'api-ingress'],
      primaryAnomalyTrigger: 'Active DB connections rising monotonically (+12 conn/min) despite nominal user traffic',
      earlyWarningSignals: [
        'Postgres connection pool utilization reached 92/100 (Nominal: 28/100)',
        'HikariCP acquisition timeout latency increased from 4ms to 4,820ms',
        'Commit 7e8b31a added CartCheckoutService.validateInventory() missing session.close() in finally block',
        'Ingress HTTP 504 gateway response rate trending at 38% increase'
      ]
    },
    rootCause: {
      culpritService: 'checkout-service (v2.4.1)',
      culpritCommit: {
        hash: '7e8b31a9',
        author: 'dev-alex@acme.internal',
        timestamp: '28 minutes ago',
        message: 'feat(checkout): add promotional coupon validator & inventory lock verification',
        service: 'checkout-service',
        changedFiles: ['src/services/CartCheckoutService.java', 'src/repo/CouponRepository.java'],
        diffPreview: '+ Connection conn = dataSource.getConnection();\n+ ResultSet rs = conn.prepareStatement("SELECT * FROM coupons WHERE code = ?").executeQuery();\n// Missing conn.close() in exception path!',
        riskScore: 89
      },
      probableRootCause: 'Unclosed JDBC connection in CartCheckoutService.validateCoupon() introduced in commit 7e8b31a9',
      confidence: 97,
      causalChain: [
        {
          step: 1,
          layer: 'Deployment',
          title: 'Canary Deployment of checkout-service:v2.4.1',
          detail: 'Commit 7e8b31a rolled out to 25% of traffic cluster at 12:15 UTC.'
        },
        {
          step: 2,
          layer: 'Application',
          title: 'Unreleased Connection Leak on Coupon Validation',
          detail: 'When validation encounters an expired voucher, an exception bypasses connection release.'
        },
        {
          step: 3,
          layer: 'Database',
          title: 'HikariCP Connection Pool Saturation',
          detail: 'Active connections climbed steadily from 28 to 92 of 100 max capacity; idle pool drained to 0.'
        },
        {
          step: 4,
          layer: 'Infrastructure',
          title: 'Thread Wait Block & Ingress Queue Spikes',
          detail: 'Worker threads blocking on HikariPool-1 - Connection is not available; p99 latency spiked to 4,850ms.'
        },
        {
          step: 5,
          layer: 'Client',
          title: 'Imminent 504 Gateway Timeout Cascade',
          detail: 'Predictive model detects full pool starvation in 9 minutes, triggering complete checkout failure.'
        }
      ],
      explainableRationale: 'By cross-referencing Git commit diffs against HikariCP connection pool metrics, SentinelOps isolated that connection acquisition delays began exactly 90 seconds after checkout-service:v2.4.1 rolled out. Stack trace profiling isolated 84 blocked threads waiting inside CartCheckoutService.java:142 on JDBC acquire.',
      crossStackCorrelations: [
        {
          signalA: 'Commit 7e8b31a (checkout-service:v2.4.1)',
          signalB: 'HikariCP Active Connections',
          correlationCoefficient: 0.98,
          reasoning: 'Active connection slope shifted from 0.02/min to +11.8/min directly following deployment.'
        },
        {
          signalA: 'Postgres Waiting Threads (92 count)',
          signalB: 'Ingress p99 Latency (4,850ms)',
          correlationCoefficient: 0.96,
          reasoning: 'Direct linear coupling between DB acquire wait time and upstream HTTP request timeouts.'
        }
      ]
    },
    remediation: {
      immediateActions: [
        {
          id: 'action-1',
          title: 'Rollback checkout-service to stable v2.4.0',
          command: 'kubectl rollout undo deployment/checkout-service -n production',
          impact: 'Immediately stops leaking connections; restores normal acquire within 45s',
          type: 'rollback',
          estimatedMitigationTime: '45 seconds'
        },
        {
          id: 'action-2',
          title: 'Temporarily bump HikariCP max pool & terminate leaked idle connections',
          command: 'aws rds pg-terminate-leaked --idle-duration 60s --max-connections 160',
          impact: 'Reclaims 64 dangling connections and prevents immediate starvation buffer collapse',
          type: 'scale',
          estimatedMitigationTime: '15 seconds'
        }
      ],
      permanentPatch: {
        prTitle: 'fix(checkout): wrap JDBC connection in try-with-resources to prevent pool exhaustion',
        filePath: 'src/services/CartCheckoutService.java',
        codeBefore: `// Culprit Code in v2.4.1:
public boolean validateCoupon(String code) throws SQLException {
    Connection conn = dataSource.getConnection();
    PreparedStatement ps = conn.prepareStatement("SELECT active, discount FROM coupons WHERE code = ?");
    ps.setString(1, code);
    ResultSet rs = ps.executeQuery();
    if (rs.next()) {
        if (!rs.getBoolean("active")) {
            throw new CouponExpiredException("Expired code"); // LEAK: conn is never closed!
        }
        return true;
    }
    conn.close();
    return false;
}`,
        codeAfter: `// Autonomous Remediation Patch generated by SentinelOps AI:
public boolean validateCoupon(String code) throws SQLException {
    // try-with-resources guarantees automatic deterministic connection release
    try (Connection conn = dataSource.getConnection();
         PreparedStatement ps = conn.prepareStatement("SELECT active, discount FROM coupons WHERE code = ?")) {
        ps.setString(1, code);
        try (ResultSet rs = ps.executeQuery()) {
            if (rs.next()) {
                if (!rs.getBoolean("active")) {
                    throw new CouponExpiredException("Expired code");
                }
                return true;
            }
            return false;
        }
    }
}`,
        explanation: 'Replaced manual connection closing with Java 7+ try-with-resources. This ensures connection closure in both standard return and exceptional exit branches (CouponExpiredException), preventing connection retention in the pool.'
      },
      postMortemReport: {
        incidentId: 'INC-2026-0927-DB01',
        severity: 'P1-CRITICAL',
        businessImpact: 'Risk of $84,000/hr revenue loss due to e-commerce checkout abandonment; prevented 9 minutes before zero-availability failure.',
        recoveryActionTaken: 'Autonomous rollback executed via GitOps webhook; Hikari pool connection reap script triggered.',
        architecturalRecommendations: [
          'Enforce SonarQube / Semgrep lint rule for deterministic AutoCloseable resource handling in CI/CD pipeline.',
          'Configure HikariCP leakDetectionThreshold = 5000ms to log stack traces of unreturned connections in staging.',
          'Implement connection-pool circuit breaker to shed unauthenticated coupon requests when pool capacity > 85%.'
        ]
      }
    },
    metrics: [
      { time: '12:00', cpu: 24, memory: 42, dbPoolUtil: 28, p99Latency: 45, errorRate: 0.1, lockWaitMs: 2 },
      { time: '12:05', cpu: 26, memory: 43, dbPoolUtil: 30, p99Latency: 48, errorRate: 0.1, lockWaitMs: 3 },
      { time: '12:10', cpu: 25, memory: 43, dbPoolUtil: 29, p99Latency: 42, errorRate: 0.2, lockWaitMs: 2 },
      { time: '12:15', cpu: 32, memory: 46, dbPoolUtil: 44, p99Latency: 110, errorRate: 0.4, lockWaitMs: 14 }, // Deploy here
      { time: '12:20', cpu: 48, memory: 52, dbPoolUtil: 62, p99Latency: 480, errorRate: 1.8, lockWaitMs: 95 },
      { time: '12:25', cpu: 67, memory: 61, dbPoolUtil: 79, p99Latency: 1450, errorRate: 5.4, lockWaitMs: 420 },
      { time: '12:30', cpu: 84, memory: 74, dbPoolUtil: 92, p99Latency: 4850, errorRate: 18.2, lockWaitMs: 2840 }
    ],
    logs: [
      { id: 'l1', timestamp: '12:15:02', service: 'deploy-bot', level: 'INFO', message: 'Deployment canary roll successful: checkout-service image tagged v2.4.1 (commit 7e8b31a9)' },
      { id: 'l2', timestamp: '12:17:44', service: 'checkout-service', level: 'INFO', message: 'Cart validation worker initialized with thread pool size 32' },
      { id: 'l3', timestamp: '12:21:10', service: 'checkout-service', level: 'WARN', message: 'CouponExpiredException: Code AUTUMN26 is no longer valid for user 89201', isCulprit: true },
      { id: 'l4', timestamp: '12:24:35', service: 'checkout-service', level: 'WARN', message: 'HikariPool-1 - Connection acquisition took 1284ms. Pool stats: active=78, idle=2, total=80', isCulprit: true },
      { id: 'l5', timestamp: '12:28:12', service: 'postgres-primary', level: 'WARN', message: 'Max client connections threshold approaching: 92/100 active connections in state IDLE IN TRANSACTION' },
      { id: 'l6', timestamp: '12:29:48', service: 'checkout-service', level: 'ERROR', message: 'ConnectionTimeout: Connection is not available, request timed out after 5000ms', isCulprit: true },
      { id: 'l7', timestamp: '12:30:05', service: 'api-ingress', level: 'FATAL', message: 'Upstream connection reset by peer from checkout-service:5000 (HTTP 504 Gateway Timeout)' }
    ],
    traces: [
      {
        id: 'trace-8891',
        service: 'api-ingress',
        name: 'POST /api/v2/checkout/finalize',
        durationMs: 4850,
        status: 'ERROR',
        children: [
          {
            id: 'trace-8891-auth',
            service: 'auth-service',
            name: 'ValidateJWTToken',
            durationMs: 14,
            status: 'OK'
          },
          {
            id: 'trace-8891-chk',
            service: 'checkout-service',
            name: 'CartCheckoutService.validateCoupon',
            durationMs: 4832,
            status: 'ERROR',
            children: [
              {
                id: 'trace-8891-db',
                service: 'postgres-primary',
                name: 'HikariPool.getConnection()',
                durationMs: 4801,
                status: 'SLOW'
              }
            ]
          }
        ]
      }
    ],
    deployment: {
      hash: '7e8b31a9',
      author: 'dev-alex@acme.internal',
      timestamp: '28 minutes ago',
      message: 'feat(checkout): add promotional coupon validator & inventory lock verification',
      service: 'checkout-service',
      changedFiles: ['src/services/CartCheckoutService.java', 'src/repo/CouponRepository.java'],
      diffPreview: '+ Connection conn = dataSource.getConnection();\n+ ResultSet rs = conn.prepareStatement("SELECT * FROM coupons WHERE code = ?").executeQuery();\n// Missing conn.close() in exception path!',
      riskScore: 89
    },
    database: {
      activeConnections: 92,
      maxConnections: 100,
      waitingThreads: 44,
      slowQueryCount: 341,
      deadlocks: 0,
      topOffenderQuery: 'SELECT active, discount FROM coupons WHERE code = ? (holding connection open without release)'
    }
  },
  {
    id: 'threadpool-starvation',
    title: 'Synchronous Webhook Timeout & Worker Thread Starvation',
    subtitle: 'Correlated: Third-party API Degradation → Sync Block → Threadpool Exhaustion → API Freeze',
    category: 'Thread Starvation',
    systemContext: 'Fintech Core Banking & Payment Settlement Engine (Node.js microservices + Redis + Kafka)',
    prediction: {
      probability: 91,
      riskLevel: 'CRITICAL',
      predictedIncident: 'Cascading Payment Processing Stall & Worker Crash Loop',
      timeToFailureSec: 420, // 7 mins
      confidence: 94,
      affectedServices: ['payment-worker', 'settlement-api', 'kafka-consumer', 'webhook-dispatcher'],
      primaryAnomalyTrigger: 'Worker Event Loop lag jumped from 8ms to 6,400ms due to blocking external HTTP call',
      earlyWarningSignals: [
        'Payment worker active threads reached 128/128 (100% capacity)',
        'Kafka consumer lag increasing at +4,200 events/minute',
        'Stripe sandbox webhook response latency degraded to 28,000ms',
        'Uncaught Promise timeout rejections escalating across all pods'
      ]
    },
    rootCause: {
      culpritService: 'payment-worker',
      culpritCommit: {
        hash: '3bc91f42',
        author: 'finance-lead@finpay.internal',
        timestamp: '1 hour ago',
        message: 'feat(payouts): sync instant bank settlement verification without timeout fallback',
        service: 'payment-worker',
        changedFiles: ['src/workers/PaymentCallbackHandler.ts'],
        diffPreview: '- const res = await axios.post(url, payload, { timeout: 3000 });\n+ const res = await axios.post(url, payload); // REMOVED TIMEOUT!',
        riskScore: 92
      },
      probableRootCause: 'Axios HTTP call without timeout configuration blocking Node.js thread pool during external partner latency spike',
      confidence: 95,
      causalChain: [
        {
          step: 1,
          layer: 'Deployment',
          title: 'Commit 3bc91f42 removed default 3-second HTTP timeout',
          detail: 'Removed timeout config to accommodate slow bank responses during high volume.'
        },
        {
          step: 2,
          layer: 'Infrastructure',
          title: 'External Bank Gateway Latency Surge',
          detail: 'Banking partner gateway degraded from 250ms to 45 seconds per response.'
        },
        {
          step: 3,
          layer: 'Application',
          title: 'Node.js Worker Threadpool Starvation',
          detail: 'Every incoming payment holds a worker thread indefinitely waiting for the socket to close.'
        },
        {
          step: 4,
          layer: 'Infrastructure',
          title: 'Kafka Consumer Heartbeat Timeout',
          detail: 'Workers stopped sending heartbeats to Kafka brokers; consumer group marked DEAD, triggering rebalance storm.'
        },
        {
          step: 5,
          layer: 'Client',
          title: 'Transactions Dropped at Ingress',
          detail: 'Clients receive socket hang up errors on /v1/charges.'
        }
      ],
      explainableRationale: 'Correlating external outbound DNS/socket durations with internal worker event loop delays revealed that 100% of stalled threads are anchored in PaymentCallbackHandler.ts:88 awaiting third-party TLS handshake.',
      crossStackCorrelations: [
        {
          signalA: 'External Partner Latency',
          signalB: 'Kafka Consumer Lag',
          correlationCoefficient: 0.99,
          reasoning: 'Zero queue processing occurs as soon as partner latency exceeds 4,000ms.'
        }
      ]
    },
    remediation: {
      immediateActions: [
        {
          id: 'act-tp-1',
          title: 'Enable Circuit Breaker & Enforce 2.5s Hard Socket Timeout via Envoy',
          command: 'envoy-admin apply-filter --service payment-worker --timeout-ms 2500 --circuit-break-threshold 50',
          impact: 'Instantly frees blocked threads and sheds lagging external requests',
          type: 'circuit_break',
          estimatedMitigationTime: '20 seconds'
        },
        {
          id: 'act-tp-2',
          title: 'Scale payment-worker deployment from 6 to 18 pods',
          command: 'kubectl scale deployment/payment-worker --replicas=18 -n payments',
          impact: 'Provides temporary threadpool buffer while processing backlog',
          type: 'scale',
          estimatedMitigationTime: '40 seconds'
        }
      ],
      permanentPatch: {
        prTitle: 'fix(payouts): restore resilient HTTP timeout & async BullMQ job queue pattern',
        filePath: 'src/workers/PaymentCallbackHandler.ts',
        codeBefore: `// Culprit Code:
export async function executeBankCallback(payoutId: string, payload: any) {
    // Dangerous: indefinite blocking socket wait
    const response = await axios.post(BANK_GATEWAY_URL, payload);
    return response.data;
}`,
        codeAfter: `// Autonomous Remediation Patch:
export async function executeBankCallback(payoutId: string, payload: any) {
    // Resilient timeout with fallback to asynchronous reconciliation queue
    try {
        const response = await axios.post(BANK_GATEWAY_URL, payload, {
            timeout: 2500, // Strict 2.5s SLA
            headers: { 'X-Idempotency-Key': payoutId }
        });
        return response.data;
    } catch (err: any) {
        if (err.code === 'ECONNABORTED' || err.response?.status >= 500) {
            await reconciliationQueue.add('retry-payout', { payoutId, payload }, {
                attempts: 5,
                backoff: { type: 'exponential', delay: 2000 }
            });
            return { status: 'PENDING_RECONCILIATION', payoutId };
        }
        throw err;
    }
}`,
        explanation: 'Enforced a strict 2,500ms timeout on outbound HTTP requests. If the partner times out, the task is handed off to an asynchronous BullMQ queue with exponential backoff, preventing thread starvation.'
      },
      postMortemReport: {
        incidentId: 'INC-2026-0927-TP02',
        severity: 'P1-CRITICAL',
        businessImpact: 'Threat of 12,400 pending transactions stalled ($1.2M total volume). Prevented 7 minutes before complete node freeze.',
        recoveryActionTaken: 'Envoy mesh circuit-breaker tripped; traffic redirected to asynchronous reconciliation queue.',
        architecturalRecommendations: [
          'Mandate non-blocking outbound HTTP client wrapper across all microservice templates.',
          'Decouple user-facing synchronous checkout from partner banking webhooks via event-driven Kafka events.'
        ]
      }
    },
    metrics: [
      { time: '12:00', cpu: 32, memory: 38, dbPoolUtil: 20, p99Latency: 85, errorRate: 0.05, lockWaitMs: 0 },
      { time: '12:05', cpu: 34, memory: 40, dbPoolUtil: 22, p99Latency: 92, errorRate: 0.05, lockWaitMs: 0 },
      { time: '12:10', cpu: 39, memory: 42, dbPoolUtil: 25, p99Latency: 110, errorRate: 0.1, lockWaitMs: 0 },
      { time: '12:15', cpu: 55, memory: 58, dbPoolUtil: 30, p99Latency: 640, errorRate: 1.2, lockWaitMs: 25 },
      { time: '12:20', cpu: 78, memory: 72, dbPoolUtil: 41, p99Latency: 2800, errorRate: 8.5, lockWaitMs: 140 },
      { time: '12:25', cpu: 94, memory: 88, dbPoolUtil: 55, p99Latency: 7900, errorRate: 24.1, lockWaitMs: 890 },
      { time: '12:30', cpu: 99, memory: 94, dbPoolUtil: 68, p99Latency: 14200, errorRate: 46.8, lockWaitMs: 3400 }
    ],
    logs: [
      { id: 'lt1', timestamp: '12:14:30', service: 'deploy-bot', level: 'INFO', message: 'payment-worker deployed commit 3bc91f42 to cluster us-east-1' },
      { id: 'lt2', timestamp: '12:18:10', service: 'payment-worker', level: 'WARN', message: 'Outbound socket handshake with bank-api.partner.io taking > 3000ms' },
      { id: 'lt3', timestamp: '12:22:45', service: 'payment-worker', level: 'WARN', message: 'Threadpool saturated: 120/128 workers busy awaiting I/O completion', isCulprit: true },
      { id: 'lt4', timestamp: '12:26:12', service: 'kafka-consumer', level: 'ERROR', message: 'Consumer group payment-workers heartbeat failed. Missed max poll interval (300000ms)', isCulprit: true },
      { id: 'lt5', timestamp: '12:28:40', service: 'settlement-api', level: 'FATAL', message: 'HTTP 503 Service Unavailable: No healthy upstream worker available to process payout queue' }
    ],
    traces: [
      {
        id: 'trace-fin-101',
        service: 'settlement-api',
        name: 'POST /v1/payouts/instant',
        durationMs: 14200,
        status: 'ERROR',
        children: [
          {
            id: 'trace-fin-worker',
            service: 'payment-worker',
            name: 'executeBankCallback',
            durationMs: 14180,
            status: 'ERROR',
            children: [
              {
                id: 'trace-fin-ext',
                service: 'bank-api.partner.io',
                name: 'HTTPS POST /settlements/verify',
                durationMs: 14150,
                status: 'SLOW'
              }
            ]
          }
        ]
      }
    ],
    deployment: {
      hash: '3bc91f42',
      author: 'finance-lead@finpay.internal',
      timestamp: '1 hour ago',
      message: 'feat(payouts): sync instant bank settlement verification without timeout fallback',
      service: 'payment-worker',
      changedFiles: ['src/workers/PaymentCallbackHandler.ts'],
      diffPreview: '- const res = await axios.post(url, payload, { timeout: 3000 });\n+ const res = await axios.post(url, payload); // REMOVED TIMEOUT!',
      riskScore: 92
    },
    database: {
      activeConnections: 68,
      maxConnections: 120,
      waitingThreads: 74,
      slowQueryCount: 88,
      deadlocks: 1,
      topOffenderQuery: 'UPDATE payout_records SET status = "PENDING" WHERE id = ? (blocked by worker thread timeout)'
    }
  },
  {
    id: 'memory-leak-gc-pause',
    title: 'Distributed Session Cache Memory Leak & OOM CrashLoop',
    subtitle: 'Correlated: Cyclical Reference Retention → Heap Saturation → Stop-The-World GC → Pod Eviction',
    category: 'Memory Leak',
    systemContext: 'Healthcare Telehealth Platform & Patient Portal (Go microservices + Redis Cluster + Kubernetes)',
    prediction: {
      probability: 88,
      riskLevel: 'HIGH',
      predictedIncident: 'Pod OOMKill CrashLoop & Telehealth Session Disconnection Wave',
      timeToFailureSec: 680, // 11 mins
      confidence: 93,
      affectedServices: ['telehealth-session-svc', 'redis-cluster', 'k8s-pod-telehealth-79b', 'webrtc-signaling'],
      primaryAnomalyTrigger: 'Heap memory usage climbing at constant +85MB/min without GC reclaim rate',
      earlyWarningSignals: [
        'Heap committed memory at 91% of Kubernetes container cgroup limit (7.3GB / 8.0GB)',
        'Full Garbage Collection stop-the-world pause duration surged from 3ms to 1,840ms',
        'Commit a19c7ef introduced global map cache with unkeyed pointers in SessionManager.go',
        'Kubernetes node kernel dmesg reporting upcoming OOM killer trigger'
      ]
    },
    rootCause: {
      culpritService: 'telehealth-session-svc',
      culpritCommit: {
        hash: 'a19c7ef3',
        author: 'infra-vikram@health.io',
        timestamp: '3 hours ago',
        message: 'perf(sessions): add in-memory telemetry buffer for patient heartbeats',
        service: 'telehealth-session-svc',
        changedFiles: ['pkg/session/SessionManager.go'],
        diffPreview: '+ var GlobalPatientHeartbeats = make(map[string][]*HeartbeatPayload)\n// Missing cleanup / TTL timer on map keys!',
        riskScore: 86
      },
      probableRootCause: 'Unbounded in-memory map retention of patient telemetry frames without TTL expiration in SessionManager.go',
      confidence: 96,
      causalChain: [
        {
          step: 1,
          layer: 'Deployment',
          title: 'Commit a19c7ef introduced in-memory slice retention',
          detail: 'Added global map to buffer patient vitals without eviction policy.'
        },
        {
          step: 2,
          layer: 'Application',
          title: 'Heap Growth & Old Generation Bloat',
          detail: 'Every incoming 5s WebRTC heartbeat is appended to slice without memory release.'
        },
        {
          step: 3,
          layer: 'Infrastructure',
          title: 'GC Stop-The-World Latency Escalation',
          detail: 'Go runtime garbage collector spends 42% of CPU cycles scanning 12M live pointers in heap.'
        },
        {
          step: 4,
          layer: 'Infrastructure',
          title: 'Imminent Container Cgroup OOMKill (8GB limit)',
          detail: 'Container memory footprint is at 7.6GB and growing at 85MB/min; OOM-Kill predicted in 11 minutes.'
        }
      ],
      explainableRationale: 'SentinelOps pprof heap profile analyzer identified that 82% of all allocated heap bytes are retained in SessionManager.go:GlobalPatientHeartbeats. Correlation with container cgroup telemetry confirms guaranteed OOM eviction.',
      crossStackCorrelations: [
        {
          signalA: 'pprof Allocated Heap (7.3GB)',
          signalB: 'GC STW Duration (1,840ms)',
          correlationCoefficient: 0.97,
          reasoning: 'Exponential rise in GC latency directly matches the pointer count in GlobalPatientHeartbeats.'
        }
      ]
    },
    remediation: {
      immediateActions: [
        {
          id: 'act-mem-1',
          title: 'Rolling restart pods with increased cgroup memory ceiling (8GB -> 16GB)',
          command: 'kubectl set resources deployment telehealth-session-svc --limits=memory=16Gi -n health-prod',
          impact: 'Buys 12 hours of operational runway and prevents immediate crashloop',
          type: 'scale',
          estimatedMitigationTime: '1 minute'
        },
        {
          id: 'act-mem-2',
          title: 'Trigger forced Go runtime debug.FreeOSMemory() endpoint',
          command: 'curl -X POST http://telehealth-internal:8080/debug/pprof/freeosmemory',
          impact: 'Forces immediate return of unreferenced physical memory to OS',
          type: 'flush',
          estimatedMitigationTime: '10 seconds'
        }
      ],
      permanentPatch: {
        prTitle: 'fix(telehealth): replace unbounded global map with LRU cache with 60-second TTL',
        filePath: 'pkg/session/SessionManager.go',
        codeBefore: `// Culprit Code:
var GlobalPatientHeartbeats = make(map[string][]*HeartbeatPayload)

func RecordHeartbeat(patientId string, hb *HeartbeatPayload) {
    // Unbounded append: memory leaks monotonically
    GlobalPatientHeartbeats[patientId] = append(GlobalPatientHeartbeats[patientId], hb)
}`,
        codeAfter: `// Autonomous Remediation Patch:
import "github.com/hashicorp/golang-lru/v2/expirable"
import "time"

// Safe bounded LRU with 60-second TTL and max 10,000 active patient sessions
var PatientHeartbeatCache = expirable.NewLRU[string, *HeartbeatRingBuffer](10000, nil, time.Minute*1)

func RecordHeartbeat(patientId string, hb *HeartbeatPayload) {
    buf, exists := PatientHeartbeatCache.Get(patientId)
    if !exists {
        buf = NewRingBuffer(50) // Keep only latest 50 entries max per patient
        PatientHeartbeatCache.Add(patientId, buf)
    }
    buf.Push(hb)
}`,
        explanation: 'Replaced the unbounded map with an expirable LRU cache with a strict 60-second TTL and circular ring buffer of 50 samples per patient, capping total memory footprint to under 120MB indefinitely.'
      },
      postMortemReport: {
        incidentId: 'INC-2026-0927-MEM03',
        severity: 'P2-HIGH',
        businessImpact: 'Threat of 4,800 active patient video consultations abruptly terminating mid-session. Caught 11 minutes prior to crash.',
        recoveryActionTaken: 'Cgroup limit expanded via live patch; PR merged with bounded LRU ring buffer.',
        architecturalRecommendations: [
          'Add memory leak regression tests in CI using Go benchmark memory allocation metrics.',
          'Alert when heap usage exceeds 75% of container memory limit.'
        ]
      }
    },
    metrics: [
      { time: '12:00', cpu: 18, memory: 45, dbPoolUtil: 15, p99Latency: 28, errorRate: 0.0, lockWaitMs: 0 },
      { time: '12:05', cpu: 22, memory: 52, dbPoolUtil: 16, p99Latency: 32, errorRate: 0.0, lockWaitMs: 0 },
      { time: '12:10', cpu: 25, memory: 61, dbPoolUtil: 17, p99Latency: 40, errorRate: 0.0, lockWaitMs: 0 },
      { time: '12:15', cpu: 32, memory: 70, dbPoolUtil: 18, p99Latency: 85, errorRate: 0.1, lockWaitMs: 0 },
      { time: '12:20', cpu: 45, memory: 79, dbPoolUtil: 18, p99Latency: 240, errorRate: 0.2, lockWaitMs: 0 },
      { time: '12:25', cpu: 68, memory: 86, dbPoolUtil: 19, p99Latency: 780, errorRate: 1.4, lockWaitMs: 0 },
      { time: '12:30', cpu: 89, memory: 93, dbPoolUtil: 21, p99Latency: 1840, errorRate: 4.8, lockWaitMs: 0 }
    ],
    logs: [
      { id: 'lm1', timestamp: '12:10:00', service: 'telehealth-session-svc', level: 'INFO', message: 'Active patient streaming sessions: 4,812' },
      { id: 'lm2', timestamp: '12:18:22', service: 'telehealth-session-svc', level: 'WARN', message: 'runtime.GC STW pause took 420ms (HeapAlloc: 5.8GB)', isCulprit: true },
      { id: 'lm3', timestamp: '12:24:15', service: 'k8s-pod-telehealth-79b', level: 'WARN', message: 'Cgroup memory threshold crossed: 85% of memory limit (6.8GB/8.0GB)' },
      { id: 'lm4', timestamp: '12:28:50', service: 'telehealth-session-svc', level: 'ERROR', message: 'runtime.GC STW pause took 1840ms. Heartbeat stream delayed', isCulprit: true },
      { id: 'lm5', timestamp: '12:30:10', service: 'k8s-pod-telehealth-79b', level: 'FATAL', message: 'Kernel OOM Killer imminent: container working_set_bytes exceeds 7.6GB' }
    ],
    traces: [
      {
        id: 'trace-mem-501',
        service: 'webrtc-signaling',
        name: 'POST /v1/telehealth/heartbeat',
        durationMs: 1840,
        status: 'SLOW',
        children: [
          {
            id: 'trace-mem-svc',
            service: 'telehealth-session-svc',
            name: 'SessionManager.RecordHeartbeat',
            durationMs: 1820,
            status: 'SLOW'
          }
        ]
      }
    ],
    deployment: {
      hash: 'a19c7ef3',
      author: 'infra-vikram@health.io',
      timestamp: '3 hours ago',
      message: 'perf(sessions): add in-memory telemetry buffer for patient heartbeats',
      service: 'telehealth-session-svc',
      changedFiles: ['pkg/session/SessionManager.go'],
      diffPreview: '+ var GlobalPatientHeartbeats = make(map[string][]*HeartbeatPayload)\n// Missing cleanup / TTL timer on map keys!',
      riskScore: 86
    },
    database: {
      activeConnections: 21,
      maxConnections: 100,
      waitingThreads: 2,
      slowQueryCount: 14,
      deadlocks: 0,
      topOffenderQuery: 'SELECT patient_id, session_token FROM active_sessions WHERE last_seen > NOW() - INTERVAL 5 MINUTE'
    }
  },
  {
    id: 'deadlock-saga-cascade',
    title: 'Distributed Saga Inconsistent Lock Order & Deadlock Cascade',
    subtitle: 'Correlated: Reverse Lock Acquisition in Inventory vs Order Saga → Row Lock Wait Timeout → 500 Spike',
    category: 'Deadlock / Cascading',
    systemContext: 'Retail Logistics & Inventory Fulfillment Saga (Spring Cloud + PostgreSQL + RabbitMQ)',
    prediction: {
      probability: 95,
      riskLevel: 'CRITICAL',
      predictedIncident: 'Fulfillment Pipeline Deadlock & Database Lock Saturation Lockup',
      timeToFailureSec: 360, // 6 mins
      confidence: 98,
      affectedServices: ['order-saga-orchestrator', 'inventory-service', 'postgres-db-cluster', 'warehouse-dispatch'],
      primaryAnomalyTrigger: 'PostgreSQL Lock wait duration jumped to 42,000ms with 18 unresolved deadlock cycles',
      earlyWarningSignals: [
        'Transaction rollback rate reached 41.2% (Baseline: 0.03%)',
        'Database Lock Wait time spiked from 2ms to 42,800ms',
        'Commit c4928db inverted locking sequence between sku_inventory and warehouse_reservation',
        'RabbitMQ dead letter exchange received 3,400 failed fulfillment events'
      ]
    },
    rootCause: {
      culpritService: 'inventory-service',
      culpritCommit: {
        hash: 'c4928db4',
        author: 'lead-sneha@retail.io',
        timestamp: '45 minutes ago',
        message: 'feat(inventory): reorder reservation lock check to prioritize fast warehouse dispatch',
        service: 'inventory-service',
        changedFiles: ['src/main/java/com/retail/saga/InventorySagaStep.java'],
        diffPreview: '- lock(sku_inventory); lock(warehouse_reservation);\n+ lock(warehouse_reservation); lock(sku_inventory); // INVERTED LOCK ORDER!',
        riskScore: 94
      },
      probableRootCause: 'Inconsistent locking sequence between OrderSagaStep and InventorySagaStep causing classic Coffman circular wait deadlock',
      confidence: 98,
      causalChain: [
        {
          step: 1,
          layer: 'Deployment',
          title: 'Commit c4928db changed lock order in InventorySagaStep',
          detail: 'Reordered lock acquisition from (SKU -> Warehouse) to (Warehouse -> SKU).'
        },
        {
          step: 2,
          layer: 'Database',
          title: 'Circular Wait Deadlock Condition Formed',
          detail: 'OrderSaga holds SKU lock and waits for Warehouse lock; InventorySaga holds Warehouse lock and waits for SKU lock.'
        },
        {
          step: 3,
          layer: 'Database',
          title: 'PostgreSQL Lock Queue Explosive Backlog',
          detail: 'PostgreSQL deadlocks detected; pg_stat_activity shows 38 transactions blocked on ExclusiveLock.'
        },
        {
          step: 4,
          layer: 'Application',
          title: 'Mass Transaction Rollbacks & Retry Avalanches',
          detail: 'Spring Retry storms retry failed transactions simultaneously, compounding the lock contention.'
        },
        {
          step: 5,
          layer: 'Client',
          title: 'Total Order Fulfillment Stoppage',
          detail: 'Customers receive "Order failed, please try again" with 500 Internal Server Error.'
        }
      ],
      explainableRationale: 'Cross-stack correlation between pg_locks and Spring Cloud distributed trace IDs proved that transaction TX-8012 and TX-8013 are in mutual circular wait on rows in tables sku_inventory and warehouse_reservation.',
      crossStackCorrelations: [
        {
          signalA: 'Commit c4928db Lock Order',
          signalB: 'pg_stat_database Deadlocks',
          correlationCoefficient: 0.99,
          reasoning: 'Deadlock counter began ticking 120s after deployment of inverted lock sequence.'
        }
      ]
    },
    remediation: {
      immediateActions: [
        {
          id: 'act-dl-1',
          title: 'Cancel blocked locking transactions via PostgreSQL pg_cancel_backend',
          command: 'psql -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE wait_event_type = \'Lock\' AND state = \'active\';"',
          impact: 'Instantly breaks deadlock cycles and flushes blocked thread queues',
          type: 'flush',
          estimatedMitigationTime: '10 seconds'
        },
        {
          id: 'act-dl-2',
          title: 'Apply rate limiter on RabbitMQ order ingestion queue',
          command: 'rabbitmqctl set_policy limits "^order.process" \'{"max-length": 500}\' --apply-to queues',
          impact: 'Stops retry storms from re-triggering deadlock until code patch rolls out',
          type: 'circuit_break',
          estimatedMitigationTime: '25 seconds'
        }
      ],
      permanentPatch: {
        prTitle: 'fix(saga): standardize global monotonic lock ordering across all distributed saga steps',
        filePath: 'src/main/java/com/retail/saga/InventorySagaStep.java',
        codeBefore: `// Culprit Code (Causing Circular Wait Deadlock):
@Transactional
public void reserveStock(String skuId, String warehouseId) {
    // Lock B first, then Lock A -> Deadlock against OrderSagaStep!
    WarehouseReservation wh = warehouseRepo.findAndLockById(warehouseId);
    SkuInventory sku = skuRepo.findAndLockById(skuId);
    wh.decrement(sku.getQuantity());
}`,
        codeAfter: `// Autonomous Remediation Patch:
@Transactional
public void reserveStock(String skuId, String warehouseId) {
    // Strictly follow global alphanumeric locking order: always SKU first, then Warehouse
    SkuInventory sku = skuRepo.findAndLockById(skuId);
    WarehouseReservation wh = warehouseRepo.findAndLockById(warehouseId);
    wh.decrement(sku.getQuantity());
}`,
        explanation: 'Enforced universal monotonic lock acquisition order (SKU entity followed by Warehouse entity) across all transaction orchestrators, eliminating the circular wait condition required for deadlocks.'
      },
      postMortemReport: {
        incidentId: 'INC-2026-0927-DL04',
        severity: 'P1-CRITICAL',
        businessImpact: 'Threat of complete fulfillment pipeline halt affecting 22,000 orders/hr. Caught 6 minutes prior to total lockup.',
        recoveryActionTaken: 'Locking transactions terminated; standardized lock sequence patch deployed.',
        architecturalRecommendations: [
          'Introduce distributed lock manager (Redlock or etcd) with mandatory strict timeout on lock acquisition.',
          'Add automated static analysis in pull requests to verify lock acquisition hierarchy.'
        ]
      }
    },
    metrics: [
      { time: '12:00', cpu: 30, memory: 50, dbPoolUtil: 25, p99Latency: 60, errorRate: 0.02, lockWaitMs: 4 },
      { time: '12:05', cpu: 32, memory: 51, dbPoolUtil: 28, p99Latency: 65, errorRate: 0.03, lockWaitMs: 5 },
      { time: '12:10', cpu: 35, memory: 52, dbPoolUtil: 30, p99Latency: 72, errorRate: 0.04, lockWaitMs: 8 },
      { time: '12:15', cpu: 52, memory: 58, dbPoolUtil: 55, p99Latency: 820, errorRate: 2.1, lockWaitMs: 1420 },
      { time: '12:20', cpu: 74, memory: 65, dbPoolUtil: 82, p99Latency: 3900, errorRate: 14.5, lockWaitMs: 12400 },
      { time: '12:25', cpu: 92, memory: 78, dbPoolUtil: 96, p99Latency: 11400, errorRate: 32.8, lockWaitMs: 28900 },
      { time: '12:30', cpu: 98, memory: 84, dbPoolUtil: 99, p99Latency: 18500, errorRate: 41.2, lockWaitMs: 42800 }
    ],
    logs: [
      { id: 'ld1', timestamp: '12:14:10', service: 'inventory-service', level: 'INFO', message: 'Saga worker deployed commit c4928db4' },
      { id: 'ld2', timestamp: '12:19:30', service: 'postgres-db-cluster', level: 'ERROR', message: 'deadlock detected: Process 18412 waits for ExclusiveLock on relation warehouse_reservation; blocked by process 18419', isCulprit: true },
      { id: 'ld3', timestamp: '12:22:15', service: 'order-saga-orchestrator', level: 'ERROR', message: 'TransactionRolledBackException: Deadlock detected in Saga step reserveStock. Triggering retry #1', isCulprit: true },
      { id: 'ld4', timestamp: '12:26:40', service: 'postgres-db-cluster', level: 'FATAL', message: 'Lock table saturated: 38 transactions in state active waiting on Lock acquire > 30000ms' },
      { id: 'ld5', timestamp: '12:29:55', service: 'warehouse-dispatch', level: 'FATAL', message: 'Circuit breaker opened: 41% of order fulfillment calls failing with HTTP 500' }
    ],
    traces: [
      {
        id: 'trace-dl-701',
        service: 'order-saga-orchestrator',
        name: 'Saga.ExecuteOrderFulfillment',
        durationMs: 18500,
        status: 'ERROR',
        children: [
          {
            id: 'trace-dl-inv',
            service: 'inventory-service',
            name: 'InventorySagaStep.reserveStock',
            durationMs: 18450,
            status: 'ERROR',
            children: [
              {
                id: 'trace-dl-pg',
                service: 'postgres-db-cluster',
                name: 'SELECT ... FOR UPDATE (Lock Wait)',
                durationMs: 18400,
                status: 'SLOW'
              }
            ]
          }
        ]
      }
    ],
    deployment: {
      hash: 'c4928db4',
      author: 'lead-sneha@retail.io',
      timestamp: '45 minutes ago',
      message: 'feat(inventory): reorder reservation lock check to prioritize fast warehouse dispatch',
      service: 'inventory-service',
      changedFiles: ['src/main/java/com/retail/saga/InventorySagaStep.java'],
      diffPreview: '- lock(sku_inventory); lock(warehouse_reservation);\n+ lock(warehouse_reservation); lock(sku_inventory); // INVERTED LOCK ORDER!',
      riskScore: 94
    },
    database: {
      activeConnections: 99,
      maxConnections: 100,
      waitingThreads: 38,
      slowQueryCount: 780,
      deadlocks: 18,
      topOffenderQuery: 'SELECT * FROM warehouse_reservation WHERE id = ? FOR UPDATE (Waiting on ExclusiveLock)'
    }
  }
];
