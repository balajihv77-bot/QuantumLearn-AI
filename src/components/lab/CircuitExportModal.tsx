import React, { useState } from 'react';
import { X, Copy, Check, Download, FileCode, FileJson } from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { Button3D } from '../common/Button3D';
import { QuantumSimulatorEngine } from '../../services/quantumSimulator';

interface CircuitExportModalProps {
  numQubits: number;
  grid: (string | null)[][];
  onClose: () => void;
}

export const CircuitExportModal: React.FC<CircuitExportModalProps> = ({
  numQubits,
  grid,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'json' | 'python' | 'qasm'>('json');
  const [copied, setCopied] = useState<boolean>(false);

  // Generate exports
  const circuitJson = JSON.stringify(
    {
      format: 'QuantumLearn-AI-Circuit-v1',
      numQubits,
      numSteps: grid[0]?.length || 0,
      grid,
      createdAt: new Date().toISOString()
    },
    null,
    2
  );

  const qiskitCode = QuantumSimulatorEngine.generateQiskitCode(numQubits, grid);
  const qasmCode = QuantumSimulatorEngine.generateOpenQASM(numQubits, grid);

  const currentContent =
    activeTab === 'json' ? circuitJson : activeTab === 'python' ? qiskitCode : qasmCode;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const filename =
      activeTab === 'json'
        ? 'circuit.json'
        : activeTab === 'python'
        ? 'circuit.py'
        : 'circuit.qasm';
    const mimeType = activeTab === 'json' ? 'application/json' : 'text/plain';

    const blob = new Blob([currentContent], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <GlassCard glow className="relative max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col p-6 sm:p-7 border border-cyan-500/40">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 block">Interoperability</span>
            <h3 className="text-lg font-bold text-white mt-0.5">Circuit Code & JSON Export</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center justify-between pt-4 pb-2">
          <div className="flex p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('json')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'json' ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileJson className="w-3.5 h-3.5" />
              <span>Circuit JSON</span>
            </button>
            <button
              onClick={() => setActiveTab('python')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'python' ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Qiskit Python</span>
            </button>
            <button
              onClick={() => setActiveTab('qasm')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'qasm' ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>OpenQASM 2.0</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-200 hover:border-cyan-400 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-semibold text-cyan-300 hover:border-cyan-400 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
          </div>
        </div>

        {/* Code Content */}
        <div className="flex-1 overflow-y-auto mt-2">
          <pre className="p-4 rounded-xl bg-slate-950 border border-slate-900 font-mono text-xs text-slate-200 overflow-x-auto leading-relaxed">
            {currentContent}
          </pre>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <Button3D variant="dark" size="sm" onClick={onClose}>
            Close
          </Button3D>
        </div>

      </GlassCard>
    </div>
  );
};
