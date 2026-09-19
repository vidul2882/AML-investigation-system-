import React, { useState } from 'react';
import { useAML } from '../context/AMLContext';
import { MoneyNetworkGraph } from '../components/network/MoneyNetworkGraph';
import { AccountIntelligenceDrawer } from '../components/network/AccountIntelligenceDrawer';
import { TransactionDetailModal } from '../components/transactions/TransactionDetailModal';
import { Account, Transaction } from '../types';
import {
  Share2,
  Filter,
  Sparkles,
  Layers,
  Repeat,
  Zap,
  Users,
  AlertOctagon,
  ArrowRight,
} from 'lucide-react';
import { formatINR } from '../utils/formatters';

export const MoneyNetworkView: React.FC = () => {
  const {
    accounts,
    transactions,
    highlightedPath,
    setHighlightedPath,
    selectedAccountId,
    setSelectedAccountId,
  } = useAML();

  const [activeAccountForDrawer, setActiveAccountForDrawer] = useState<Account | null>(null);
  const [activeTxForModal, setActiveTxForModal] = useState<Transaction | null>(null);

  // Synchronize drawer when selectedAccountId changes
  React.useEffect(() => {
    if (selectedAccountId) {
      const match = accounts.find((a) => a.id === selectedAccountId);
      if (match) {
        setActiveAccountForDrawer(match);
      }
    }
  }, [selectedAccountId, accounts]);

  const handleSelectScenarioPath = (path: string[]) => {
    setHighlightedPath(path);
  };

  const handleNodeClick = (account: Account) => {
    setActiveAccountForDrawer(account);
  };

  const handleEdgeClick = (tx: Transaction) => {
    setActiveTxForModal(tx);
  };

  const criticalNodes = accounts.filter((a) => a.risk === 'CRITICAL' || a.risk === 'HIGH_RISK');

  return (
    <div id="money-network-page-view" className="space-y-4 max-w-7xl mx-auto">
      {/* Top Header & Fast Typology Selectors */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Money Flow Network Visualizer
            </h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-bold">
              Graph Engine
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Identify topological structures: multi-hop layering, round-tripping cycles, and rapid mule disbursement
          </p>
        </div>

        {/* Quick Scenario Path Highlight Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="network-filter-layering-btn"
            onClick={() => handleSelectScenarioPath(['A101', 'B205', 'C301', 'D410', 'E512'])}
            className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-800 font-semibold text-xs flex items-center gap-1.5 transition"
          >
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            <span>Layering (A101 ➔ E512)</span>
          </button>

          <button
            id="network-filter-circular-btn"
            onClick={() => handleSelectScenarioPath(['P100', 'Q200', 'R300', 'P100'])}
            className="px-3 py-1.5 rounded-xl bg-pink-50 hover:bg-pink-100 border border-pink-200 text-pink-800 font-semibold text-xs flex items-center gap-1.5 transition"
          >
            <Repeat className="w-3.5 h-3.5 text-pink-600" />
            <span>Circular (P100 ➔ R300)</span>
          </button>

          <button
            id="network-filter-rapid-btn"
            onClick={() => handleSelectScenarioPath(['M101', 'M202', 'M303', 'M404'])}
            className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 font-semibold text-xs flex items-center gap-1.5 transition"
          >
            <Zap className="w-3.5 h-3.5 text-amber-600" />
            <span>Rapid (M101 ➔ M404)</span>
          </button>

          <button
            onClick={() => setHighlightedPath([])}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition"
          >
            Clear Focus
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
          <span className="text-slate-500 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-indigo-500" /> Total Accounts
          </span>
          <span className="font-mono font-bold text-slate-900">{accounts.length} Entities</span>
        </div>

        <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
          <span className="text-slate-500 flex items-center gap-1.5">
            <AlertOctagon className="w-3.5 h-3.5 text-rose-500" /> High-Risk Nodes
          </span>
          <span className="font-mono font-bold text-rose-600">{criticalNodes.length} Flagged</span>
        </div>

        <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
          <span className="text-slate-500 flex items-center gap-1.5">
            <Share2 className="w-3.5 h-3.5 text-blue-500" /> Directed Edges
          </span>
          <span className="font-mono font-bold text-slate-900">{transactions.length} Wires</span>
        </div>

        <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
          <span className="text-slate-500">Active Path Hops</span>
          <span className="font-mono font-bold text-indigo-600">
            {highlightedPath.length > 0 ? `${highlightedPath.length} Nodes` : 'Global Overview'}
          </span>
        </div>
      </div>

      {/* Interactive Network Graph */}
      <div className="relative">
        <MoneyNetworkGraph
          heightClass="h-[680px]"
          onNodeClick={handleNodeClick}
          onEdgeClick={handleEdgeClick}
        />
      </div>

      {/* Slide-over Account Intelligence Drawer */}
      <AccountIntelligenceDrawer
        account={activeAccountForDrawer}
        onClose={() => {
          setActiveAccountForDrawer(null);
          setSelectedAccountId(null);
        }}
        onSelectTransaction={(txId) => {
          const match = transactions.find((t) => t.id === txId);
          if (match) setActiveTxForModal(match);
        }}
      />

      {/* Transaction Modal */}
      <TransactionDetailModal
        transaction={activeTxForModal}
        onClose={() => setActiveTxForModal(null)}
      />
    </div>
  );
};
