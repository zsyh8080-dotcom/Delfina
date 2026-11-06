import React from 'react';
import { Award, Play, Sparkles, Compass, CheckCircle2, Lock } from 'lucide-react';
import { GameProgress } from '../game/types';
import { AxieCharacter } from './AxieCharacter';
import titleBgUrl from '../assets/images/title_bg_1793974344182.jpg';

interface DelfinaHubProps {
  progress: GameProgress;
  onLaunchSeaKnight: () => void;
  onLaunchRound2Directly: () => void;
}

/**
 * Delfina Bay Games Hub (خلیج بازی‌های دلفینا)
 * Connects the "شوالیهٔ صدفی و هیولای سکوت" mini-game seamlessly into the Delfina marine world
 * with saved medals, stars, and neighboring bay missions.
 */
export const DelfinaHub: React.FC<DelfinaHubProps> = ({
  progress,
  onLaunchSeaKnight,
  onLaunchRound2Directly,
}) => {
  const totalStars = progress.starsRound1 + progress.starsRound2;

  return (
    <div
      className="min-h-screen w-full bg-[#042f4b] text-[#FFF8EE] flex flex-col justify-between p-4 sm:p-6 select-none"
      data-testid="delfina-hub-screen"
    >
      {/* Top Delfina World Header */}
      <header className="w-full max-w-5xl mx-auto flex items-center justify-between gap-4 pb-4 border-b border-[#39D5D0]/30">
        <div className="flex items-center gap-2.5">
          <Compass className="w-7 h-7 text-[#39D5D0]" />
          <span className="text-xl sm:text-2xl font-display text-[#FFF8EE] whitespace-nowrap">
            دنیای دلفینا — خلیج بازی‌های هوش مصنوعی
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs sm:text-sm font-bold text-[#FFD76B] tabular-nums">
          <span>★ ستاره‌ها: {totalStars}/6</span>
          <span aria-hidden="true">·</span>
          <span>بهترین امتیاز: {progress.bestScore}</span>
        </div>
      </header>

      {/* Main Mission Cards Grid */}
      <main className="w-full max-w-5xl mx-auto my-6 grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Featured Active Mission Card: Shell Knight & The Monster of Silence */}
        <div className="lg:col-span-2 rounded-3xl bg-[#063b5e] border-2 border-[#39D5D0] shadow-2xl overflow-hidden flex flex-col justify-between">
          <div className="relative h-52 sm:h-64 overflow-hidden">
            <img
              src={titleBgUrl}
              alt="شوالیهٔ صدفی و هیولای سکوت"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#063b5e] via-[#063b5e]/40 to-transparent" />
            <div className="absolute bottom-3 right-5 left-5 flex items-end justify-between gap-4">
              <div>
                <div className="text-xs font-bold text-[#39D5D0] mb-1">
                  مأموریت صوتی فارسی · تشخیص گفتار (Speech-to-Text)
                </div>
                <h1 className="text-2xl sm:text-3xl font-display text-[#FFF8EE]">
                  شوالیهٔ صدفی و هیولای سکوت
                </h1>
              </div>
              <div className="shrink-0 pl-2">
                <AxieCharacter animation="Greeting" className="w-20 h-20 sm:w-24 sm:h-24" />
              </div>
            </div>
          </div>

          <div className="p-5 space-y-4">
            <p className="text-sm sm:text-base text-[#A5F3FC] leading-relaxed">
              صدات رو به آکسی برسون و قلعهٔ دریا رو نجات بده! با گفتن فرمان‌های فارسی به میکروفون، از دروازهٔ ژله‌خان عبور کن و طلسم سکوت هشت‌پا رو بشکن.
            </p>

            {/* Saved Progress & Medals Row */}
            <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-[#FFF8EE] pt-1">
              <span className="flex items-center gap-1 text-[#FFD76B]">
                <Award className="w-4 h-4" />
                <span>
                  مدال فرماندهٔ صدا:{' '}
                  {progress.medals.includes('VOICE_COMMANDER') ? 'دریافت شد ✓' : 'در انتظار'}
                </span>
              </span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1 text-[#39D5D0]">
                <Sparkles className="w-4 h-4" />
                <span>
                  مدال قهرمان صداهای جادویی:{' '}
                  {progress.medals.includes('MAGIC_VOICE_HERO') ? 'دریافت شد ✓' : 'در انتظار'}
                </span>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onLaunchSeaKnight}
                data-testid="hub-launch-seaknight-btn"
                className="px-6 py-3 rounded-2xl bg-[#FFD76B] hover:bg-amber-300 text-[#042f4b] font-black text-sm sm:text-base shadow-[0_5px_0_#B45309] flex items-center gap-2 cursor-pointer whitespace-nowrap"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>ورود به بازی شوالیهٔ صدفی</span>
              </button>

              {progress.round1Completed && (
                <button
                  type="button"
                  onClick={onLaunchRound2Directly}
                  data-testid="hub-launch-round2-btn"
                  className="px-4 py-3 rounded-2xl bg-[#39D5D0] hover:bg-[#67E8F9] text-[#042f4b] font-black text-xs sm:text-sm cursor-pointer whitespace-nowrap"
                >
                  ادامهٔ مستقیم دور دوم (نبرد با هشت‌پا)
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Neighboring Delfina Bay Missions */}
        <div className="space-y-4 flex flex-col justify-between">
          <div className="rounded-3xl bg-[#053452] border border-[#39D5D0]/40 p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-300 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>خلیج همسایه‌ها · تکمیل‌شده</span>
              </span>
            </div>
            <h2 className="text-lg font-extrabold text-[#FFF8EE] mb-1">
              ماهی‌های دسته‌بندی (نزدیک‌ترین همسایه)
            </h2>
            <p className="text-xs text-[#A5F3FC] leading-relaxed">
              شناخت الگوهای ماهی‌های رنگارنگ خلیج بر اساس شباهت ویژگی‌ها در دنیای دلفینا.
            </p>
          </div>

          <div className="rounded-3xl bg-[#053452] border border-[#39D5D0]/40 p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#FFD76B] flex items-center gap-1">
                <Lock className="w-4 h-4" />
                <span>مسیرهای پنهان دلفینا</span>
              </span>
            </div>
            <h2 className="text-lg font-extrabold text-[#FFF8EE] mb-1">
              مسیریابی مرجانی هوشمند
            </h2>
            <p className="text-xs text-[#A5F3FC] leading-relaxed">
              پیدا کردن کوتاه‌ترین مسیر بین جزیره‌های مرجانی با کمک دلفین راهنما.
            </p>
          </div>
        </div>
      </main>

      <footer className="w-full max-w-5xl mx-auto text-center text-xs text-[#A5F3FC]/70 pt-3 border-t border-[#39D5D0]/20">
        پروژهٔ آموزشی دلفینا · یادگیری مفاهیم هوش مصنوعی با داستان و بازی
      </footer>
    </div>
  );
};
