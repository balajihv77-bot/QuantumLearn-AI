import React, { useState } from 'react';
import {
  Mic,
  MicOff,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  Shield,
  HelpCircle,
  Plus,
  RefreshCw,
  Edit3
} from 'lucide-react';
import { Button3D } from '../common/Button3D';
import { VoiceInputState } from '../../hooks/useVoiceInterview';

interface VoiceInputControlProps {
  isRecognitionSupported: boolean;
  inputState: VoiceInputState;
  isListening: boolean;
  isProcessing: boolean;
  permissionDenied: boolean;
  recognitionError: string | null;
  interimTranscript: string;
  lastFinalTranscript: string;
  currentAnswer: string;
  onStartListening: () => void;
  onStopListening: () => void;
  onClearError: () => void;
  onAppendText: (text: string) => void;
  onReplaceText: (text: string) => void;
  onClearTranscript: () => void;
}

export const VoiceInputControl: React.FC<VoiceInputControlProps> = ({
  isRecognitionSupported,
  inputState,
  isListening,
  isProcessing,
  permissionDenied,
  recognitionError,
  interimTranscript,
  lastFinalTranscript,
  currentAnswer,
  onStartListening,
  onStopListening,
  onClearError,
  onAppendText,
  onReplaceText,
  onClearTranscript
}) => {
  const [showPrivacyNote, setShowPrivacyNote] = useState<boolean>(false);

  // If browser does not support SpeechRecognition (e.g., Firefox or unsupported mobile engine)
  if (!isRecognitionSupported) {
    return (
      <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <MicOff className="w-4 h-4 text-slate-500 shrink-0" />
          <span>
            <strong className="text-slate-300">Voice Input Unsupported:</strong> Speech Recognition is not available in this browser. You can type seamlessly using keyboard input.
          </span>
        </div>
        <span className="text-[10px] text-cyan-400 font-mono">Text Fallback Active</span>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {/* Main 3D Microphone Toggle Button */}
          {!isListening && !isProcessing ? (
            <Button3D
              variant="dark"
              size="sm"
              onClick={onStartListening}
              leftIcon={<Mic className="w-3.5 h-3.5 text-cyan-400" />}
              className="text-xs"
              title="Click to activate microphone and speak your answer"
            >
              Speak Answer
            </Button3D>
          ) : isListening ? (
            <Button3D
              variant="emerald"
              size="sm"
              onClick={onStopListening}
              leftIcon={
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                </span>
              }
              className="text-xs"
              title="Click to stop microphone recording"
            >
              Listening... (Click to Finish)
            </Button3D>
          ) : (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs font-semibold animate-pulse">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
              <span>Transcribing Speech...</span>
            </div>
          )}

          {/* Privacy & Safeguards Badge */}
          <button
            type="button"
            onClick={() => setShowPrivacyNote(!showPrivacyNote)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900/60 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-400 hover:text-cyan-300 transition-colors"
            title="Privacy and speech processing disclosure"
          >
            <Shield className="w-3 h-3 text-cyan-400" />
            <span>Voice Privacy</span>
          </button>
        </div>

        {/* Live Audio Equalizer Animation while active */}
        {isListening && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-mono text-[11px]">Microphone Active</span>
            <div className="flex items-center gap-0.5 ml-1">
              <span className="w-1 h-2.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1 h-4 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1 h-3 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              <span className="w-1 h-4 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '450ms' }} />
            </div>
          </div>
        )}
      </div>

      {/* Permission Denied Alert (Requirement: Show permission-denied state with fallback) */}
      {permissionDenied && (
        <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs space-y-1.5 animate-in fade-in">
          <div className="flex items-center justify-between font-semibold text-amber-300">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Microphone Access Blocked</span>
            </div>
            <button
              type="button"
              onClick={onClearError}
              className="text-amber-400 hover:text-amber-200 font-bold"
            >
              ✕
            </button>
          </div>
          <p className="text-slate-300 leading-relaxed">
            Your browser prevented microphone access. To enable speech-to-text, click the lock or camera icon in your address bar and set <strong>Microphone</strong> to <strong>Allow</strong>.
          </p>
          <div className="pt-1 flex items-center gap-2 text-[11px] text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>Text-only fallback is active. You can type your answer into the box below anytime.</span>
          </div>
        </div>
      )}

      {/* Non-permission error (e.g. no speech detected or hardware issue) */}
      {!permissionDenied && recognitionError && (
        <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-xs text-slate-300 flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>{recognitionError}</span>
          </div>
          <button
            type="button"
            onClick={onClearError}
            className="text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* Privacy & Anti-Slop Notice Disclosure */}
      {showPrivacyNote && (
        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 space-y-2 animate-in fade-in">
          <div className="flex items-center justify-between font-semibold text-white">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-cyan-400" />
              <span>Privacy & Reliability Guarantees</span>
            </div>
            <button
              type="button"
              onClick={() => setShowPrivacyNote(false)}
              className="text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px]">
            <li>
              <strong className="text-slate-200">Zero Audio Retention:</strong> Speech recognition is processed locally in your browser. Audio streams are never recorded continuously, stored, or sent to QuantumLearn servers.
            </li>
            <li>
              <strong className="text-slate-200">Explicit User Trigger:</strong> The microphone is requested strictly when you click the Speak button, and disconnects immediately when you stop speaking or move to the next question.
            </li>
            <li>
              <strong className="text-slate-200">No Biometric Emotion Claims:</strong> Voice features serve purely for hands-free answer dictation. We do not perform stress analysis, emotion detection, or personality scoring.
            </li>
            <li>
              <strong className="text-slate-200">Candidate Editorial Control:</strong> Transcribed speech is presented in the editor so you can review and edit every word prior to final submission.
            </li>
          </ul>
        </div>
      )}

      {/* Live Interim Transcript or Recognized Text Banner */}
      {(interimTranscript || lastFinalTranscript) && (
        <div className="p-3 rounded-xl bg-slate-900/95 border border-cyan-500/30 text-xs space-y-2 animate-in fade-in">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span className="font-semibold text-cyan-300 flex items-center gap-1.5">
              <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
              Transcribed Speech Preview
            </span>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Edit directly in the editor below before submitting</span>
              <button
                type="button"
                onClick={onClearTranscript}
                className="text-slate-400 hover:text-slate-200 text-[10px] underline"
              >
                Clear Preview
              </button>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-200 font-sans leading-relaxed">
            {lastFinalTranscript && <span>{lastFinalTranscript} </span>}
            {interimTranscript && <span className="text-cyan-400/90 italic">{interimTranscript}</span>}
          </div>

          {lastFinalTranscript && (
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => onAppendText(lastFinalTranscript)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/30 text-cyan-300 text-xs font-medium transition-colors"
              >
                <Plus className="w-3 h-3" />
                <span>Append to Response</span>
              </button>
              <button
                type="button"
                onClick={() => onReplaceText(lastFinalTranscript)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-medium transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Replace Response</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
