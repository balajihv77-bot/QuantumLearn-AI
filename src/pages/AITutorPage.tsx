import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Send,
  Sparkles,
  Bot,
  RefreshCw,
  Server,
  Download,
  AlertTriangle,
  Lightbulb,
  Terminal,
  ShieldCheck,
  CheckCircle2,
  Atom,
  HelpCircle,
  Code2,
  Binary
} from 'lucide-react';
import { GlassCard } from '../components/common/GlassCard';
import { Button3D } from '../components/common/Button3D';
import { ChatMessageItem } from '../components/tutor/ChatMessageItem';
import { SuggestedQuestionsPanel } from '../components/tutor/SuggestedQuestionsPanel';
import { LearningPathWidget } from '../components/tutor/LearningPathWidget';
import { BackendSetupModal } from '../components/tutor/BackendSetupModal';
import { aiService } from '../services/aiService';
import { progressService } from '../services/progressService';
import { AIChatMessage, AICodeSnippet, SuggestedQuestion, BackendHealthStatus } from '../types/ai';

const INITIAL_GREETING: AIChatMessage = {
  id: 'msg-welcome',
  role: 'assistant',
  content: `Hello! I am your **QuantumLearn AI Pedagogical Tutor & Code Assistant**.\n\nWhether you need:\n* **Conceptual Intuition:** Understanding superposition, entanglement, and wave-particle duality\n* **Mathematical Rigor:** Step-by-step matrix multiplication, unitary proofs, and Born rule calculations\n* **Code Generation:** Clean Python scripts for IBM Qiskit, OpenQASM 2.0, or Google Cirq\n* **Circuit Debugging:** Fixing endianness bugs, phase kickback failures, or premature measurements\n\nI am here to guide your learning journey. Choose a suggested topic below or type your quantum question to begin!`,
  timestamp: 'Just now',
  suggestedFollowUps: [
    'Explain quantum superposition with a coin toss',
    'Show step-by-step matrix derivation of Hadamard gate',
    'Generate Qiskit code for Bell state |Φ+⟩',
    'Why is my quantum circuit outcome reversed (endianness)?'
  ],
  source: 'curated_demo'
};

export const AITutorPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Conversation history
  const [messages, setMessages] = useState<AIChatMessage[]>([INITIAL_GREETING]);
  const [inputText, setInputText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Live Backend vs Demo Mode
  const [preferLiveBackend, setPreferLiveBackend] = useState<boolean>(false);
  const [backendHealth, setBackendHealth] = useState<BackendHealthStatus | null>(null);
  const [isSetupModalOpen, setIsSetupModalOpen] = useState<boolean>(false);

  // Suggested questions from service
  const suggestedQuestions = aiService.getSuggestedQuestions();

  // Auto-scroll to bottom of conversation
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Initial check on mount: check URL queries and backend health
  useEffect(() => {
    // Check if query param topic was provided
    const topicParam = searchParams.get('topic');
    if (topicParam) {
      handleSendMessage(topicParam);
    }

    // Check backend health
    aiService.checkBackendHealth().then((status) => {
      setBackendHealth(status);
    });
  }, [searchParams]);

  // Send query
  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query) return;

    // Reset error state
    setErrorMessage(null);

    const userMessage: AIChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source: preferLiveBackend ? 'live_backend' : 'curated_demo'
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      const completedModuleIds = progressService.getCompletedModuleIds();

      const response = await aiService.sendMessage(
        {
          message: query,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
          context: {
            completedModuleIds,
            currentTopic: query
          }
        },
        preferLiveBackend
      );

      const aiMessage: AIChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        codeSnippets: response.codeSnippets,
        suggestedFollowUps: response.suggestedFollowUps,
        recommendedModuleId: response.recommendedModuleId,
        recommendedAlgorithmId: response.recommendedAlgorithmId,
        source: response.source
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err: unknown) {
      const error = err as Error;
      const errorText = error.message || 'An unexpected error occurred.';
      setErrorMessage(errorText);

      // Add transparent error message to the thread
      const errorAiMessage: AIChatMessage = {
        id: `ai-err-${Date.now()}`,
        role: 'assistant',
        content: `**Connection Alert:** ${errorText}\n\nYou can switch to the **Curated Pedagogical Demo Mode** to receive immediate verified quantum explanations, or click **Setup Guide** to configure your FastAPI backend.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true,
        source: 'curated_demo',
        suggestedFollowUps: [
          'Switch to Demo Mode and ask this question',
          'Open FastAPI Setup Guide'
        ]
      };

      setMessages((prev) => [...prev, errorAiMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  // Follow-up handler
  const handleFollowUp = (prompt: string) => {
    if (prompt === 'Switch to Demo Mode and ask this question') {
      setPreferLiveBackend(false);
      const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
      if (lastUserMsg) {
        handleSendMessage(lastUserMsg.content);
      }
    } else if (prompt === 'Open FastAPI Setup Guide') {
      setIsSetupModalOpen(true);
    } else {
      handleSendMessage(prompt);
    }
  };

  // Clear conversation
  const handleClearConversation = () => {
    setMessages([INITIAL_GREETING]);
    setErrorMessage(null);
  };

  // Export conversation transcript
  const handleExportTranscript = () => {
    const transcript = messages
      .map(
        (m) =>
          `[${m.timestamp}] ${m.role === 'assistant' ? 'QuantumLearn AI Tutor' : 'Student'}:\n${
            m.content
          }\n${m.codeSnippets?.map((c: AICodeSnippet) => `\n\`\`\`${c.language}\n${c.code}\n\`\`\``).join('\n') || ''}\n---`
      )
      .join('\n\n');

    const blob = new Blob([transcript], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `quantumlearn_chat_${new Date().toISOString().slice(0, 10)}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in pb-20">
      
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>AI Quantum Pedagogical Tutor & Code Assistant</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">
            Quantum AI Tutor
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Personalized quantum concepts, step-by-step mathematical proofs, Qiskit/Cirq code generation, and circuit debugging assistance.
          </p>
        </div>

        {/* Top Control Actions */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Mode Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
            <button
              onClick={() => {
                setPreferLiveBackend(false);
                setErrorMessage(null);
              }}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                !preferLiveBackend
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Demo Mode
            </button>
            <button
              onClick={() => {
                setPreferLiveBackend(true);
                aiService.checkBackendHealth().then((status) => setBackendHealth(status));
              }}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                preferLiveBackend
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              <span>Live Backend</span>
            </button>
          </div>

          <Button3D
            variant="dark"
            size="sm"
            onClick={() => setIsSetupModalOpen(true)}
            leftIcon={<Server className="w-3.5 h-3.5 text-cyan-400" />}
          >
            Setup Guide
          </Button3D>

          <Button3D
            variant="dark"
            size="sm"
            onClick={handleExportTranscript}
            leftIcon={<Download className="w-3.5 h-3.5 text-slate-300" />}
          >
            Export Chat
          </Button3D>

          <Button3D
            variant="dark"
            size="sm"
            onClick={handleClearConversation}
            leftIcon={<RefreshCw className="w-3.5 h-3.5 text-slate-400" />}
          >
            Reset
          </Button3D>
        </div>
      </div>

      {/* Mode Status & Operational Banner */}
      <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <span
            className={`w-2.5 h-2.5 rounded-full shrink-0 ${
              preferLiveBackend ? 'bg-purple-400 animate-pulse' : 'bg-cyan-400'
            }`}
          />
          <div className="text-slate-300">
            {preferLiveBackend ? (
              <span>
                <strong>Live AI Backend Mode Active:</strong> Sending requests to{' '}
                <code className="text-purple-300 font-mono">POST /api/ai/chat</code>.
              </span>
            ) : (
              <span>
                <strong>Curated Pedagogical Demo Mode:</strong> Responses powered by verified quantum curricula, matrix mathematics, and Qiskit code templates.
              </span>
            )}
          </div>
        </div>

        <button
          onClick={() => setIsSetupModalOpen(true)}
          className="text-cyan-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer shrink-0"
        >
          <span>FastAPI Endpoint Contract</span>
          <Server className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Error Alert Banner (if any) */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-950/30 border border-red-500/40 text-red-200 text-xs flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1">
            <span className="font-bold text-red-100">AI Request Alert:</span>
            <p className="leading-relaxed">{errorMessage}</p>
          </div>
          <button
            onClick={() => {
              setPreferLiveBackend(false);
              setErrorMessage(null);
            }}
            className="px-2.5 py-1 rounded bg-red-900/60 border border-red-500/50 text-red-100 hover:bg-red-800 transition-colors cursor-pointer font-medium shrink-0"
          >
            Switch to Demo Mode
          </button>
        </div>
      )}

      {/* Two-Column Grid: Main Chat (8 cols) & Learning Sidebar (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Main Chat Column (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Chat Messages Timeline */}
          <GlassCard glow className="p-4 sm:p-6 min-h-[500px] max-h-[640px] overflow-y-auto space-y-6">
            {messages.map((msg) => (
              <ChatMessageItem
                key={msg.id}
                message={msg}
                onSendFollowUp={handleFollowUp}
              />
            ))}

            {/* Typing / Loading Animation */}
            {isTyping && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/70 border border-slate-800/80 w-fit animate-pulse">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
                  <Atom className="w-4 h-4 animate-spin text-cyan-400" />
                </div>
                <div className="text-xs text-cyan-300 font-medium">
                  {preferLiveBackend
                    ? 'Connecting to live FastAPI LLM backend...'
                    : 'Quantum AI Tutor synthesizing pedagogical explanation...'}
                </div>
              </div>
            )}

            <div ref={chatBottomRef} />
          </GlassCard>

          {/* Quick Prompt Presets Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mr-1">
              Quick Inquiries:
            </span>
            <button
              onClick={() => handleSendMessage('Show step-by-step matrix derivation of the Hadamard gate on |0⟩.')}
              className="px-2.5 py-1 rounded-lg text-xs bg-slate-900/90 border border-slate-800 text-purple-300 hover:border-purple-400 transition-colors cursor-pointer flex items-center gap-1"
            >
              <Binary className="w-3 h-3 text-purple-400" />
              <span>Step-by-Step Math</span>
            </button>
            <button
              onClick={() => handleSendMessage('Generate Qiskit Python code for Bell state |Φ+⟩ with local simulation.')}
              className="px-2.5 py-1 rounded-lg text-xs bg-slate-900/90 border border-slate-800 text-emerald-300 hover:border-emerald-400 transition-colors cursor-pointer flex items-center gap-1"
            >
              <Code2 className="w-3 h-3 text-emerald-400" />
              <span>Generate Qiskit</span>
            </button>
            <button
              onClick={() => handleSendMessage('Why did my quantum circuit fail? Help me debug common beginner pitfalls.')}
              className="px-2.5 py-1 rounded-lg text-xs bg-slate-900/90 border border-slate-800 text-amber-300 hover:border-amber-400 transition-colors cursor-pointer flex items-center gap-1"
            >
              <AlertTriangle className="w-3 h-3 text-amber-400" />
              <span>Debug Circuit</span>
            </button>
            <button
              onClick={() => handleSendMessage('Explain the geometric meaning of the Bloch sphere polar angle θ and azimuth φ.')}
              className="px-2.5 py-1 rounded-lg text-xs bg-slate-900/90 border border-slate-800 text-cyan-300 hover:border-cyan-400 transition-colors cursor-pointer flex items-center gap-1"
            >
              <Atom className="w-3 h-3 text-cyan-400" />
              <span>Bloch Sphere</span>
            </button>
          </div>

          {/* Input Composer */}
          <GlassCard className="p-3 sm:p-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-3"
            >
              <input
                type="text"
                placeholder="Ask about superposition, Dirac notation, Qiskit code, or debugging..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={isTyping}
                className="flex-1 bg-transparent px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
              />

              <Button3D
                type="submit"
                variant="cyan"
                size="md"
                disabled={!inputText.trim() || isTyping}
                isLoading={isTyping}
                rightIcon={<Send className="w-4 h-4" />}
              >
                Send
              </Button3D>
            </form>
          </GlassCard>

          {/* Suggested Questions Drawer / Panel */}
          <div className="pt-2">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                <span>Suggested Quantum Questions by Topic:</span>
              </span>
            </div>
            <SuggestedQuestionsPanel
              questions={suggestedQuestions}
              onSelectQuestion={(q) => handleSendMessage(q)}
            />
          </div>

        </div>

        {/* Sidebar Column (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Personalized Learning Roadmap Widget */}
          <LearningPathWidget onAskTutorTopic={(topic) => handleSendMessage(topic)} />

          {/* Quantum Debugger Quick-Check Card */}
          <GlassCard className="p-4 sm:p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
              <AlertTriangle className="w-4 h-4" />
              <span>Quantum Circuit Debugger</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Having trouble with a circuit? Click any diagnostic below to inspect the mathematical fix:
            </p>
            <div className="space-y-2 pt-1">
              <button
                onClick={() => handleSendMessage('Why are my Qiskit measurement outcomes reversed compared to standard textbooks (Endianness)?')}
                className="w-full text-left p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 hover:border-amber-400 hover:text-white transition-colors cursor-pointer"
              >
                1. Qiskit Bitstring Endianness Reversed
              </button>
              <button
                onClick={() => handleSendMessage('What is Phase Kickback and why must the ancilla target be in state |–⟩?')}
                className="w-full text-left p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 hover:border-amber-400 hover:text-white transition-colors cursor-pointer"
              >
                2. Phase Kickback Target Missing |–⟩ State
              </button>
              <button
                onClick={() => handleSendMessage('Why did measuring my qubit too early destroy my quantum entanglement?')}
                className="w-full text-left p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 hover:border-amber-400 hover:text-white transition-colors cursor-pointer"
              >
                3. Premature Measurement Wavefunction Collapse
              </button>
            </div>
          </GlassCard>

          {/* Interactive Bridge to Visual Quantum Lab */}
          <GlassCard className="p-4 sm:p-5 space-y-3 border-cyan-500/30">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400">
              <Atom className="w-4 h-4" />
              <span>Experiment In Visual Lab</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Build and test the circuits discussed in this chat on our interactive circuit grid with exact state-vector simulation.
            </p>
            <Button3D
              variant="cyan"
              size="sm"
              onClick={() => navigate('/lab')}
              className="w-full"
            >
              Open Quantum Lab
            </Button3D>
          </GlassCard>

          {/* Security & Sandbox Discipline */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] text-slate-400 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-slate-300">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Educational Sandbox Discipline</span>
            </div>
            <p className="leading-relaxed">
              AI-generated code is displayed for study and manual export only. Code is never automatically executed in your browser. Provider API keys are strictly configured on the server side.
            </p>
          </div>

        </div>

      </div>

      {/* Backend Setup Modal */}
      <BackendSetupModal
        isOpen={isSetupModalOpen}
        onClose={() => setIsSetupModalOpen(false)}
        backendEndpoint="/api/ai/chat"
      />

    </div>
  );
};
