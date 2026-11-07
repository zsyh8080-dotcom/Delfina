import React from 'react';
import { Award, Compass, RotateCcw, Sparkles } from 'lucide-react';
import { gameAudio } from '../game/GameAudioManager';

interface VictoryScreenProps {
  score: number;
  onPlayAgain: () => void;
  onOpenDelfinaHub: () => void;
}

/**
 * VictoryScreen ("آفرین قهرمان دلفینا")
 * Displays a custom SVG Medal Emblem INSTEAD of AxieCharacter,
 * with the medal name «نشان قهرمان صداهای جادویی» directly underneath it,
 * a congratulatory animation, and a «بازگشت به دلفینا» button.
 */
export const VictoryScreen: React.FC<VictoryScreenProps> = ({
  score,
  onPlayAgain,
  onOpenDelfinaHub,
}) => {
  return (
    <div
      className="w-full min-h-screen bg-gradient-to-b from-[#042f4b] via-[#063f63] to-[#032238] flex flex-col items-center justify-center px-4 py-6 select-none overflow-hidden relative"
      data-testid="final-reward-screen"
    >
      {/* Congratulatory Floating Sparkles & Golden Rays Background Animation */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
        <div className="w-[460px] h-[460px] rounded-full bg-gradient-to-r from-[#FFD76B]/15 via-[#39D5D0]/15 to-[#FF84B2]/15 blur-3xl animate-pulse" />
      </div>

      <div className="relative z-10 w-full max-w-xl rounded-3xl bg-[#042f4b]/95 border-2 border-[#FFD76B] shadow-[0_18px_50px_rgba(0,0,0,0.65)] p-6 sm:p-7 text-center">
        {/* Custom Medal Emblem instead of Axie Character ("به جای کارتر آکسی یه نشان طراحی کن و اسم نشان رو پایینش بزار") */}
        <div className="flex flex-col items-center justify-center mb-4">
          <div
            className="relative flex items-center justify-center animate-float-slow"
            data-testid="magic-voice-medal-emblem"
          >
            {/* Glowing Halo behind the Medal */}
            <div className="absolute -inset-4 rounded-full bg-[#FFD76B]/30 blur-xl animate-pulse pointer-events-none" />

            <svg
              viewBox="0 0 220 220"
              className="w-36 h-36 sm:w-44 sm:h-44 drop-shadow-[0_12px_24px_rgba(245,158,11,0.55)] overflow-visible"
              role="img"
              aria-label="نشان قهرمان صداهای جادویی"
            >
              <defs>
                <linearGradient id="medalRibbonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#39D5D0" />
                  <stop offset="100%" stopColor="#087EB7" />
                </linearGradient>
                <linearGradient id="medalGoldRim" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFF8EE" />
                  <stop offset="45%" stopColor="#FFD76B" />
                  <stop offset="100%" stopColor="#D97706" />
                </linearGradient>
                <radialGradient id="medalCoreGrad" cx="50%" cy="45%" r="55%">
                  <stop offset="0%" stopColor="#087EB7" />
                  <stop offset="70%" stopColor="#042f4b" />
                  <stop offset="100%" stopColor="#021827" />
                </radialGradient>
              </defs>

              {/* Royal Sea-Turquoise Ribbons Hanging Under Medal */}
              <path
                d="M 76 145 L 54 206 L 80 194 L 96 210 L 104 152 Z"
                fill="url(#medalRibbonGrad)"
                stroke="#FFD76B"
                strokeWidth="2.5"
              />
              <path
                d="M 144 145 L 166 206 L 140 194 L 124 210 L 116 152 Z"
                fill="url(#medalRibbonGrad)"
                stroke="#FFD76B"
                strokeWidth="2.5"
              />

              {/* Starburst Outer Points */}
              <polygon
                points="110,10 128,34 158,24 162,54 192,64 178,92 198,116 172,134 176,164 146,164 134,190 110,174 86,190 74,164 44,164 48,134 22,116 42,92 28,64 58,54 62,24 92,34"
                fill="url(#medalGoldRim)"
                stroke="#FFF8EE"
                strokeWidth="2.5"
              />

              {/* Inner Medallion Disc */}
              <circle
                cx="110"
                cy="100"
                r="58"
                fill="url(#medalCoreGrad)"
                stroke="url(#medalGoldRim)"
                strokeWidth="6"
              />

              {/* Pearlescent Seashell & Sound-Wave Crest in the Center */}
              <path
                d="M 80 114 Q 110 74 140 114 Q 125 124 110 124 Q 95 124 80 114 Z"
                fill="#FF84B2"
                stroke="#FFF8EE"
                strokeWidth="2.5"
              />
              {/* Glowing Pearl of Voice + Golden Microphone Symbol */}
              <circle
                cx="110"
                cy="88"
                r="16"
                fill="url(#medalGoldRim)"
                stroke="#FFF8EE"
                strokeWidth="2.5"
              />
              <path
                d="M 86 76 Q 74 88 86 100"
                stroke="#39D5D0"
                strokeWidth="3.5"
                fill="none"
                strokeLinecap="round"
              />
              <path
                d="M 134 76 Q 146 88 134 100"
                stroke="#39D5D0"
                strokeWidth="3.5"
                fill="none"
                strokeLinecap="round"
              />
              {/* Crown Stars */}
              <circle cx="90" cy="56" r="4" fill="#FFD76B" />
              <circle cx="110" cy="50" r="5.5" fill="#FFF8EE" />
              <circle cx="130" cy="56" r="4" fill="#FFD76B" />
            </svg>
          </div>

          {/* Medal Name Placed Directly Underneath the Emblem ("اسم نشان رو پایینش بزار") */}
          <div
            className="mt-2 inline-flex items-center gap-2 px-5 py-1.5 rounded-full bg-gradient-to-r from-[#FFD76B] via-amber-300 to-[#FFD76B] text-[#042f4b] font-black text-sm sm:text-base shadow-[0_4px_15px_rgba(255,215,107,0.5)] border-2 border-[#FFF8EE]"
            data-testid="magic-voice-medal-name"
          >
            <Award className="w-5 h-5 text-[#042f4b] shrink-0" />
            <span>نشان قهرمان صداهای جادویی</span>
            <Sparkles className="w-4 h-4 text-[#042f4b] shrink-0" />
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-display text-[#FFF8EE] mb-2">
          آفرین قهرمانِ دلفینا!
        </h2>
        <p className="text-sm sm:text-base text-[#A5F3FC] font-semibold mb-5 leading-relaxed">
          تو هم قلعهٔ مرجانی و هشت‌پا رو نجات دادی و هم یاد گرفتی هوش مصنوعی چطور گفتار فارسی رو به نوشته و فرمان تبدیل می‌کنه!
        </p>

        <div className="grid grid-cols-2 gap-3 mb-6 text-center">
          <div className="p-3 rounded-2xl bg-[#074268] border border-[#39D5D0]/50">
            <div className="text-xs text-[#A5F3FC]">امتیاز کل ماجراجویی</div>
            <div
              className="text-2xl font-black text-[#FFD76B] tabular-nums"
              data-testid="victory-total-score"
            >
              {score}
            </div>
          </div>
          <div className="p-3 rounded-2xl bg-[#074268] border border-[#39D5D0]/50">
            <div className="text-xs text-[#A5F3FC]">نشان‌های دریافت‌شده</div>
            <div className="text-xs sm:text-sm font-black text-[#39D5D0] mt-1">
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
            <span>بازگشت به دلفینا</span>
          </button>
        </div>
      </div>
    </div>
  );
};
