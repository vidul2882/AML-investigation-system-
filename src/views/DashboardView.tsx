import React from 'react';
import { useAML } from '../context/AMLContext';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts';
import {
  Activity,
  AlertOctagon,
  TrendingUp,
  Share2,
  Repeat,
  Zap,
  ArrowRight,
  ShieldAlert,
  Award,
  Sparkles,
  FileSpreadsheet,
  SearchCode,
} from 'lucide-react';
import {
  formatINR,
  formatCompactINR,
  getRiskColorClass,
} from '../utils/formatters';

export const DashboardView: React.FC = () => {
  const {
    detectionResult,
    cases,
    setActiveView,
    setSelectedCaseId,
    setHighlightedPath,
    startJudgeDemo,
  } = useAML();

  const { stats } = detectionResult;

  // Pie chart data: Risk Distribution
  const riskPieData = [
    { name: 'Normal', value: stats.normalTransactions, color: '#10b981' },
    { name: 'Suspicious', value: stats.suspiciousBreakdown.suspicious, color: '#f59e0b' },
    { name: 'High Risk', value: stats.suspiciousBreakdown.highRisk, color: '#ef4444' },
    { name: 'Critical', value: stats.suspiciousBreakdown.critical, color: '#be123c' },
  ];

  // Pattern Breakdown Data
  const patternBarData = [
    { pattern: 'Layering', count: stats.layeringChains, fill: '#6366f1' },
    { pattern: 'Circular Flow', count: stats.circularFlows, fill: '#ec4899' },
    { pattern: 'Rapid Move', count: stats.rapidMovements, fill: '#f59e0b' },
    { pattern: 'High Value', count: stats.highValueCount, fill: '#3b82f6' },
  ];

  // Top High-Risk Accounts Bar Data
  const topAccountsData = stats.topRiskAccounts.slice(0, 5).map((acc) => ({
    name: acc.id,
    outflow: acc.totalOutflow,
    risk: acc.risk,
  }));

  // Suspicious Volume Timeline Data (Simulated chronological aggregated bins)
  const volumeTimelineData = [
    { time: '10:00', normal: 250000, suspicious: 0 },
    { time: '10:05', normal: 480000, suspicious: 5000000 },
    { time: '10:10', normal: 310000, suspicious: 4800000 },
    { time: '10:15', normal: 620000, suspicious: 4600000 },
    { time: '10:20', normal: 190000, suspicious: 4400000 },
    { time: '10:30', normal: 540000, suspicious: 14400000 },
    { time: '10:45', normal: 420000, suspicious: 3750000 },
  ];

  const handleOpenCase = (caseId: string) => {
    setSelectedCaseId(caseId);
    setActiveView('investigation');
  };

  const handleTracePattern = (path: string[]) => {
    setHighlightedPath(path);
    setActiveView('network');
  };

  return (
    <div id="amlens-dashboard-view" className="space-y-6 max-w-7xl mx-auto">
      {/* Hero Card & Workflow Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl text-white p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
        {/* Glow orb */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400 text-slate-950 uppercase tracking-wide">
                  FIU Sentinel Engine v2.4
                </span>
                <span className="text-xs text-indigo-200">
                  Real-time Graph Anomaly Detection
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                Follow the Money
              </h1>
              <p className="text-sm sm:text-base text-slate-300 mt-2 leading-relaxed">
                Autonomous anti-money-laundering intelligence. Uncover layered shell conduits,
                round-tripping loops, rapid smurfing, and undisclosed beneficiary rings across banking ledgers.
              </p>
            </div>

            {/* Quick Actions in Hero */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                id="dashboard-start-demo-btn"
                onClick={startJudgeDemo}
                className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md flex items-center gap-2 transition"
              >
                <Award className="w-4 h-4" /> Start Judge Demo
              </button>
              <button
                onClick={() => setActiveView('network')}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm rounded-xl backdrop-blur-xs border border-white/10 flex items-center gap-2 transition"
              >
                <Share2 className="w-4 h-4 text-indigo-300" /> Open Money Network
              </button>
            </div>
          </div>

          {/* Workflow Stepper Roadmap */}
          <div className="mt-6 pt-6 border-t border-slate-800">
            <div className="text-[11px] uppercase tracking-wider font-bold text-slate-400 mb-3">
              Investigative Workflow Pipeline
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-center text-xs">
              {[
                { step: '1. Detect', desc: 'Rules & Graph Traversal' },
                { step: '2. Connect', desc: 'Synthesize Entity Graph' },
                { step: '3. Trace', desc: 'Sub-Graph Conduit Hops' },
                { step: '4. Explain', desc: 'Forensic AI Narrative' },
                { step: '5. Investigate', desc: 'Dossier Workspace' },
                { step: '6. Create Case', desc: 'Evidence & Notes Docket' },
                { step: '7. Report', desc: 'FIU/STR Regulatory Export' },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white/5 border border-white/10 rounded-xl p-2.5 backdrop-blur-xs hover:bg-white/10 transition"
                >
                  <div className="font-bold text-amber-300 text-xs">{item.step}</div>
                  <div className="text-[10px] text-slate-300 mt-0.5">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* KPI 6-Grid Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Card 1: Total Transactions */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Transactions Monitored</span>
            <Activity className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {stats.totalTransactions}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">
            {stats.normalTransactions} verified clean
          </div>
        </div>

        {/* Card 2: Suspicious Transactions */}
        <div className="bg-white p-4 rounded-2xl border border-rose-200/80 bg-rose-50/20 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Suspicious Wires</span>
            <AlertOctagon className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-rose-600 font-mono">
            {stats.suspiciousTransactions}
          </div>
          <div className="text-[11px] text-rose-700 font-medium mt-1">
            {stats.suspiciousBreakdown.critical} critical severity
          </div>
        </div>

        {/* Card 3: Suspicious Volume */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Flagged Volume</span>
            <TrendingUp className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-black text-slate-900 font-mono truncate">
            {formatINR(stats.suspiciousVolume)}
          </div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">
            Total {formatINR(stats.totalVolume)} ledger
          </div>
        </div>

        {/* Card 4: Layering Chains */}
        <div
          onClick={() => handleTracePattern(['A101', 'B205', 'C301', 'D410', 'E512'])}
          className="bg-white p-4 rounded-2xl border border-indigo-200 shadow-xs hover:shadow-md hover:border-indigo-400 cursor-pointer transition group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold group-hover:text-indigo-600">Layering Chains</span>
            <Share2 className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-indigo-600 font-mono">
            {stats.layeringChains} Active
          </div>
          <div className="text-[11px] text-indigo-700 font-medium mt-1 flex items-center gap-1">
            Trace 5-hop conduit <ArrowRight className="w-3 h-3" />
          </div>
        </div>

        {/* Card 5: Circular Flows */}
        <div
          onClick={() => handleTracePattern(['P100', 'Q200', 'R300', 'P100'])}
          className="bg-white p-4 rounded-2xl border border-pink-200 shadow-xs hover:shadow-md hover:border-pink-400 cursor-pointer transition group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold group-hover:text-pink-600">Circular Loops</span>
            <Repeat className="w-4 h-4 text-pink-600" />
          </div>
          <div className="text-2xl font-black text-pink-600 font-mono">
            {stats.circularFlows} Loop
          </div>
          <div className="text-[11px] text-pink-700 font-medium mt-1 flex items-center gap-1">
            Trace round-trip <ArrowRight className="w-3 h-3" />
          </div>
        </div>

        {/* Card 6: Rapid Movement */}
        <div
          onClick={() => handleTracePattern(['M101', 'M202', 'M303', 'M404'])}
          className="bg-white p-4 rounded-2xl border border-amber-200 shadow-xs hover:shadow-md hover:border-amber-400 cursor-pointer transition group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold group-hover:text-amber-600">Rapid Movement</span>
            <Zap className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-600 font-mono">
            {stats.rapidMovements} Fast Hops
          </div>
          <div className="text-[11px] text-amber-700 font-medium mt-1 flex items-center gap-1">
            Trace mule ring <ArrowRight className="w-3 h-3" />
          </div>
        </div>
      </div>

      {/* Priority Investigations Alert Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-600" />
            <h2 className="text-base font-extrabold text-slate-900">
              Active Priority Investigations ({cases.length})
            </h2>
          </div>
          <button
            onClick={() => setActiveView('cases')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            View All Cases <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {cases.slice(0, 3).map((c) => {
            const riskClass = getRiskColorClass(c.risk);
            return (
              <div
                key={c.id}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-bold text-xs text-indigo-700">{c.id}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${riskClass.badge}`}>
                      {c.risk}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm mt-1.5 line-clamp-1">{c.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{c.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-400">Total Flagged Flow</div>
                    <div className="font-mono font-bold text-sm text-rose-600">
                      {formatINR(c.amount)}
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenCase(c.id)}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition"
                  >
                    <SearchCode className="w-3.5 h-3.5" /> Investigate
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Analytics Visualizations: 4 Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Risk Distribution */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Transactions by Risk Level</h3>
              <p className="text-xs text-slate-500">Breakdown of inspected transaction corpus</p>
            </div>
            <span className="text-xs font-mono text-slate-400">N={stats.totalTransactions}</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {riskPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [`${value} Transactions`, 'Volume']}
                  contentStyle={{
                    borderRadius: '12px',
                    borderColor: '#e2e8f0',
                    fontSize: '12px',
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Suspicious Volume Timeline */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Suspicious Volume Over Time</h3>
              <p className="text-xs text-slate-500">Chronological surge of flagged transfers (INR)</p>
            </div>
            <span className="text-xs font-mono text-rose-600 font-bold">₹2.32 Cr Flagged</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={volumeTimelineData}>
                <defs>
                  <linearGradient id="suspiciousGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`}
                />
                <Tooltip
                  formatter={(v: any) => [formatINR(v), 'Flagged Volume']}
                  contentStyle={{
                    borderRadius: '12px',
                    borderColor: '#e2e8f0',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="suspicious"
                  stroke="#ef4444"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#suspiciousGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Top High Risk Accounts */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Top High-Risk Accounts</h3>
              <p className="text-xs text-slate-500">Outbound capital volume across flagged entities</p>
            </div>
            <span className="text-xs text-indigo-600 font-semibold cursor-pointer" onClick={() => setActiveView('network')}>
              View Network
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topAccountsData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  type="number"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickFormatter={(v) => formatCompactINR(v)}
                />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={12} fontStyle="bold" />
                <Tooltip
                  formatter={(v: any) => [formatINR(v), 'Outflow']}
                  contentStyle={{
                    borderRadius: '12px',
                    borderColor: '#e2e8f0',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="outflow" fill="#6366f1" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Detected Pattern Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Detection Pattern Breakdown</h3>
              <p className="text-xs text-slate-500">Incidence frequency by typology structure</p>
            </div>
            <span className="text-xs font-mono text-slate-400">4 Active Typologies</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={patternBarData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="pattern" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    borderColor: '#e2e8f0',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill="#818cf8" radius={[6, 6, 0, 0]}>
                  {patternBarData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
