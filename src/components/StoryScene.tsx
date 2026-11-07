import React, { useState, useEffect } from 'react';
import { ChevronLeft, FastForward, Sparkles } from 'lucide-react';
import { AxieCharacter } from './AxieCharacter';
import { OctopusBoss } from './OctopusBoss';
import { gameAudio } from '../game/GameAudioManager';
import titleBgUrl from '../assets/images/title_bg_1793974344182.jpg';
import bossBgUrl from '../assets/images/boss_arena_bg_1793974346072.jpg';

export type StoryMode = 'INTRO' | 'MID_BRIDGE' | 'ENDING';

interface StorySlide {
  id: string;
  speaker: 'دلفی' | 'آکسی' | 'هشت‌پا';
  text: string;
  subText?: string;
  sceneVisual:
    | 'HAPPY_CASTLE'
    | 'PEARL_STOLEN'
    | 'SHELL_HOUSE'
    | 'AXIE_CALL_TO_ACTION'
    | 'MID_HALL'
    | 'ENDING_CELEBRATION';
  ctaLabel?: string;
}

const INTRO_SLIDES: StorySlide[] = [
  {
    id: 'intro-1',
    speaker: 'دلفی',
    // Removed "سلام دوست من! من دلفی هستم!" as requested by the user
    text: 'تهِ دریای آبی، یه قلعهٔ جادویی بود که با صدای دوستای دریایی می‌درخشید!',
    subText: 'هر وقت ماهی‌ها می‌خندیدن یا آواز می‌خوندن، «مروارید صدا» بالای برج اصلی نور می‌پاشید.',
    sceneVisual: 'HAPPY_CASTLE',
  },
  {
    id: 'intro-2',
    speaker: 'دلفی',
    text: 'اما یه روز، هشت‌پا که گرفتار طلسم سکوت شده بود، مروارید صدا رو دزدید و برد به تالار تاریک!',
    subText: 'وووش! با رفتن مروارید، نور مرجان‌های قلعه کم‌کم خاموش شد.',
    sceneVisual: 'PEARL_STOLEN',
  },
  {
    id: 'intro-3',
    speaker: 'آکسی',
    text: 'ای وای! شمشیرم چرا کار نمی‌کنه؟ ... آهااا! یادم اومد! زره من فقط با صدای یه قهرمان دیگه کار می‌کنه!',
    subText: 'شمشیر مرجانیِ آکسی با شنیدن فرمان صوتی روشن میشه.',
    sceneVisual: 'SHELL_HOUSE',
  },
  {
    id: 'intro-4',
    speaker: 'آکسی',
    text: 'هی دوست من! تو همونی هستی که دنبالش می‌گشتم! با صدات کمکم می‌کنی قلعه رو نجات بدیم؟',
    sceneVisual: 'AXIE_CALL_TO_ACTION',
    ctaLabel: 'آره! بزن بریم!',
  },
];

const MID_SLIDES: StorySlide[] = [
  {
    id: 'mid-1',
    speaker: 'هشت‌پا',
    text: 'هاهاها! فکر کردین می‌تونین مرواریدمو پس بگیرین؟',
    subText: 'حباب‌های بنفش از تالار تاریک بیرون میان...',
    sceneVisual: 'MID_HALL',
  },
  {
    id: 'mid-2',
    speaker: 'آکسی',
    text: 'وای! این یکی خیلی بزرگ‌تره! ولی حالا من یه دوست دارم که با صداش کمکم می‌کنه!',
    subText: 'آماده‌ای؟ این بار باید با فرمان‌های «حمله کن»، «سپر بگیر»، «بپر بکن» و «قدرت حبابی» بجنگیم!',
    sceneVisual: 'MID_HALL',
    ctaLabel: 'آمادهٔ نبردم!',
  },
];

const ENDING_SLIDES: StorySlide[] = [
  {
    id: 'end-1',
    speaker: 'دلفی',
    text: 'هورااا! مروارید صدا به برج اصلی قلعه برگشت و تمام مرجان‌ها دوباره روشن شدن!',
    subText: 'هشت‌پا هم که از طلسم سکوت نجات پیدا کرده، حالا کنار ما و آکسی جشن می‌گیره!',
    sceneVisual: 'ENDING_CELEBRATION',
  },
  {
    id: 'end-2',
    speaker: 'آکسی',
    text: 'قهرمانِ من، قلعه رو با صدای خودت نجات دادی! ولی می‌دونی کامپیوتر چطوری تونست صدای تو رو بفهمه؟',
    sceneVisual: 'ENDING_CELEBRATION',
    ctaLabel: 'بگو چطوری کار کرد!',
  },
];

/**
 * Delfi the Dolphin (دلفی، راوی دوست‌داشتنی دلفینا)
 */
const DelfiNarratorCharacter: React.FC<{ isSpeaking?: boolean }> = ({ isSpeaking }) => (
  <div
    className="relative flex flex-col items-center animate-float-slow select-none"
    data-testid="delfi-narrator"
  >
    <svg
      viewBox="0 0 200 190"
      className="w-36 h-36 sm:w-44 sm:h-44 drop-shadow-[0_12px_20px_rgba(4,47,75,0.55)] overflow-visible"
      role="img"
      aria-label="دلفی، دلفین راوی دلفینا"
    >
      <defs>
        <linearGradient id="delfiBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#67E8F9" />
          <stop offset="55%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>
        <linearGradient id="delfiBellyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFF8EE" />
          <stop offset="100%" stopColor="#E0F7FA" />
        </linearGradient>
      </defs>

      <path
        d="M 108 38 Q 134 18 140 48 Q 124 46 112 52 Z"
        fill="#0284C7"
        stroke="#A5F3FC"
        strokeWidth="2.5"
      />
      <path
        d="M 148 134 Q 182 124 188 106 Q 182 146 154 152 Q 178 164 176 176 Q 152 168 142 148 Z"
        fill="url(#delfiBodyGrad)"
        stroke="#0369A1"
        strokeWidth="2.5"
      />

      <path
        d="M 46 92 C 42 46, 138 38, 156 96 C 166 130, 146 156, 110 156 C 72 156, 52 128, 46 92 Z"
        fill="url(#delfiBodyGrad)"
        stroke="#0369A1"
        strokeWidth="3"
      />

      <ellipse cx="96" cy="116" rx="34" ry="30" fill="url(#delfiBellyGrad)" />

      <path
        d="M 52 94 Q 20 96 24 110 Q 34 118 58 112 Z"
        fill="url(#delfiBodyGrad)"
        stroke="#0369A1"
        strokeWidth="2.5"
      />

      <circle cx="72" cy="82" r="10.5" fill="#1E1B4B" />
      <circle cx="69" cy="78" r="3.8" fill="#FFFFFF" />
      <circle cx="75" cy="85" r="2" fill="#67E8F9" />

      <ellipse cx="82" cy="96" rx="7.5" ry="4" fill="#FF84B2" opacity="0.65" />

      {isSpeaking ? (
        <path
          d="M 42 108 Q 58 124 72 108 Z"
          fill="#9D174D"
          stroke="#FFF8EE"
          strokeWidth="1.5"
        />
      ) : (
        <path
          d="M 40 107 Q 58 118 72 106"
          stroke="#0369A1"
          strokeWidth="3.2"
          fill="none"
          strokeLinecap="round"
        />
      )}

      <path
        d="M 98 114 Q 124 102 134 122 Q 114 134 94 126 Z"
        fill="#38BDF8"
        stroke="#0369A1"
        strokeWidth="2.5"
      />

      <circle cx="96" cy="46" r="7" fill="#FFD76B" stroke="#FFF8EE" strokeWidth="2" />
    </svg>
    <span className="mt-1 px-3 py-0.5 rounded-full bg-[#042f4b]/90 border border-[#39D5D0] text-xs font-extrabold text-[#FFD76B]">
      دلفی (راوی دلفینا)
    </span>
  </div>
);

interface StorySceneProps {
  mode: StoryMode;
  onComplete: () => void;
}

export const StoryScene: React.FC<StorySceneProps> = ({ mode, onComplete }) => {
  const slides =
    mode === 'INTRO' ? INTRO_SLIDES : mode === 'MID_BRIDGE' ? MID_SLIDES : ENDING_SLIDES;

  const [index, setIndex] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const currentSlide = slides[index] || slides[0];
  const isLast = index === slides.length - 1;
  const fullDialogueText = `${currentSlide.text}${currentSlide.subText ? ` ${currentSlide.subText}` : ''}`;
  const [typedLen, setTypedLen] = useState<number>(fullDialogueText.length);

  // Typing animation effect for Delfi & Axie dialogues
  useEffect(() => {
    setTypedLen(0);
    const total = fullDialogueText.length;
    let cur = 0;
    const step = Math.max(2, Math.ceil(total / 22));
    const timer = window.setInterval(() => {
      cur += step;
      if (cur >= total) {
        setTypedLen(total);
        window.clearInterval(timer);
      } else {
        setTypedLen(cur);
      }
    }, 20);
    return () => window.clearInterval(timer);
  }, [fullDialogueText]);

  useEffect(() => {
    setIsSpeaking(true);
    const timer = setTimeout(() => setIsSpeaking(false), 1800);
    return () => {
      clearTimeout(timer);
    };
  }, [index, currentSlide.text]);

  const handleNext = () => {
    gameAudio.playClick();
    if (isLast) {
      gameAudio.stopAllSpeech();
      onComplete();
    } else {
      setIndex((prev) => prev + 1);
    }
  };

  const handleSkip = () => {
    gameAudio.playClick();
    gameAudio.stopAllSpeech();
    onComplete();
  };

  const bgImage = mode === 'MID_BRIDGE' ? bossBgUrl : titleBgUrl;
  const visibleStoryText = fullDialogueText.slice(0, typedLen);
  const hiddenStoryText = fullDialogueText.slice(typedLen);

  return (
    <div
      className="relative w-full min-h-screen flex flex-col justify-between overflow-hidden select-none bg-[#042f4b]"
      data-testid={`story-scene-${mode.toLowerCase()}`}
    >
      {/* Illustrated Background with Measured Scrim */}
      <div className="absolute inset-0 pointer-events-none">
        <img
          src={bgImage}
          alt="محیط داستانی قلعهٔ مرجانی"
          referrerPolicy="no-referrer"
          className={`w-full h-full object-cover transition-all duration-700 ${
            currentSlide.sceneVisual === 'PEARL_STOLEN' || currentSlide.sceneVisual === 'MID_HALL'
              ? 'brightness-50 saturate-75 hue-rotate-15'
              : 'brightness-90'
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#031d30] via-[#042f4b]/45 to-[#042f4b]/70" />
      </div>

      {/* Top Bar: Scene Progress & Skip Button */}
      <div className="relative z-20 w-full max-w-4xl mx-auto px-4 pt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm font-black text-[#FFD76B]">
            {mode === 'INTRO'
              ? 'داستان قلعهٔ مرجانی با دلفی'
              : mode === 'MID_BRIDGE'
              ? 'ورود به تالار هیولای سکوت'
              : 'جشن پیروزی و بازگشت مروارید'}
          </span>
          <span className="text-xs text-[#A5F3FC] font-bold tabular-nums">
            ({index + 1} از {slides.length})
          </span>
        </div>

        <button
          type="button"
          onClick={handleSkip}
          data-testid="skip-story-btn"
          className="px-3.5 py-1.5 rounded-xl bg-[#074268]/90 hover:bg-[#09598b] border border-[#39D5D0]/60 text-xs sm:text-sm font-extrabold text-[#FFF8EE] flex items-center gap-1.5 shadow cursor-pointer whitespace-nowrap"
        >
          <FastForward className="w-4 h-4 text-[#FFD76B]" />
          <span>رد کردن داستان</span>
        </button>
      </div>

      {/* Center Stage: Animated Characters (Delfi, Axie, Octopus) & Pearl of Voice */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-2">
        {(currentSlide.sceneVisual === 'HAPPY_CASTLE' ||
          currentSlide.sceneVisual === 'ENDING_CELEBRATION') && (
          <div className="mb-3 flex flex-col items-center animate-bounce">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-white via-[#FFF8EE] to-[#FFD76B] shadow-[0_0_45px_#FFD76B] border-4 border-white flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-amber-500" />
            </div>
            <span className="mt-1.5 text-xs font-black text-[#FFD76B] bg-[#042f4b]/80 px-3 py-0.5 rounded-full border border-[#FFD76B]/50">
              مروارید درخشان صدا
            </span>
          </div>
        )}

        <div className="flex items-center justify-center gap-6 sm:gap-12 flex-wrap">
          {currentSlide.speaker === 'دلفی' && (
            <DelfiNarratorCharacter isSpeaking={isSpeaking} />
          )}

          {currentSlide.sceneVisual !== 'PEARL_STOLEN' && (
            <div className="flex flex-col items-center">
              <AxieCharacter
                animation={
                  currentSlide.sceneVisual === 'ENDING_CELEBRATION'
                    ? 'Victory'
                    : currentSlide.sceneVisual === 'AXIE_CALL_TO_ACTION'
                    ? 'Greeting'
                    : 'Idle'
                }
                isSpeaking={isSpeaking && currentSlide.speaker === 'آکسی'}
                swordGlowingGold={
                  currentSlide.sceneVisual === 'SHELL_HOUSE' ||
                  currentSlide.sceneVisual === 'ENDING_CELEBRATION'
                }
              />
              <span className="mt-1 px-3 py-0.5 rounded-full bg-[#042f4b]/90 border border-[#39D5D0]/60 text-xs font-extrabold text-[#A5F3FC]">
                آکسی (شوالیهٔ صدفی)
              </span>
            </div>
          )}

          {(currentSlide.sceneVisual === 'PEARL_STOLEN' ||
            currentSlide.sceneVisual === 'MID_HALL' ||
            currentSlide.sceneVisual === 'ENDING_CELEBRATION') && (
            <div className="flex flex-col items-center">
              <OctopusBoss
                animation={
                  currentSlide.sceneVisual === 'ENDING_CELEBRATION'
                    ? 'HealedHappy'
                    : 'Laugh'
                }
                pearlFreed={currentSlide.sceneVisual === 'ENDING_CELEBRATION'}
              />
              <span className="mt-1 px-3 py-0.5 rounded-full bg-[#2E1065]/90 border border-[#C084FC]/60 text-xs font-extrabold text-[#E9D5FF]">
                هشت‌پا
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Story Dialogue Bubble with Speaker Label Above ("دیالوگای دلفی بالاش بنویس دلفی: دیالوگای آکسی بالاش بنویس آکسی:") */}
      <div className="relative z-20 w-full max-w-2xl mx-auto px-4 pb-6 space-y-2">
        {/* Speaker Name Label Placed Above the Speech Bubble */}
        <div className="flex justify-start px-3">
          <span
            className={`inline-flex items-center px-3.5 py-0.5 rounded-t-xl font-black text-xs sm:text-sm shadow ${
              currentSlide.speaker === 'دلفی'
                ? 'bg-[#FFD76B] text-[#042f4b]'
                : currentSlide.speaker === 'آکسی'
                ? 'bg-[#39D5D0] text-[#042f4b]'
                : 'bg-[#C084FC] text-[#2E1065]'
            }`}
            data-testid="story-speaker-label"
          >
            {currentSlide.speaker}:
          </span>
        </div>

        {/* Pure Single-Part Speech Bubble ("حباب ها داخلیش دو قسمتی نباشه فقط یه متن واحد باشه") */}
        <div className="relative rounded-3xl bg-[#042f4b]/95 border-2 border-[#39D5D0] shadow-[0_14px_36px_rgba(0,0,0,0.6)] p-5 sm:p-6 text-right">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-5 h-5 bg-[#042f4b] border-t-2 border-l-2 border-[#39D5D0] rotate-45 pointer-events-none" />

          <p
            className="text-base sm:text-xl font-extrabold text-[#FFF8EE] leading-relaxed"
            data-testid="story-dialogue-text"
          >
            «<span>{visibleStoryText}</span>
            <span className="opacity-0">{hiddenStoryText}</span>»
          </p>
        </div>

        {/* External Story Navigation Bar (Outside the Bubble) */}
        <div className="flex items-center justify-between gap-3 px-2 pt-1">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5">
              {slides.map((s, i) => (
                <span
                  key={s.id}
                  className={`h-2 rounded-full transition-all ${
                    i === index ? 'w-6 bg-[#FFD76B]' : 'w-2 bg-[#39D5D0]/40'
                  }`}
                />
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleNext}
            data-testid="story-next-btn"
            className="px-6 py-3 rounded-2xl bg-[#FFD76B] hover:bg-amber-300 text-[#042f4b] font-black text-sm sm:text-base shadow-[0_6px_0_#B45309] active:translate-y-0.5 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap"
          >
            <span>{currentSlide.ctaLabel || 'بعدی'}</span>
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
