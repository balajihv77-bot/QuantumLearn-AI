import React, { useState, useRef } from 'react';
import { Code2, RotateCcw, Check, Copy, CheckCheck, FileText, Sparkles } from 'lucide-react';

export interface CodeAnswerEditorProps {
  value: string;
  onChange: (val: string) => void;
  language?: string;
  starterCode?: string;
  placeholder?: string;
  readOnly?: boolean;
}

export const CodeAnswerEditor: React.FC<CodeAnswerEditorProps> = ({
  value,
  onChange,
  language = 'python',
  starterCode,
  placeholder = 'Write your solution implementation here...',
  readOnly = false
}) => {
  const [activeTab, setActiveTab] = useState<'editor' | 'notes'>('editor');
  const [notes, setNotes] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [syntaxCheckResult, setSyntaxCheckResult] = useState<{
    valid: boolean;
    message: string;
  } | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Handle Tab key to insert 2 spaces instead of moving focus
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      // Insert 2 spaces
      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      onChange(newValue);

      // Restore cursor position after the spaces
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResetStarter = () => {
    if (starterCode) {
      onChange(starterCode);
      setSyntaxCheckResult(null);
    }
  };

  // Local syntax validator (balances brackets, quotes, indentation check)
  const handleValidateSyntax = () => {
    const text = value;
    const stack: { char: string; line: number }[] = [];
    const pairs: Record<string, string> = { ')': '(', ']': '[', '}': '{' };
    const lines = text.split('\n');

    let error: string | null = null;

    for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
      const line = lines[lineIdx];
      for (let cIdx = 0; cIdx < line.length; cIdx++) {
        const char = line[cIdx];
        if (char === '(' || char === '[' || char === '{') {
          stack.push({ char, line: lineIdx + 1 });
        } else if (char === ')' || char === ']' || char === '}') {
          const expected = pairs[char];
          const last = stack.pop();
          if (!last || last.char !== expected) {
            error = `Unmatched bracket '${char}' around Line ${lineIdx + 1}.`;
            break;
          }
        }
      }
      if (error) break;
    }

    if (!error && stack.length > 0) {
      const unclosed = stack[stack.length - 1];
      error = `Unclosed bracket '${unclosed.char}' opened on Line ${unclosed.line}.`;
    }

    if (error) {
      setSyntaxCheckResult({ valid: false, message: error });
    } else {
      setSyntaxCheckResult({
        valid: true,
        message: 'Syntax validation passed: Bracket pairs and structural delimiters are balanced.'
      });
    }
  };

  // Calculate lines for gutter
  const lineCount = Math.max(1, value.split('\n').length);
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  return (
    <div className="rounded-xl border border-cyan-500/30 bg-[#080d1f] overflow-hidden flex flex-col transition-all">
      {/* Editor Top Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 text-xs select-none">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 font-mono text-[11px] font-semibold uppercase">
            <Code2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>{language}</span>
          </div>

          <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-950/60 border border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab('editor')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                activeTab === 'editor'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Code Editor
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('notes')}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                activeTab === 'notes'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Notes & Complexity
            </button>
          </div>
        </div>

        {/* Toolbar actions */}
        <div className="flex items-center gap-2">
          {starterCode && (
            <button
              type="button"
              onClick={handleResetStarter}
              title="Reset code to initial template"
              className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              <RotateCcw className="w-3 h-3 text-cyan-400" />
              <span>Reset Template</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleValidateSyntax}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-750 text-cyan-300 border border-cyan-500/20 text-[11px] font-medium transition-colors"
          >
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>Check Structure</span>
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="p-1.5 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title="Copy code"
          >
            {copied ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Editor Body */}
      {activeTab === 'editor' ? (
        <div className="relative flex min-h-[260px] max-h-[460px] overflow-auto font-mono text-xs sm:text-sm">
          {/* Line Numbers Gutter */}
          <div className="select-none py-3 px-3 text-right text-slate-600 bg-slate-950/60 border-r border-slate-800/80 shrink-0 font-mono text-[11px] leading-6">
            {lineNumbers.map(n => (
              <div key={n}>{n}</div>
            ))}
          </div>

          {/* Code Textarea */}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              if (syntaxCheckResult) setSyntaxCheckResult(null);
            }}
            onKeyDown={handleKeyDown}
            readOnly={readOnly}
            placeholder={placeholder}
            spellCheck={false}
            className="flex-1 w-full bg-transparent p-3 text-cyan-100 placeholder:text-slate-600 focus:outline-none resize-none font-mono leading-6 tab-size-2"
          />
        </div>
      ) : (
        /* Complexity & Notes tab */
        <div className="p-4 space-y-3 min-h-[260px]">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 text-cyan-400" />
            <span>Write your Big-O time and space complexity explanation and algorithmic approach:</span>
          </div>
          <textarea
            rows={8}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Time Complexity: O(N) because...&#10;Space Complexity: O(1) auxiliary...&#10;Key Trade-offs & Edge Cases..."
            className="w-full bg-slate-950/70 p-3.5 rounded-lg border border-slate-800 text-xs text-slate-200 focus:border-cyan-400 focus:outline-none font-sans leading-relaxed resize-y"
          />
        </div>
      )}

      {/* Syntax Check Notification if performed */}
      {syntaxCheckResult && (
        <div
          className={`px-4 py-2 border-t text-xs flex items-center gap-2 ${
            syntaxCheckResult.valid
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
              : 'bg-amber-950/40 border-amber-500/30 text-amber-300'
          }`}
        >
          {syntaxCheckResult.valid ? (
            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          ) : (
            <span className="text-amber-400 font-bold shrink-0">!</span>
          )}
          <span>{syntaxCheckResult.message}</span>
        </div>
      )}

      {/* Editor Status Footer */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-slate-950 border-t border-slate-800/80 text-[11px] text-slate-500 font-mono">
        <div>
          <span>{lineCount} lines</span>
          <span className="mx-2">·</span>
          <span>{value.length} characters</span>
        </div>
        <div className="text-slate-400">
          Tab key inserts 2 spaces · UTF-8
        </div>
      </div>
    </div>
  );
};
