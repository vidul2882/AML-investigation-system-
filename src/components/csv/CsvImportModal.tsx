import React, { useState, useRef } from 'react';
import { useAML } from '../../context/AMLContext';
import { Upload, Download, X, FileText, CheckCircle2, AlertTriangle } from 'lucide-react';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CsvImportModal: React.FC<CsvImportModalProps> = ({ isOpen, onClose }) => {
  const { importCsvTransactions, showToast } = useAML();
  const [csvContent, setCsvContent] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (file: File) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
      setErrorMessage('Please upload a valid .csv file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setCsvContent(text);
    };
    reader.readAsText(file);
  };

  const handleProcessImport = () => {
    if (!csvContent.trim()) {
      setErrorMessage('Please paste or upload CSV data first.');
      return;
    }
    const res = importCsvTransactions(csvContent);
    if (res.success) {
      setSuccessMessage(`Successfully imported and processed ${res.count} transactions!`);
      setErrorMessage(null);
      setTimeout(() => {
        onClose();
      }, 1400);
    } else {
      setErrorMessage(res.message);
      setSuccessMessage(null);
    }
  };

  const handleDownloadSample = () => {
    const sampleCsv = `transaction_id,from_account,to_account,amount,timestamp
TX_DEMO_01,ACC_901,ACC_902,4200000,2026-09-18 12:01:00
TX_DEMO_02,ACC_902,ACC_903,4100000,2026-09-18 12:04:00
TX_DEMO_03,ACC_903,ACC_904,3950000,2026-09-18 12:07:00
TX_DEMO_04,ACC_904,ACC_905,3850000,2026-09-18 12:09:00
TX_DEMO_05,ACC_801,ACC_802,25000,2026-09-18 12:15:00`;

    const blob = new Blob([sampleCsv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'amlens_sample_transactions.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Sample AML CSV downloaded', 'info');
  };

  const handleLoadSampleToEditor = () => {
    const sampleCsv = `transaction_id,from_account,to_account,amount,timestamp
TX_DEMO_01,ACC_901,ACC_902,4200000,2026-09-18 12:01:00
TX_DEMO_02,ACC_902,ACC_903,4100000,2026-09-18 12:04:00
TX_DEMO_03,ACC_903,ACC_904,3950000,2026-09-18 12:07:00
TX_DEMO_04,ACC_904,ACC_905,3850000,2026-09-18 12:09:00`;
    setCsvContent(sampleCsv);
    setErrorMessage(null);
  };

  return (
    <div
      id="csv-import-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Import Transaction CSV</h3>
              <p className="text-xs text-slate-500">
                Bulk ingest banking ledgers into AMLens graph engine
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs">
          {/* Instructions */}
          <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-100 text-indigo-900 leading-relaxed">
            <span className="font-bold">Required CSV Columns:</span>{' '}
            <code className="bg-white/80 px-1.5 py-0.5 rounded text-indigo-700 font-mono text-[11px]">
              transaction_id, from_account, to_account, amount, timestamp
            </code>
          </div>

          {/* Drag and Drop Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleFileUpload(e.dataTransfer.files[0]);
              }
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition ${
              isDragging
                ? 'border-indigo-500 bg-indigo-50/50'
                : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
            />
            <FileText className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
            <div className="font-semibold text-slate-800">
              Click to select or drag and drop a CSV file
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Standard UTF-8 comma-separated banking ledgers
            </div>
          </div>

          {/* CSV Textarea preview/edit */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-semibold text-slate-700">CSV Data / Preview</label>
              <button
                type="button"
                onClick={handleLoadSampleToEditor}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Paste Demo Data
              </button>
            </div>
            <textarea
              rows={4}
              value={csvContent}
              onChange={(e) => setCsvContent(e.target.value)}
              placeholder="transaction_id,from_account,to_account,amount,timestamp&#10;T101,A101,B205,5000000,2026-09-18 10:01:00"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-[11px] text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
            />
          </div>

          {/* Messages */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={handleDownloadSample}
              className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5 text-indigo-600" /> Download Sample CSV
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition"
              >
                Cancel
              </button>
              <button
                id="parse-csv-submit-btn"
                type="button"
                onClick={handleProcessImport}
                className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-1.5 shadow-sm transition"
              >
                <Upload className="w-4 h-4" /> Ingest & Run AML Scan
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
