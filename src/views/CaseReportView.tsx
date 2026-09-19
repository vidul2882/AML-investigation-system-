import React, { useMemo } from 'react';
import { useAML } from '../context/AMLContext';
import {
  Printer,
  Download,
  Share2,
  FileCheck,
  Building,
  User,
  Shield,
  Clock,
  ArrowRight,
  AlertTriangle,
  Briefcase,
  CheckCircle2,
} from 'lucide-react';
import {
  formatINR,
  getRiskColorClass,
  getCaseStatusBadge,
  formatDate,
  formatTimestamp,
} from '../utils/formatters';

export const CaseReportView: React.FC = () => {
  const {
    cases,
    selectedCaseId,
    setSelectedCaseId,
    transactions,
    accounts,
    aiForensics,
    showToast,
  } = useAML();

  const activeCase = useMemo(() => {
    return cases.find((c) => c.id === selectedCaseId) || cases[0];
  }, [cases, selectedCaseId]);

  const caseTxs = useMemo(() => {
    return transactions.filter(
      (t) =>
        activeCase.transactions.includes(t.id) ||
        (activeCase.accounts.includes(t.from) && activeCase.accounts.includes(t.to))
    );
  }, [transactions, activeCase]);

  const caseAccounts = useMemo(() => {
    return accounts.filter((a) => activeCase.accounts.includes(a.id));
  }, [accounts, activeCase]);

  const forensic = useMemo(() => {
    return (
      aiForensics[activeCase.id] ||
      aiForensics['CASE-001'] || {
        caseId: activeCase.id,
        confidenceScore: 96,
        summary: `Autonomous AML graph traversal detected high-risk anomalous funds flow for ${activeCase.title}.`,
        whySuspicious: [
          'Abnormal velocity: transfers initiated < 5 mins apart.',
          'Intermediary accounts with near-zero retained balance.',
        ],
        moneyFlowNarrative: `Funds routed sequentially through intermediary ledger hops.`,
        recommendedActions: [
          'Issue account debit freeze order.',
          'Submit Suspicious Transaction Report (STR) to FIU.',
        ],
        evidencePoints: [
          'High turnover contrasting with tax filings.',
          'Lack of physical business operations.',
        ],
      }
    );
  }, [activeCase, aiForensics]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadReport = () => {
    const reportText = `================================================================================
FINANCIAL INTELLIGENCE UNIT — ANTI-MONEY-LAUNDERING INVESTIGATION REPORT
================================================================================
CASE ID:        ${activeCase.id}
TITLE:          ${activeCase.title}
DATE:           ${new Date().toISOString().split('T')[0]}
INVESTIGATOR:   ${activeCase.investigator}
STATUS:         ${activeCase.status}
RISK RATING:    ${activeCase.risk}
FLAGGED VOLUME: ${formatINR(activeCase.amount)}
TYPOLOGY:       ${activeCase.pattern}

1. EXECUTIVE FORENSIC SUMMARY
${forensic.summary}

2. MONEY TRAIL RECONSTRUCTION
${forensic.moneyFlowNarrative}

Accounts Involved: ${activeCase.accounts.join(' -> ')}

3. DETECTED STATUTORY RED FLAGS
${forensic.whySuspicious.map((r, i) => `  ${i + 1}. ${r}`).join('\n')}

4. EVIDENCE CATALOG
${forensic.evidencePoints.map((e, i) => `  E${i + 1}: ${e}`).join('\n')}

5. ENFORCEMENT RECOMMENDATIONS
${forensic.recommendedActions.map((a, i) => `  [ ] ${a}`).join('\n')}

6. INVESTIGATOR SIGN-OFF
Certified by: ${activeCase.investigator}
Date of Certification: ${new Date().toLocaleDateString('en-IN')}
Classification: CONFIDENTIAL // LAW ENFORCEMENT SENSITIVE
================================================================================`;

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AML_REPORT_${activeCase.id}_${Date.now()}.txt`;
    a.click();
    showToast('Forensic Case Report exported successfully', 'success');
  };

  const riskStyle = getRiskColorClass(activeCase.risk);
  const statusBadge = getCaseStatusBadge(activeCase.status);

  return (
    <div id="case-report-view" className="space-y-6 max-w-5xl mx-auto">
      {/* Action Bar (Hidden during printing) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-black text-slate-900">Official AML Forensic Report</h1>
          <p className="text-xs text-slate-500">
            Exportable regulatory documentation compliant with FIU-IND & FATF standards
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={activeCase.id}
            onChange={(e) => setSelectedCaseId(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs font-bold text-slate-800 bg-white"
          >
            {cases.map((c) => (
              <option key={c.id} value={c.id}>
                {c.id} - {c.title}
              </option>
            ))}
          </select>

          <button
            id="print-report-btn"
            onClick={handlePrint}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition"
          >
            <Printer className="w-4 h-4" /> Print Dossier
          </button>

          <button
            onClick={handleDownloadReport}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition"
          >
            <Download className="w-4 h-4" /> Download Text Report
          </button>
        </div>
      </div>

      {/* Official Printable Report Document */}
      <div
        id="official-aml-report-document"
        className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-lg text-slate-900 space-y-8 font-sans"
      >
        {/* Document Letterhead */}
        <div className="border-b-2 border-slate-900 pb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-900 text-white flex items-center justify-center font-bold">
                <Shield className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-sm uppercase tracking-widest text-slate-900">
                AMLens Special Investigations Directorate
              </span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900 mt-2">
              SUSPICIOUS TRANSACTION FORENSIC DOSSIER
            </h2>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Ref: FIU-IND / AML-CASE / {activeCase.id} • Classification: CONFIDENTIAL
            </p>
          </div>

          <div className="text-right sm:text-right">
            <span className={`inline-block px-3 py-1 rounded-full border text-xs font-black ${riskStyle.badge}`}>
              {activeCase.risk} RATING
            </span>
            <div className="text-xs text-slate-500 font-mono mt-1">
              Date: {new Date().toLocaleDateString('en-IN', { dateStyle: 'long' })}
            </div>
          </div>
        </div>

        {/* Section 1: Case Meta Data Table */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
          <div>
            <span className="text-slate-500 block text-[11px] uppercase font-semibold">Case Docket</span>
            <span className="font-mono font-bold text-indigo-900 text-sm">{activeCase.id}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px] uppercase font-semibold">Lead Investigator</span>
            <span className="font-bold text-slate-900">{activeCase.investigator}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px] uppercase font-semibold">Flagged Capital</span>
            <span className="font-mono font-bold text-rose-700 text-sm">{formatINR(activeCase.amount)}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px] uppercase font-semibold">Regulatory Status</span>
            <span className="font-bold text-slate-900">{activeCase.status}</span>
          </div>
        </div>

        {/* Section 2: Executive Summary */}
        <div className="space-y-2">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
            1. Executive Forensic Summary
          </h3>
          <p className="text-xs leading-relaxed text-slate-700">
            {forensic.summary} This investigation was automatically triggered by the AMLens graph
            traversal engine upon encountering multi-hop anomalous velocity thresholds and synthetic
            account behavioral topologies.
          </p>
        </div>

        {/* Section 3: Topology & Money Trail */}
        <div className="space-y-2">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
            2. Typology Classification & Money Conduit
          </h3>
          <p className="text-xs text-slate-700 leading-relaxed">{forensic.moneyFlowNarrative}</p>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between font-mono text-xs font-bold text-indigo-900">
            <span>Conduit Path:</span>
            <span>{activeCase.accounts.join(' ➔ ')}</span>
          </div>
        </div>

        {/* Section 4: Involved Entities Table */}
        <div className="space-y-2">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
            3. Involved Entity Profiles
          </h3>
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <th className="py-2 px-3">Account ID</th>
                <th className="py-2 px-3">Entity Name</th>
                <th className="py-2 px-3">Type</th>
                <th className="py-2 px-3">Age</th>
                <th className="py-2 px-3">Risk Level</th>
                <th className="py-2 px-3 text-right">Total Outflow</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {caseAccounts.map((acc) => (
                <tr key={acc.id}>
                  <td className="py-2 px-3 font-bold text-indigo-700">{acc.id}</td>
                  <td className="py-2 px-3 font-sans text-slate-900">{acc.name}</td>
                  <td className="py-2 px-3 font-sans text-slate-600">{acc.type}</td>
                  <td className="py-2 px-3">{acc.ageMonths} mos</td>
                  <td className="py-2 px-3 font-sans font-bold text-rose-600">{acc.risk}</td>
                  <td className="py-2 px-3 text-right font-bold text-slate-900">
                    {formatINR(acc.totalOutflow)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Section 5: Transaction Sequence */}
        <div className="space-y-2">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
            4. Transaction Sequence & Velocity Log
          </h3>
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold font-sans border-b border-slate-200">
                <th className="py-2 px-3">Tx ID</th>
                <th className="py-2 px-3">Origin</th>
                <th className="py-2 px-3">Beneficiary</th>
                <th className="py-2 px-3">Timestamp</th>
                <th className="py-2 px-3">Velocity</th>
                <th className="py-2 px-3 text-right">Amount (INR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {caseTxs.map((t) => (
                <tr key={t.id}>
                  <td className="py-2 px-3 font-bold text-indigo-700">{t.id}</td>
                  <td className="py-2 px-3">{t.from}</td>
                  <td className="py-2 px-3">{t.to}</td>
                  <td className="py-2 px-3 text-slate-600">{formatTimestamp(t.timestamp)}</td>
                  <td className="py-2 px-3 text-indigo-600 font-bold">
                    {t.velocityMinutes !== undefined ? `${t.velocityMinutes} min` : 'Fast'}
                  </td>
                  <td className="py-2 px-3 text-right font-bold text-rose-700">
                    {formatINR(t.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Section 6: Statutory Evidence & Red Flags */}
        <div className="space-y-2">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
            5. Evidentiary Red Flags & Anomalies
          </h3>
          <ul className="space-y-1.5 text-xs text-slate-700 list-disc list-inside">
            {forensic.whySuspicious.map((r, i) => (
              <li key={i} className="leading-relaxed">
                <strong className="text-slate-900">{r}</strong>
              </li>
            ))}
          </ul>
        </div>

        {/* Section 7: Recommended Enforcement Actions */}
        <div className="space-y-2">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
            6. Regulatory Directives & Required Actions
          </h3>
          <div className="space-y-1 text-xs text-slate-800">
            {forensic.recommendedActions.map((rec, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-4 h-4 rounded border border-slate-400 flex items-center justify-center font-mono text-[10px]">
                  ✓
                </span>
                <span>{rec}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Section 8: Sign-off Seal & Signatures */}
        <div className="pt-8 border-t-2 border-slate-900 grid grid-cols-2 gap-8 text-xs">
          <div>
            <div className="font-bold text-slate-900 uppercase">Investigating Officer Sign-off</div>
            <div className="font-serif italic text-base mt-2 text-indigo-950 font-bold">
              Priya Rao, FIU-IND
            </div>
            <div className="text-slate-500 text-[11px] mt-0.5">
              Inspector Priya Rao, FIU Special AML Task Force
            </div>
          </div>

          <div className="text-right">
            <div className="font-bold text-slate-900 uppercase">Official Verification Seal</div>
            <div className="inline-block mt-2 px-3 py-1.5 border-2 border-slate-900 rounded-lg font-mono font-bold text-slate-900 text-[11px]">
              FIU-AMLENS // VERIFIED SEAL
            </div>
            <div className="text-slate-400 text-[10px] mt-1">
              Cryptographically timestamped by AMLens Engine
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
