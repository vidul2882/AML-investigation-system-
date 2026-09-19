import React, { useState, useMemo } from 'react';
import { useAML } from '../context/AMLContext';
import { Transaction, RiskLevel, AMLPatternType } from '../types';
import {
  Search,
  Filter,
  Eye,
  ArrowUpDown,
  Download,
  Share2,
  Calendar,
  AlertCircle,
  Clock,
  ArrowRight,
} from 'lucide-react';
import {
  formatINR,
  getRiskColorClass,
  getPatternBadge,
  formatTimestamp,
} from '../utils/formatters';
import { TransactionDetailModal } from '../components/transactions/TransactionDetailModal';
import { CreateCaseModal } from '../components/cases/CreateCaseModal';

export const TransactionMonitorView: React.FC = () => {
  const {
    transactions,
    selectedTransactionId,
    setSelectedTransactionId,
    setHighlightedPath,
    setActiveView,
  } = useAML();

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');
  const [patternFilter, setPatternFilter] = useState<string>('ALL');
  const [minAmount, setMinAmount] = useState<string>('');
  const [sortField, setSortField] = useState<'timestamp' | 'amount' | 'risk'>('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Modals state
  const [activeDetailTx, setActiveDetailTx] = useState<Transaction | null>(null);
  const [isCaseCreateOpen, setIsCaseCreateOpen] = useState(false);

  // If a transaction was selected globally, open it
  React.useEffect(() => {
    if (selectedTransactionId) {
      const match = transactions.find((t) => t.id === selectedTransactionId);
      if (match) {
        setActiveDetailTx(match);
      }
    }
  }, [selectedTransactionId, transactions]);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      // Search
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const matchesId = t.id.toLowerCase().includes(q);
        const matchesFrom = t.from.toLowerCase().includes(q);
        const matchesTo = t.to.toLowerCase().includes(q);
        const matchesAmount = t.amount.toString().includes(q);
        const matchesPattern = t.patterns.some((p) => p.toLowerCase().includes(q));
        if (!matchesId && !matchesFrom && !matchesTo && !matchesAmount && !matchesPattern) {
          return false;
        }
      }

      // Risk filter
      if (riskFilter === 'SUSPICIOUS_ONLY' && t.risk === 'NORMAL') {
        return false;
      }
      if (riskFilter !== 'ALL' && riskFilter !== 'SUSPICIOUS_ONLY' && t.risk !== riskFilter) {
        return false;
      }

      // Pattern filter
      if (patternFilter !== 'ALL') {
        if (!t.patterns.includes(patternFilter as AMLPatternType)) {
          return false;
        }
      }

      // Min amount
      if (minAmount && t.amount < parseFloat(minAmount)) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortField === 'amount') {
        return sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount;
      }
      if (sortField === 'timestamp') {
        const timeA = new Date(a.timestamp).getTime();
        const timeB = new Date(b.timestamp).getTime();
        return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
      }
      return 0;
    });
  }, [transactions, searchQuery, riskFilter, patternFilter, minAmount, sortField, sortOrder]);

  const handleExportCsv = () => {
    const headers = 'Transaction ID,Sender,Receiver,Amount,Timestamp,Risk,Patterns\n';
    const rows = filteredTransactions
      .map(
        (t) =>
          `"${t.id}","${t.from}","${t.to}",${t.amount},"${t.timestamp}","${t.risk}","${t.patterns.join(';')}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `amlens_transactions_export_${Date.now()}.csv`;
    a.click();
  };

  const handleTraceRow = (t: Transaction) => {
    setHighlightedPath([t.from, t.to]);
    setActiveView('network');
  };

  return (
    <div id="transaction-monitor-view" className="space-y-5 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Transaction Monitoring Ledger
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Real-time feed across monitored banking endpoints with embedded forensic pattern detection
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 shadow-xs transition"
          >
            <Download className="w-3.5 h-3.5 text-indigo-600" /> Export Filtered CSV
          </button>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          {/* Search Box */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ID, sender, receiver, pattern (e.g. A101, T001, Layering)..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-slate-800"
            />
          </div>

          {/* Risk Filter */}
          <div>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Risk Levels</option>
              <option value="SUSPICIOUS_ONLY">Suspicious & Above Only</option>
              <option value="CRITICAL">Critical Only</option>
              <option value="HIGH_RISK">High Risk Only</option>
              <option value="SUSPICIOUS">Suspicious Only</option>
              <option value="NORMAL">Normal Transactions</option>
            </select>
          </div>

          {/* Pattern Filter */}
          <div>
            <select
              value={patternFilter}
              onChange={(e) => setPatternFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Patterns</option>
              <option value="LAYERING">Layering Structure</option>
              <option value="CIRCULAR">Circular Transfer</option>
              <option value="RAPID_MOVEMENT">Rapid Movement</option>
              <option value="HIGH_VALUE">High Value Transfer</option>
            </select>
          </div>

          {/* Min Amount */}
          <div>
            <input
              type="number"
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
              placeholder="Min Amount (₹)..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono text-slate-800 outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
          <div>
            Showing <span className="font-bold text-slate-800">{filteredTransactions.length}</span> of{' '}
            <span className="font-bold text-slate-800">{transactions.length}</span> recorded
            transactions
          </div>

          <div className="flex items-center gap-3">
            <span
              onClick={() => {
                setSortField('timestamp');
                setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
              }}
              className="cursor-pointer hover:text-slate-800 flex items-center gap-1"
            >
              Sort by Time <ArrowUpDown className="w-3 h-3" />
            </span>
            <span
              onClick={() => {
                setSortField('amount');
                setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
              }}
              className="cursor-pointer hover:text-slate-800 flex items-center gap-1"
            >
              Sort by Amount <ArrowUpDown className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Transaction ID</th>
                <th className="py-3 px-4">Sender (From)</th>
                <th className="py-3 px-4"></th>
                <th className="py-3 px-4">Receiver (To)</th>
                <th className="py-3 px-4">Amount (INR)</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Risk Level</th>
                <th className="py-3 px-4">Detected Typology</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No transactions match current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
                  const riskStyle = getRiskColorClass(tx.risk);
                  return (
                    <tr
                      key={tx.id}
                      className="hover:bg-indigo-50/30 transition group cursor-pointer"
                      onClick={() => setActiveDetailTx(tx)}
                    >
                      {/* ID */}
                      <td className="py-3 px-4 font-mono font-bold text-indigo-700">
                        {tx.id}
                      </td>

                      {/* Sender */}
                      <td className="py-3 px-4">
                        <span className="font-mono font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                          {tx.from}
                        </span>
                      </td>

                      {/* Direction Arrow */}
                      <td className="py-3 px-1 text-slate-300 group-hover:text-indigo-600 transition">
                        ➔
                      </td>

                      {/* Receiver */}
                      <td className="py-3 px-4">
                        <span className="font-mono font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                          {tx.to}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {formatINR(tx.amount)}
                      </td>

                      {/* Timestamp */}
                      <td className="py-3 px-4 text-slate-500 font-mono">
                        {formatTimestamp(tx.timestamp)}
                      </td>

                      {/* Risk */}
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${riskStyle.badge}`}>
                          {tx.risk}
                        </span>
                      </td>

                      {/* Typology */}
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {tx.patterns.map((p) => {
                            const b = getPatternBadge(p);
                            return (
                              <span
                                key={p}
                                className={`px-2 py-0.5 rounded-sm border text-[10px] font-semibold ${b.className}`}
                              >
                                {b.label}
                              </span>
                            );
                          })}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleTraceRow(tx)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition"
                            title="Trace in Graph"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            id={`view-tx-btn-${tx.id}`}
                            onClick={() => setActiveDetailTx(tx)}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-700 font-semibold text-xs transition"
                          >
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Detail Modal */}
      {activeDetailTx && (
        <TransactionDetailModal
          transaction={activeDetailTx}
          onClose={() => {
            setActiveDetailTx(null);
            setSelectedTransactionId(null);
          }}
          onOpenCaseCreateModal={() => setIsCaseCreateOpen(true)}
        />
      )}

      {/* Create Case Modal */}
      <CreateCaseModal
        isOpen={isCaseCreateOpen}
        onClose={() => setIsCaseCreateOpen(false)}
        defaultTransactionId={activeDetailTx ? activeDetailTx.id : undefined}
      />
    </div>
  );
};
