import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Mic, MicOff, RotateCcw } from 'lucide-react';
import {
  DifficultyMode,
  MicrophoneStatus,
  VoiceCommandType,
} from '../game/types';
import {
  parseVoiceAlternativesWithConfidence,
  parseVoiceCommand,
  VoiceRecognitionCandidate,
} from '../game/CommandParser';
import { gameAudio } from '../game/GameAudioManager';

interface SpeechRecognitionAlternativeLike {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResultLike {
  isFinal: boolean;
  length: number;
  [index: number]: SpeechRecognitionAlternativeLike;
}

interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: SpeechRecognitionResultLike;
  };
}

interface SpeechRecognitionErrorEventLike {
  error: string;
  message?: string;
}

interface SpeechRecognitionInstance {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onspeechend?: (() => void) | null;
  onsoundend?: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

interface VoiceControllerProps {
  expectedCommand: Exclude<VoiceCommandType, 'UNKNOWN'>;
  bubblePowerUnlocked: boolean;
  difficulty: DifficultyMode;
  disabled: boolean;
  lastRecognizedText: string;
  feedbackMessage: string;
  showSttDiagram: boolean;
  onMicStateChange: (status: MicrophoneStatus) => void;
  onFinalTranscript: (transcript: string, isPracticeFallback: boolean) => void;
  onVolumeChange?: (volume: number) => void;
}

const CONFIDENCE_THRESHOLD = 0.35;
const MAX_SILENCE_RESTARTS = 4;

export const VoiceController: React.FC<VoiceControllerProps> = ({
  expectedCommand,
  difficulty,
  disabled,
  lastRecognizedText,
  feedbackMessage,
  onMicStateChange,
  onFinalTranscript,
}) => {
  const [micStatus, setMicStatus] = useState<MicrophoneStatus>('READY');
  const [liveInterimText, setLiveInterimText] = useState<string>('');

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const finalDeliveredInTurnRef = useRef<boolean>(false);
  const latestCandidatesRef = useRef<VoiceRecognitionCandidate[]>([]);
  const isListeningToggledRef = useRef<boolean>(false);
  const silenceRestartCountRef = useRef<number>(0);
  const silenceTimerRef = useRef<number | null>(null);
  const restartTimerRef = useRef<number | null>(null);
  const disabledRef = useRef<boolean>(disabled);
  const expectedCommandRef = useRef<Exclude<VoiceCommandType, 'UNKNOWN'>>(expectedCommand);
  const onMicStateChangeRef = useRef(onMicStateChange);
  const onFinalTranscriptRef = useRef(onFinalTranscript);

  useEffect(() => {
    disabledRef.current = disabled;
    if (!disabled) {
      finalDeliveredInTurnRef.current = false;
      setLiveInterimText('');
    }
  }, [disabled, expectedCommand, feedbackMessage, lastRecognizedText]);

  useEffect(() => {
    expectedCommandRef.current = expectedCommand;
  }, [expectedCommand]);

  useEffect(() => {
    onMicStateChangeRef.current = onMicStateChange;
  }, [onMicStateChange]);

  useEffect(() => {
    onFinalTranscriptRef.current = onFinalTranscript;
  }, [onFinalTranscript]);

  const updateStatus = useCallback((next: MicrophoneStatus) => {
    setMicStatus(next);
    onMicStateChangeRef.current(next);
  }, []);

  const stopActiveRecognitionSession = useCallback(() => {
    isListeningToggledRef.current = false;
    if (silenceTimerRef.current) {
      window.clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (restartTimerRef.current) {
      window.clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onstart = null;
        recognitionRef.current.onspeechend = null;
        recognitionRef.current.onsoundend = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.abort();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.onstop = null;
        mediaRecorderRef.current.stop();
      } catch {
        // ignore
      }
    }
    mediaRecorderRef.current = null;
    if (mediaStreamRef.current) {
      try {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      } catch {
        // ignore
      }
      mediaStreamRef.current = null;
    }
    gameAudio.setMicListening(false);
  }, []);

  useEffect(() => {
    return () => {
      stopActiveRecognitionSession();
    };
  }, [stopActiveRecognitionSession]);

  /**
   * Commits the recognized command and immediately exits the microphone LISTENING state
   * without muting or interrupting the game's audio effects.
   */
  const deliverTranscript = useCallback(
    (transcript: string, isRuneTap = false) => {
      if ((!isRuneTap && finalDeliveredInTurnRef.current) || disabledRef.current) return;
      const finalStr = (transcript || '').trim();
      if (!finalStr) return;

      finalDeliveredInTurnRef.current = true;
      stopActiveRecognitionSession();
      setLiveInterimText(finalStr);
      updateStatus('RECOGNIZED');
      onFinalTranscriptRef.current(finalStr, isRuneTap);
    },
    [stopActiveRecognitionSession, updateStatus]
  );

  /**
   * Evaluates collected Web Speech API candidates using the exact confidence threshold check
   * from the previous working version.
   */
  const evaluateAndCommitCandidates = useCallback(() => {
    if (finalDeliveredInTurnRef.current || disabledRef.current) return false;
    const candidates = latestCandidatesRef.current;
    if (candidates.length === 0) return false;

    const matched = parseVoiceAlternativesWithConfidence(
      candidates,
      true,
      CONFIDENCE_THRESHOLD
    );

    if (matched.command !== 'UNKNOWN') {
      deliverTranscript(matched.canonicalLabel, false);
      return true;
    }

    const topCandidate = candidates[0];
    if (
      topCandidate &&
      topCandidate.transcript.trim().length >= 2 &&
      (topCandidate.confidence === 0 || topCandidate.confidence >= CONFIDENCE_THRESHOLD)
    ) {
      deliverTranscript(topCandidate.transcript.trim(), false);
      return true;
    }

    return false;
  }, [deliverTranscript]);

  /**
   * Fallback audio transcription ONLY for browsers that lack Web Speech API (SpeechRecognition).
   */
  const startFallbackRecorderOnlyWhenNoSpeechApi = useCallback(async () => {
    if (
      typeof navigator === 'undefined' ||
      !navigator.mediaDevices?.getUserMedia ||
      disabledRef.current
    ) {
      updateStatus('UNSUPPORTED_OR_ERROR');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        if (finalDeliveredInTurnRef.current || disabledRef.current) return;
        const blob = new Blob(chunks, { type: 'audio/webm' });
        if (blob.size < 100) {
          updateStatus('READY');
          return;
        }
        updateStatus('PROCESSING');
        try {
          const base64Audio = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              const res = reader.result as string;
              resolve(res.split(',')[1] || '');
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
          const resp = await fetch('/api/transcribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ audioBase64: base64Audio, mimeType: 'audio/webm' }),
          });
          if (resp.ok) {
            const data = (await resp.json()) as { transcript?: string };
            if (data.transcript && data.transcript.trim()) {
              const matched = parseVoiceCommand(data.transcript.trim(), true);
              deliverTranscript(
                matched.command !== 'UNKNOWN'
                  ? matched.canonicalLabel
                  : data.transcript.trim(),
                false
              );
              return;
            }
          }
          updateStatus('READY');
        } catch {
          updateStatus('READY');
        }
      };

      recorder.start();
      window.setTimeout(() => {
        if (recorder.state === 'recording') recorder.stop();
      }, 2200);
    } catch {
      updateStatus('PERMISSION_DENIED');
    }
  }, [deliverTranscript, updateStatus]);

  /**
   * Exact Persian ('fa-IR') Web Speech Recognition loop from the previous working version!
   */
  const startPersianSpeechRecognition = useCallback(() => {
    if (disabledRef.current) return;

    stopActiveRecognitionSession();
    setLiveInterimText('');
    latestCandidatesRef.current = [];
    finalDeliveredInTurnRef.current = false;
    isListeningToggledRef.current = true;
    silenceRestartCountRef.current = 0;

    updateStatus('LISTENING');

    const SpeechRecognitionCtor =
      (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionInstance })
        .SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionInstance })
        .webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) {
      startFallbackRecorderOnlyWhenNoSpeechApi();
      return;
    }

    const spawnRecognitionCycle = () => {
      if (
        disabledRef.current ||
        finalDeliveredInTurnRef.current ||
        !isListeningToggledRef.current
      ) {
        return;
      }

      try {
        const recognition = new SpeechRecognitionCtor();
        recognitionRef.current = recognition;
        recognition.lang = 'fa-IR';
        recognition.interimResults = true;
        recognition.continuous = true;
        recognition.maxAlternatives = 10;

        recognition.onstart = () => {
          if (!isListeningToggledRef.current || disabledRef.current) return;
          updateStatus('LISTENING');
        };

        recognition.onresult = (event: SpeechRecognitionEventLike) => {
          if (finalDeliveredInTurnRef.current || disabledRef.current) return;

          const candidates: VoiceRecognitionCandidate[] = [];
          let hasFinal = false;

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const res = event.results[i];
            if (res.isFinal) hasFinal = true;
            for (let a = 0; a < res.length; a++) {
              const item = res[a];
              const text = item?.transcript?.trim();
              if (text) {
                candidates.push({
                  transcript: text,
                  confidence: typeof item.confidence === 'number' ? item.confidence : 0,
                });
              }
            }
          }

          if (candidates.length === 0) return;

          latestCandidatesRef.current = candidates;
          setLiveInterimText(candidates[0].transcript);

          // Instant 0ms execution as soon as a known command ('حمله کن', 'سپر بگیر', 'بپر بکن', 'قدرت حبابی') is recognized!
          const instantMatch = parseVoiceAlternativesWithConfidence(
            candidates,
            true,
            CONFIDENCE_THRESHOLD
          );
          if (instantMatch.command !== 'UNKNOWN') {
            deliverTranscript(instantMatch.canonicalLabel, false);
            return;
          }

          // If browser marked result as final, evaluate and exit mic state immediately
          if (hasFinal) {
            evaluateAndCommitCandidates();
            return;
          }

          // Short 130ms intermittent-silence debounce for any other spoken phrase
          if (silenceTimerRef.current) {
            window.clearTimeout(silenceTimerRef.current);
          }
          silenceTimerRef.current = window.setTimeout(() => {
            evaluateAndCommitCandidates();
          }, 130);
        };

        recognition.onspeechend = () => {
          if (finalDeliveredInTurnRef.current || disabledRef.current) return;
          if (silenceTimerRef.current) {
            window.clearTimeout(silenceTimerRef.current);
          }
          silenceTimerRef.current = window.setTimeout(() => {
            evaluateAndCommitCandidates();
          }, 140);
        };

        recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
          if (finalDeliveredInTurnRef.current || disabledRef.current) return;

          if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            isListeningToggledRef.current = false;
            updateStatus('PERMISSION_DENIED');
          } else if (event.error === 'no-speech') {
            // Intermittent silence: allow onend to seamlessly continue if within restart budget
          }
        };

        recognition.onend = () => {
          if (
            finalDeliveredInTurnRef.current ||
            disabledRef.current ||
            !isListeningToggledRef.current
          ) {
            return;
          }

          if (latestCandidatesRef.current.length > 0 && evaluateAndCommitCandidates()) {
            return;
          }

          if (silenceRestartCountRef.current < MAX_SILENCE_RESTARTS) {
            silenceRestartCountRef.current += 1;
            restartTimerRef.current = window.setTimeout(() => {
              spawnRecognitionCycle();
            }, 60);
          } else {
            isListeningToggledRef.current = false;
            updateStatus('READY');
          }
        };

        recognition.start();
      } catch {
        isListeningToggledRef.current = false;
        updateStatus('READY');
      }
    };

    spawnRecognitionCycle();
  }, [
    deliverTranscript,
    evaluateAndCommitCandidates,
    startFallbackRecorderOnlyWhenNoSpeechApi,
    stopActiveRecognitionSession,
    updateStatus,
  ]);

  const handleMicButtonTap = () => {
    if (disabled) return;

    if (micStatus === 'LISTENING' || isListeningToggledRef.current) {
      if (latestCandidatesRef.current.length > 0 && evaluateAndCommitCandidates()) {
        return;
      }
      stopActiveRecognitionSession();
      updateStatus('READY');
      return;
    }

    startPersianSpeechRecognition();
  };

  const statusMeta: Record<
    MicrophoneStatus,
    { label: string; badgeText: string; colorClass: string; ringClass: string }
  > = {
    INACTIVE: {
      label: 'روی میکروفون بزن و فرمان بده!',
      badgeText: 'میکروفون آماده (fa-IR)',
      colorClass: 'bg-[#087EB7] border-[#39D5D0] text-[#FFF8EE]',
      ringClass: 'border-[#39D5D0]/50',
    },
    AWAITING_PERMISSION: {
      label: 'اجازهٔ میکروفون رو بده تا صداتو بشنوم...',
      badgeText: 'در انتظار اجازهٔ میکروفون',
      colorClass: 'bg-amber-500 border-amber-200 text-[#042f4b]',
      ringClass: 'border-amber-300',
    },
    READY: {
      label: 'آماده‌ام! روی میکروفون بزن و فرمان رو بگو',
      badgeText: 'میکروفون آماده (fa-IR)',
      colorClass: 'bg-[#087EB7] border-[#39D5D0] text-[#FFF8EE]',
      ringClass: 'border-[#39D5D0]',
    },
    LISTENING: {
      label: 'دارم گوش میدم... بگو!',
      badgeText: 'در حال گوش دادن (LISTEN: fa-IR)',
      colorClass: 'bg-rose-500 border-[#FFD76B] text-white',
      ringClass: 'border-rose-400',
    },
    PROCESSING: {
      label: 'در حال بررسی صدای تو...',
      badgeText: 'در حال پردازش گفتار...',
      colorClass: 'bg-[#8D68DB] border-[#A5F3FC] text-white',
      ringClass: 'border-[#8D68DB]',
    },
    RECOGNIZED: {
      label: 'فرمان صوتی تشخیص داده شد!',
      badgeText: 'فرمان صوتی اجرا شد!',
      colorClass: 'bg-emerald-500 border-[#FFF8EE] text-[#042f4b]',
      ringClass: 'border-emerald-400',
    },
    UNKNOWN_COMMAND: {
      label: 'دوباره واضح بگو قهرمان!',
      badgeText: 'آمادهٔ تلاش دوباره',
      colorClass: 'bg-amber-500 border-[#FFF8EE] text-[#042f4b]',
      ringClass: 'border-amber-400',
    },
    PERMISSION_DENIED: {
      label: 'میکروفون بسته است — روی نشان‌های زره بزن',
      badgeText: 'میکروفون غیرفعال',
      colorClass: 'bg-slate-700 border-amber-300 text-amber-200',
      ringClass: 'border-amber-300/40',
    },
    UNSUPPORTED_OR_ERROR: {
      label: 'روی میکروفون یا نشان‌های زره بزن',
      badgeText: 'حالت نشان‌های صوتی',
      colorClass: 'bg-slate-700 border-amber-300 text-amber-200',
      ringClass: 'border-amber-300/40',
    },
  };

  const currentMeta = statusMeta[micStatus];
  const displayedHeardText = liveInterimText || lastRecognizedText;

  const availableCommands: { cmd: Exclude<VoiceCommandType, 'UNKNOWN'>; label: string }[] = [
    { cmd: 'MOVE_FORWARD', label: 'برو جلو' },
    { cmd: 'ATTACK', label: 'حمله کن' },
    { cmd: 'SHIELD', label: 'سپر بگیر' },
    { cmd: 'JUMP', label: 'بپر بکن' },
    { cmd: 'BUBBLE_POWER', label: 'قدرت حبابی' },
  ];

  return (
    <div
      className="relative z-20 w-full max-w-4xl mx-auto px-2.5 sm:px-3 pb-2 pt-0.5 select-none pointer-events-auto space-y-1"
      data-testid="voice-controller"
      data-mic-status={micStatus}
    >
      {/* Speaker Label Above Axie's Dialogue Bubble ("دیالوگای آکسی بالاش بنویس آکسی:") */}
      <div className="flex items-center justify-between px-2">
        <span
          className="inline-flex items-center gap-1 px-3 py-0.5 rounded-t-xl bg-[#39D5D0] text-[#042f4b] font-black text-xs sm:text-sm shadow"
          data-testid="axie-dialogue-speaker-label"
        >
          آکسی:
        </span>
      </div>

      {/* Row 1: Pure Single-Part Story Speech Bubble ("حباب ها داخلیش دو قسمتی نباشه فقط یه متن واحد باشه") */}
      <div className="relative rounded-2xl sm:rounded-3xl bg-[#042f4b]/95 border-2 border-[#39D5D0] shadow-[0_6px_18px_rgba(0,0,0,0.55)] px-4 py-2 sm:px-5 sm:py-2.5 text-right">
        <div className="absolute -top-2.5 right-12 w-4 h-4 bg-[#042f4b] border-t-2 border-r-2 border-[#39D5D0] rotate-[-45deg] pointer-events-none" />

        <p
          className="text-xs sm:text-sm md:text-base font-extrabold text-[#FFF8EE] leading-relaxed"
          data-testid="axie-feedback-message"
        >
          «{feedbackMessage}»
        </p>
      </div>

      {/* Row 2: Compact External Voice & Armor Control Dock (Outside the Speech Bubble!) */}
      <div className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-2xl bg-[#032238]/95 border border-[#39D5D0]/60 shadow-lg">
        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
          <div
            className="flex flex-wrap items-center gap-1.5 text-[11px] sm:text-xs"
            data-testid="what-ai-heard-bubble"
          >
            {/* Dedicated Listen Status Area */}
            <div
              className="flex items-center gap-1 shrink-0"
              data-testid="mic-listen-status-area"
            >
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-black text-[10px] sm:text-xs ${
                  micStatus === 'LISTENING'
                    ? 'bg-rose-500 text-white shadow-[0_0_10px_rgba(244,63,94,0.7)]'
                    : micStatus === 'RECOGNIZED'
                    ? 'bg-emerald-400 text-[#042f4b]'
                    : 'bg-[#042f4b] text-[#39D5D0] border border-[#39D5D0]/50'
                }`}
              >
                <Mic className="w-3 h-3" />
                <span>{currentMeta.badgeText}</span>
              </span>
            </div>

            {/* Real-Time Recognized Speech Text */}
            <div className="flex items-center gap-1 overflow-hidden">
              {displayedHeardText ? (
                <span
                  className="font-black text-[#FFD76B] tracking-wide truncate"
                  data-testid="recognized-speech-text"
                >
                  شنیدم: «{displayedHeardText}»
                </span>
              ) : (
                <span className="text-[#A5F3FC]/90 truncate">
                  {currentMeta.label}
                </span>
              )}
            </div>
          </div>

          {/* Diegetic Armor Runes */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {availableCommands.map((item) => {
              const isExpected =
                difficulty !== 'challenge' && item.cmd === expectedCommand;
              return (
                <button
                  key={item.cmd}
                  type="button"
                  disabled={disabled}
                  onClick={() => deliverTranscript(item.label, true)}
                  data-testid={`practice-cmd-${item.cmd}`}
                  className={`text-[11px] sm:text-xs px-2.5 py-0.5 rounded-xl font-black transition-all cursor-pointer whitespace-nowrap ${
                    isExpected
                      ? 'bg-[#39D5D0] text-[#042f4b] ring-2 ring-[#FFD76B] shadow-[0_0_10px_rgba(57,213,208,0.5)]'
                      : 'bg-[#085582] hover:bg-[#0a69a0] text-[#FFF8EE]'
                  }`}
                >
                  «{item.label}»
                </button>
              );
            })}
          </div>
        </div>

        {/* Left in RTL: Big Circular Microphone Toggle Button */}
        <div className="relative flex items-center gap-1.5 shrink-0">
          <div className="relative flex flex-col items-center">
            {micStatus === 'LISTENING' && (
              <span
                className={`absolute -inset-1.5 rounded-full border-4 ${currentMeta.ringClass} animate-pulse-ring pointer-events-none`}
              />
            )}
            <button
              type="button"
              onClick={handleMicButtonTap}
              disabled={disabled}
              aria-label={
                micStatus === 'LISTENING'
                  ? 'توقف یا ثبت گوش دادن میکروفون'
                  : 'فعال کردن میکروفون و گفتن فرمان صوتی فارسی'
              }
              data-testid="microphone-button"
              className={`relative w-13 h-13 sm:w-15 sm:h-15 rounded-full border-4 flex flex-col items-center justify-center shadow-[0_0_20px_rgba(57,213,208,0.55)] transition-transform active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FFD76B] cursor-pointer ${
                disabled ? 'opacity-50 cursor-not-allowed' : currentMeta.colorClass
              }`}
            >
              {micStatus === 'PERMISSION_DENIED' || micStatus === 'UNSUPPORTED_OR_ERROR' ? (
                <MicOff className="w-5 h-5 sm:w-6 sm:h-6" />
              ) : (
                <Mic
                  className={`w-5 h-5 sm:w-6 sm:h-6 ${
                    micStatus === 'LISTENING' ? 'animate-pulse' : ''
                  }`}
                />
              )}
              <span className="text-[10px] font-black whitespace-nowrap">
                {micStatus === 'LISTENING' ? 'گوش میدم' : 'بگو!'}
              </span>
            </button>
          </div>

          {micStatus === 'UNKNOWN_COMMAND' && (
            <button
              type="button"
              onClick={handleMicButtonTap}
              disabled={disabled}
              className="px-2 py-1 rounded-xl bg-[#FFD76B] hover:bg-amber-300 text-[#042f4b] font-extrabold text-[11px] flex items-center gap-1 shadow cursor-pointer whitespace-nowrap"
            >
              <RotateCcw className="w-3 h-3" />
              <span>دوباره</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
