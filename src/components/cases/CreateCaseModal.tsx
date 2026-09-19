import React, { useState } from 'react';
import { useAML } from '../../context/AMLContext';
import { RiskLevel } from '../../types';
import { X, Briefcase, ShieldAlert, Check } from 'lucide-react';

interface CreateCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTransactionId?: string;
}

export const CreateCaseModal: React.FC<CreateCaseModalProps> = ({
  isOpen,
  onClose,
  defaultTransactionId,
}) => {
  const { createCase, transactions, accounts } = useAML();

  const [title, setTitle] = useState('');
  const [selectedTxId, setSelectedTxId] = useState(defaultTransactionId || 'T001');
  const [pattern, setPattern] = useState('Layering & Rapid Movement');
  const [risk, setRisk] = useState<RiskLevel>('CRITICAL');
  const [description, setDescription] = useState('');
  const [investigator, setInvestigator] = useState('Inspector Priya Rao (FIU-IND)');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const primaryTx = transactions.find((t) => t.id === selectedTxId);
    const involvedAccounts = primaryTx ? [primaryTx.from, primaryTx.to] : ['A101', 'B205'];

    createCase({
      title: title.trim(),
      risk,
      pattern,
      amount: primaryTx ? primaryTx.amount : 5000000,
      accounts: involvedAccounts,
      transactions: primaryTx ? [primaryTx.id] : ['T001'],
      description: description.trim() || `Investigation into suspicious ${pattern} structure involving accounts ${involvedAccounts.join(', ')}.`,
      investigator,
    });

    onClose();
  };

  return (
    <div
      id="create-case-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Create AML Investigation Case</h3>
              <p className="text-xs text-slate-500">Initiate formal forensic case docket</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Case Title */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Case Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Cross-Border Layering via Shell Escrow Ring"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-slate-800 font-medium"
            />
          </div>

          {/* Primary Transaction */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Primary Transaction
              </label>
              <select
                value={selectedTxId}
                onChange={(e) => setSelectedTxId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-slate-800 bg-white font-mono"
              >
                {transactions.map((tx) => (
                  <option key={tx.id} value={tx.id}>
                    {tx.id} ({tx.from} ➔ {tx.to}) - ₹{(tx.amount / 100000).toFixed(0)}L
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Risk Classification
              </label>
              <select
                value={risk}
                onChange={(e) => setRisk(e.target.value as RiskLevel)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-slate-800 bg-white font-semibold"
              >
                <option value="CRITICAL">Critical (Emergency Priority)</option>
                <option value="HIGH_RISK">High Risk</option>
                <option value="SUSPICIOUS">Suspicious</option>
                <option value="NORMAL">Standard Review</option>
              </select>
            </div>
          </div>

          {/* Pattern & Investigator */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Detected Pattern
              </label>
              <select
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-slate-800 bg-white"
              >
                <option value="Layering & Rapid Movement">Layering & Rapid Movement</option>
                <option value="Circular Transfer (Round-Tripping)">Circular Transfer</option>
                <option value="Rapid Mule Smurfing">Rapid Movement & Smurfing</option>
                <option value="High-Value Foreign Outflow">High Value Transaction</option>
                <option value="Unusual Account Relationship">Unusual Relationship</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Assigned Investigator
              </label>
              <input
                type="text"
                value={investigator}
                onChange={(e) => setInvestigator(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-slate-800"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Case Summary / Initial Findings
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detail the detected anomaly, source of funds, intermediary mule behavior, and immediate investigative objectives..."
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-slate-800"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition"
            >
              Cancel
            </button>
            <button
              id="save-case-submit-btn"
              type="submit"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-1.5 shadow-sm transition"
            >
              <Check className="w-4 h-4" /> Save & Open Case
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
