import React from 'react';
import { Volume2, VolumeX, Pause, Play, RotateCcw, Home, AlertTriangle, Sparkles } from 'lucide-react';
import { CombatState } from '../game/types';
import { getCurrentStepConfig } from '../game/CombatEngine';

interface GameHUDProps {
  state: CombatState;
  isMuted: boolean;
  onToggleMute: () => void;
  onTogglePause: () => void;
  onRestartRound: () => void;
  onReturnTitle: () => void;
}

/**
 * World-Matched Underwater Game HUD positioned absolutely over the game container.
 * Shows:
 * - Health Bar + 3 Coral Hearts for Axie (شوالیهٔ صدفی)
 * - Health Bar for OctopusBoss / JellyGuardian (هیولای سکوت / ژله‌خان)
 * - Visual Special Move Telegraph Indicator when Boss is about to perform a special move
 * - Utility controls (Mute, Pause, Restart, Home)
 */
export const GameHUD: React.FC<GameHUDProps> = ({
  state,
  isMuted,
  onToggleMute,
  onTogglePause,
  onRestartRound,
  onReturnTitle,
}) => {
  const stepConfig = getCurrentStepConfig(state);
  const stageTitle =
    state.round === 1 ? 'دور اول: دروازهٔ ژله‌ای' : 'دور دوم: نبرد با هیولای هشت‌پا';
  const enemyName = state.round === 1 ? 'ژله‌خان (نگهبان)' : 'هشت‌پا (هیولای سکوت)';

  const axieHpPercent = Math.max(
    0,
    Math.min(100, Math.round((state.axieHearts / state.axieMaxHearts) * 100))
  );
  const enemyHpPercent = Math.max(
    0,
    Math.min(100, Math.round((state.enemyHp / state.enemyMaxHp) * 100))
  );

  // Determine Boss / Enemy Special Move Telegraph Visual Indicator
  const getSpecialMoveIndicator = (): {
    label: string;
    tone: 'danger' | 'opportunity';
  } | null => {
    if (state.phase === 'ROUND_COMPLETE' || state.phase === 'VICTORY') return null;
    switch (stepConfig.enemyTelegraphType) {
      case 'JELLY_BALL':
        return {
          label: 'حرکت ویژهٔ ژله‌خان: پرتاب توپ ژله‌ای! (بگو: سپر بگیر)',
          tone: 'danger',
        };
      case 'SMALL_WAVE':
        return {
          label: 'حرکت ویژهٔ ژله‌خان: موج خروشان دریایی! (بگو: بپر بکن)',
          tone: 'danger',
        };
      case 'TENTACLE_SLAM':
        return {
          label: 'حرکت ویژهٔ هشت‌پا: ضربهٔ شاخک غول‌پیکر! (بگو: سپر بگیر)',
          tone: 'danger',
        };
      case 'GIANT_WAVE':
        return {
          label: 'حرکت ویژهٔ هشت‌پا: سونامی و موج عظیم تالار! (بگو: بپر بکن)',
          tone: 'danger',
        };
      case 'DIZZY_OPENING':
        return {
          label: 'فرصت طلایی: هشت‌پا گیج شده! (بگو: حمله کن)',
          tone: 'opportunity',
        };
      case 'BUBBLE_AURA':
        return {
          label: 'شمشیر طلایی آمادهٔ حرکت ویژه! (بگو: قدرت حبابی)',
          tone: 'opportunity',
        };
      case 'WEAKENED_CROWN':
        return {
          label: 'طلسم تاج هشت‌پا ترک برداشته! ضربهٔ آخر! (بگو: حمله کن)',
          tone: 'opportunity',
        };
      default:
        return {
          label:
            state.round === 1
              ? 'ژله‌خان جلوی دروازه آمادهٔ نبرد است! (بگو: حمله کن)'
              : 'هشت‌پا با شاخک‌هایش به جلو خیز برداشته! (بگو: حمله کن)',
          tone: 'opportunity',
        };
    }
  };

  const specialMove = getSpecialMoveIndicator();

  return (
    <header
      className="absolute top-0 inset-x-0 z-30 w-full max-w-5xl mx-auto px-3 pt-2.5 pb-1 select-none pointer-events-none"
      data-testid="game-hud"
    >
      <div className="rounded-2xl bg-[#042f4b]/92 border-2 border-[#39D5D0]/70 shadow-[0_6px_18px_rgba(0,0,0,0.45)] px-2.5 py-1.5 sm:px-4 sm:py-2 flex items-center justify-between gap-2 sm:gap-3 pointer-events-auto">
        {/* Right Cluster (in RTL): Axie Health Bar & 3 Coral Hearts */}
        <div
          className="flex-1 min-w-0 max-w-xs"
          data-testid="axie-health-cluster"
        >
          <div className="flex items-center justify-between text-[11px] sm:text-xs font-extrabold mb-1 gap-1">
            <span className="text-[#FFF8EE] flex items-center gap-1 truncate">
              <span className="truncate">آکسی</span>
              <span className="text-[#FFD76B] tabular-nums shrink-0">★{state.starsEarned}/3</span>
            </span>

            {/* 3 Coral Hearts */}
            <div
              className="flex items-center gap-0.5 shrink-0"
              aria-label={`قلب‌های آکسی: ${state.axieHearts} از ${state.axieMaxHearts}`}
              data-testid="axie-hearts"
            >
              {Array.from({ length: state.axieMaxHearts }).map((_, idx) => {
                const full = idx < state.axieHearts;
                return (
                  <svg
                    key={idx}
                    viewBox="0 0 24 24"
                    className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform ${
                      full ? 'text-[#FF84B2] scale-100' : 'text-slate-600 scale-90'
                    }`}
                    fill="currentColor"
                  >
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                );
              })}
            </div>
          </div>

          {/* Axie Continuous Health Bar */}
          <div
            className="w-full h-2.5 sm:h-3 rounded-full bg-[#021c2e] border border-[#39D5D0] overflow-hidden p-0.5"
            data-testid="axie-health-bar"
          >
            <div
              className="h-full rounded-full bg-gradient-to-l from-[#39D5D0] via-[#67E8F9] to-[#FF84B2] transition-all duration-300"
              style={{ width: `${axieHpPercent}%` }}
            />
          </div>
        </div>

        {/* Center Stage Badge & Score */}
        <div className="flex flex-col items-center justify-center px-1 shrink-0">
          <span className="hidden md:inline text-xs font-black text-[#FFD76B] whitespace-nowrap">
            {stageTitle}
          </span>
          <span
            className="text-[11px] sm:text-xs font-black text-[#FFD76B] tabular-nums whitespace-nowrap"
            data-testid="hud-stars-score"
          >
            امتیاز: {state.score}
          </span>
        </div>

        {/* Left Cluster: OctopusBoss / Enemy Health Bar */}
        <div
          className="flex-1 min-w-0 max-w-xs"
          data-testid="enemy-health-cluster"
        >
          <div className="flex items-center justify-between text-[11px] sm:text-xs font-extrabold mb-1 gap-1">
            <span className="text-[#E9D5FF] truncate">{enemyName}</span>
            <span
              dir="ltr"
              className="text-[#FFD76B] tabular-nums shrink-0"
              data-testid="enemy-hp-readout"
            >
              {state.enemyHp}/{state.enemyMaxHp}
            </span>
          </div>
          <div
            className="w-full h-2.5 sm:h-3 rounded-full bg-[#021c2e] border border-[#C084FC] overflow-hidden p-0.5"
            data-testid="boss-health-bar"
          >
            <div
              className="h-full rounded-full bg-gradient-to-l from-[#FF84B2] via-[#9333EA] to-[#FFD76B] transition-all duration-300"
              style={{ width: `${enemyHpPercent}%` }}
            />
          </div>
        </div>

        {/* Utility Icon Buttons (Mute, Pause, Restart, Home) */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.currentTarget.blur();
              onToggleMute();
            }}
            aria-label={isMuted ? 'وصل کردن صدا' : 'بی‌صدا کردن موسیقی'}
            data-testid="hud-mute-btn"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#074268] hover:bg-[#09588a] border border-[#39D5D0]/50 flex items-center justify-center text-[#FFF8EE] cursor-pointer"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-rose-300" />
            ) : (
              <Volume2 className="w-4 h-4 text-[#39D5D0]" />
            )}
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.currentTarget.blur();
              onTogglePause();
            }}
            aria-label={state.phase === 'PAUSED' ? 'ادامهٔ بازی' : 'توقف بازی'}
            data-testid="hud-pause-btn"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#074268] hover:bg-[#09588a] border border-[#39D5D0]/50 flex items-center justify-center text-[#FFF8EE] cursor-pointer"
          >
            {state.phase === 'PAUSED' ? (
              <Play className="w-4 h-4 text-[#FFD76B]" />
            ) : (
              <Pause className="w-4 h-4 text-[#FFF8EE]" />
            )}
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.currentTarget.blur();
              onRestartRound();
            }}
            aria-label="شروع مجدد مرحله"
            data-testid="hud-restart-btn"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#074268] hover:bg-[#09588a] border border-[#39D5D0]/50 flex items-center justify-center text-[#FFF8EE] cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.currentTarget.blur();
              onReturnTitle();
            }}
            aria-label="صفحهٔ آغاز بازی"
            data-testid="hud-home-btn"
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#074268] hover:bg-[#09588a] border border-[#39D5D0]/50 flex items-center justify-center text-[#FFF8EE] cursor-pointer"
          >
            <Home className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Visual Indicator for Boss Special Move / Telegraph */}
      {specialMove && (
        <div className="mt-1.5 flex justify-center pointer-events-none">
          <div
            data-testid="boss-special-move-indicator"
            className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full border-2 text-xs sm:text-sm font-black shadow-lg transition-all ${
              specialMove.tone === 'danger'
                ? 'bg-rose-950/90 border-rose-400 text-rose-100 animate-pulse'
                : 'bg-[#042f4b]/90 border-[#FFD76B] text-[#FFD76B]'
            }`}
          >
            {specialMove.tone === 'danger' ? (
              <AlertTriangle className="w-4 h-4 text-rose-300 shrink-0" />
            ) : (
              <Sparkles className="w-4 h-4 text-[#FFD76B] shrink-0" />
            )}
            <span>{specialMove.label}</span>
          </div>
        </div>
      )}
    </header>
  );
};
