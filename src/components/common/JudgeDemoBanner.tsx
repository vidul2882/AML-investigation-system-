import React from 'react';
import { useAML } from '../../context/AMLContext';
import { Play, Pause, ChevronRight, ChevronLeft, X, Award, CheckCircle2 } from 'lucide-react';

export const JudgeDemoBanner: React.FC = () => {
  const {
    judgeDemo,
    nextJudgeDemoStep,
    prevJudgeDemoStep,
    stopJudgeDemo,
    toggleJudgeDemoAutoplay,
  } = useAML();

  if (!judgeDemo.isActive) return null;

  return (
    <div
      id="judge-demo-banner"
      className="sticky top-0 z-50 bg-gradient-to-r from-indigo-900 via-blue-900 to-indigo-950 text-white shadow-xl border-b border-indigo-700/60 px-4 py-3"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left: Step indicator & icon */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-amber-400 text-indigo-950 font-bold shadow">
            <Award className="w-5 h-5 text-indigo-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-300">
                Hackathon Judge Guided Demo
              </span>
              <span className="px-2 py-0.5 text-xs font-bold bg-white/15 rounded-full text-indigo-100">
                Step {judgeDemo.step} of 11
              </span>
            </div>
            <p className="text-sm font-medium text-slate-100 line-clamp-1">
              {judgeDemo.stepDescription}
            </p>
          </div>
        </div>

        {/* Center: Progress dots */}
        <div className="hidden lg:flex items-center gap-1.5">
          {Array.from({ length: 11 }, (_, i) => i + 1).map((stepNum) => (
            <div
              key={stepNum}
              className={`h-2 rounded-full transition-all duration-300 ${
                stepNum === judgeDemo.step
                  ? 'w-6 bg-amber-400'
                  : stepNum < judgeDemo.step
                  ? 'w-2 bg-emerald-400'
                  : 'w-2 bg-indigo-800/80'
              }`}
              title={`Step ${stepNum}`}
            />
          ))}
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-2">
          <button
            id="judge-demo-prev-btn"
            onClick={prevJudgeDemoStep}
            disabled={judgeDemo.step <= 1}
            className="p-1.5 rounded-md bg-white/10 hover:bg-white/20 disabled:opacity-40 disabled:cursor-not-allowed transition text-white"
            title="Previous Step"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            id="judge-demo-autoplay-btn"
            onClick={toggleJudgeDemoAutoplay}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition shadow-sm ${
              judgeDemo.isAutoPlaying
                ? 'bg-amber-400 text-indigo-950 hover:bg-amber-300'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white'
            }`}
          >
            {judgeDemo.isAutoPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" /> Auto-playing
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" /> Auto-Play
              </>
            )}
          </button>

          <button
            id="judge-demo-next-btn"
            onClick={nextJudgeDemoStep}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition shadow-sm"
          >
            {judgeDemo.step === 11 ? (
              <>
                <CheckCircle2 className="w-4 h-4" /> Finish Demo
              </>
            ) : (
              <>
                Next Step <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>

          <button
            id="judge-demo-close-btn"
            onClick={stopJudgeDemo}
            className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition ml-1"
            title="Exit Demo"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
