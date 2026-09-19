import React, { useState } from 'react';
import { useAML } from '../context/AMLContext';
import { ShieldCheck, ArrowRight, KeyRound, Mail, Sparkles, Award } from 'lucide-react';

export const LoginView: React.FC = () => {
  const { loginUser, startJudgeDemo } = useAML();
  const [email, setEmail] = useState('investigator@amlens.demo');
  const [password, setPassword] = useState('AMLens@123');

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    loginUser(email);
  };

  const handleEnterDemo = () => {
    loginUser('investigator@amlens.demo');
  };

  const handleStartJudgeDemo = () => {
    loginUser('investigator@amlens.demo');
    setTimeout(() => {
      startJudgeDemo();
    }, 100);
  };

  return (
    <div
      id="amlens-login-screen"
      className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col justify-center items-center p-4 relative overflow-hidden text-slate-900"
    >
      {/* Background visual geometric accents */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Login Card */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200/80 p-8 z-10 relative">
        {/* Brand Icon & Heading */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200 mb-3">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            AMLens
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-indigo-600 tracking-wide uppercase mt-0.5">
            Follow the Money
          </p>
          <p className="text-xs text-slate-500 mt-2">
            AI-Powered Anti-Money-Laundering Investigation System
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSignIn} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Investigator Work Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="investigator@amlens.demo"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none text-xs text-slate-800 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Secure Passphrase
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none text-xs text-slate-800 font-medium"
              />
            </div>
          </div>

          <button
            id="login-sign-in-btn"
            type="submit"
            className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
          >
            <span>Sign In</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <span className="relative px-3 bg-white text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Fast Access For Judges
          </span>
        </div>

        {/* Quick Demo Buttons */}
        <div className="space-y-2.5">
          <button
            id="enter-demo-mode-btn"
            type="button"
            onClick={handleEnterDemo}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition flex items-center justify-center gap-2 border border-slate-200"
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Enter Demo Mode (Direct Dashboard)</span>
          </button>

          <button
            id="login-start-judge-demo-btn"
            type="button"
            onClick={handleStartJudgeDemo}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-extrabold text-xs transition flex items-center justify-center gap-2 shadow-sm"
          >
            <Award className="w-4 h-4" />
            <span>Launch Hackathon Judge Walkthrough</span>
          </button>
        </div>

        {/* Credentials reminder */}
        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-400">
            Demo Credentials:{' '}
            <code className="text-slate-600 font-mono font-semibold">investigator@amlens.demo</code>{' '}
            / <code className="text-slate-600 font-mono font-semibold">AMLens@123</code>
          </p>
        </div>
      </div>

      {/* Footer disclaimer */}
      <footer className="mt-8 text-center text-xs text-slate-400 max-w-sm">
        AMLens is a hackathon prototype using simulated financial transaction data.
      </footer>
    </div>
  );
};
