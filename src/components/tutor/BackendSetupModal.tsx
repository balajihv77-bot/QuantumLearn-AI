import React, { useState } from 'react';
import { X, Server, Terminal, Copy, Check, ShieldCheck, ExternalLink, Code2 } from 'lucide-react';
import { Button3D } from '../common/Button3D';

interface BackendSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  backendEndpoint: string;
}

export const BackendSetupModal: React.FC<BackendSetupModalProps> = ({
  isOpen,
  onClose,
  backendEndpoint
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!isOpen) return null;

  const sampleFastAPICode = `# backend/main.py
# FastAPI Live AI Service for QuantumLearn AI
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
import google.genai as genai

app = FastAPI(title="QuantumLearn AI Backend")

# 1. Enable CORS for Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Configure Gemini API securely via server environment variable
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
client = genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[dict]] = None
    context: Optional[dict] = None

@app.get("/api/health")
def health():
    return {"status": "ok", "gemini_configured": bool(GEMINI_API_KEY)}

@app.post("/api/ai/chat")
async def chat(req: ChatRequest):
    if not client:
        raise HTTPException(
            status_code=503, 
            detail="GEMINI_API_KEY is not configured on the backend server."
        )
    
    system_prompt = (
        "You are QuantumLearn AI Tutor, an expert pedagogical guide for quantum computing. "
        "Explain concepts with Dirac bra-ket notation, physical analogies, and step-by-step math. "
        "Provide Python Qiskit or Cirq code when requested."
    )
    
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=[system_prompt, req.message]
    )
    
    return {
        "reply": response.text,
        "source": "live_backend",
        "suggestedFollowUps": [
            "Explain step-by-step matrix derivation",
            "Generate Qiskit circuit code"
        ]
    }

# Run with: uvicorn main:app --port 8000 --reload
`;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Live AI Backend Setup Guide</h3>
              <p className="text-xs text-slate-400">Connecting FastAPI to QuantumLearn AI</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-300">
          
          {/* Security Principle Banner */}
          <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/30 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed space-y-1">
              <span className="font-bold text-white block">Security & API Key Isolation Architecture</span>
              <p className="text-cyan-200/90">
                To guarantee zero secret exposure, <strong>GEMINI_API_KEY is never stored or called directly in frontend client code</strong>.
                Instead, QuantumLearn AI points to a secure backend endpoint (<code className="text-cyan-300 font-mono">{backendEndpoint}</code>).
              </p>
            </div>
          </div>

          {/* Current Status */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current Configuration Status</div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-xs font-medium text-slate-200">
                  Operating in <strong>Offline Curated Pedagogical Demo Mode</strong>
                </span>
              </div>
              <span className="text-[11px] font-mono text-cyan-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                Endpoint: {backendEndpoint}
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed pt-1">
              While running without an active backend, all quantum concepts, mathematics, code generation, and debugging are answered by our rich curated quantum knowledge base.
            </p>
          </div>

          {/* Setup Steps */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span>Step-by-Step FastAPI Deployment</span>
            </h4>

            <ol className="space-y-3 text-xs text-slate-300">
              <li className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
                <span className="font-bold text-cyan-400">Step 1: Install Python Dependencies</span>
                <div className="font-mono bg-black/60 p-2 rounded text-slate-200 flex justify-between items-center mt-1">
                  <code>pip install fastapi uvicorn google-genai pydantic</code>
                  <button
                    onClick={() => copyToClipboard('pip install fastapi uvicorn google-genai pydantic', 'pip')}
                    className="text-slate-400 hover:text-white cursor-pointer"
                  >
                    {copiedCode === 'pip' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </li>

              <li className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
                <span className="font-bold text-cyan-400">Step 2: Set Server Environment Secret</span>
                <div className="font-mono bg-black/60 p-2 rounded text-slate-200 flex justify-between items-center mt-1">
                  <code>export GEMINI_API_KEY="your-secret-api-key"</code>
                  <button
                    onClick={() => copyToClipboard('export GEMINI_API_KEY="your-secret-api-key"', 'env')}
                    className="text-slate-400 hover:text-white cursor-pointer"
                  >
                    {copiedCode === 'env' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </li>

              <li className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-cyan-400">Step 3: Create FastAPI Server (`main.py`)</span>
                  <button
                    onClick={() => copyToClipboard(sampleFastAPICode, 'fastapi')}
                    className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedCode === 'fastapi' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copy main.py</span>
                  </button>
                </div>

                <pre className="font-mono bg-black/80 p-3 rounded-lg text-slate-300 text-[11px] overflow-x-auto max-h-48 border border-slate-800/80">
                  <code>{sampleFastAPICode}</code>
                </pre>
              </li>

              <li className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
                <span className="font-bold text-cyan-400">Step 4: Launch FastAPI Server</span>
                <div className="font-mono bg-black/60 p-2 rounded text-slate-200 flex justify-between items-center mt-1">
                  <code>uvicorn main:app --host 0.0.0.0 --port 8000 --reload</code>
                  <button
                    onClick={() => copyToClipboard('uvicorn main:app --host 0.0.0.0 --port 8000 --reload', 'run')}
                    className="text-slate-400 hover:text-white cursor-pointer"
                  >
                    {copiedCode === 'run' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </li>
            </ol>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            QuantumLearn AI will automatically detect when the endpoint goes live.
          </span>
          <Button3D variant="cyan" size="sm" onClick={onClose}>
            Got It
          </Button3D>
        </div>

      </div>
    </div>
  );
};
