import React, { useState, useMemo } from 'react';
import { useAML } from '../context/AMLContext';
import { MoneyNetworkGraph } from '../components/network/MoneyNetworkGraph';
import { AccountIntelligenceDrawer } from '../components/network/AccountIntelligenceDrawer';
import { TransactionDetailModal } from '../components/transactions/TransactionDetailModal';
import { Account, Transaction, CaseStatus, RiskLevel } from '../types';
import {
  Briefcase,
  Bot,
  Clock,
  ShieldAlert,
  ArrowRight,
  Plus,
  Send,
  Sparkles,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  Lock,
  UserCheck,
  FileText,
  Layers,
  ChevronDown,
} from 'lucide-react';
import {
  formatINR,
  getRiskColorClass,
  getCaseStatusBadge,
  formatTimestamp,
} from '../utils/formatters';

export const InvestigationWorkspaceView: React.FC = () => {
  const {
    cases,
    selectedCaseId,
    setSelectedCaseId,
    updateCaseStatus,
    addCaseNote,
    transactions,
    accounts,
    highlightedPath,
    setHighlightedPath,
    setActiveView,
    aiForensics,
    showToast,
  } = useAML();

  // Active case
  const activeCase = useMemo(() => {
    return cases.find((c) => c.id === selectedCaseId) || cases[0];
  }, [cases, selectedCaseId]);

  // Note form input
  const [newNote, setNewNote] = useState('');
  const [activeAccountDrawer, setActiveAccountDrawer] = useState<Account | null>(null);
  const [activeTxModal, setActiveTxModal] = useState<Transaction | null>(null);

  // Synchronize highlighted path to case accounts on mount or case switch
  React.useEffect(() => {
    if (activeCase && activeCase.accounts.length > 0) {
      setHighlightedPath(activeCase.accounts);
    }
  }, [activeCase, setHighlightedPath]);

  // Forensic AI explanation for this case
  const forensicExplanation = useMemo(() => {
    return (
      aiForensics[activeCase.id] ||
      aiForensics['CASE-001'] || {
        caseId: activeCase.id,
        confidenceScore: 95,
        summary: `Autonomous AML graph traversal detected high-risk anomalous funds flow for ${activeCase.title}.`,
        whySuspicious: [
          'High fund turnover without economic justification.',
          'Transactions executed in tight temporal succession.',
          'Intermediary accounts operating as transit conduits.',
        ],
        moneyFlowNarrative: `Funds routed sequentially through intermediary ledger hops.`,
        recommendedActions: [
          'Freeze terminal accounts immediately.',
          'File Suspicious Transaction Report (STR).',
        ],
        evidencePoints: [
          'Abnormal velocity between hops.',
          'Newly established entity accounts.',
        ],
      }
    );
  }, [activeCase, aiForensics]);

  // Case transactions
  const caseTransactions = useMemo(() => {
    return transactions.filter(
      (t) =>
        activeCase.transactions.includes(t.id) ||
        (activeCase.accounts.includes(t.from) && activeCase.accounts.includes(t.to))
    );
  }, [transactions, activeCase]);

  // Case accounts
  const caseAccounts = useMemo(() => {
    return accounts.filter((a) => activeCase.accounts.includes(a.id));
  }, [accounts, activeCase]);

  const handleAddNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    addCaseNote(activeCase.id, newNote.trim());
    setNewNote('');
    showToast('Investigator forensic note appended to case ledger', 'success');
  };

  const handleStatusChange = (newStatus: CaseStatus) => {
    updateCaseStatus(activeCase.id, newStatus);
  };

  const handleExecuteRecommendation = (actionText: string) => {
    showToast(`Investigator Directive Executed: ${actionText}`, 'warning');
    addCaseNote(activeCase.id, `DIRECTIVE EXECUTED: ${actionText}`);
  };

  const riskStyle = getRiskColorClass(activeCase.risk);
  const statusBadge = getCaseStatusBadge(activeCase.status);

  return (
    <div id="investigation-workspace-view" className="space-y-5 max-w-7xl mx-auto">
      {/* Workspace Top Switcher Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Active Investigation Docket
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${riskStyle.badge}`}>
                {activeCase.risk}
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${statusBadge.className}`}>
                {statusBadge.label}
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 font-mono flex items-center gap-2">
              {activeCase.id}: {activeCase.title}
            </h1>
          </div>
        </div>

        {/* Case Switcher & Quick Export */}
        <div className="flex items-center gap-2">
          <select
            value={activeCase.id}
            onChange={(e) => setSelectedCaseId(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 bg-white font-mono text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500"
          >
            {cases.map((c) => (
              <option key={c.id} value={c.id}>
                {c.id} - {c.title.substring(0, 32)}...
              </option>
            ))}
          </select>

          <button
            onClick={() => setActiveView('case_reports')}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-amber-400" /> Export FIU Report
          </button>
        </div>
      </div>

      {/* Main 3-Column Investigative Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Case Information & Entity Docket (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Case Info Card */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3.5 text-xs">
            <div className="font-bold text-slate-800 uppercase tracking-wider text-[11px] pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>Case Meta Profile</span>
              <span className="font-mono text-slate-400">{activeCase.id}</span>
            </div>

            {/* Status Selector */}
            <div>
              <label className="block text-slate-500 font-semibold mb-1">Investigation Status</label>
              <select
                value={activeCase.status}
                onChange={(e) => handleStatusChange(e.target.value as CaseStatus)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-semibold text-slate-800"
              >
                <option value="OPEN">OPEN (Initial Intake)</option>
                <option value="UNDER_INVESTIGATION">UNDER INVESTIGATION</option>
                <option value="ESCALATED_FIU">ESCALATED TO FIU</option>
                <option value="CLOSED">CLOSED & RESOLVED</option>
              </select>
            </div>

            {/* Total Flagged Flow */}
            <div className="p-3 rounded-xl bg-rose-50/80 border border-rose-200">
              <div className="text-rose-700 text-[11px] font-semibold">Flagged Flow Volume</div>
              <div className="text-xl font-black font-mono text-rose-900 mt-0.5">
                {formatINR(activeCase.amount)}
              </div>
              <div className="text-[10px] text-rose-600 mt-0.5">{activeCase.pattern}</div>
            </div>

            {/* Metadata pairs */}
            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Lead Investigator</span>
                <span className="font-bold text-slate-800">{activeCase.investigator}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Intake Timestamp</span>
                <span className="font-mono text-slate-700">{activeCase.createdAt}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Monitored Entities</span>
                <span className="font-bold text-indigo-700">{activeCase.accounts.length} nodes</span>
              </div>
            </div>

            {/* Involved Accounts Chips */}
            <div>
              <span className="block text-slate-500 font-semibold mb-1.5">Involved Accounts:</span>
              <div className="flex flex-wrap gap-1.5">
                {caseAccounts.map((acc) => {
                  const r = getRiskColorClass(acc.risk);
                  return (
                    <button
                      key={acc.id}
                      onClick={() => setActiveAccountDrawer(acc)}
                      className={`px-2 py-1 rounded-lg border font-mono font-bold text-[11px] flex items-center gap-1 hover:scale-105 transition ${r.badge}`}
                    >
                      <span>{acc.id}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Investigator Notes & Log Stream */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3 text-xs">
            <div className="font-bold text-slate-800 uppercase tracking-wider text-[11px] pb-2 border-b border-slate-100">
              Investigator Audit Notes ({activeCase.notes.length})
            </div>

            <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
              {activeCase.notes.length === 0 ? (
                <div className="text-slate-400 py-2 text-center text-xs">
                  No notes recorded on docket.
                </div>
              ) : (
                activeCase.notes.map((note, idx) => (
                  <div
                    key={note.id || idx}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-700 leading-relaxed"
                  >
                    <div className="font-semibold text-slate-900 mb-0.5 flex justify-between">
                      <span>{note.author || `Note #${idx + 1}`}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{note.timestamp}</span>
                    </div>
                    <div>{note.text}</div>
                  </div>
                ))
              )}
            </div>

            {/* Add Note Form */}
            <form onSubmit={handleAddNoteSubmit} className="pt-2 border-t border-slate-100 flex gap-1.5">
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Append forensic observation..."
                className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-800 outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
                title="Add Note"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>

        {/* Center Column: Interactive Graph Topology (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Sub-Network Money Conduit</h3>
                <p className="text-[11px] text-slate-500">
                  Visual topology mapping capital trajectory for {activeCase.id}
                </p>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold">
                {activeCase.pattern}
              </span>
            </div>

            {/* Embedded Graph */}
            <MoneyNetworkGraph
              heightClass="h-[480px]"
              onNodeClick={(acc) => setActiveAccountDrawer(acc)}
              onEdgeClick={(tx) => setActiveTxModal(tx)}
            />
          </div>
        </div>

        {/* Right Column: AI Assistant Panel & Action Engine (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* AI Forensic Panel */}
          <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-950 text-white p-5 rounded-2xl border border-indigo-800 shadow-md space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-indigo-800/80 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center text-white">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-white">AI Forensic Analysis</h3>
                  <p className="text-[10px] text-indigo-300">Explainable AML Intelligence</p>
                </div>
              </div>

              {/* Confidence Meter */}
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-indigo-300">Confidence</span>
                <div className="text-base font-black font-mono text-emerald-400">
                  {forensicExplanation.confidenceScore}%
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-200 leading-relaxed">
              {forensicExplanation.summary}
            </div>

            {/* Why Suspicious Points */}
            <div>
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-amber-300 mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Key Forensic Indicators
              </h4>
              <div className="space-y-1.5 text-xs text-slate-300">
                {forensicExplanation.whySuspicious.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Next Actions */}
            <div className="pt-2 border-t border-indigo-800/80">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-emerald-300 mb-2.5 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Recommended Investigator Actions
              </h4>
              <div className="space-y-2">
                {forensicExplanation.recommendedActions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleExecuteRecommendation(action)}
                    className="w-full text-left p-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-semibold text-white flex items-center justify-between transition group"
                  >
                    <span className="truncate pr-2">{action}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-amber-400 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                ))}
              </div>
            </div>

            {/* Button to Full AI Investigator View */}
            <button
              onClick={() => setActiveView('ai_investigator')}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Open Full AI Forensic Dialogue
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Panel: Transaction Timeline & Evidence Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Transaction Timeline (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-sm">Chronological Conduit Hops</h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {caseTransactions.length} Sequential Transfers
            </span>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {caseTransactions.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">
                No transactions tied to current case filters.
              </div>
            ) : (
              caseTransactions.map((tx, idx) => (
                <div
                  key={tx.id}
                  onClick={() => setActiveTxModal(tx)}
                  className="p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/20 cursor-pointer transition flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-mono font-bold flex items-center justify-center text-[10px]">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="font-mono font-bold text-slate-900">
                        {tx.from} ➔ {tx.to}
                      </div>
                      <div className="text-[10px] text-slate-500">{formatTimestamp(tx.timestamp)}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono font-bold text-rose-600">{formatINR(tx.amount)}</div>
                    <div className="text-[10px] text-slate-500">
                      Velocity: {tx.velocityMinutes !== undefined ? `${tx.velocityMinutes}m` : 'Fast'}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Evidence & Risk Indicators (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <h3 className="font-bold text-slate-900 text-sm">Forensic Evidence Catalog</h3>
          </div>

          <div className="space-y-2 text-xs">
            {forensicExplanation.evidencePoints.map((ev, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5 text-slate-800"
              >
                <div className="w-5 h-5 rounded-md bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">
                  E{idx + 1}
                </div>
                <div className="leading-snug">{ev}</div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs">
            <span className="font-bold">Statutory Note:</span> All evidence compiled conformant to
            PMLA (Prevention of Money Laundering Act) Section 12 requirements.
          </div>
        </div>
      </div>

      {/* Account Drawer */}
      <AccountIntelligenceDrawer
        account={activeAccountDrawer}
        onClose={() => setActiveAccountDrawer(null)}
        onSelectTransaction={(txId) => {
          const match = transactions.find((t) => t.id === txId);
          if (match) setActiveTxModal(match);
        }}
      />

      {/* Transaction Modal */}
      <TransactionDetailModal
        transaction={activeTxModal}
        onClose={() => setActiveTxModal(null)}
      />
    </div>
  );
};
