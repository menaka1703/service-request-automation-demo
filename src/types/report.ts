export interface ExecutionEnvironment {
  environment: 'Local' | 'CI';
  testedBuild: string;
  gitCommitSha: string;
  gitBranch: string;
  buildIdentifier: string;
  executionDate: string;
  timezone: string;
  os: string;
  nodeVersion: string;
  npmVersion: string;
  playwrightVersion: string;
  browser: string;
  browserVersion: string;
  databaseConfig: string;
  buildStatusNote: string;
}

export interface HubResult {
  hubName: string;
  passed: number;
  failed: number;
  flaky: number;
  skipped: number;
  blocked: number;
  notRun: number;
  total: number;
  durationMs: number;
  overallStatus: 'PASS' | 'FAIL' | 'BLOCKED' | 'PARTIAL';
}

export interface BusinessWorkflow {
  id: string;
  name: string;
  hub: string;
  coverageStatus: 'Covered' | 'Partially Covered' | 'Not Covered';
  associatedSpecs: string[];
  manualTestingRequired: boolean;
  coverageGapNotes: string;
}

export interface CodeChange {
  commitSha: string;
  prNumber: string;
  author: string;
  summary: string;
  changedFiles: string[];
  isConfirmedRootCause: boolean;
  investigationNotes: string;
}

export interface FailureRecord {
  failureId: string;
  testTitle: string;
  specFile: string;
  hub: string;
  workflow: string;
  failureType: 'New' | 'Continuing';
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  errorSummary: string;
  evidence: {
    stdoutSnippet?: string;
    screenshotPath?: string;
    tracePath?: string;
    logPath?: string;
    htmlReportLink?: string;
  };
  assignedOwner: string;
  investigationStatus: string;
  confirmedRootCause: string;
}

export interface FixRetestRecord {
  fixCommitSha: string;
  originalFailureId: string;
  retestExecutionId: string;
  testedBuild: string;
  retestResult: 'Passed' | 'Failed' | 'Not Run' | 'Blocked';
  fixAuthor: string;
  independentVerifier: string;
  verificationNotes: string;
}

export interface PendingDecisionAction {
  id: string;
  title: string;
  category: 'Decision' | 'Missing Integration' | 'Blocked Suite' | 'Coverage Gap';
  description: string;
  recommendedNextAction: string;
  owner: string;
  dueDate: string;
  status: 'Open' | 'In Progress' | 'Blocked';
}

export interface ConsolidatedDailyReport {
  reportId: string;
  generatedAt: string;
  environment: ExecutionEnvironment;
  kpis: {
    totalTests: number;
    passed: number;
    failed: number;
    flaky: number;
    skipped: number;
    blocked: number;
    notRun: number;
    durationMs: number;
    passRate: number;
    overallStatus: 'PASS' | 'FAIL' | 'WARNING';
  };
  hubs: HubResult[];
  workflows: BusinessWorkflow[];
  codeChanges: {
    previousTestedCommit: string;
    currentTestedCommit: string;
    changes: CodeChange[];
    disclaimer: string;
  };
  failures: FailureRecord[];
  fixRetests: FixRetestRecord[];
  pendingActions: PendingDecisionAction[];
  isDemoCaseStudy?: boolean;
}

export interface ReportSummaryItem {
  reportId: string;
  generatedAt: string;
  environment: string;
  overallStatus: 'PASS' | 'FAIL' | 'WARNING';
  totalTests: number;
  passed: number;
  failed: number;
  durationMs: number;
  htmlFile: string;
  jsonFile: string;
  htmlPath?: string;
  jsonPath?: string;
}
