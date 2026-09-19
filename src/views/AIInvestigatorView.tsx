import React, { useState, useMemo } from 'react';
import { useAML } from '../context/AMLContext';
import {
  Bot,
  Sparkles,
  Send,
  HelpCircle,
  ShieldAlert,
  Layers,
  ArrowRight,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Building,
  DollarSign,
  Briefcase,
  Download,
} from 'lucide-react';
import { formatINR } from '../utils/formatters';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export const AIInvestigatorView: React.FC = () => {
  const { cases, selectedCaseId, setSelectedCaseId, aiForensics, setActiveView } = useAML();

  const activeCase = useMemo(() => {
    return cases.find((c) => c.id === selectedCaseId) || cases[0];
  }, [cases, selectedCaseId]);

  const forensic = useMemo(() => {
    return (
      aiForensics[activeCase.id] ||
      aiForensics['CASE-001'] || {
        caseId: activeCase.id,
        confidenceScore: 96,
        summary: `Autonomous AML graph traversal flagged ${activeCase.title}.`,
        whySuspicious: [
          'High fund velocity between unrelated accounts.',
          'Intermediary accounts with near-zero retained balance.',
        ],
        moneyFlowNarrative: 'Funds routed sequentially across intermediate accounts.',
        recommendedActions: [
          'Submit STR to Financial Intelligence Unit.',
          'Issue account debit freeze order.',
        ],
        evidencePoints: [
          'Abnormal velocity: transfers initiated < 5 mins apart.',
          'Shell company address mismatch.',
        ],
      }
    );
  }, [activeCase, aiForensics]);

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'ai',
      text: `Greetings Inspector Rao. I have analyzed the financial graph for ${activeCase.id} (${activeCase.title}). The confidence score is ${forensic.confidenceScore}%. How can I assist your forensic inquiry?`,
      timestamp: 'Just now',
    },
  ]);
  const [userInput, setUserInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  const quickQuestions = [
    `Why is account ${activeCase.accounts[1] || 'B205'} considered a mule account?`,
    'What is the total laundered amount in this chain?',
    'How does this velocity compare to normal retail banking?',
    'What specific statutory evidence should I cite in the STR filing?',
  ];

  const handleAskQuestion = (questionText: string) => {
    if (!questionText.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: questionText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setUserInput('');
    setIsThinking(true);

    // Dynamic intelligent reply based on query
    setTimeout(() => {
      let replyText = '';
      const q = questionText.toLowerCase();

      if (q.includes('mule') || q.includes('b205') || q.includes('why is account')) {
        replyText = `Account ${activeCase.accounts[1] || 'B205'} exhibits textbook money mule behavior: (1) Inflow of funds was immediately dissipated within minutes (transit time 3m), (2) Account holds near-zero retained balance after routing, (3) PAN/tax filing shows negligible reported annual turnover (<₹2,50,000) contrasting with multi-lakh wire volumes, and (4) Entity registration was completed only 3 months ago with no operational payroll or commercial activity.`;
      } else if (q.includes('amount') || q.includes('laundered') || q.includes('total')) {
        replyText = `The total detected conduit volume under this case is ${formatINR(activeCase.amount)}. Over the sequence of hops, approximately 2-4% is siphoned at each stage (likely mule commissions and transaction fees), with the terminal beneficiary receiving ${formatINR(activeCase.amount * 0.94)}.`;
      } else if (q.includes('velocity') || q.includes('normal') || q.includes('compare')) {
        replyText = `Normal commercial B2B settlements exhibit an average holding latency of 24 to 72 hours with matching invoices. In this network, capital was transferred in an extraordinary 2 to 4 minutes per hop. This rapid-fire velocity is mathematically impossible for legitimate human business verification and demonstrates programmatic or coordinated structuring designed to outrun automated clearing freezes.`;
      } else if (q.includes('str') || q.includes('evidence') || q.includes('filing') || q.includes('cite')) {
        replyText = `For the FIU-IND Suspicious Transaction Report (Form STR-1), cite the following statutory grounds under Rule 8(1) of PMLA: (1) Structured layering across 5 hops without economic rationale, (2) Contradiction between entity profile and wire magnitude, (3) Circular round-tripping signatures returning capital to controlling interest, and (4) Timestamps confirming rapid sequential liquidation.`;
      } else {
        replyText = `Based on our forensic graph ledger for ${activeCase.id}: The transactions across accounts ${activeCase.accounts.join(' ➔ ')} represent a coordinated ${activeCase.pattern} topology. The primary risk driver is the absence of commercial underlying contracts combined with synthetic entity velocities. I strongly recommend freezing the outbound debit rights on terminal account ${activeCase.accounts[activeCase.accounts.length - 1]}.`;
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsThinking(false);
    }, 650);
  };

  return (
    <div id="ai-investigator-view" className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-purple-100">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                AI Investigator Forensic Studio
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold">
                Explainable AML AI
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500">
              Autonomous evidentiary synthesis, money trail walkthroughs, and legal red-flag explanations
            </p>
          </div>
        </div>

        {/* Case Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Active Case:</span>
          <select
            value={activeCase.id}
            onChange={(e) => setSelectedCaseId(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 bg-white font-mono text-xs font-bold text-slate-800 outline-none"
          >
            {cases.map((c) => (
              <option key={c.id} value={c.id}>
                {c.id} - {c.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Forensic Report Cards (Structured Explainable AI) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Card 1: Executive Summary & Typology */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" /> Executive Narrative
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono font-bold">
              {forensic.confidenceScore}% Confidence
            </span>
          </div>

          <p className="text-xs text-slate-700 leading-relaxed">{forensic.summary}</p>

          <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-100 space-y-1">
            <div className="text-[11px] font-bold text-purple-900 uppercase">
              Typology: {activeCase.pattern}
            </div>
            <p className="text-[11px] text-purple-800 leading-relaxed">
              Intentional dissipation and fragmentation of illicit capital across multiple
              intermediary entities to obscure beneficial ownership and origin.
            </p>
          </div>
        </div>

        {/* Card 2: Money Trail Walkthrough */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" /> Money Trail Walkthrough
            </h3>
            <span className="text-xs font-mono text-slate-400">
              {activeCase.accounts.length} Hop Chain
            </span>
          </div>

          <p className="text-xs text-slate-700 leading-relaxed">{forensic.moneyFlowNarrative}</p>

          <div className="space-y-1.5 text-xs font-mono text-slate-800">
            {activeCase.accounts.map((acc, idx) => (
              <div
                key={acc}
                className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[10px]">
                    {idx + 1}
                  </span>
                  <span className="font-bold">{acc}</span>
                </div>
                <span className="text-[10px] text-slate-500">
                  {idx === 0
                    ? 'Originator'
                    : idx === activeCase.accounts.length - 1
                    ? 'Terminal Beneficiary'
                    : 'Mule Intermediary'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Card 3: Statutory Red Flags & Recommendations */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600" /> Statutory Red Flags
            </h3>
            <span className="text-xs font-bold text-rose-700 font-mono">PMLA Section 12</span>
          </div>

          <div className="space-y-2 text-xs">
            {forensic.whySuspicious.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2 text-slate-700">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100">
            <div className="text-[11px] font-bold text-slate-800 uppercase mb-2">
              Recommended Directives
            </div>
            <div className="space-y-1.5 text-xs text-slate-700">
              {forensic.recommendedActions.map((rec, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Q&A Forensic Chat Console */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col h-[520px]">
        {/* Console Header */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-sm">
              Interactive Investigator Dialogue — Case {activeCase.id}
            </h3>
          </div>
          <span className="text-xs text-slate-500">Autonomous Financial Crime Logic</span>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-3 bg-slate-50/50 border-b border-slate-100 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-slate-400 shrink-0">Inquire:</span>
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleAskQuestion(q)}
              className="px-3 py-1 rounded-lg bg-white hover:bg-indigo-50 hover:border-indigo-300 border border-slate-200 text-slate-700 font-medium text-xs whitespace-nowrap transition"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Chat Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-800 border border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1 opacity-75 font-semibold text-[10px]">
                  <span>{msg.sender === 'user' ? 'Inspector Priya Rao' : 'AMLens AI Core'}</span>
                  <span>{msg.timestamp}</span>
                </div>
                <div>{msg.text}</div>
              </div>
            </div>
          ))}

          {isThinking && (
            <div className="flex justify-start">
              <div className="bg-slate-100 rounded-2xl p-3 border border-slate-200 text-xs text-slate-500 flex items-center gap-2 animate-pulse">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                <span>Traversing graph ledgers & synthesizing forensic explanation...</span>
              </div>
            </div>
          )}
        </div>

        {/* Chat Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAskQuestion(userInput);
          }}
          className="p-3 border-t border-slate-200 bg-white flex items-center gap-2"
        >
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder={`Ask any forensic question about ${activeCase.id}, accounts, or suspicious indicators...`}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
          <button
            type="submit"
            disabled={!userInput.trim()}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition"
          >
            <span>Ask</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
