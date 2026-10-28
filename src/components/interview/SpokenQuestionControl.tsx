import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  Square,
  Settings,
  ChevronDown,
  Info
} from 'lucide-react';
import { Button3D } from '../common/Button3D';

interface SpokenQuestionControlProps {
  questionText: string;
  isSynthesisSupported: boolean;
  isSpeaking: boolean;
  isPaused: boolean;
  spokenQuestionsEnabled: boolean;
  autoReadQuestions: boolean;
  speechRate: number;
  onPlay: (text: string) => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onToggleEnabled: (enabled: boolean) => void;
  onToggleAutoRead: (enabled: boolean) => void;
  onChangeRate: (rate: number) => void;
}

export const SpokenQuestionControl: React.FC<SpokenQuestionControlProps> = ({
  questionText,
  isSynthesisSupported,
  isSpeaking,
  isPaused,
  spokenQuestionsEnabled,
  autoReadQuestions,
  speechRate,
  onPlay,
  onPause,
  onResume,
  onStop,
  onToggleEnabled,
  onToggleAutoRead,
  onChangeRate
}) => {
  const [showSettings, setShowSettings] = useState<boolean>(false);

  if (!isSynthesisSupported) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400">
        <VolumeX className="w-3.5 h-3.5 text-slate-500" />
        <span>Spoken audio unavailable in this browser (Text mode active)</span>
      </div>
    );
  }

  return (
    <div className="relative inline-flex items-center gap-2">
      {spokenQuestionsEnabled ? (
        <div className="flex items-center gap-2">
          {/* Main Play / Pause / Resume / Stop Controls */}
          {!isSpeaking ? (
            <Button3D
              variant="dark"
              size="sm"
              onClick={() => onPlay(questionText)}
              leftIcon={<Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
              className="text-xs"
              title="Read this question aloud using browser speech synthesis"
            >
              Read Question Aloud
            </Button3D>
          ) : (
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/90 border border-cyan-500/40 shadow-sm animate-in fade-in">
              {/* Animated sound wave bars */}
              <div className="flex items-center gap-0.5 px-2">
                <span className={`w-1 h-3.5 bg-cyan-400 rounded-full ${!isPaused ? 'animate-bounce' : 'opacity-60'}`} style={{ animationDelay: '0ms' }} />
                <span className={`w-1 h-5 bg-cyan-400 rounded-full ${!isPaused ? 'animate-bounce' : 'opacity-60'}`} style={{ animationDelay: '120ms' }} />
                <span className={`w-1 h-2.5 bg-cyan-400 rounded-full ${!isPaused ? 'animate-bounce' : 'opacity-60'}`} style={{ animationDelay: '240ms' }} />
              </div>

              {isPaused ? (
                <button
                  type="button"
                  onClick={onResume}
                  className="p-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 hover:text-white transition-colors"
                  title="Resume reading"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onPause}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                  title="Pause reading"
                >
                  <Pause className="w-3.5 h-3.5 fill-current" />
                </button>
              )}

              <button
                type="button"
                onClick={onStop}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-950/80 hover:text-red-300 text-slate-400 transition-colors"
                title="Stop reading"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
              </button>
            </div>
          )}

          {/* Quick Settings Gear Popover Button */}
          <button
            type="button"
            onClick={() => setShowSettings(!showSettings)}
            className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 border border-slate-800 transition-colors"
            title="Spoken audio settings"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onToggleEnabled(true)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900/60 hover:bg-slate-800 border border-slate-800 text-xs text-slate-400 hover:text-slate-200 transition-colors"
            title="Enable spoken questions"
          >
            <VolumeX className="w-3.5 h-3.5 text-slate-500" />
            <span>Spoken Questions Disabled</span>
            <ChevronDown className="w-3 h-3 text-slate-500" />
          </button>
        </div>
      )}

      {/* Voice Settings Dropdown / Popover */}
      {showSettings && (
        <div className="absolute right-0 top-full mt-2 w-72 p-4 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl z-30 space-y-3 animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
              Spoken Question Settings
            </span>
            <button
              type="button"
              onClick={() => setShowSettings(false)}
              className="text-xs text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* Toggle 1: Enable / Disable Spoken Questions */}
          <div className="flex items-center justify-between gap-2 text-xs">
            <div>
              <span className="font-semibold text-slate-200">Spoken Questions</span>
              <p className="text-[11px] text-slate-400">Read questions aloud using speech synthesis</p>
            </div>
            <input
              type="checkbox"
              checked={spokenQuestionsEnabled}
              onChange={(e) => onToggleEnabled(e.target.checked)}
              className="h-4 w-4 rounded bg-slate-950 border-slate-700 text-cyan-500 focus:ring-cyan-400 cursor-pointer"
            />
          </div>

          {/* Toggle 2: Auto-read questions on progression */}
          {spokenQuestionsEnabled && (
            <>
              <div className="flex items-center justify-between gap-2 text-xs pt-2 border-t border-slate-800">
                <div>
                  <span className="font-semibold text-slate-200">Auto-Read On Next</span>
                  <p className="text-[11px] text-slate-400">Speak new questions automatically</p>
                </div>
                <input
                  type="checkbox"
                  checked={autoReadQuestions}
                  onChange={(e) => onToggleAutoRead(e.target.checked)}
                  className="h-4 w-4 rounded bg-slate-950 border-slate-700 text-cyan-500 focus:ring-cyan-400 cursor-pointer"
                />
              </div>

              {/* Setting 3: Speech Rate */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200">Speech Rate</span>
                  <span className="font-mono text-cyan-400">{speechRate.toFixed(2)}x</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onChangeRate(0.85)}
                    className={`px-2 py-1 rounded text-[11px] font-mono border transition-colors ${
                      speechRate === 0.85 ? 'bg-cyan-950 border-cyan-500/60 text-cyan-300' : 'bg-slate-800 border-slate-700 text-slate-300'
                    }`}
                  >
                    0.85x
                  </button>
                  <button
                    type="button"
                    onClick={() => onChangeRate(1.0)}
                    className={`px-2 py-1 rounded text-[11px] font-mono border transition-colors ${
                      speechRate === 1.0 ? 'bg-cyan-950 border-cyan-500/60 text-cyan-300' : 'bg-slate-800 border-slate-700 text-slate-300'
                    }`}
                  >
                    1.0x (Normal)
                  </button>
                  <button
                    type="button"
                    onClick={() => onChangeRate(1.15)}
                    className={`px-2 py-1 rounded text-[11px] font-mono border transition-colors ${
                      speechRate === 1.15 ? 'bg-cyan-950 border-cyan-500/60 text-cyan-300' : 'bg-slate-800 border-slate-700 text-slate-300'
                    }`}
                  >
                    1.15x
                  </button>
                </div>
              </div>
            </>
          )}

          <div className="pt-2 border-t border-slate-800 flex items-start gap-1.5 text-[10px] text-slate-400">
            <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
            <span>Spoken audio uses your browser's local text-to-speech engine. No server audio is downloaded.</span>
          </div>
        </div>
      )}
    </div>
  );
};
