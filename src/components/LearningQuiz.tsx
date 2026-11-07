import React, { useState, useEffect } from 'react';
import { CheckCircle2, HelpCircle, ChevronLeft } from 'lucide-react';
import { AxieCharacter } from './AxieCharacter';
import { VictoryScreen } from './VictoryScreen';
import { gameAudio } from '../game/GameAudioManager';

interface LearningQuizProps {
  mode: 'SUMMARY' | 'QUIZ';
  score: number;
  onFinishSummary: () => void;
  onCompleteQuiz: () => void;
  onPlayAgain: () => void;
  onOpenDelfinaHub: () => void;
}

interface QuizQuestion {
  id: number;
  question: string;
  options: { id: string; text: string; isCorrect: boolean; explanation: string }[];
}

const SUMMARY_SPEECH_BUBBLES: { num: number; text: string }[] = [
  {
    num: 1,
    text: 'گام اول (دریافت صدا): وقتی تو با میکروفون حرف زدی، میکروفون موج صدای تو رو گرفت و به زره جادویی فرستاد!',
  },
  {
    num: 2,
    text: 'گام دوم (تشخیص گفتار): بعد هوش مصنوعی صدای تو رو شنید و اون رو به یک نوشتهٔ فارسی مثل «حمله کن» یا «برو جلو» تبدیل کرد!',
  },
  {
    num: 3,
    text: 'گام سوم (اجرای فرمان): در ادامه، سیستم بازی اون نوشته رو با فرمان‌های زره تطبیق داد و من همون حرکت جنگی رو انجام دادم!',
  },
  {
    num: 4,
    text: 'جمع‌بندی: اسم تبدیل صدا به نوشته «تشخیص گفتار» است و بعد از تبدیل شدن صدا به متن، بازی نوشته رو بررسی می‌کنه تا فرمان حرکت رو اجرا کنه!',
  },
];

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: 'وقتی تو حرف می‌زنی، هوش مصنوعی اول چی رو دریافت می‌کنه؟',
    options: [
      {
        id: 'a',
        text: 'صدای تو',
        isCorrect: true,
        explanation: 'آفرین! میکروفون اول موج صدای تو رو می‌شنوه.',
      },
      {
        id: 'b',
        text: 'رنگ شمشیر',
        isCorrect: false,
        explanation: 'رنگ شمشیر تصویره! هوش مصنوعیِ تشخیص گفتار به صدای تو گوش میده. دوباره امتحان کن!',
      },
      {
        id: 'c',
        text: 'نور قلعه',
        isCorrect: false,
        explanation: 'نور قلعه بعد از نجات مروارید روشن شد! اول از همه میکروفون صدای تو رو می‌شنوه.',
      },
    ],
  },
  {
    id: 2,
    question: 'هوش مصنوعی صدای «بپر» رو به چی تبدیل کرد؟',
    options: [
      {
        id: 'a',
        text: 'نوشتهٔ «بپر»',
        isCorrect: true,
        explanation: 'دقیقاً! تشخیص گفتار یعنی تبدیل صدای انسان به متن و نوشته!',
      },
      {
        id: 'b',
        text: 'تصویر ماهی',
        isCorrect: false,
        explanation: 'نه قهرمان! تشخیص گفتار صدا رو به نوشته تبدیل می‌کنه، نه نقاشی ماهی.',
      },
      {
        id: 'c',
        text: 'یک عدد تصادفی',
        isCorrect: false,
        explanation: 'کامپیوتر کلمه‌ای که گفتی رو به نوشتهٔ همون کلمه تبدیل می‌کنه. یه بار دیگه انتخاب کن!',
      },
    ],
  },
  {
    id: 3,
    question: 'اگه کامپیوتر حرفتو اشتباه بشنوه، چی میشه؟',
    options: [
      {
        id: 'a',
        text: 'ممکنه فرمان درست اجرا نشه.',
        isCorrect: true,
        explanation: 'عالی گفتی! چون بازی نوشتهٔ تشخیص‌داده‌شده رو بررسی می‌کنه، اگه نوشته اشتباه باشه، فرمانِ درست اجرا نمیشه.',
      },
      {
        id: 'b',
        text: 'همیشه درست حدس می‌زنه.',
        isCorrect: false,
        explanation: 'هوش مصنوعی هم گاهی به خاطر سر و صدا اشتباه می‌شنوه و نیاز داره دوباره واضح بهش بگی.',
      },
      {
        id: 'c',
        text: 'شمشیر خودش فکر می‌کنه.',
        isCorrect: false,
        explanation: 'شمشیر فقط زمانی کار می‌کنه که نوشتهٔ فرمان با دستورات بازی جور دربیاد!',
      },
    ],
  },
];

export const LearningQuiz: React.FC<LearningQuizProps> = ({
  mode,
  score,
  onFinishSummary,
  onCompleteQuiz,
  onPlayAgain,
  onOpenDelfinaHub,
}) => {
  const [activeBubbleIndex, setActiveBubbleIndex] = useState<number>(0);
  const [qIndex, setQIndex] = useState<number>(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; text: string } | null>(null);
  const [quizFinished, setQuizFinished] = useState<boolean>(false);

  // Auto-advance the speech bubbles in SUMMARY mode ("حباب ها اوتومات میرن بعدی") without bubble voice audio
  useEffect(() => {
    if (mode !== 'SUMMARY') return;

    if (activeBubbleIndex < SUMMARY_SPEECH_BUBBLES.length - 1) {
      const autoTimer = window.setTimeout(() => {
        setActiveBubbleIndex((prev) => Math.min(SUMMARY_SPEECH_BUBBLES.length - 1, prev + 1));
      }, 3600);
      return () => window.clearTimeout(autoTimer);
    }
    return undefined;
  }, [mode, activeBubbleIndex]);

  if (mode === 'SUMMARY') {
    const currentBubble =
      SUMMARY_SPEECH_BUBBLES[activeBubbleIndex] || SUMMARY_SPEECH_BUBBLES[0];
    const isLastBubble = activeBubbleIndex === SUMMARY_SPEECH_BUBBLES.length - 1;

    return (
      <div
        className="w-full min-h-screen bg-gradient-to-b from-[#042f4b] via-[#063f63] to-[#032238] flex flex-col items-center justify-center px-4 py-6 select-none"
        data-testid="learning-summary-screen"
      >
        <div className="w-full max-w-2xl rounded-3xl bg-[#042f4b]/95 border-2 border-[#39D5D0] shadow-2xl p-5 sm:p-7 flex flex-col items-center">
          <h2 className="text-xl sm:text-2xl font-display text-[#FFD76B] mb-2 text-center">
            راز علمیِ زره جادویی: تشخیص گفتار چطوری کار می‌کنه؟
          </h2>

          <AxieCharacter animation="Celebrate" isSpeaking className="my-2" />

          {/* Speaker Label Above the Speech Bubble */}
          <div className="w-full flex justify-start px-3 mt-2">
            <span
              className="inline-flex items-center px-3.5 py-0.5 rounded-t-xl bg-[#39D5D0] text-[#042f4b] font-black text-xs sm:text-sm shadow"
              data-testid="summary-speaker-label"
            >
              آکسی:
            </span>
          </div>

          {/* Single Unified Speech Bubble that Automatically Advances ("به صورت حباب گفتاریه که متن به هم پیوسته داخلش داره و جمع بندی اخرین حبابشه و حباب ها اوتومات میرن بعدی") */}
          <div
            className="relative w-full rounded-3xl bg-[#032238] border-2 border-[#FFD76B] shadow-[0_10px_30px_rgba(0,0,0,0.55)] p-5 sm:p-6 text-right"
            data-testid="summary-speech-bubble"
            data-bubble-step={currentBubble.num}
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-5 h-5 bg-[#032238] border-t-2 border-l-2 border-[#FFD76B] rotate-45 pointer-events-none" />

            <p
              className="text-base sm:text-lg font-extrabold text-[#FFF8EE] leading-relaxed"
              data-testid="summary-bubble-text"
            >
              «{currentBubble.text}»
            </p>
          </div>

          {/* Step Indicator Pills & Controls Outside the Speech Bubble */}
          <div className="w-full flex flex-wrap items-center justify-between gap-3 mt-4 px-1">
            <div className="flex items-center gap-2">
              {SUMMARY_SPEECH_BUBBLES.map((b, idx) => (
                <button
                  key={b.num}
                  type="button"
                  onClick={() => {
                    gameAudio.playClick();
                    setActiveBubbleIndex(idx);
                  }}
                  data-testid={`summary-step-${b.num}`}
                  className={`px-2.5 py-1 rounded-full text-xs font-black transition-all cursor-pointer ${
                    idx === activeBubbleIndex
                      ? 'bg-[#FFD76B] text-[#042f4b] scale-105 shadow'
                      : idx < activeBubbleIndex
                      ? 'bg-[#39D5D0]/40 text-[#FFF8EE]'
                      : 'bg-[#074268] text-[#A5F3FC]'
                  }`}
                >
                  {idx === SUMMARY_SPEECH_BUBBLES.length - 1 ? 'جمع‌بندی' : `حباب ${b.num}`}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              {!isLastBubble && (
                <button
                  type="button"
                  onClick={() => {
                    gameAudio.playClick();
                    setActiveBubbleIndex((prev) => prev + 1);
                  }}
                  data-testid="next-summary-bubble-btn"
                  className="px-4 py-2.5 rounded-2xl bg-[#074268] hover:bg-[#09588a] border border-[#39D5D0] text-[#FFF8EE] font-extrabold text-xs sm:text-sm flex items-center gap-1 cursor-pointer"
                >
                  <span>حباب بعدی</span>
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  gameAudio.playClick();
                  gameAudio.stopAllSpeech();
                  onFinishSummary();
                }}
                data-testid="start-quiz-btn"
                className="px-5 py-3 rounded-2xl bg-[#FFD76B] hover:bg-amber-300 text-[#042f4b] font-black text-sm sm:text-base shadow-[0_5px_0_#B45309] cursor-pointer whitespace-nowrap"
              >
                بریم سراغ کوییز پایانی! (۳ سؤال)
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Final Reward Screen after completing all 3 quiz questions -> uses custom VictoryScreen with Medal Emblem!
  if (quizFinished) {
    return (
      <VictoryScreen
        score={score}
        onPlayAgain={onPlayAgain}
        onOpenDelfinaHub={onOpenDelfinaHub}
      />
    );
  }

  const currentQ = QUIZ_QUESTIONS[qIndex];

  const handleSelectOption = (opt: QuizQuestion['options'][0]) => {
    setSelectedOptionId(opt.id);
    setFeedback({ isCorrect: opt.isCorrect, text: opt.explanation });
    if (opt.isCorrect) {
      gameAudio.playCommandRecognized();
    } else {
      gameAudio.playUnknownCommand();
    }
  };

  const handleNextQuestion = () => {
    gameAudio.playClick();
    if (qIndex + 1 < QUIZ_QUESTIONS.length) {
      setQIndex((prev) => prev + 1);
      setSelectedOptionId(null);
      setFeedback(null);
    } else {
      gameAudio.playVictoryFanfare();
      setQuizFinished(true);
      onCompleteQuiz();
    }
  };

  return (
    <div
      className="w-full min-h-screen bg-gradient-to-b from-[#042f4b] via-[#063f63] to-[#032238] flex flex-col items-center justify-center px-4 py-6 select-none"
      data-testid="learning-quiz-screen"
    >
      <div className="w-full max-w-2xl rounded-3xl bg-[#042f4b]/95 border-2 border-[#39D5D0] shadow-2xl p-5 sm:p-7">
        <div className="flex items-center justify-between mb-4">
          <span className="inline-flex items-center gap-1.5 text-sm font-black text-[#FFD76B]">
            <HelpCircle className="w-5 h-5 text-[#39D5D0]" />
            <span>کوییز قهرمانان صدا — سؤال {qIndex + 1} از {QUIZ_QUESTIONS.length}</span>
          </span>
          <span className="text-xs text-[#A5F3FC] font-bold tabular-nums">
            امتیاز: {score}
          </span>
        </div>

        <h2
          className="text-xl sm:text-2xl font-extrabold text-[#FFF8EE] mb-5 leading-snug"
          data-testid="quiz-question-text"
        >
          {currentQ.question}
        </h2>

        <div className="space-y-3 mb-5">
          {currentQ.options.map((opt) => {
            const isSelected = selectedOptionId === opt.id;
            let btnStyle = 'bg-[#074268] hover:bg-[#095382] border-[#39D5D0]/50 text-[#FFF8EE]';
            if (isSelected) {
              btnStyle = opt.isCorrect
                ? 'bg-emerald-500/25 border-emerald-400 text-emerald-200'
                : 'bg-amber-500/25 border-amber-400 text-amber-200';
            }

            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleSelectOption(opt)}
                data-testid={`quiz-option-${opt.id}`}
                className={`w-full text-right p-4 rounded-2xl border-2 font-extrabold text-sm sm:text-base transition-all flex items-center justify-between cursor-pointer ${btnStyle}`}
              >
                <span>{opt.text}</span>
                {isSelected && opt.isCorrect && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {feedback && (
          <div
            className={`p-4 rounded-2xl border mb-4 text-sm font-bold flex items-center justify-between gap-3 ${
              feedback.isCorrect
                ? 'bg-emerald-950/80 border-emerald-400 text-emerald-200'
                : 'bg-amber-950/80 border-amber-400 text-amber-200'
            }`}
            data-testid="quiz-feedback-box"
          >
            <span>{feedback.text}</span>
            {feedback.isCorrect && (
              <button
                type="button"
                onClick={handleNextQuestion}
                data-testid="quiz-next-btn"
                className="px-5 py-2 rounded-xl bg-[#FFD76B] text-[#042f4b] font-black text-xs sm:text-sm shrink-0 cursor-pointer whitespace-nowrap"
              >
                {qIndex + 1 < QUIZ_QUESTIONS.length ? 'سؤال بعدی' : 'دریافت نشان قهرمانی!'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
