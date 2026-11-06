import React, { useState } from 'react';
import { Mic, FileText, Sword, CheckCircle2, HelpCircle, Award, RotateCcw, Compass } from 'lucide-react';
import { AxieCharacter } from './AxieCharacter';
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
  const [activeSummaryStep, setActiveSummaryStep] = useState<number>(1);
  const [qIndex, setQIndex] = useState<number>(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; text: string } | null>(null);
  const [quizFinished, setQuizFinished] = useState<boolean>(false);

  if (mode === 'SUMMARY') {
    const steps = [
      {
        num: 1,
        title: 'مرحلهٔ اول: دریافت صدا',
        desc: 'اول تو حرف زدی و میکروفون موج صدای تو رو گرفت!',
        badge: 'ورودی صوتی (میکروفون)',
        icon: <Mic className="w-7 h-7 text-[#39D5D0]" />,
      },
      {
        num: 2,
        title: 'مرحلهٔ دوم: تشخیص گفتار (Speech-to-Text)',
        desc: 'بعد هوش مصنوعی حرفتو شنید و اون رو به نوشته تبدیل کرد (مثلاً نوشتهٔ «حمله کن»)!',
        badge: 'تبدیل صدا به متن',
        icon: <FileText className="w-7 h-7 text-[#FFD76B]" />,
      },
      {
        num: 3,
        title: 'مرحلهٔ سوم: تطبیق متن و اجرای فرمان',
        desc: 'در آخر، سیستم بازی نوشته رو با فرمان‌های مجاز تطبیق داد و آکسی همون حرکت رو انجام داد!',
        badge: 'اجرای فرمان بازی',
        icon: <Sword className="w-7 h-7 text-[#FF84B2]" />,
      },
    ];

    return (
      <div
        className="w-full min-h-screen bg-gradient-to-b from-[#042f4b] via-[#063f63] to-[#032238] flex flex-col items-center justify-center px-4 py-6 select-none"
        data-testid="learning-summary-screen"
      >
        <div className="w-full max-w-3xl rounded-3xl bg-[#042f4b]/95 border-2 border-[#39D5D0] shadow-2xl p-5 sm:p-7">
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-5">
            <AxieCharacter animation="Celebrate" className="w-28 h-28 sm:w-32 sm:h-32 shrink-0" />
            <div className="text-right">
              <h2 className="text-2xl sm:text-3xl font-display text-[#FFD76B] mb-1">
                راز علمیِ زره جادویی: تشخیص گفتار چطوری کار می‌کنه؟
              </h2>
              <p className="text-sm sm:text-base text-[#A5F3FC] font-semibold">
                روی هر مرحله بزن تا ببینی صدای تو چطوری به حرکت شمشیر تبدیل شد:
              </p>
            </div>
          </div>

          {/* 3 Interactive Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
            {steps.map((st) => {
              const isSelected = activeSummaryStep >= st.num;
              return (
                <button
                  key={st.num}
                  type="button"
                  onClick={() => {
                    gameAudio.playClick();
                    setActiveSummaryStep(st.num);
                  }}
                  data-testid={`summary-step-${st.num}`}
                  className={`text-right p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#085582] border-[#FFD76B] shadow-lg scale-[1.01]'
                      : 'bg-[#053756] border-[#39D5D0]/40 opacity-80'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black text-[#FFD76B]">
                        گام {st.num}
                      </span>
                      {st.icon}
                    </div>
                    <h3 className="text-base font-extrabold text-[#FFF8EE] mb-1.5">
                      {st.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#A5F3FC] leading-relaxed">
                      {st.desc}
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-[#39D5D0]/30 text-[11px] font-bold text-[#FFD76B]">
                    {st.badge}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Scientific Distinction Callout */}
          <div className="rounded-2xl bg-[#074268] border border-[#39D5D0] p-4 mb-5 text-right">
            <p className="text-xs sm:text-sm font-bold text-[#FFF8EE] leading-relaxed">
              💡 <span className="text-[#FFD76B]">جمع‌بندی آکسی:</span> اسم تبدیل صدا به نوشته،{' '}
              <span className="text-[#39D5D0] underline">تشخیص گفتار</span> است! و بعد از اینکه صدا به نوشته تبدیل شد، بازی اون نوشته رو بررسی می‌کنه تا{' '}
              <span className="text-[#FFD76B] underline">فرمانِ حرکت</span> رو اجرا کنه!
            </p>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                gameAudio.playClick();
                onFinishSummary();
              }}
              data-testid="start-quiz-btn"
              className="px-6 py-3 rounded-2xl bg-[#FFD76B] hover:bg-amber-300 text-[#042f4b] font-black text-base shadow-[0_5px_0_#B45309] cursor-pointer whitespace-nowrap"
            >
              بریم سراغ کوییز پایانی! (۳ سؤال)
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Final Reward Screen after completing all 3 quiz questions
  if (quizFinished) {
    return (
      <div
        className="w-full min-h-screen bg-gradient-to-b from-[#042f4b] via-[#063f63] to-[#032238] flex flex-col items-center justify-center px-4 py-6 select-none"
        data-testid="final-reward-screen"
      >
        <div className="w-full max-w-xl rounded-3xl bg-[#042f4b]/95 border-2 border-[#FFD76B] shadow-2xl p-6 text-center">
          <div className="flex justify-center mb-2">
            <AxieCharacter animation="Victory" swordGlowingGold />
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFD76B]/20 border border-[#FFD76B] text-[#FFD76B] font-black text-sm mb-3">
            <Award className="w-5 h-5" />
            <span>مدال «قهرمان صداهای جادویی» باز شد!</span>
          </div>

          <h2 className="text-3xl font-display text-[#FFF8EE] mb-2">
            آفرین قهرمانِ دلفینا!
          </h2>
          <p className="text-sm sm:text-base text-[#A5F3FC] font-semibold mb-4 leading-relaxed">
            تو هم قلعهٔ مرجانی و هشت‌پا رو نجات دادی و هم یاد گرفتی هوش مصنوعی چطور گفتار فارسی رو به نوشته و فرمان تبدیل می‌کنه!
          </p>

          <div className="grid grid-cols-2 gap-3 mb-6 text-center">
            <div className="p-3 rounded-2xl bg-[#074268] border border-[#39D5D0]/50">
              <div className="text-xs text-[#A5F3FC]">امتیاز کل ماجراجویی</div>
              <div className="text-2xl font-black text-[#FFD76B] tabular-nums">{score}</div>
            </div>
            <div className="p-3 rounded-2xl bg-[#074268] border border-[#39D5D0]/50">
              <div className="text-xs text-[#A5F3FC]">مدال‌های کسب‌شده</div>
              <div className="text-sm font-black text-[#39D5D0] mt-1">
                فرماندهٔ صدا · قهرمان صداهای جادویی
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              data-start="true"
              onClick={() => {
                gameAudio.playClick();
                onPlayAgain();
              }}
              data-testid="play-again-btn"
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#FFD76B] hover:bg-amber-300 text-[#042f4b] font-black text-base shadow-[0_5px_0_#B45309] flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <RotateCcw className="w-5 h-5" />
              <span>دوباره بازی کنیم</span>
            </button>

            <button
              type="button"
              onClick={() => {
                gameAudio.playClick();
                onOpenDelfinaHub();
              }}
              data-testid="return-delfina-btn"
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#39D5D0] hover:bg-[#67E8F9] text-[#042f4b] font-black text-base shadow-[0_5px_0_#087EB7] flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <Compass className="w-5 h-5" />
              <span>برگشت به دلفینا</span>
            </button>
          </div>
        </div>
      </div>
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
                {qIndex + 1 < QUIZ_QUESTIONS.length ? 'سؤال بعدی' : 'دریافت مدال قهرمانی!'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
