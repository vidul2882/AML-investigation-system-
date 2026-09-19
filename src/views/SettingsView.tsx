import React, { useState } from 'react';
import { useAML } from '../context/AMLContext';
import { AMLSettings } from '../types';
import {
  Settings,
  Sliders,
  RotateCcw,
  Save,
  ShieldAlert,
  Clock,
  Layers,
  Repeat,
  Download,
  CheckCircle2,
} from 'lucide-react';
import { formatINR } from '../utils/formatters';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, resetToDefaultData, showToast } = useAML();

  const [formSettings, setFormSettings] = useState<AMLSettings>({ ...settings });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formSettings);
  };

  const handleResetData = () => {
    if (window.confirm('Reset all transactions, cases, and accounts back to factory demo state?')) {
      resetToDefaultData();
    }
  };

  const handleExportConfig = () => {
    const jsonStr = JSON.stringify(formSettings, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `amlens_rules_config_${Date.now()}.json`;
    a.click();
    showToast('AML Engine configuration exported as JSON', 'info');
  };

  return (
    <div id="amlens-settings-view" className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              AML Sentinel Engine Settings
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Configure detection rule thresholds, hop limits, and data sandbox persistence
            </p>
          </div>
        </div>

        <button
          onClick={handleExportConfig}
          className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition"
        >
          <Download className="w-3.5 h-3.5 text-indigo-600" /> Export JSON
        </button>
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSave} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        <div className="space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
            Algorithmic Detection Thresholds
          </h3>

          {/* High Value Threshold */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-indigo-600" />
                High-Value Transaction Threshold (INR)
              </label>
              <span className="font-mono font-bold text-xs text-indigo-700">
                {formatINR(formSettings.highValueThreshold)}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Any single transaction exceeding this value triggers immediate enhanced due diligence (EDD) rule.
            </p>
            <input
              type="range"
              min="500000"
              max="10000000"
              step="500000"
              value={formSettings.highValueThreshold}
              onChange={(e) =>
                setFormSettings({ ...formSettings, highValueThreshold: parseInt(e.target.value, 10) })
              }
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>

          {/* Rapid Movement Window */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-600" />
                Rapid Movement Time Window (Minutes)
              </label>
              <span className="font-mono font-bold text-xs text-amber-700">
                {formSettings.rapidMovementWindowMinutes} Minutes
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Maximum allowable duration between consecutive hops in transit accounts before triggering mule smurfing alert.
            </p>
            <input
              type="range"
              min="5"
              max="60"
              step="5"
              value={formSettings.rapidMovementWindowMinutes}
              onChange={(e) =>
                setFormSettings({
                  ...formSettings,
                  rapidMovementWindowMinutes: parseInt(e.target.value, 10),
                })
              }
              className="w-full accent-amber-600 cursor-pointer"
            />
          </div>

          {/* Min Layering Hops */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-purple-600" />
                Minimum Layering Chain Length (Hops)
              </label>
              <span className="font-mono font-bold text-xs text-purple-700">
                {formSettings.minLayeringHops} Consecutive Hops
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Number of sequential transfers without balance retention required to classify as an active layering conduit.
            </p>
            <input
              type="range"
              min="2"
              max="6"
              step="1"
              value={formSettings.minLayeringHops}
              onChange={(e) =>
                setFormSettings({
                  ...formSettings,
                  minLayeringHops: parseInt(e.target.value, 10),
                })
              }
              className="w-full accent-purple-600 cursor-pointer"
            />
          </div>

          {/* Circular Threshold */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Repeat className="w-4 h-4 text-pink-600" />
                Circular Flow Threshold (INR)
              </label>
              <span className="font-mono font-bold text-xs text-pink-700">
                {formatINR(formSettings.circularFlowThreshold)}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Closed loop threshold detecting cycles where funds return to originating entity.
            </p>
            <input
              type="range"
              min="500000"
              max="5000000"
              step="250000"
              value={formSettings.circularFlowThreshold}
              onChange={(e) =>
                setFormSettings({
                  ...formSettings,
                  circularFlowThreshold: parseInt(e.target.value, 10),
                })
              }
              className="w-full accent-pink-600 cursor-pointer"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={handleResetData}
            className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs flex items-center gap-1.5 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset to Default Seed Data
          </button>

          <button
            id="save-settings-btn"
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
          >
            <Save className="w-4 h-4" /> Save & Recompute Graph
          </button>
        </div>
      </form>
    </div>
  );
};
