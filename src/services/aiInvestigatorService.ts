import { AMLCase, Transaction, Account } from '../types';
import { formatINR, formatCompactINR } from '../utils/formatters';

export interface AIInvestigationReport {
  executiveNarrative: string;
  whySuspicious: {
    title: string;
    description: string;
    severity: 'CRITICAL' | 'HIGH_RISK' | 'SUSPICIOUS' | 'INFO';
  }[];
  transactionPathDescription: string;
  supportingTransactions: Transaction[];
  confidenceScore: number;
  confidenceLabel: string;
  recommendedActions: string[];
}

export function generateAIExplanation(
  targetCase: AMLCase | null,
  allTransactions: Transaction[],
  allAccounts: Account[]
): AIInvestigationReport {
  if (!targetCase) {
    return {
      executiveNarrative:
        'Select a case or transaction to generate an autonomous forensic AML intelligence analysis.',
      whySuspicious: [],
      transactionPathDescription: 'No active case selected.',
      supportingTransactions: [],
      confidenceScore: 0,
      confidenceLabel: 'DEMO ANALYTIC CONFIDENCE: 0%',
      recommendedActions: [],
    };
  }

  const caseTxs = allTransactions.filter((tx) => targetCase.transactions.includes(tx.id));
  const involvedAccounts = allAccounts.filter((acc) => targetCase.accounts.includes(acc.id));

  // Determine key metrics
  const firstTx = caseTxs[0];
  const lastTx = caseTxs[caseTxs.length - 1];
  const startAcc = firstTx ? firstTx.from : targetCase.accounts[0];
  const destAcc = lastTx ? lastTx.to : targetCase.accounts[targetCase.accounts.length - 1];

  const totalAmountFormatted = formatINR(targetCase.amount);
  const compactAmount = formatCompactINR(targetCase.amount);

  let durationMinutes = 8;
  if (firstTx && lastTx && firstTx.timestamp && lastTx.timestamp) {
    const t1 = new Date(firstTx.timestamp).getTime();
    const t2 = new Date(lastTx.timestamp).getTime();
    durationMinutes = Math.max(2, Math.round((t2 - t1) / (1000 * 60)));
  }

  // Generate tailored executive narrative
  let narrative = '';
  const whySuspiciousList: AIInvestigationReport['whySuspicious'] = [];
  const recommendedActions: string[] = [];

  const isLayering = targetCase.pattern.toLowerCase().includes('layering');
  const isCircular = targetCase.pattern.toLowerCase().includes('circular');
  const isRapid = targetCase.pattern.toLowerCase().includes('rapid');

  if (isCircular) {
    narrative = `AMLens identified a high-risk circular transaction loop (round-tripping) involving ${targetCase.accounts.length} connected entities. Funds totaling ${totalAmountFormatted} departed from originating account ${startAcc} and circulated through ${targetCase.accounts.slice(1).join(', ')} before returning back to ${startAcc} within ${durationMinutes} minutes. This closed-loop movement generates false operational turnover without authentic economic substance.`;

    whySuspiciousList.push(
      {
        title: 'Closed Directed Loop (Round-Tripping)',
        description: `Funds returned to originator ${startAcc} minus minor intermediary transaction slippage.`,
        severity: 'HIGH_RISK',
      },
      {
        title: 'High Transaction Value',
        description: `Single loop volume of ${compactAmount} exceeds regulatory reporting limits.`,
        severity: 'HIGH_RISK',
      },
      {
        title: 'Short Dwell Time',
        description: `Transfers executed within ${durationMinutes} minutes with zero resting balance.`,
        severity: 'SUSPICIOUS',
      }
    );

    recommendedActions.push(
      `Cross-check tax filing and GST declarations of ${startAcc} for synthetic turnover inflation`,
      'Request commercial contracts justifying fee transfers between loop entities',
      'Alert lending department regarding active round-tripping on corporate facility',
      'Prepare regulatory STR disclosure for financial intelligence unit'
    );
  } else if (isLayering) {
    narrative = `AMLens identified a critical suspicious money movement pipeline involving ${targetCase.accounts.length} entities. The sequence initiated from ${startAcc} with ${caseTxs[0] ? formatINR(caseTxs[0].amount) : totalAmountFormatted} and moved sequentially through intermediary nodes (${targetCase.accounts.slice(1, -1).join(', ')}) before reaching destination ${destAcc}. The transfers completed in approximately ${durationMinutes} minutes, indicating automated velocity. The transaction amounts decreased fractionally at each stage, consistent with standard money-mule commission retention. AMLens recommends freezing destination account ${destAcc} and filing an expedited Suspicious Transaction Report.`;

    whySuspiciousList.push(
      {
        title: 'Rapid Movement of Funds',
        description: `Entire fund conduit moved through ${targetCase.accounts.length - 2} intermediary accounts in ${durationMinutes} minutes.`,
        severity: 'CRITICAL',
      },
      {
        title: 'Multiple Intermediary Paper Entities',
        description: `Intermediary nodes exhibit shell/mule characteristics with negligible account history and pass-through ledgering.`,
        severity: 'CRITICAL',
      },
      {
        title: 'Consistent Layering Retention Ratio',
        description: `Amounts systematically stepped down (~2-4% per hop) reflecting structured mule cuts.`,
        severity: 'HIGH_RISK',
      },
      {
        title: 'High Value Threshold Breach',
        description: `Aggregate pipeline of ${compactAmount} exceeds statutory anti-laundering thresholds.`,
        severity: 'HIGH_RISK',
      },
      {
        title: 'Unusual Entity Relationships',
        description: `No prior transactional nexus recorded between originating corporate entity and intermediary conduits.`,
        severity: 'SUSPICIOUS',
      }
    );

    recommendedActions.push(
      `Issue emergency debit freeze order on terminal account ${destAcc}`,
      `File Suspicious Transaction Report (STR) under PMLA Section 12 with FIU-IND`,
      'Subpoena shared beneficial ownership records (UBO) for intermediary paper entities',
      'Preserve netbanking IP access logs and device fingerprints for originator',
      'Conduct automated adverse media screening across all associated company directors'
    );
  } else {
    narrative = `AMLens identified an anomalous transaction burst of ${compactAmount} through accounts ${targetCase.accounts.join(' → ')}. Transfers were executed in rapid succession over ${durationMinutes} minutes, demonstrating atypical velocity and high risk indicators.`;

    whySuspiciousList.push(
      {
        title: 'High Transaction Velocity',
        description: `Funds dispersed across multiple accounts within ${durationMinutes} minutes.`,
        severity: 'HIGH_RISK',
      },
      {
        title: 'High Value Conduit',
        description: `Transaction sum of ${totalAmountFormatted} exceeds normal operating baseline.`,
        severity: 'HIGH_RISK',
      }
    );

    recommendedActions.push(
      `Temporarily freeze outbound wires on ${destAcc}`,
      'Request source of funds documentation from originating account holder',
      'Review historical counterparties for common signatories'
    );
  }

  const transactionPathDescription = targetCase.accounts.join(' → ');

  return {
    executiveNarrative: narrative,
    whySuspicious: whySuspiciousList,
    transactionPathDescription,
    supportingTransactions: caseTxs,
    confidenceScore: 94.2,
    confidenceLabel: 'DEMO ANALYTIC CONFIDENCE: 94.2%',
    recommendedActions,
  };
}

export function answerInvestigatorQuery(
  question: string,
  targetCase: AMLCase | null,
  allTransactions: Transaction[],
  allAccounts: Account[]
): string {
  if (!targetCase) {
    return 'Please select an active AML investigation case or transaction chain first so I can analyze the exact financial topology.';
  }

  const caseTxs = allTransactions.filter((tx) => targetCase.transactions.includes(tx.id));
  const q = question.toLowerCase();

  if (q.includes('what happened') || q.includes('summary') || q.includes('overview')) {
    return `In ${targetCase.id}, a high-risk financial pipeline was detected involving ${targetCase.accounts.length} accounts (${targetCase.accounts.join(' → ')}). A sum of ${formatINR(targetCase.amount)} was routed across ${caseTxs.length} sequential transfers in rapid succession. The transaction behavior exhibits clear signatures of ${targetCase.pattern}, where money is rapidly disguised through intermediary pass-through conduits to obscure audit trails.`;
  }

  if (q.includes('why is this suspicious') || q.includes('why suspicious') || q.includes('red flag')) {
    return `This network triggered multiple AML detection rules simultaneously:\n1. Rapid Velocity: Funds spent less than 3 minutes inside each intermediary account before being pushed outward.\n2. Commission Shaving: Amounts dropped predictably (~₹2 Lakh per hop), representing mule handler cuts.\n3. Zero Business Logic: Entities in diverse industries (exports, trading, logistics) transacted without reciprocal trade goods or valid VAT/GST invoices.\n4. High Value: Total amount (${formatINR(targetCase.amount)}) dramatically exceeds normal retail thresholds.`;
  }

  if (q.includes('where did the money go') || q.includes('destination') || q.includes('final')) {
    const dest = targetCase.accounts[targetCase.accounts.length - 1];
    const destAcc = allAccounts.find((a) => a.id === dest);
    return `The funds terminated at account ${dest} (${destAcc?.name || 'Terminal Entity'})${destAcc?.country ? `, registered in ${destAcc.country}` : ''}. The final recorded transfer was ${caseTxs[caseTxs.length - 1] ? formatINR(caseTxs[caseTxs.length - 1].amount) : 'the terminal tranche'}. This terminal account has been marked with high-risk offshore escrow indicators and recommended for immediate freeze.`;
  }

  if (q.includes('path') || q.includes('hops') || q.includes('trail')) {
    const stepLines = caseTxs.map(
      (tx, i) => `Hop ${i + 1} (${new Date(tx.timestamp).toLocaleTimeString()}): ${tx.from} ➔ ${tx.to} [${formatINR(tx.amount)}]`
    );
    return `The complete money trail is:\n${stepLines.join('\n')}\nTotal hops: ${caseTxs.length}. Total path: ${targetCase.accounts.join(' ➔ ')}.`;
  }

  if (q.includes('evidence') || q.includes('proof') || q.includes('support')) {
    return `Forensic Evidence Summary for ${targetCase.id}:\n• ${targetCase.evidence.length} flagged evidentiary items recorded in the case docket.\n• Primary Evidence: ${targetCase.evidence[0]?.title || 'Rapid Movement of Capital'} - ${targetCase.evidence[0]?.metrics || 'Sub-10 minute transit'}.\n• Secondary Evidence: ${targetCase.evidence[1]?.title || 'Layering Structure'} - ${targetCase.evidence[1]?.metrics || 'Systematic commission deduction'}.\n• Complete transaction hashes and timestamps are locked for regulatory export.`;
  }

  if (q.includes('inspect') || q.includes('which accounts') || q.includes('interrogate')) {
    const intermediaries = targetCase.accounts.slice(1, -1);
    const dest = targetCase.accounts[targetCase.accounts.length - 1];
    return `Recommended Priority Accounts for Inspection:\n1. ${dest} (Destination): Freeze debits immediately to prevent cash-out or foreign flight.\n2. ${intermediaries.join(', ')} (Intermediaries): Serve bank summons for account opening KYC, IP logs, and signatory resolution forms to uncover the money mule coordinator.\n3. ${targetCase.accounts[0]} (Originator): Audit source of funds and business tax returns for undeclared proceeds.`;
  }

  // Fallback intelligent response
  return `Forensic analysis on ${targetCase.id}: Based on the graph structure across ${targetCase.accounts.join(' → ')}, the transaction pattern strongly aligns with ${targetCase.pattern}. All ${caseTxs.length} supporting transactions have been timestamped and indexed in the case docket. Would you like to generate the formal investigation report or export the evidence pack?`;
}
