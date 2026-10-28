import { useState, useEffect, useRef, useCallback } from 'react';

// Web Speech API interface declarations for browser compatibility
interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      length: number;
      [index: number]: {
        transcript: string;
        confidence: number;
      };
    };
  };
}

interface SpeechRecognitionErrorEventLike {
  error: string;
  message?: string;
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onaudiostart?: (() => void) | null;
  onaudioend?: (() => void) | null;
  onspeechstart?: (() => void) | null;
  onspeechend?: (() => void) | null;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

export type VoiceInputState = 'idle' | 'listening' | 'processing' | 'permission_denied' | 'unsupported';

export interface UseVoiceInterviewOptions {
  onTranscriptReceived?: (transcript: string, isFinal: boolean) => void;
  initialAutoRead?: boolean;
}

export interface UseVoiceInterviewReturn {
  // Voice Input (Speech-to-Text)
  isRecognitionSupported: boolean;
  inputState: VoiceInputState;
  isListening: boolean;
  isProcessing: boolean;
  permissionDenied: boolean;
  recognitionError: string | null;
  interimTranscript: string;
  lastFinalTranscript: string;
  startListening: () => void;
  stopListening: () => void;
  clearRecognitionError: () => void;
  clearTranscripts: () => void;

  // Spoken Questions (Text-to-Speech)
  isSynthesisSupported: boolean;
  isSpeaking: boolean;
  isPaused: boolean;
  spokenQuestionsEnabled: boolean;
  autoReadQuestions: boolean;
  speechRate: number;
  availableVoices: SpeechSynthesisVoice[];
  selectedVoice: SpeechSynthesisVoice | null;
  speakQuestion: (text: string) => void;
  pauseSpeaking: () => void;
  resumeSpeaking: () => void;
  stopSpeaking: () => void;
  setSpokenQuestionsEnabled: (enabled: boolean) => void;
  setAutoReadQuestions: (enabled: boolean) => void;
  setSpeechRate: (rate: number) => void;
  setSelectedVoice: (voice: SpeechSynthesisVoice | null) => void;
}

const STORAGE_KEY_VOICE_ENABLED = 'quantumlearn_spoken_questions_enabled';
const STORAGE_KEY_AUTO_READ = 'quantumlearn_auto_read_questions';
const STORAGE_KEY_SPEECH_RATE = 'quantumlearn_speech_rate';

export function useVoiceInterview(options: UseVoiceInterviewOptions = {}): UseVoiceInterviewReturn {
  const { onTranscriptReceived, initialAutoRead = false } = options;

  // ---------------------------------------------------------------------------
  // Feature detection
  // ---------------------------------------------------------------------------
  const isRecognitionSupported = typeof window !== 'undefined' &&
    Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);

  const isSynthesisSupported = typeof window !== 'undefined' &&
    'speechSynthesis' in window &&
    'SpeechSynthesisUtterance' in window;

  // ---------------------------------------------------------------------------
  // Voice Input States
  // ---------------------------------------------------------------------------
  const [inputState, setInputState] = useState<VoiceInputState>(() =>
    isRecognitionSupported ? 'idle' : 'unsupported'
  );
  const [recognitionError, setRecognitionError] = useState<string | null>(null);
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [lastFinalTranscript, setLastFinalTranscript] = useState<string>('');
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const isExplicitStopRef = useRef<boolean>(false);

  // ---------------------------------------------------------------------------
  // Speech Synthesis States
  // ---------------------------------------------------------------------------
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [spokenQuestionsEnabled, setSpokenQuestionsEnabledState] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const stored = localStorage.getItem(STORAGE_KEY_VOICE_ENABLED);
    return stored !== null ? stored === 'true' : true;
  });
  const [autoReadQuestions, setAutoReadQuestionsState] = useState<boolean>(() => {
    if (typeof window === 'undefined') return initialAutoRead;
    const stored = localStorage.getItem(STORAGE_KEY_AUTO_READ);
    return stored !== null ? stored === 'true' : initialAutoRead;
  });
  const [speechRate, setSpeechRateState] = useState<number>(() => {
    if (typeof window === 'undefined') return 1.0;
    const stored = localStorage.getItem(STORAGE_KEY_SPEECH_RATE);
    const parsed = stored ? parseFloat(stored) : 1.0;
    return isNaN(parsed) ? 1.0 : parsed;
  });

  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // ---------------------------------------------------------------------------
  // Persist speech settings
  // ---------------------------------------------------------------------------
  const setSpokenQuestionsEnabled = useCallback((enabled: boolean) => {
    setSpokenQuestionsEnabledState(enabled);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_VOICE_ENABLED, String(enabled));
      if (!enabled && isSynthesisSupported) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        setIsPaused(false);
      }
    }
  }, [isSynthesisSupported]);

  const setAutoReadQuestions = useCallback((enabled: boolean) => {
    setAutoReadQuestionsState(enabled);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_AUTO_READ, String(enabled));
    }
  }, []);

  const setSpeechRate = useCallback((rate: number) => {
    const clamped = Math.max(0.75, Math.min(1.5, rate));
    setSpeechRateState(clamped);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_SPEECH_RATE, String(clamped));
    }
  }, []);

  // ---------------------------------------------------------------------------
  // Load browser voices
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!isSynthesisSupported) return;

    const updateVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        setAvailableVoices(voices);
        // Default to a clear English voice if none is selected
        setSelectedVoice(prev => {
          if (prev) return prev;
          const preferred = voices.find(v =>
            v.lang.startsWith('en') &&
            (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel'))
          ) || voices.find(v => v.lang.startsWith('en')) || voices[0];
          return preferred || null;
        });
      }
    };

    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, [isSynthesisSupported]);

  // ---------------------------------------------------------------------------
  // Voice Input: Start Listening (User-Triggered Only)
  // ---------------------------------------------------------------------------
  const startListening = useCallback(() => {
    if (!isRecognitionSupported) {
      setInputState('unsupported');
      setRecognitionError('Speech recognition is not supported in this browser. Please use keyboard text input.');
      return;
    }

    // Stop any existing instance first
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // Ignore abort errors
      }
      recognitionRef.current = null;
    }

    try {
      const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognitionClass) {
        setInputState('unsupported');
        return;
      }

      const recognition = new SpeechRecognitionClass();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      isExplicitStopRef.current = false;
      setRecognitionError(null);
      setInterimTranscript('');

      recognition.onstart = () => {
        setInputState('listening');
        setRecognitionError(null);
      };

      recognition.onspeechend = () => {
        // Transition to processing state to show transcription finalization
        setInputState('processing');
      };

      recognition.onresult = (event: SpeechRecognitionEventLike) => {
        let finalChunk = '';
        let interimChunk = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcript = result[0]?.transcript || '';
          if (result.isFinal) {
            finalChunk += transcript;
          } else {
            interimChunk += transcript;
          }
        }

        setInterimTranscript(interimChunk);

        if (finalChunk.trim().length > 0) {
          setLastFinalTranscript(prev => (prev ? `${prev} ${finalChunk.trim()}` : finalChunk.trim()));
          if (onTranscriptReceived) {
            onTranscriptReceived(finalChunk.trim(), true);
          }
          // After processing final chunk, reset to listening if still active
          setInputState('listening');
        } else if (interimChunk.trim().length > 0 && onTranscriptReceived) {
          onTranscriptReceived(interimChunk.trim(), false);
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
        const errType = event.error;

        if (errType === 'not-allowed' || errType === 'service-not-allowed') {
          setInputState('permission_denied');
          setRecognitionError(
            'Microphone access was denied. Please allow microphone permissions in your browser address bar settings to use voice response, or continue typing below.'
          );
        } else if (errType === 'no-speech') {
          // Empty recognition result - keep listening or inform user gently
          setRecognitionError('No speech detected. Please speak clearly into your microphone.');
          setInputState('idle');
        } else if (errType === 'audio-capture') {
          setInputState('idle');
          setRecognitionError('No microphone detected. Please check your audio input hardware.');
        } else if (errType === 'network') {
          setInputState('idle');
          setRecognitionError('Speech recognition network error. Please check your connection or use keyboard input.');
        } else if (errType === 'aborted') {
          // User or programmatic abort, ignore
          setInputState('idle');
        } else {
          setInputState('idle');
          setRecognitionError(`Speech recognition notice: ${errType}. Text input is fully available.`);
        }
      };

      recognition.onend = () => {
        if (!isExplicitStopRef.current && inputState === 'listening') {
          // Natural pause or silence
          setInputState('idle');
        } else {
          setInputState(prev => (prev === 'permission_denied' || prev === 'unsupported' ? prev : 'idle'));
        }
        setInterimTranscript('');
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: unknown) {
      setInputState('idle');
      const message = err instanceof Error ? err.message : 'Failed to initialize speech recognition';
      setRecognitionError(`${message}. Please use text input.`);
    }
  }, [isRecognitionSupported, onTranscriptReceived, inputState]);

  // ---------------------------------------------------------------------------
  // Voice Input: Stop Listening
  // ---------------------------------------------------------------------------
  const stopListening = useCallback(() => {
    isExplicitStopRef.current = true;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignore stop errors if already stopped
      }
      recognitionRef.current = null;
    }
    setInputState(prev => (prev === 'permission_denied' || prev === 'unsupported' ? prev : 'idle'));
    setInterimTranscript('');
  }, []);

  const clearRecognitionError = useCallback(() => {
    setRecognitionError(null);
    if (inputState === 'permission_denied') {
      setInputState('idle');
    }
  }, [inputState]);

  const clearTranscripts = useCallback(() => {
    setInterimTranscript('');
    setLastFinalTranscript('');
  }, []);

  // ---------------------------------------------------------------------------
  // Spoken Questions (Speech Synthesis)
  // ---------------------------------------------------------------------------
  const cleanTextForSpeech = (rawText: string): string => {
    return rawText
      // Remove code backticks
      .replace(/```[\s\S]*?```/g, ' [Code sample omitted for voice] ')
      .replace(/`([^`]+)`/g, '$1')
      // Remove Markdown headers and bullets
      .replace(/^[#*-]+\s+/gm, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      // Normalize whitespace
      .replace(/\s+/g, ' ')
      .trim();
  };

  const speakQuestion = useCallback((text: string) => {
    if (!isSynthesisSupported || !spokenQuestionsEnabled) {
      return;
    }

    const clean = cleanTextForSpeech(text);
    if (!clean) return;

    // Cancel any previous speech
    window.speechSynthesis.cancel();

    try {
      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.rate = speechRate;
      utterance.pitch = 1.0;
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
        setIsPaused(false);
      };

      utterance.onpause = () => {
        setIsPaused(true);
      };

      utterance.onresume = () => {
        setIsPaused(false);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setIsPaused(false);
        currentUtteranceRef.current = null;
      };

      utterance.onerror = (e) => {
        // Ignore canceled/interrupted errors
        if (e.error !== 'canceled' && e.error !== 'interrupted') {
          console.warn('Speech synthesis notice:', e.error);
        }
        setIsSpeaking(false);
        setIsPaused(false);
        currentUtteranceRef.current = null;
      };

      currentUtteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Failed to speak question:', err);
      setIsSpeaking(false);
      setIsPaused(false);
    }
  }, [isSynthesisSupported, spokenQuestionsEnabled, speechRate, selectedVoice]);

  const pauseSpeaking = useCallback(() => {
    if (isSynthesisSupported && isSpeaking && !isPaused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  }, [isSynthesisSupported, isSpeaking, isPaused]);

  const resumeSpeaking = useCallback(() => {
    if (isSynthesisSupported && isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  }, [isSynthesisSupported, isPaused]);

  const stopSpeaking = useCallback(() => {
    if (isSynthesisSupported) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
      currentUtteranceRef.current = null;
    }
  }, [isSynthesisSupported]);

  // ---------------------------------------------------------------------------
  // Privacy and lifecycle cleanups
  // Ensure microphone and speech synthesis NEVER run continuously in background
  // ---------------------------------------------------------------------------
  useEffect(() => {
    return () => {
      // Unmount cleanup
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
        recognitionRef.current = null;
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return {
    // Voice Input
    isRecognitionSupported,
    inputState,
    isListening: inputState === 'listening',
    isProcessing: inputState === 'processing',
    permissionDenied: inputState === 'permission_denied',
    recognitionError,
    interimTranscript,
    lastFinalTranscript,
    startListening,
    stopListening,
    clearRecognitionError,
    clearTranscripts,

    // Spoken Questions
    isSynthesisSupported,
    isSpeaking,
    isPaused,
    spokenQuestionsEnabled,
    autoReadQuestions,
    speechRate,
    availableVoices,
    selectedVoice,
    speakQuestion,
    pauseSpeaking,
    resumeSpeaking,
    stopSpeaking,
    setSpokenQuestionsEnabled,
    setAutoReadQuestions,
    setSpeechRate,
    setSelectedVoice
  };
}
