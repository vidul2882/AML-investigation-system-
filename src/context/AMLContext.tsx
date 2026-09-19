import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Transaction,
  Account,
  AMLCase,
  AMLSettings,
  NotificationItem,
  ActiveView,
  CaseStatus,
} from '../types';
import {
  initialTransactions,
  initialAccounts,
  initialCases,
  initialSettings,
  initialNotifications,
} from '../data/mockData';
import { runAmlDetectionEngine, DetectionResult } from '../services/amlDetectionEngine';
import { generateAIExplanation } from '../services/aiInvestigatorService';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

export interface JudgeDemoState {
  isActive: boolean;
  step: number; // 1 to 11
  isAutoPlaying: boolean;
  stepDescription: string;
}

interface AMLContextType {
  // Core Data
  transactions: Transaction[];
  accounts: Account[];
  cases: AMLCase[];
  settings: AMLSettings;
  notifications: NotificationItem[];
  detectionResult: DetectionResult;

  // Navigation & Selection
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  selectedCaseId: string | null;
  setSelectedCaseId: (id: string | null) => void;
  selectedTransactionId: string | null;
  setSelectedTransactionId: (id: string | null) => void;
  selectedAccountId: string | null;
  setSelectedAccountId: (id: string | null) => void;
  highlightedPath: string[];
  setHighlightedPath: (path: string[]) => void;

  // Selected Entities
  activeCase: AMLCase | null;
  activeTransaction: Transaction | null;
  activeAccount: Account | null;

  // Search & Filters
  globalSearchQuery: string;
  setGlobalSearchQuery: (query: string) => void;
  isSearchModalOpen: boolean;
  setIsSearchModalOpen: (open: boolean) => void;

  // Actions
  loadScenario: (scenarioNumber: 1 | 2 | 3) => void;
  importCsvTransactions: (csvString: string) => { success: boolean; message: string; count?: number };
  createCase: (caseInput: {
    title: string;
    risk: AMLCase['risk'];
    pattern: string;
    amount: number;
    accounts: string[];
    transactions: string[];
    description: string;
    investigator: string;
  }) => AMLCase;
  updateCaseStatus: (caseId: string, status: CaseStatus) => void;
  addCaseNote: (caseId: string, text: string) => void;
  updateSettings: (newSettings: Partial<AMLSettings>) => void;
  resetDemoData: () => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;

  // Judge Demo Mode
  judgeDemo: JudgeDemoState;
  startJudgeDemo: () => void;
  nextJudgeDemoStep: () => void;
  prevJudgeDemoStep: () => void;
  stopJudgeDemo: () => void;
  toggleJudgeDemoAutoplay: () => void;

  // Toasts
  toasts: ToastMessage[];
  showToast: (message: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;

  // Auth/Session
  isLoggedIn: boolean;
  currentUser: {
    name: string;
    email: string;
    role: string;
  } | null;
  loginUser: (email?: string) => void;
  logoutUser: () => void;

  // AI & Scenarios helpers
  aiForensics: Record<
    string,
    {
      caseId: string;
      confidenceScore: number;
      summary: string;
      whySuspicious: string[];
      moneyFlowNarrative: string;
      recommendedActions: string[];
      evidencePoints: string[];
    }
  >;
  resetToDefaultData: () => void;
  loadDemoScenario: (scenarioType: 'layering' | 'circular' | 'rapid' | 1 | 2 | 3) => void;
}

const AMLContext = createContext<AMLContextType | undefined>(undefined);

const STORAGE_KEYS = {
  TRANSACTIONS: 'amlens_transactions_v2',
  ACCOUNTS: 'amlens_accounts_v2',
  CASES: 'amlens_cases_v2',
  SETTINGS: 'amlens_settings_v2',
  NOTIFICATIONS: 'amlens_notifications_v2',
  LOGGED_IN: 'amlens_auth_v2',
};

export const AMLProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEYS.LOGGED_IN) === 'true';
  });

  // Data states with localStorage initialization
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved transactions', e);
      }
    }
    return initialTransactions;
  });

  const [accounts, setAccounts] = useState<Account[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved accounts', e);
      }
    }
    return initialAccounts;
  });

  const [cases, setCases] = useState<AMLCase[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CASES);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved cases', e);
      }
    }
    return initialCases;
  });

  const [settings, setSettings] = useState<AMLSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved settings', e);
      }
    }
    return initialSettings;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse notifications', e);
      }
    }
    return initialNotifications;
  });

  // UI Navigation states
  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>('CASE-001');
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [highlightedPath, setHighlightedPath] = useState<string[]>(['A101', 'B205', 'C301', 'D410', 'E512']);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (message: string, type: ToastMessage['type'] = 'info') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync with LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CASES, JSON.stringify(cases));
  }, [cases]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LOGGED_IN, String(isLoggedIn));
  }, [isLoggedIn]);

  // Run detection engine dynamically when transactions, accounts, or settings change
  const detectionResult = useMemo(() => {
    return runAmlDetectionEngine(transactions, accounts, settings);
  }, [transactions, accounts, settings]);

  // Active Entities
  const activeCase = useMemo(() => {
    if (!selectedCaseId) return cases[0] || null;
    return cases.find((c) => c.id === selectedCaseId) || cases[0] || null;
  }, [cases, selectedCaseId]);

  const activeTransaction = useMemo(() => {
    if (!selectedTransactionId) return null;
    return transactions.find((t) => t.id === selectedTransactionId) || null;
  }, [transactions, selectedTransactionId]);

  const activeAccount = useMemo(() => {
    if (!selectedAccountId) return null;
    return accounts.find((a) => a.id === selectedAccountId) || null;
  }, [accounts, selectedAccountId]);

  // Auth functions
  const currentUser = useMemo(() => {
    if (!isLoggedIn) return null;
    return {
      name: 'Inspector Priya Rao',
      email: 'priya.rao@amlens.gov.in',
      role: 'Lead Financial Crime Analyst',
    };
  }, [isLoggedIn]);

  const loginUser = (email?: string) => {
    setIsLoggedIn(true);
    showToast(`Signed in as ${email || 'investigator@amlens.demo'} (Demo Mode)`, 'success');
  };

  const logoutUser = () => {
    setIsLoggedIn(false);
    showToast('Signed out of AMLens session', 'info');
  };

  // Scenario Loader
  const loadScenario = (scenarioNumber: 1 | 2 | 3) => {
    if (scenarioNumber === 1) {
      // Layering
      setHighlightedPath(['A101', 'B205', 'C301', 'D410', 'E512']);
      setSelectedCaseId('CASE-001');
      showToast('Scenario 1 loaded: Layering Attack across 5 accounts (₹4.5 Cr)', 'warning');
    } else if (scenarioNumber === 2) {
      // Circular Flow
      setHighlightedPath(['P100', 'Q200', 'R300', 'P100']);
      setSelectedCaseId('CASE-003');
      showToast('Scenario 2 loaded: Circular Round-Tripping (₹1.2 Cr)', 'warning');
    } else if (scenarioNumber === 3) {
      // Rapid Movement
      setHighlightedPath(['M101', 'M202', 'M303', 'M404']);
      setSelectedCaseId('CASE-002');
      showToast('Scenario 3 loaded: Rapid Smurfing Movement (₹82 Lakh in 6 mins)', 'warning');
    }
  };

  const loadDemoScenario = (scenarioType: 'layering' | 'circular' | 'rapid' | 1 | 2 | 3) => {
    if (scenarioType === 'layering' || scenarioType === 1) {
      loadScenario(1);
    } else if (scenarioType === 'circular' || scenarioType === 2) {
      loadScenario(2);
    } else if (scenarioType === 'rapid' || scenarioType === 3) {
      loadScenario(3);
    }
    setActiveView('network');
  };

  const resetToDefaultData = () => {
    resetDemoData();
  };

  // AI Forensic synthesis
  const aiForensics = useMemo(() => {
    const map: Record<
      string,
      {
        caseId: string;
        confidenceScore: number;
        summary: string;
        whySuspicious: string[];
        moneyFlowNarrative: string;
        recommendedActions: string[];
        evidencePoints: string[];
      }
    > = {};

    cases.forEach((c) => {
      const exp = generateAIExplanation(c, transactions, accounts);
      map[c.id] = {
        caseId: c.id,
        confidenceScore: exp.confidenceScore,
        summary: exp.executiveNarrative,
        whySuspicious: exp.whySuspicious.map((w) => `${w.title}: ${w.description}`),
        moneyFlowNarrative: exp.transactionPathDescription,
        recommendedActions: exp.recommendedActions,
        evidencePoints: exp.whySuspicious.map((w) => w.description),
      };
    });

    return map;
  }, [cases, transactions, accounts]);

  // CSV Importer
  const importCsvTransactions = (csvString: string) => {
    try {
      const lines = csvString.trim().split('\n');
      if (lines.length < 2) {
        return { success: false, message: 'CSV file is empty or missing data rows.' };
      }

      const header = lines[0].toLowerCase().split(',').map((h) => h.trim().replace(/"/g, ''));
      const requiredColumns = ['transaction_id', 'from_account', 'to_account', 'amount', 'timestamp'];
      const missing = requiredColumns.filter((c) => !header.includes(c));
      if (missing.length > 0) {
        return {
          success: false,
          message: `Missing required CSV column(s): ${missing.join(', ')}. Expected: transaction_id, from_account, to_account, amount, timestamp`,
        };
      }

      const idIdx = header.indexOf('transaction_id');
      const fromIdx = header.indexOf('from_account');
      const toIdx = header.indexOf('to_account');
      const amountIdx = header.indexOf('amount');
      const timeIdx = header.indexOf('timestamp');

      const newTxs: Transaction[] = [];
      const parsedAccountIds = new Set<string>();

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const cols = line.split(',').map((c) => c.trim().replace(/"/g, ''));
        const txId = cols[idIdx];
        const from = cols[fromIdx];
        const to = cols[toIdx];
        const amount = parseFloat(cols[amountIdx]);
        const timestamp = cols[timeIdx];

        if (!txId || !from || !to) {
          return { success: false, message: `Row ${i + 1} has invalid or empty account/transaction IDs.` };
        }
        if (isNaN(amount) || amount <= 0) {
          return { success: false, message: `Row ${i + 1} has invalid transaction amount: "${cols[amountIdx]}". Must be positive number.` };
        }

        parsedAccountIds.add(from);
        parsedAccountIds.add(to);

        newTxs.push({
          id: txId,
          from,
          to,
          amount,
          timestamp: timestamp || new Date().toISOString(),
          risk: amount >= settings.highValueThreshold ? 'SUSPICIOUS' : 'NORMAL',
          patterns: amount >= settings.highValueThreshold ? ['HIGH_VALUE'] : ['NORMAL'],
          status: 'CLEARED',
          narrative: `Imported transaction ${txId}: ${from} ➔ ${to} (₹${amount.toLocaleString('en-IN')})`,
        });
      }

      // Check duplicates
      const existingIds = new Set(transactions.map((t) => t.id));
      const deduplicated = newTxs.filter((t) => !existingIds.has(t.id));

      if (deduplicated.length === 0) {
        return { success: false, message: 'All transactions in this CSV already exist in the database (duplicate IDs).' };
      }

      // Add missing accounts
      const existingAccIds = new Set(accounts.map((a) => a.id));
      const newAccounts: Account[] = [];
      parsedAccountIds.forEach((accId) => {
        if (!existingAccIds.has(accId)) {
          newAccounts.push({
            id: accId,
            name: `Entity ${accId}`,
            type: 'BUSINESS',
            ageMonths: 6,
            risk: 'NORMAL',
            totalInflow: 0,
            totalOutflow: 0,
            transactionCount: 0,
            connectedAccounts: [],
            firstSeen: new Date().toISOString(),
            lastSeen: new Date().toISOString(),
            riskIndicators: [],
          });
        }
      });

      const mergedTransactions = [...transactions, ...deduplicated];
      const mergedAccounts = [...accounts, ...newAccounts];

      setTransactions(mergedTransactions);
      setAccounts(mergedAccounts);

      showToast(`Successfully imported ${deduplicated.length} transactions and ran AML detection scan!`, 'success');
      return { success: true, message: `Imported ${deduplicated.length} transactions.`, count: deduplicated.length };
    } catch (err) {
      console.error(err);
      return { success: false, message: 'Failed to parse CSV file. Ensure formatting is standard comma-separated.' };
    }
  };

  // Case Actions
  const createCase = (caseInput: {
    title: string;
    risk: AMLCase['risk'];
    pattern: string;
    amount: number;
    accounts: string[];
    transactions: string[];
    description: string;
    investigator: string;
  }): AMLCase => {
    const nextNum = cases.length + 1;
    const padded = nextNum < 10 ? `00${nextNum}` : nextNum < 100 ? `0${nextNum}` : `${nextNum}`;
    const newCaseId = `CASE-${padded}`;

    const newCase: AMLCase = {
      id: newCaseId,
      title: caseInput.title,
      risk: caseInput.risk,
      pattern: caseInput.pattern,
      amount: caseInput.amount,
      accounts: caseInput.accounts,
      transactions: caseInput.transactions,
      status: 'OPEN',
      investigator: caseInput.investigator || 'Inspector Priya Rao (FIU-IND)',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      description: caseInput.description,
      notes: [
        {
          id: `NOTE-${Date.now()}`,
          author: caseInput.investigator || 'Inspector Priya Rao',
          timestamp: new Date().toLocaleTimeString(),
          text: 'Case docket generated from forensic pattern detection evidence.',
        },
      ],
      evidence: detectionResult.evidenceList.filter((e) =>
        e.relatedAccounts.some((a) => caseInput.accounts.includes(a))
      ),
      aiExplanation: `Forensic case docket initialized for ${newCaseId} targeting detected pattern ${caseInput.pattern}. Financial exposure under review is ₹${caseInput.amount.toLocaleString('en-IN')}.`,
      recommendedActions: [
        'Place administrative debit freeze on terminal beneficiary account',
        'Request corporate registrar extract for common directors',
        'Prepare Suspicious Transaction Report (STR)',
      ],
    };

    setCases((prev) => [newCase, ...prev]);
    setSelectedCaseId(newCaseId);
    showToast(`Case ${newCaseId} created successfully.`, 'success');
    return newCase;
  };

  const updateCaseStatus = (caseId: string, status: CaseStatus) => {
    setCases((prev) =>
      prev.map((c) => (c.id === caseId ? { ...c, status } : c))
    );
    showToast(`Case ${caseId} status updated to ${status}.`, 'info');
  };

  const addCaseNote = (caseId: string, text: string) => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id === caseId) {
          const newNote = {
            id: `NOTE-${Date.now()}`,
            author: 'Priya Rao (FIU-IND)',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            text,
          };
          return {
            ...c,
            notes: [...c.notes, newNote],
          };
        }
        return c;
      })
    );
    showToast('Investigation note added to case file.', 'success');
  };

  const updateSettings = (newSettings: Partial<AMLSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    showToast('AML Detection settings updated. Re-scanned transaction graph.', 'success');
  };

  const resetDemoData = () => {
    setTransactions(initialTransactions);
    setAccounts(initialAccounts);
    setCases(initialCases);
    setSettings(initialSettings);
    setNotifications(initialNotifications);
    setSelectedCaseId('CASE-001');
    setHighlightedPath(['A101', 'B205', 'C301', 'D410', 'E512']);
    showToast('Demo data restored to initial state.', 'info');
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('All notifications marked as read', 'info');
  };

  // Judge Demo Mode State & Stepper
  const [judgeDemo, setJudgeDemo] = useState<JudgeDemoState>({
    isActive: false,
    step: 1,
    isAutoPlaying: false,
    stepDescription: '',
  });

  const JUDGE_STEPS: { [key: number]: { title: string; desc: string; view: ActiveView } } = {
    1: {
      title: 'Step 1: Dashboard Overview',
      desc: 'AML Investigation Dashboard monitoring transactions, high-risk cases, and suspicious trends.',
      view: 'dashboard',
    },
    2: {
      title: 'Step 2: Load Layering Scenario',
      desc: 'Automatically loading the complex 5-node Layering Attack scenario.',
      view: 'dashboard',
    },
    3: {
      title: 'Step 3: Navigate to Money Network',
      desc: 'Visualizing transaction topology with accounts as nodes and money flows as directed arrows.',
      view: 'network',
    },
    4: {
      title: 'Step 4: Highlight Suspicious Flow',
      desc: 'Highlighting the multi-hop laundering path: A101 → B205 → C301 → D410 → E512.',
      view: 'network',
    },
    5: {
      title: 'Step 5: Inspect Amount Sequence',
      desc: 'Observed systematic commission step-down: ₹50,00,000 → ₹48,00,000 → ₹47,00,000 → ₹45,00,000.',
      view: 'network',
    },
    6: {
      title: 'Step 6: Velocity Analysis',
      desc: 'Chronological timeline proof: entire ₹4.5 Cr moved through 4 intermediaries within 8 minutes.',
      view: 'investigation',
    },
    7: {
      title: 'Step 7: Pattern Detection Rules Triggered',
      desc: 'Simultaneous breaches of: Layering, Rapid Movement, High Value Threshold, and Unusual Relationship.',
      view: 'investigation',
    },
    8: {
      title: 'Step 8: Open AI Investigator',
      desc: 'Launching the AI-assisted explainable transaction intelligence engine.',
      view: 'ai_investigator',
    },
    9: {
      title: 'Step 9: Generate Autonomous Explanation',
      desc: 'Producing human-readable forensic narrative with confidence metrics and inspection questions.',
      view: 'ai_investigator',
    },
    10: {
      title: 'Step 10: Manage Case CASE-001',
      desc: 'Reviewing docket CASE-001 with locked evidence items and investigator notes.',
      view: 'cases',
    },
    11: {
      title: 'Step 11: Export Judge-Ready Report',
      desc: 'Complete AML Investigation Report ready to Print, Export to HTML, or submit to FIU.',
      view: 'case_reports',
    },
  };

  const applyJudgeStep = (stepNumber: number) => {
    const stepConfig = JUDGE_STEPS[stepNumber];
    if (!stepConfig) return;

    setActiveView(stepConfig.view);
    setJudgeDemo((prev) => ({
      ...prev,
      step: stepNumber,
      stepDescription: stepConfig.desc,
    }));

    if (stepNumber === 2 || stepNumber === 4 || stepNumber === 5) {
      setHighlightedPath(['A101', 'B205', 'C301', 'D410', 'E512']);
      setSelectedCaseId('CASE-001');
    }
    if (stepNumber >= 6) {
      setSelectedCaseId('CASE-001');
    }
  };

  const startJudgeDemo = () => {
    setJudgeDemo({
      isActive: true,
      step: 1,
      isAutoPlaying: false,
      stepDescription: JUDGE_STEPS[1].desc,
    });
    applyJudgeStep(1);
    showToast('Judge Demo Mode started: Step 1 of 11', 'info');
  };

  const nextJudgeDemoStep = () => {
    if (judgeDemo.step < 11) {
      const nextStep = judgeDemo.step + 1;
      applyJudgeStep(nextStep);
    } else {
      stopJudgeDemo();
      showToast('Judge Demo completed successfully! All 11 criteria demonstrated.', 'success');
    }
  };

  const prevJudgeDemoStep = () => {
    if (judgeDemo.step > 1) {
      applyJudgeStep(judgeDemo.step - 1);
    }
  };

  const stopJudgeDemo = () => {
    setJudgeDemo({
      isActive: false,
      step: 1,
      isAutoPlaying: false,
      stepDescription: '',
    });
    showToast('Judge Demo mode exited', 'info');
  };

  const toggleJudgeDemoAutoplay = () => {
    setJudgeDemo((prev) => ({
      ...prev,
      isAutoPlaying: !prev.isAutoPlaying,
    }));
  };

  // Autoplay effect
  useEffect(() => {
    let timer: any;
    if (judgeDemo.isActive && judgeDemo.isAutoPlaying) {
      timer = setTimeout(() => {
        if (judgeDemo.step < 11) {
          nextJudgeDemoStep();
        } else {
          stopJudgeDemo();
        }
      }, 4000);
    }
    return () => clearTimeout(timer);
  }, [judgeDemo.isActive, judgeDemo.isAutoPlaying, judgeDemo.step]);

  return (
    <AMLContext.Provider
      value={{
        transactions,
        accounts,
        cases,
        settings,
        notifications,
        detectionResult,
        activeView,
        setActiveView,
        selectedCaseId,
        setSelectedCaseId,
        selectedTransactionId,
        setSelectedTransactionId,
        selectedAccountId,
        setSelectedAccountId,
        highlightedPath,
        setHighlightedPath,
        activeCase,
        activeTransaction,
        activeAccount,
        globalSearchQuery,
        setGlobalSearchQuery,
        isSearchModalOpen,
        setIsSearchModalOpen,
        loadScenario,
        importCsvTransactions,
        createCase,
        updateCaseStatus,
        addCaseNote,
        updateSettings,
        resetDemoData,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        judgeDemo,
        startJudgeDemo,
        nextJudgeDemoStep,
        prevJudgeDemoStep,
        stopJudgeDemo,
        toggleJudgeDemoAutoplay,
        toasts,
        showToast,
        removeToast,
        isLoggedIn,
        currentUser,
        loginUser,
        logoutUser,
        aiForensics,
        resetToDefaultData,
        loadDemoScenario,
      }}
    >
      {children}
    </AMLContext.Provider>
  );
};

export const useAML = () => {
  const context = useContext(AMLContext);
  if (!context) {
    throw new Error('useAML must be used within an AMLProvider');
  }
  return context;
};
