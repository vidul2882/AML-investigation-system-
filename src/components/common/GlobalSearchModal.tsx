import React, { useState, useEffect, useRef } from 'react';
import { useAML } from '../../context/AMLContext';
import { Search, X, ShieldAlert, ArrowRight, Activity, Briefcase, User } from 'lucide-react';
import { formatINR, getRiskColorClass } from '../../utils/formatters';

export const GlobalSearchModal: React.FC = () => {
  const {
    isSearchModalOpen,
    setIsSearchModalOpen,
    accounts,
    transactions,
    cases,
    setActiveView,
    setSelectedAccountId,
    setSelectedTransactionId,
    setSelectedCaseId,
    setHighlightedPath,
  } = useAML();

  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchModalOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isSearchModalOpen]);

  // Handle Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchModalOpen(true);
      }
      if (e.key === 'Escape') {
        setIsSearchModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsSearchModalOpen]);

  if (!isSearchModalOpen) return null;

  const cleanQ = query.trim().toLowerCase();

  // Search matches
  const matchingAccounts = cleanQ
    ? accounts.filter(
        (a) =>
          a.id.toLowerCase().includes(cleanQ) ||
          (a.name && a.name.toLowerCase().includes(cleanQ)) ||
          a.type.toLowerCase().includes(cleanQ)
      )
    : accounts.slice(0, 4);

  const matchingTransactions = cleanQ
    ? transactions.filter(
        (t) =>
          t.id.toLowerCase().includes(cleanQ) ||
          t.from.toLowerCase().includes(cleanQ) ||
          t.to.toLowerCase().includes(cleanQ) ||
          t.patterns.some((p) => p.toLowerCase().includes(cleanQ))
      )
    : transactions.slice(0, 4);

  const matchingCases = cleanQ
    ? cases.filter(
        (c) =>
          c.id.toLowerCase().includes(cleanQ) ||
          c.title.toLowerCase().includes(cleanQ) ||
          c.pattern.toLowerCase().includes(cleanQ) ||
          c.accounts.some((a) => a.toLowerCase().includes(cleanQ))
      )
    : cases.slice(0, 3);

  const handleSelectAccount = (accId: string) => {
    setSelectedAccountId(accId);
    setHighlightedPath([accId]);
    setActiveView('network');
    setIsSearchModalOpen(false);
  };

  const handleSelectTransaction = (txId: string) => {
    setSelectedTransactionId(txId);
    setActiveView('transactions');
    setIsSearchModalOpen(false);
  };

  const handleSelectCase = (caseId: string) => {
    setSelectedCaseId(caseId);
    setActiveView('investigation');
    setIsSearchModalOpen(false);
  };

  return (
    <div
      id="global-search-modal"
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/40 backdrop-blur-xs"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 gap-3">
          <Search className="w-5 h-5 text-indigo-600 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search accounts (A101), transactions (T001), cases (CASE-001), patterns..."
            className="w-full bg-transparent border-none outline-none text-slate-800 placeholder-slate-400 text-sm sm:text-base font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setIsSearchModalOpen(false)}
            className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-1 rounded-md font-mono"
          >
            ESC
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2.5 bg-slate-50/80 border-b border-slate-100 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-slate-400 shrink-0">Quick jump:</span>
          {['A101', 'B205', 'CASE-001', 'T001', 'Layering', 'Circular'].map((chip) => (
            <button
              key={chip}
              onClick={() => setQuery(chip)}
              className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 transition shrink-0 font-medium"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Results Body */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-5">
          {/* Accounts Section */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              <span className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-indigo-500" /> Accounts ({matchingAccounts.length})
              </span>
            </div>
            {matchingAccounts.length === 0 ? (
              <div className="text-xs text-slate-400 py-1 pl-2">No matching accounts found</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {matchingAccounts.map((acc) => {
                  const riskStyle = getRiskColorClass(acc.risk);
                  return (
                    <div
                      key={acc.id}
                      onClick={() => handleSelectAccount(acc.id)}
                      className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-indigo-50/60 hover:border-indigo-200 cursor-pointer transition flex items-center justify-between"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-slate-900">{acc.id}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-sm border font-semibold ${riskStyle.badge}`}>
                            {acc.risk}
                          </span>
                        </div>
                        <div className="text-xs text-slate-600 truncate mt-0.5">{acc.name}</div>
                        <div className="text-[11px] text-slate-500 mt-1">
                          Outflow: {formatINR(acc.totalOutflow)}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Transactions Section */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              <span className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-500" /> Transactions ({matchingTransactions.length})
              </span>
            </div>
            {matchingTransactions.length === 0 ? (
              <div className="text-xs text-slate-400 py-1 pl-2">No matching transactions found</div>
            ) : (
              <div className="space-y-1.5">
                {matchingTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    onClick={() => handleSelectTransaction(tx.id)}
                    className="p-2.5 rounded-xl border border-slate-100 hover:bg-emerald-50/50 hover:border-emerald-200 cursor-pointer transition flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-indigo-700">{tx.id}</span>
                      <span className="font-medium text-slate-700">
                        {tx.from} ➔ {tx.to}
                      </span>
                      <span className="font-mono font-semibold text-slate-900">
                        {formatINR(tx.amount)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                        {tx.patterns[0] || 'NORMAL'}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cases Section */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              <span className="flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-purple-500" /> Investigation Cases ({matchingCases.length})
              </span>
            </div>
            {matchingCases.length === 0 ? (
              <div className="text-xs text-slate-400 py-1 pl-2">No matching cases found</div>
            ) : (
              <div className="space-y-1.5">
                {matchingCases.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => handleSelectCase(c.id)}
                    className="p-2.5 rounded-xl border border-slate-100 hover:bg-purple-50/50 hover:border-purple-200 cursor-pointer transition flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-purple-900">{c.id}</span>
                        <span className="text-xs font-medium text-slate-800">{c.title}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Amount: {formatINR(c.amount)} • {c.pattern}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <span>Tip: Click any item to jump directly into the full forensic view.</span>
          <span className="font-mono">AMLens Search Index</span>
        </div>
      </div>
    </div>
  );
};
