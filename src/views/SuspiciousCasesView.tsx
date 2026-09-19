import React, { useState, useMemo } from 'react';
import { useAML } from '../context/AMLContext';
import { AMLCase, CaseStatus, RiskLevel } from '../types';
import {
  Briefcase,
  Plus,
  Search,
  Filter,
  ArrowRight,
  ShieldAlert,
  Clock,
  User,
  ExternalLink,
  ChevronRight,
  FileCheck,
} from 'lucide-react';
import {
  formatINR,
  getRiskColorClass,
  getCaseStatusBadge,
  formatDate,
} from '../utils/formatters';
import { CreateCaseModal } from '../components/cases/CreateCaseModal';

export const SuspiciousCasesView: React.FC = () => {
  const { cases, setSelectedCaseId, setActiveView } = useAML();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const matchId = c.id.toLowerCase().includes(q);
        const matchTitle = c.title.toLowerCase().includes(q);
        const matchPattern = c.pattern.toLowerCase().includes(q);
        const matchAccounts = c.accounts.some((a) => a.toLowerCase().includes(q));
        if (!matchId && !matchTitle && !matchPattern && !matchAccounts) return false;
      }

      if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
      if (riskFilter !== 'ALL' && c.risk !== riskFilter) return false;

      return true;
    });
  }, [cases, searchQuery, statusFilter, riskFilter]);

  const handleOpenCase = (caseId: string) => {
    setSelectedCaseId(caseId);
    setActiveView('investigation');
  };

  return (
    <div id="suspicious-cases-view" className="space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Suspicious Investigation Dockets
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold">
              {cases.length} Active Cases
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Formally registered anti-money-laundering forensic cases, audit trails, and regulatory evidence
          </p>
        </div>

        <button
          id="create-new-case-btn"
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs flex items-center gap-2 transition active:scale-95"
        >
          <Plus className="w-4 h-4" /> Create New Case
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Case ID, title, accounts (e.g. CASE-001, A101)..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-slate-800"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="OPEN">Open Dockets</option>
              <option value="UNDER_INVESTIGATION">Under Active Investigation</option>
              <option value="ESCALATED_FIU">Escalated to FIU Enforcement</option>
              <option value="CLOSED">Closed & Resolved</option>
            </select>
          </div>

          {/* Risk Filter */}
          <div>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Risk Classifications</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH_RISK">High Risk</option>
              <option value="SUSPICIOUS">Suspicious</option>
            </select>
          </div>
        </div>
      </div>

      {/* Cases Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4">Case ID</th>
                <th className="py-3.5 px-4">Case Title & Typology</th>
                <th className="py-3.5 px-4">Flagged Volume</th>
                <th className="py-3.5 px-4">Involved Accounts</th>
                <th className="py-3.5 px-4">Risk Level</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Lead Investigator</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCases.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No cases match the current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredCases.map((c) => {
                  const riskStyle = getRiskColorClass(c.risk);
                  const statusBadge = getCaseStatusBadge(c.status);

                  return (
                    <tr
                      key={c.id}
                      onClick={() => handleOpenCase(c.id)}
                      className="hover:bg-indigo-50/40 transition cursor-pointer group"
                    >
                      {/* Case ID */}
                      <td className="py-3.5 px-4 font-mono font-extrabold text-indigo-700">
                        {c.id}
                      </td>

                      {/* Title & Pattern */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition">
                          {c.title}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {c.pattern} • Created {formatDate(c.createdAt)}
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 font-mono font-bold text-rose-600 text-sm">
                        {formatINR(c.amount)}
                      </td>

                      {/* Accounts */}
                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        <div className="flex flex-wrap gap-1">
                          {c.accounts.slice(0, 4).map((acc) => (
                            <span key={acc} className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px]">
                              {acc}
                            </span>
                          ))}
                          {c.accounts.length > 4 && (
                            <span className="text-[10px] text-slate-400">+{c.accounts.length - 4}</span>
                          )}
                        </div>
                      </td>

                      {/* Risk */}
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${riskStyle.badge}`}>
                          {c.risk}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${statusBadge.className}`}>
                          {statusBadge.label}
                        </span>
                      </td>

                      {/* Investigator */}
                      <td className="py-3.5 px-4 text-slate-700 font-medium">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>{c.investigator || 'Inspector Priya Rao'}</span>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          id={`open-case-btn-${c.id}`}
                          onClick={() => handleOpenCase(c.id)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-800 font-bold text-xs transition flex items-center gap-1 ml-auto"
                        >
                          <span>Investigate</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Case Modal */}
      <CreateCaseModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
};
