export type RiskLevel = 'NORMAL' | 'SUSPICIOUS' | 'HIGH_RISK' | 'CRITICAL';

export type CaseStatus = 'OPEN' | 'UNDER_REVIEW' | 'ESCALATED' | 'CLOSED';

export type TransactionStatus = 'CLEARED' | 'FLAGGED' | 'FROZEN' | 'UNDER_REVIEW';

export type AMLPatternType =
  | 'LAYERING'
  | 'CIRCULAR_TRANSFER'
  | 'RAPID_MOVEMENT'
  | 'UNUSUAL_RELATIONSHIP'
  | 'HIGH_VALUE'
  | 'NORMAL';

export interface Transaction {
  id: string;
  from: string;
  to: string;
  amount: number;
  timestamp: string; // ISO or readable format
  risk: RiskLevel;
  patterns: AMLPatternType[];
  velocityMinutes?: number;
  status: TransactionStatus;
  notes?: string;
  hopIndex?: number;
  narrative?: string;
}

export interface Account {
  id: string;
  name?: string;
  type: 'INDIVIDUAL' | 'BUSINESS' | 'SHELL_CORP' | 'MULE' | 'OVERSEAS_ENTITY' | 'SAVINGS' | 'CURRENT';
  ageMonths: number;
  risk: RiskLevel;
  totalInflow: number;
  totalOutflow: number;
  transactionCount: number;
  connectedAccounts: string[];
  firstSeen: string;
  lastSeen: string;
  riskIndicators: string[];
  bankBranch?: string;
  country?: string;
  panOrGst?: string;
}

export interface EvidenceItem {
  id: string;
  title: string;
  category: AMLPatternType;
  description: string;
  metrics: string;
  relatedTransactions: string[];
  relatedAccounts: string[];
  severity: RiskLevel;
}

export interface CaseNote {
  id: string;
  author: string;
  timestamp: string;
  text: string;
}

export interface AMLCase {
  id: string;
  title: string;
  risk: RiskLevel;
  pattern: string;
  amount: number;
  accounts: string[];
  transactions: string[];
  status: CaseStatus;
  investigator: string;
  createdAt: string;
  description: string;
  notes: CaseNote[];
  evidence: EvidenceItem[];
  aiExplanation?: string;
  recommendedActions?: string[];
}

export interface AMLSettings {
  highValueThreshold: number; // default: 1000000 (10 Lakh)
  rapidMovementWindowMinutes: number; // default: 10
  minLayeringHops: number; // default: 3
  amountRetentionTolerancePct: number; // default: 30
  circularFlowThreshold: number; // default: 1000000
  theme: 'light';
  demoMode: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'CRITICAL' | 'WARNING' | 'INFO';
  timestamp: string;
  read: boolean;
  linkView?: string;
  linkId?: string;
}

export type ActiveView =
  | 'dashboard'
  | 'transactions'
  | 'network'
  | 'cases'
  | 'investigation'
  | 'ai_investigator'
  | 'case_reports'
  | 'demo_scenarios'
  | 'settings';
