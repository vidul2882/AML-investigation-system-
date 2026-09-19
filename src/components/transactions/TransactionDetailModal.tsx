import React from 'react';
import { useAML } from '../../context/AMLContext';
import { Transaction } from '../../types';
import {
  X,
  ArrowRight,
  ShieldAlert,
  Share2,
  SearchCode,
  FolderPlus,
  Bot,
  Calendar,
  Clock,
  Building,
  User,
  AlertTriangle,
} from 'lucide-react';
import {
  formatINR,
  getRiskColorClass,
  getPatternBadge,
  formatDateTime,
  formatTimestamp,
} from '../../utils/formatters';

interface TransactionDetailModalProps {
  transaction: Transaction | null;
  onClose: () => void;
  onOpenCaseCreateModal?: () => void;
}

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  transaction,
  onClose,
  onOpenCaseCreateModal,
}) => {
  const {
    accounts,
    transactions,
    setActiveView,
    setHighlightedPath,
    setSelectedAccountId,
    setSelectedCaseId,
    cases,
    showToast,
  } = useAML();

  if (!transaction) return null;

  const riskStyle = getRiskColorClass(transaction.risk);
  const fromAcc = accounts.find((a) => a.id === transaction.from);
  const toAcc = accounts.find((a) => a.id === transaction.to);

  // Find previous and next transactions in chronological chain
  const sortedTxs = [...transactions].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  const currentIdx = sortedTxs.findIndex((t) => t.id === transaction.id);
  const prevTx = sortedTxs.filter((t) => t.to === transaction.from)[0] || null;
  const nextTx = sortedTxs.filter((t) => t.from === transaction.to)[0] || null;

  // Actions
  const handleTraceMoneyFlow = () => {
    setHighlightedPath([transaction.from, transaction.to]);
    setActiveView('network');
    onClose();
    showToast(`Tracing money flow for ${transaction.from} ➔ ${transaction.to} in network graph`, 'info');
  };

  const handleOpenInvestigation = () => {
    // Find matching case or default to CASE-001
    const matchingCase = cases.find(
      (c) =>
        c.transactions.includes(transaction.id) ||
        (c.accounts.includes(transaction.from) && c.accounts.includes(transaction.to))
    );
    if (matchingCase) {
      setSelectedCaseId(matchingCase.id);
    } else {
      setSelectedCaseId('CASE-001');
    }
    setActiveView('investigation');
    onClose();
  };

  const handleAddToCase = () => {
    if (onOpenCaseCreateModal) {
      onOpenCaseCreateModal();
    } else {
      showToast(`Transaction ${transaction.id} queued for Case creation docket`, 'success');
    }
    onClose();
  };

  const handleAiExplain = () => {
    setActiveView('ai_investigator');
    onClose();
  };

  return (
    <div
      id="transaction-detail-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Transaction Dossier
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full border font-bold ${riskStyle.badge}`}>
                {transaction.risk}
              </span>
            </div>
            <h3 className="text-xl font-extrabold font-mono text-slate-900 mt-1">
              {transaction.id}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Main Transfer Flow Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Sender */}
            <div
              onClick={() => {
                setSelectedAccountId(transaction.from);
                setActiveView('network');
                onClose();
              }}
              className="flex-1 text-center sm:text-left cursor-pointer hover:bg-white p-2.5 rounded-lg transition"
            >
              <div className="text-[11px] font-semibold text-slate-500 uppercase flex items-center gap-1">
                <User className="w-3 h-3 text-slate-400" /> Sender Entity
              </div>
              <div className="text-base font-bold font-mono text-indigo-700 mt-0.5">
                {transaction.from}
              </div>
              <div className="text-xs text-slate-600 truncate">
                {fromAcc?.name || 'Sender Entity'}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Age: {fromAcc?.ageMonths || 12} mos • Type: {fromAcc?.type}
              </div>
            </div>

            {/* Transfer Amount & Arrow */}
            <div className="flex flex-col items-center shrink-0 px-4">
              <div className="text-xs font-medium text-slate-500 mb-1">Transfer Amount</div>
              <div className="text-xl sm:text-2xl font-black font-mono text-rose-600">
                {formatINR(transaction.amount)}
              </div>
              <div className="flex items-center gap-1.5 mt-1 text-slate-400">
                <span className="w-8 h-px bg-slate-300"></span>
                <ArrowRight className="w-4 h-4 text-indigo-600" />
                <span className="w-8 h-px bg-slate-300"></span>
              </div>
            </div>

            {/* Receiver */}
            <div
              onClick={() => {
                setSelectedAccountId(transaction.to);
                setActiveView('network');
                onClose();
              }}
              className="flex-1 text-center sm:text-right cursor-pointer hover:bg-white p-2.5 rounded-lg transition"
            >
              <div className="text-[11px] font-semibold text-slate-500 uppercase flex items-center justify-center sm:justify-end gap-1">
                <Building className="w-3 h-3 text-slate-400" /> Beneficiary Entity
              </div>
              <div className="text-base font-bold font-mono text-indigo-700 mt-0.5">
                {transaction.to}
              </div>
              <div className="text-xs text-slate-600 truncate">
                {toAcc?.name || 'Receiver Entity'}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                Age: {toAcc?.ageMonths || 6} mos • Type: {toAcc?.type}
              </div>
            </div>
          </div>

          {/* Metadata Grid: Velocity, Timestamp, Status */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-slate-500 flex items-center gap-1 mb-1">
                <Clock className="w-3.5 h-3.5 text-indigo-500" /> Velocity
              </div>
              <div className="font-bold text-slate-900 font-mono">
                {transaction.velocityMinutes !== undefined
                  ? `${transaction.velocityMinutes} min hop`
                  : 'High Velocity'}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-slate-500 flex items-center gap-1 mb-1">
                <Calendar className="w-3.5 h-3.5 text-indigo-500" /> Timestamp
              </div>
              <div className="font-bold text-slate-900 font-mono truncate">
                {formatTimestamp(transaction.timestamp)}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-slate-500 mb-1">Chain Hop</div>
              <div className="font-bold text-indigo-700">
                {transaction.hopIndex ? `Hop #${transaction.hopIndex} in conduit` : 'Direct Transfer'}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-slate-500 mb-1">Regulatory Status</div>
              <span className="font-bold text-rose-700">{transaction.status}</span>
            </div>
          </div>

          {/* Chain Context: Previous & Next Transaction */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Chain Continuity (Adjacent Hops)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50">
                <div className="text-[10px] text-slate-500 uppercase font-semibold">
                  Preceding Hop
                </div>
                {prevTx ? (
                  <div className="font-mono font-medium text-slate-800 mt-0.5">
                    {prevTx.id}: {prevTx.from} ➔ {prevTx.to} ({formatINR(prevTx.amount)})
                  </div>
                ) : (
                  <div className="text-slate-400 text-xs mt-0.5">None (Originating node)</div>
                )}
              </div>

              <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50">
                <div className="text-[10px] text-slate-500 uppercase font-semibold">
                  Succeeding Hop
                </div>
                {nextTx ? (
                  <div className="font-mono font-medium text-slate-800 mt-0.5">
                    {nextTx.id}: {nextTx.from} ➔ {nextTx.to} ({formatINR(nextTx.amount)})
                  </div>
                ) : (
                  <div className="text-slate-400 text-xs mt-0.5">None (Terminal node)</div>
                )}
              </div>
            </div>
          </div>

          {/* Detected Patterns */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Detected AML Patterns
            </h4>
            <div className="flex flex-wrap gap-2">
              {transaction.patterns.map((p) => {
                const badge = getPatternBadge(p);
                return (
                  <span
                    key={p}
                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${badge.className}`}
                  >
                    {badge.label}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Notes / Forensic Context */}
          {transaction.notes && (
            <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 leading-relaxed">
              <span className="font-bold flex items-center gap-1 text-amber-800 mb-1">
                <AlertTriangle className="w-3.5 h-3.5" /> AML Intelligence Note:
              </span>
              {transaction.notes}
            </div>
          )}
        </div>

        {/* Modal Actions Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center justify-end gap-2">
          <button
            onClick={handleTraceMoneyFlow}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition"
          >
            <Share2 className="w-3.5 h-3.5" /> Trace Money Flow
          </button>

          <button
            onClick={handleOpenInvestigation}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition"
          >
            <SearchCode className="w-3.5 h-3.5" /> Open Investigation
          </button>

          <button
            onClick={handleAddToCase}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold text-xs flex items-center gap-1.5 transition"
          >
            <FolderPlus className="w-3.5 h-3.5 text-slate-500" /> Add to Case
          </button>

          <button
            onClick={handleAiExplain}
            className="px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-semibold text-xs flex items-center gap-1.5 transition"
          >
            <Bot className="w-3.5 h-3.5 text-purple-600" /> AI Explain
          </button>
        </div>
      </div>
    </div>
  );
};
