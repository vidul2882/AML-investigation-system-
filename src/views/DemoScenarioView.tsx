import React from 'react';
import { useAML } from '../context/AMLContext';
import {
  Layers,
  Repeat,
  Zap,
  Play,
  ArrowRight,
  ShieldAlert,
  Clock,
  Building,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { formatINR } from '../utils/formatters';

export const DemoScenarioView: React.FC = () => {
  const { loadDemoScenario, setActiveView, setHighlightedPath, showToast } = useAML();

  const scenarios = [
    {
      id: 'layering' as const,
      title: 'Scenario 1: Multi-Hop Shell Layering',
      typology: 'Layering & Structuring',
      path: ['A101', 'B205', 'C301', 'D410', 'E512'],
      amount: 5000000,
      velocity: '10 mins total (2m avg / hop)',
      color: 'border-indigo-200 bg-indigo-50/30 text-indigo-900',
      badgeColor: 'bg-indigo-100 text-indigo-700',
      icon: Layers,
      story:
        'A high-value deposit of ₹50,00,000 originating from A101 (Apex Horizon Trading) is rapidly fragmented and wired across three intermediary shell entities (B205, C301, D410) within 10 minutes, finally terminating at E512 (Elysian Global Offshore Holdings). The objective is to disguise the illicit origin and bypass standard clearing-house anti-fraud latency checks.',
      indicators: [
        'Rapid fund dissipation with near-zero retained balance in intermediary accounts',
        'Entities established < 6 months with generic commercial descriptions',
        'Lack of physical shipping or tax/customs declarations for claimed B2B payments',
      ],
      caseId: 'CASE-001',
    },
    {
      id: 'circular' as const,
      title: 'Scenario 2: Circular Round-Tripping',
      typology: 'Circular Flow (Hawala / Tax Arbitrage)',
      path: ['P100', 'Q200', 'R300', 'P100'],
      amount: 4800000,
      velocity: '12 mins closed loop',
      color: 'border-pink-200 bg-pink-50/30 text-pink-900',
      badgeColor: 'bg-pink-100 text-pink-700',
      icon: Repeat,
      story:
        'Capital totaling ₹48,00,000 is transferred in a closed triangular loop from P100 (Prism Zenith Logistics) to Q200 (Quantum Falcon Advisory), onward to R300 (Radiant Vertex Holdings), and immediately returning back into P100. This circular transfer is a classic signature of synthetic trade turnover inflation, bogus expense claims, and round-tripping.',
      indicators: [
        'Zero net capital deployment: 99.2% of original principal returns to sender',
        'Zero commercial rationale for mutual inter-company transfers on same calendar day',
        'Identical ultimate beneficial ownership (UBO) controlling all 3 entities',
      ],
      caseId: 'CASE-002',
    },
    {
      id: 'rapid' as const,
      title: 'Scenario 3: Rapid Movement & Mule Smurfing',
      typology: 'High-Velocity Mule Smurfing',
      path: ['M101', 'M202', 'M303', 'M404'],
      amount: 3500000,
      velocity: '8 mins (under 2m / hop)',
      color: 'border-amber-200 bg-amber-50/30 text-amber-900',
      badgeColor: 'bg-amber-100 text-amber-800',
      icon: Zap,
      story:
        '₹35,00,000 moves across 4 individual accounts (M101 to M404) at hyper-speed—under 2 minutes per hop. The sender accounts are typical student/low-income mule accounts recruited on messaging platforms to route illicit proceeds to cryptocurrency P2P desks before detection teams can flag the accounts.',
      indicators: [
        'Transfers executed in rapid succession (< 120 seconds between credit and debit)',
        'Mule accounts exhibit historic turnover under ₹25,000 suddenly receiving ₹35,00,000',
        'IP logins from anomalous overseas VPN endpoints for all transfers',
      ],
      caseId: 'CASE-003',
    },
  ];

  const handleRunScenario = (sc: (typeof scenarios)[0]) => {
    loadDemoScenario(sc.id);
  };

  return (
    <div id="demo-scenarios-view" className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Pre-Configured AML Demo Scenarios
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
              Judge-Ready Sandbox
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Click any scenario below to instantly configure the graph topology, focus the network visualizer,
            and inspect the associated case docket and AI explanation.
          </p>
        </div>

        <button
          onClick={() => {
            setHighlightedPath(['A101', 'B205', 'C301', 'D410', 'E512', 'P100', 'Q200', 'R300']);
            setActiveView('network');
            showToast('All suspicious topologies highlighted simultaneously in Network', 'info');
          }}
          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition"
        >
          <Sparkles className="w-4 h-4 text-amber-400" /> Highlight All In Graph
        </button>
      </div>

      {/* 3 Scenario Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {scenarios.map((sc) => {
          const Icon = sc.icon;
          return (
            <div
              key={sc.id}
              className={`p-6 rounded-3xl border shadow-xs bg-white hover:shadow-lg transition flex flex-col justify-between space-y-5`}
            >
              <div className="space-y-4">
                {/* Header of card */}
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800 shadow-xs">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${sc.badgeColor}`}>
                    {sc.typology}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-extrabold text-slate-900">{sc.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                    <span className="font-mono font-bold text-rose-600">{formatINR(sc.amount)}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-indigo-500" /> {sc.velocity}
                    </span>
                  </div>
                </div>

                {/* Path Visualizer Pill */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-mono text-xs font-bold text-slate-800 flex items-center justify-between overflow-x-auto">
                  <span>Path:</span>
                  <span className="text-indigo-700">{sc.path.join(' ➔ ')}</span>
                </div>

                {/* Narrative Story */}
                <p className="text-xs text-slate-600 leading-relaxed">{sc.story}</p>

                {/* Red Flag Indicators */}
                <div>
                  <div className="text-[11px] font-bold text-slate-800 uppercase tracking-wider mb-2">
                    Key Red Flags:
                  </div>
                  <div className="space-y-1.5 text-xs text-slate-600">
                    {sc.indicators.map((ind, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{ind}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 border-t border-slate-100">
                <button
                  id={`load-scenario-${sc.id}-btn`}
                  onClick={() => handleRunScenario(sc)}
                  className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition active:scale-98"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Load Scenario & Open Case ({sc.caseId})</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
