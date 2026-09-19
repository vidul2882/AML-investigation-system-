import React from 'react';
import { useAML } from '../../context/AMLContext';
import { Account, Transaction } from '../../types';
import {
  X,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Building,
  User,
  ExternalLink,
  MapPin,
  CreditCard,
  AlertTriangle,
  FileCheck,
} from 'lucide-react';
import { formatINR, getRiskColorClass, formatTimestamp } from '../../utils/formatters';

interface AccountIntelligenceDrawerProps {
  account: Account | null;
  onClose: () => void;
  onSelectTransaction: (txId: string) => void;
}

export const AccountIntelligenceDrawer: React.FC<AccountIntelligenceDrawerProps> = ({
  account,
  onClose,
  onSelectTransaction,
}) => {
  const { transactions, setActiveView, setSelectedCaseId, cases, setHighlightedPath } = useAML();

  if (!account) return null;

  const riskStyle = getRiskColorClass(account.risk);

  const incomingTxs = transactions.filter((t) => t.to === account.id);
  const outgoingTxs = transactions.filter((t) => t.from === account.id);

  const relatedCases = cases.filter((c) => c.accounts.includes(account.id));

  const handleTraceFlow = () => {
    setHighlightedPath([account.id, ...account.connectedAccounts]);
  };

  const handleOpenCase = (caseId: string) => {
    setSelectedCaseId(caseId);
    setActiveView('investigation');
  };

  return (
    <div
      id="account-intelligence-drawer"
      className="fixed inset-y-0 right-0 z-40 w-full max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-200"
    >
      {/* Drawer Header */}
      <div className="p-5 border-b border-slate-100 flex items-start justify-between bg-slate-50/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Account Intelligence
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full border font-bold ${riskStyle.badge}`}>
              {account.risk}
            </span>
          </div>
          <h2 className="text-xl font-bold font-mono text-slate-900 mt-1 flex items-center gap-2">
            {account.id}
          </h2>
          <p className="text-xs text-slate-600 font-medium">{account.name || 'Entity Profile'}</p>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Drawer Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* Quick Action Button Bar */}
        <div className="flex gap-2">
          <button
            onClick={handleTraceFlow}
            className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Trace Flow in Graph
          </button>
          {relatedCases.length > 0 && (
            <button
              onClick={() => handleOpenCase(relatedCases[0].id)}
              className="py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
            >
              Open Case ({relatedCases[0].id})
            </button>
          )}
        </div>

        {/* Financial Flow Summary Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-100">
            <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-semibold mb-1">
              <ArrowDownLeft className="w-4 h-4" /> Total Inflow
            </div>
            <div className="text-lg font-bold font-mono text-emerald-950">
              {formatINR(account.totalInflow)}
            </div>
            <div className="text-[11px] text-emerald-700 mt-0.5">
              {incomingTxs.length} incoming wires
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-rose-50/80 border border-rose-100">
            <div className="flex items-center gap-1.5 text-rose-700 text-xs font-semibold mb-1">
              <ArrowUpRight className="w-4 h-4" /> Total Outflow
            </div>
            <div className="text-lg font-bold font-mono text-rose-950">
              {formatINR(account.totalOutflow)}
            </div>
            <div className="text-[11px] text-rose-700 mt-0.5">
              {outgoingTxs.length} outbound wires
            </div>
          </div>
        </div>

        {/* Account Metadata Grid */}
        <div className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/50 space-y-2.5 text-xs">
          <div className="flex justify-between py-1 border-b border-slate-200/60">
            <span className="text-slate-500 flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-slate-400" /> Account Type
            </span>
            <span className="font-semibold text-slate-800">{account.type.replace('_', ' ')}</span>
          </div>

          <div className="flex justify-between py-1 border-b border-slate-200/60">
            <span className="text-slate-500 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" /> Account Age
            </span>
            <span className="font-semibold text-slate-800">
              {account.ageMonths} months ({account.ageMonths < 6 ? 'High-Risk Recent' : 'Established'})
            </span>
          </div>

          <div className="flex justify-between py-1 border-b border-slate-200/60">
            <span className="text-slate-500 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-slate-400" /> PAN / GST Tax ID
            </span>
            <span className="font-mono font-semibold text-slate-800">
              {account.panOrGst || 'NOT_DECLARED'}
            </span>
          </div>

          <div className="flex justify-between py-1 border-b border-slate-200/60">
            <span className="text-slate-500 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" /> Branch & Jurisdiction
            </span>
            <span className="font-medium text-slate-800 text-right">
              {account.bankBranch || 'Central Vault'}, {account.country || 'India'}
            </span>
          </div>

          <div className="flex justify-between py-1">
            <span className="text-slate-500">Connected Accounts</span>
            <span className="font-bold text-indigo-700">
              {account.connectedAccounts.length} entities ({account.connectedAccounts.join(', ')})
            </span>
          </div>
        </div>

        {/* Risk Indicators Section */}
        <div>
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-500" /> Risk Indicators
          </h4>
          {account.riskIndicators.length === 0 ? (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500">
              No anomalies detected. Consistent with regular operating ledger.
            </div>
          ) : (
            <div className="space-y-1.5">
              {account.riskIndicators.map((ind, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/70 text-xs font-medium text-amber-900 flex items-start gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  <span>{ind}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Outgoing Transactions */}
        <div>
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <ArrowUpRight className="w-4 h-4 text-rose-500" /> Outgoing Transactions ({outgoingTxs.length})
          </h4>
          {outgoingTxs.length === 0 ? (
            <div className="text-xs text-slate-400 pl-1">No outbound transfers recorded</div>
          ) : (
            <div className="space-y-1.5">
              {outgoingTxs.map((tx) => (
                <div
                  key={tx.id}
                  onClick={() => onSelectTransaction(tx.id)}
                  className="p-2.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-slate-50 cursor-pointer transition flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-mono font-bold text-slate-800">
                      ➔ To {tx.to} ({tx.id})
                    </div>
                    <div className="text-[10px] text-slate-500">{formatTimestamp(tx.timestamp)}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-rose-600">{formatINR(tx.amount)}</div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                      {tx.patterns[0] || 'TRANSFER'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Incoming Transactions */}
        <div>
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <ArrowDownLeft className="w-4 h-4 text-emerald-500" /> Incoming Transactions ({incomingTxs.length})
          </h4>
          {incomingTxs.length === 0 ? (
            <div className="text-xs text-slate-400 pl-1">No inbound credits recorded</div>
          ) : (
            <div className="space-y-1.5">
              {incomingTxs.map((tx) => (
                <div
                  key={tx.id}
                  onClick={() => onSelectTransaction(tx.id)}
                  className="p-2.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-slate-50 cursor-pointer transition flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-mono font-bold text-slate-800">
                      From {tx.from} ({tx.id})
                    </div>
                    <div className="text-[10px] text-slate-500">{formatTimestamp(tx.timestamp)}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-emerald-600">{formatINR(tx.amount)}</div>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                      {tx.patterns[0] || 'CREDIT'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
