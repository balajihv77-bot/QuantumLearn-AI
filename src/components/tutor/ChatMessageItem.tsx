import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, User, Copy, Check, Sparkles, BookOpen, Cpu, ShieldCheck, AlertCircle, ExternalLink } from 'lucide-react';
import { AIChatMessage, AICodeSnippet } from '../../types/ai';

interface ChatMessageItemProps {
  message: AIChatMessage;
  onSendFollowUp: (text: string) => void;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({ message, onSendFollowUp }) => {
  const navigate = useNavigate();
  const [copiedText, setCopiedText] = useState<boolean>(false);
  const [copiedSnippetIdx, setCopiedSnippetIdx] = useState<number | null>(null);

  const handleCopyText = () => {
    navigator.clipboard.writeText(message.content);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleCopySnippet = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedSnippetIdx(idx);
    setTimeout(() => setCopiedSnippetIdx(null), 2000);
  };

  const isAI = message.role === 'assistant';

  // Helper to render markdown-like formatted text with bold, headers, math notation
  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');

    return lines.map((line, idx) => {
      // Header 3
      if (line.startsWith('### ')) {
        return (
          <h3 key={idx} className="text-base font-bold text-white mt-3 mb-1.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            {line.replace('### ', '')}
          </h3>
        );
      }
      // Header 4
      if (line.startsWith('#### ')) {
        return (
          <h4 key={idx} className="text-sm font-bold text-cyan-300 mt-2.5 mb-1">
            {line.replace('#### ', '')}
          </h4>
        );
      }
      // Bullet list item
      if (line.startsWith('* ') || line.startsWith('- ')) {
        const itemText = line.substring(2);
        return (
          <li key={idx} className="ml-4 list-disc text-slate-200 my-0.5 leading-relaxed text-sm">
            {renderInlineMarkdown(itemText)}
          </li>
        );
      }
      // Numbered list item
      if (/^\d+\.\s/.test(line)) {
        const numMatch = line.match(/^(\d+\.)\s(.*)$/);
        if (numMatch) {
          return (
            <div key={idx} className="flex items-start gap-2 text-slate-200 my-1 text-sm leading-relaxed">
              <span className="font-semibold text-cyan-400 shrink-0">{numMatch[1]}</span>
              <span>{renderInlineMarkdown(numMatch[2])}</span>
            </div>
          );
        }
      }
      // Empty line
      if (!line.trim()) {
        return <div key={idx} className="h-2" />;
      }
      // Standard paragraph
      return (
        <p key={idx} className="my-1 text-slate-200 text-sm leading-relaxed">
          {renderInlineMarkdown(line)}
        </p>
      );
    });
  };

  // Helper for inline markdown: bold, inline code, math formatting
  const renderInlineMarkdown = (text: string) => {
    // Split by inline code `code`
    const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);

    return parts.map((part, pIdx) => {
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code
            key={pIdx}
            className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-cyan-300 font-mono text-xs"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={pIdx} className="font-bold text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return <span key={pIdx}>{part}</span>;
    });
  };

  return (
    <div className={`flex items-start gap-3.5 group ${isAI ? 'flex-row' : 'flex-row-reverse'}`}>
      
      {/* Avatar */}
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${
          isAI
            ? 'bg-gradient-to-br from-cyan-500/20 via-blue-600/30 to-purple-600/30 border border-cyan-400/40 text-cyan-300'
            : 'bg-slate-800 border border-slate-700 text-slate-200'
        }`}
      >
        {isAI ? <Bot className="w-5 h-5 text-cyan-300" /> : <User className="w-5 h-5 text-slate-200" />}
      </div>

      {/* Message Bubble Container */}
      <div className={`max-w-[88%] sm:max-w-[82%] space-y-3 ${isAI ? 'items-start' : 'items-end'}`}>
        
        {/* Header with Sender info, timestamp & badges */}
        <div className={`flex items-center gap-2 text-xs text-slate-400 ${isAI ? 'flex-row' : 'flex-row-reverse'}`}>
          <span className="font-semibold text-slate-300">
            {isAI ? 'QuantumLearn AI Tutor' : 'You'}
          </span>
          <span>•</span>
          <span className="text-[11px] text-slate-500">{message.timestamp}</span>

          {isAI && (
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase border ${
                message.source === 'live_backend'
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                  : 'bg-cyan-950/60 border-cyan-500/30 text-cyan-300'
              }`}
            >
              {message.source === 'live_backend' ? 'Live AI' : 'Demo Knowledge Base'}
            </span>
          )}

          {/* Copy Message Action */}
          <button
            onClick={handleCopyText}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-400 hover:text-cyan-300 rounded cursor-pointer ml-1"
            title="Copy message text"
          >
            {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Bubble Box */}
        <div
          className={`rounded-2xl p-4 sm:p-5 shadow-lg border relative ${
            isAI
              ? message.isError
                ? 'bg-red-950/20 border-red-500/40 text-red-200'
                : 'bg-slate-900/90 border-slate-800/90 text-slate-200 backdrop-blur-md'
              : 'bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border-cyan-500/40 text-slate-100'
          }`}
        >
          {/* Main Text Content */}
          <div className="space-y-1">
            {renderFormattedContent(message.content)}
          </div>

          {/* Code Snippets Block (if any) */}
          {message.codeSnippets && message.codeSnippets.length > 0 && (
            <div className="mt-4 space-y-3">
              {message.codeSnippets.map((snippet, sIdx) => (
                <div
                  key={sIdx}
                  className="rounded-xl border border-slate-800 bg-[#060913] overflow-hidden shadow-inner"
                >
                  {/* Code Card Header */}
                  <div className="px-3.5 py-2 bg-slate-950/90 border-b border-slate-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-400/80 inline-block" />
                      <span className="font-semibold text-slate-200 font-mono">
                        {snippet.title || `${snippet.language.toUpperCase()} Snippet`}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-slate-900 border border-slate-800 text-cyan-300">
                        {snippet.language}
                      </span>
                      <button
                        onClick={() => handleCopySnippet(snippet.code, sIdx)}
                        className="p-1 rounded text-slate-400 hover:text-cyan-300 transition-colors flex items-center gap-1 text-xs cursor-pointer"
                        title="Copy code"
                      >
                        {copiedSnippetIdx === sIdx ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-[10px] text-emerald-400 font-medium">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span className="text-[10px]">Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Preformatted Code Content */}
                  <pre className="p-3.5 text-xs font-mono text-cyan-200 overflow-x-auto leading-relaxed selection:bg-cyan-500/30">
                    <code>{snippet.code}</code>
                  </pre>

                  {/* Security Notice: Never automatically executes AI generated code */}
                  <div className="px-3 py-1.5 bg-slate-950/50 border-t border-slate-800/50 text-[10px] text-slate-400 flex items-center justify-between">
                    <span>* Safe sandbox preview. Review code before running on local Python.</span>
                    <button
                      onClick={() => navigate('/lab')}
                      className="text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer font-medium"
                    >
                      <span>Simulate in Quantum Lab</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Dynamic Module or Algorithm Recommendations */}
          {(message.recommendedModuleId || message.recommendedAlgorithmId) && (
            <div className="mt-4 pt-3 border-t border-slate-800/70 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-400 text-[11px] font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                Recommended Next Step:
              </span>

              {message.recommendedModuleId && (
                <button
                  onClick={() => navigate(`/modules?module=${message.recommendedModuleId}`)}
                  className="px-2.5 py-1 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 hover:border-cyan-400 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Open Related Module</span>
                </button>
              )}

              {message.recommendedAlgorithmId && (
                <button
                  onClick={() => navigate(`/algorithms?algo=${message.recommendedAlgorithmId}`)}
                  className="px-2.5 py-1 rounded-lg bg-purple-950/60 border border-purple-500/40 text-purple-300 hover:border-purple-400 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>Inspect Algorithm</span>
                </button>
              )}
            </div>
          )}

          {/* Suggested Follow-Up Questions */}
          {message.suggestedFollowUps && message.suggestedFollowUps.length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-400 block">
                Suggested Follow-Up Inquiries:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {message.suggestedFollowUps.map((prompt, pIdx) => (
                  <button
                    key={pIdx}
                    onClick={() => onSendFollowUp(prompt)}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-950/80 border border-slate-800 text-cyan-300 hover:border-cyan-400 hover:bg-slate-900 transition-all cursor-pointer text-left"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
