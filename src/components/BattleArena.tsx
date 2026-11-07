import React, { useEffect, useRef, useState } from 'react';
import { Award, Sparkles, Play, RotateCcw, Home, Footprints } from 'lucide-react';
import {
  BossBehaviorState,
  CombatState,
  MicrophoneStatus,
} from '../game/types';
import { getCurrentStepConfig } from '../game/CombatEngine';
import { GameHUD } from './GameHUD';
import { AxieCharacter } from './AxieCharacter';
import { JellyGuardian } from './JellyGuardian';
import { OctopusBoss } from './OctopusBoss';
import { VoiceController } from './VoiceController';
import gateArenaBgUrl from '../assets/images/gate_arena_bg_1793974345937.jpg';
import bossArenaBgUrl from '../assets/images/boss_arena_bg_1793974346072.jpg';

interface BattleArenaProps {
  state: CombatState;
  bossBehaviorState?: BossBehaviorState;
  isMuted: boolean;
  onToggleMute: () => void;
  onTogglePause: () => void;
  onRestartRound: () => void;
  onReturnTitle: () => void;
  onMicStateChange: (status: MicrophoneStatus) => void;
  onFinalTranscript: (transcript: string, isPracticeFallback: boolean) => void;
  onProceedAfterRound1Victory: () => void;
  onToggleBossRange?: () => void;
}

interface AmbientBubble {
  x: number;
  y: number;
  r: number;
  vy: number;
  vx: number;
  alpha: number;
  gold: boolean;
}

export const BattleArena: React.FC<BattleArenaProps> = ({
  state,
  bossBehaviorState = 'APPROACHING_CENTER',
  isMuted,
  onToggleMute,
  onTogglePause,
  onRestartRound,
  onReturnTitle,
  onMicStateChange,
  onFinalTranscript,
  onProceedAfterRound1Victory,
  onToggleBossRange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [micVolume, setMicVolume] = useState<number>(0);
  const [axieSteppedForward, setAxieSteppedForward] = useState<boolean>(false);

  const stepConfig = getCurrentStepConfig(state);
  const isShielding = state.axieAnim === 'Shield';

  // Keep track of smooth forward stride so Axie glides forward and stays forward without snapping back
  useEffect(() => {
    if (state.stepIndex === 0 && state.score === 0 && state.lastExecutedCommand === null) {
      setAxieSteppedForward(false);
    } else if (state.round === 2 && state.bossRange === 'FAR') {
      setAxieSteppedForward(false);
    } else if (
      state.axieAnim === 'WalkForward' ||
      state.lastExecutedCommand === 'MOVE_FORWARD'
    ) {
      setAxieSteppedForward(true);
    }
  }, [
    state.round,
    state.stepIndex,
    state.score,
    state.bossRange,
    state.axieAnim,
    state.lastExecutedCommand,
  ]);

  // Subtle, slow-moving visual bubble particles in the background canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const poolSize = 36;
    const pool: AmbientBubble[] = Array.from({ length: poolSize }, (_, i) => ({
      x: (i * 47) % 800,
      y: (i * 63) % 500,
      r: 2.5 + (i % 6) * 1.4,
      vy: 0.22 + (i % 5) * 0.14,
      vx: ((i % 3) - 1) * 0.15,
      alpha: 0.18 + (i % 5) * 0.08,
      gold: i % 4 === 0,
    }));

    let rafId = 0;
    const resize = () => {
      if (!canvas) return;
      canvas.width = canvas.clientWidth || 800;
      canvas.height = canvas.clientHeight || 450;
    };
    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < poolSize; i++) {
        const b = pool[i];
        b.y -= b.vy;
        b.x += b.vx;
        if (b.y < -20) {
          b.y = canvas.height + 15;
          b.x = (i * 73) % Math.max(200, canvas.width);
        }
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fillStyle = b.gold
          ? `rgba(255, 215, 107, ${b.alpha})`
          : `rgba(165, 243, 252, ${b.alpha})`;
        ctx.fill();
      }
      rafId = requestAnimationFrame(render);
    };
    rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  const bgUrl = state.round === 1 ? gateArenaBgUrl : bossArenaBgUrl;
  const showWaveHazard =
    stepConfig.enemyTelegraphType === 'SMALL_WAVE' ||
    stepConfig.enemyTelegraphType === 'GIANT_WAVE' ||
    state.axieAnim === 'Jump';

  const showFlyingJellyBall =
    state.round === 1 &&
    stepConfig.enemyTelegraphType === 'JELLY_BALL' &&
    state.phase === 'PLAYER_READY';

  const showDeflectedJellyBall =
    state.round === 1 &&
    stepConfig.enemyTelegraphType === 'JELLY_BALL' &&
    isShielding;

  const isMonsterAdvancing =
    state.phase === 'PLAYER_READY' && !state.gateOpened && !state.pearlFreed;

  // Overhead Moving Health Bar for Axie (passed inside AxieCharacter so it moves with Axie's body)
  const axieMovingHealthBar = (
    <div
      className="flex flex-col items-center gap-0.5 whitespace-nowrap"
      data-testid="axie-floating-hp"
    >
      <span className="px-2.5 py-0.5 rounded-full bg-[#042f4b]/90 border border-[#39D5D0]/60 text-[10px] sm:text-xs font-extrabold text-[#A5F3FC] shadow">
        آکسی (شوالیهٔ صدفی)
      </span>
      <div className="w-24 sm:w-28 bg-[#042f4b]/95 border border-[#39D5D0] rounded-full px-1.5 py-0.5 shadow-md">
        <div className="w-full h-1.5 rounded-full bg-[#021c2e] overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-l from-[#39D5D0] to-[#FF84B2] transition-all duration-300"
            style={{
              width: `${Math.round((state.axieHearts / state.axieMaxHearts) * 100)}%`,
            }}
          />
        </div>
      </div>
    </div>
  );

  // Overhead Moving Health Bar for Monster (passed inside JellyGuardian / OctopusBoss so it moves with their body)
  const bossMovingHealthBar = (
    <div
      className="flex flex-col items-center gap-0.5 whitespace-nowrap"
      data-testid="boss-floating-hp"
    >
      <span className="px-2.5 py-0.5 rounded-full bg-[#2E1065]/90 border border-[#C084FC]/60 text-[10px] sm:text-xs font-extrabold text-[#E9D5FF] shadow">
        {state.round === 1 ? 'ژله‌خان (نگهبان دروازه)' : 'هشت‌پا (هیولای سکوت)'}
      </span>
      <div className="w-28 sm:w-32 bg-[#2E1065]/95 border border-[#C084FC] rounded-full px-2 py-0.5 shadow-md flex items-center gap-1.5">
        <div className="flex-1 h-1.5 rounded-full bg-[#021c2e] overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-l from-[#FF84B2] via-[#9333EA] to-[#FFD76B] transition-all duration-300"
            style={{
              width: `${Math.max(0, Math.round((state.enemyHp / state.enemyMaxHp) * 100))}%`,
            }}
          />
        </div>
        <span className="text-[10px] font-black text-[#FFD76B] tabular-nums" dir="ltr">
          {state.enemyHp}%
        </span>
      </div>
    </div>
  );

  return (
    <div
      className="relative w-full h-screen max-h-screen overflow-hidden flex flex-col justify-between bg-[#042f4b] select-none"
      data-testid={`battle-arena-round-${state.round}`}
    >
      {/* Stationary Background Key Art + Underwater Canvas Layer ("موقع جلو رفتن محیط یکسان باشه") */}
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden"
        data-testid="underwater-bubble-bg-container"
      >
        <img
          src={bgUrl}
          alt={state.round === 1 ? 'دروازهٔ صدفی' : 'تالار مرجانی هشت‌پا'}
          referrerPolicy="no-referrer"
          data-testid="arena-scenery-bg"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#042f4b]/65 via-transparent to-[#042f4b]/55" />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
          data-testid="ambient-bubbles-canvas"
        />
      </div>

      {/* Zone 1: Top Absolute HUD with Volume Meter */}
      <GameHUD
        state={state}
        micVolume={micVolume}
        micStatus={state.micStatus}
        isMuted={isMuted}
        onToggleMute={onToggleMute}
        onTogglePause={onTogglePause}
        onRestartRound={onRestartRound}
        onReturnTitle={onReturnTitle}
      />

      {/* Zone 2: Ground-Anchored Playfield — Creatures stand directly on the sandy ocean floor & Wave rolls along the ground */}
      <main className="relative z-10 flex-1 w-full max-w-4xl mx-auto px-3 sm:px-4 pt-20 sm:pt-24 pb-1 sm:pb-3 flex flex-col justify-end overflow-hidden pointer-events-none">
        {/* Round 2 Distance Indicator & Toggle (Near vs Far Dodge Mechanic) */}
        {state.round === 2 && state.phase !== 'VICTORY' && (
          <div className="w-full flex justify-center mb-1.5 pointer-events-auto">
            <button
              type="button"
              onClick={onToggleBossRange}
              data-testid="boss-range-toggle"
              data-boss-range={state.bossRange}
              className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-black border transition-all cursor-pointer shadow ${
                state.bossRange === 'NEAR'
                  ? 'bg-emerald-950/90 border-emerald-400 text-emerald-200'
                  : 'bg-amber-950/90 border-[#FFD76B] text-[#FFD76B] animate-pulse'
              }`}
            >
              <Footprints className="w-3.5 h-3.5" />
              <span>
                فاصله با هشت‌پا:{' '}
                {state.bossRange === 'NEAR'
                  ? 'نزدیک (آمادهٔ ضربه!)'
                  : 'دور (بگو «برو جلو» تا جا خالی نده!)'}
              </span>
            </button>
          </div>
        )}

        {/* Single Unified Text Speech Bubble for Enemy */}
        {stepConfig.enemyDialogue && (
          <div className="w-full flex justify-center mb-4 sm:mb-6 px-2">
            <div
              className="relative max-w-xl rounded-2xl bg-[#2E1065]/92 border-2 border-[#C084FC] px-4 py-2 text-xs sm:text-sm md:text-base font-extrabold text-[#FFF8EE] shadow-xl text-right"
              data-testid="enemy-dialogue-bubble"
            >
              <span>
                «
                {state.phase === 'PLAYER_ACTION' && stepConfig.enemyReactionReply
                  ? stepConfig.enemyReactionReply
                  : stepConfig.enemyDialogue}
                »
              </span>
              <div className="absolute -bottom-2.5 left-12 w-4 h-4 bg-[#2E1065] border-b-2 border-l-2 border-[#C084FC] rotate-[-45deg]" />
            </div>
          </div>
        )}

        {/* Ground Stage Floor — Both Axie and the Monster stand directly on the sandy ground in close melee reach */}
        <div
          className="relative w-full max-w-2xl mx-auto flex items-end justify-center gap-0 pt-4 pb-0"
          data-testid="arena-ground-stage"
        >
          {/* Natural Ground Contact Shadow on the Painted Sandy Seabed */}
          <div
            className="absolute bottom-0 inset-x-8 sm:inset-x-12 h-4 rounded-full bg-[#021827]/45 blur-[2px] z-10 pointer-events-none"
            data-testid="seabed-ground-floor"
          />

          {/* Right Side (in RTL): Axie Character with Smooth Persistent Forward Stride (no snap-back!) */}
          <div
            className={`relative flex flex-col items-center justify-end z-30 -ml-3 sm:-ml-5 transition-transform duration-500 ease-out ${
              state.round === 2 && state.bossRange === 'FAR'
                ? 'translate-x-6 sm:translate-x-10'
                : axieSteppedForward
                ? '-translate-x-8 sm:-translate-x-12'
                : '-translate-x-2 sm:-translate-x-4'
            }`}
            data-testid="axie-ground-position"
          >
            <AxieCharacter
              animation={state.axieAnim}
              swordGlowingGold={state.bubblePowerUnlocked}
              comboCount={state.comboCount}
              comboMultiplier={state.comboMultiplier}
              floatingHealthBar={axieMovingHealthBar}
            />
          </div>

          {/* Tight Center Clash Zone between Axie and Monster (for Jelly-Ball projectiles) */}
          <div className="relative flex items-center justify-center w-2 sm:w-4 h-32 z-30">
            {showFlyingJellyBall && (
              <div
                className="w-11 h-11 rounded-full bg-gradient-to-br from-[#FFF8EE] via-[#FF84B2] to-[#9333EA] border-4 border-white shadow-[0_0_25px_#FF84B2] animate-projectile-attack"
                data-testid="flying-jelly-ball"
              />
            )}

            {showDeflectedJellyBall && (
              <div
                className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FFF8EE] via-[#39D5D0] to-[#FF84B2] border-4 border-[#FFD76B] shadow-[0_0_30px_#39D5D0] animate-projectile-deflect"
                data-testid="deflected-jelly-ball"
              />
            )}
          </div>

          {/* Left Side (in RTL): Monster with Smooth Ground Position (no sudden horizontal jumps when hit!) */}
          <div
            className={`relative flex flex-col items-center justify-end z-20 -mr-3 sm:-mr-5 transition-transform duration-500 ease-out ${
              state.round === 2 && state.bossRange === 'FAR'
                ? '-translate-x-10 sm:-translate-x-16'
                : 'translate-x-0'
            }`}
            data-testid="monster-ground-position"
          >
            {/* Prominent Close-Up Impact Damage Callout directly on the Monster */}
            {state.lastFloatingDamage !== null && (
              <div
                className="absolute -top-14 left-1/2 -translate-x-1/2 z-40 px-4 py-1 rounded-2xl bg-[#FFD76B] border-2 border-white text-[#042f4b] font-display text-xl sm:text-2xl shadow-[0_0_30px_#FFD76B] animate-pulse whitespace-nowrap tabular-nums"
                data-testid="floating-damage-number"
              >
                💥 ضربه! -{state.lastFloatingDamage}
              </div>
            )}

            {state.round === 1 ? (
              <JellyGuardian
                animation={state.jellyAnim}
                isAdvancingToAttack={isMonsterAdvancing}
                floatingHealthBar={bossMovingHealthBar}
              />
            ) : (
              <OctopusBoss
                animation={state.octopusAnim}
                bossBehaviorState={bossBehaviorState}
                pearlFreed={state.pearlFreed}
                isAdvancingToAttack={isMonsterAdvancing}
                floatingHealthBar={bossMovingHealthBar}
              />
            )}
          </div>

          {/* Ground-Hugging Curling Ocean Wave rolling strictly along the seabed floor from Monster to Axie */}
          {showWaveHazard && (
            <div
              className="absolute bottom-1 inset-x-4 sm:inset-x-10 h-20 sm:h-24 z-30 pointer-events-none flex items-end justify-center"
              data-testid="wave-hazard-fx"
            >
              <svg
                viewBox="0 0 420 112"
                preserveAspectRatio="none"
                className="w-72 sm:w-96 h-full drop-shadow-[0_0_18px_rgba(57,213,208,0.85)] overflow-visible animate-wave-sweep"
                role="img"
                aria-label="موج خروشان دریایی روی زمین"
              >
                <defs>
                  <linearGradient id="oceanWaveBodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#67E8F9" />
                    <stop offset="45%" stopColor="#06B6D4" />
                    <stop offset="85%" stopColor="#087EB7" />
                    <stop offset="100%" stopColor="#063b5c" />
                  </linearGradient>
                  <linearGradient id="oceanWaveBackGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#39D5D0" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="#03486C" stopOpacity="0.95" />
                  </linearGradient>
                </defs>

                <path
                  d="M 10 110 Q 55 58 115 72 T 230 50 Q 290 34 330 68 Q 375 95 410 110 Z"
                  fill="url(#oceanWaveBackGrad)"
                />

                <path
                  d="M 0 110 C 45 104, 85 45, 150 32 C 205 20, 260 12, 295 36 C 318 52, 292 78, 268 68 C 254 62, 262 46, 278 48 C 250 36, 200 54, 175 78 C 225 76, 285 52, 345 42 C 378 36, 398 54, 380 72 C 398 84, 412 100, 420 110 Z"
                  fill="url(#oceanWaveBodyGrad)"
                  stroke="#E0F7FA"
                  strokeWidth="2.5"
                />

                <path
                  d="M -6 110 Q 105 103 210 109 T 426 110"
                  stroke="#FFF8EE"
                  strokeWidth="5"
                  strokeLinecap="round"
                  fill="none"
                  opacity="0.92"
                />

                <path
                  d="M 132 36 Q 215 12 296 34 C 316 44, 304 68, 276 64 C 292 54, 284 40, 255 38 Q 195 32 132 36 Z"
                  fill="#FFF8EE"
                  opacity="0.95"
                />
                <path
                  d="M 290 54 Q 345 32 384 48 C 396 56, 386 72, 368 68 C 378 60, 372 50, 350 50 Z"
                  fill="#FFF8EE"
                  opacity="0.92"
                />

                <path
                  d="M 55 98 Q 135 55 215 62"
                  stroke="#E0F7FA"
                  strokeWidth="3"
                  strokeLinecap="round"
                  fill="none"
                  opacity="0.75"
                />
                <path
                  d="M 160 98 Q 255 68 345 78"
                  stroke="#A5F3FC"
                  strokeWidth="3"
                  strokeLinecap="round"
                  fill="none"
                  opacity="0.7"
                />

                <circle cx="316" cy="24" r="6" fill="#FFF8EE" />
                <circle cx="334" cy="34" r="4.5" fill="#A5F3FC" />
                <circle cx="298" cy="16" r="4" fill="#E0F7FA" />
                <circle cx="394" cy="36" r="5.5" fill="#FFF8EE" />
                <circle cx="406" cy="52" r="3.5" fill="#A5F3FC" />
                <circle cx="242" cy="18" r="5" fill="#FFF8EE" />
              </svg>
            </div>
          )}
        </div>
      </main>

      {/* Zone 3: Bottom Cohesive Story & Voice Controller */}
      <VoiceController
        expectedCommand={
          state.round === 2 && state.bossRange === 'FAR'
            ? 'MOVE_FORWARD'
            : stepConfig.expectedCommand
        }
        bubblePowerUnlocked={state.bubblePowerUnlocked}
        difficulty={state.difficulty}
        disabled={
          state.phase === 'PLAYER_ACTION' ||
          state.phase === 'PAUSED' ||
          state.phase === 'ROUND_COMPLETE'
        }
        lastRecognizedText={state.lastRecognizedText}
        feedbackMessage={state.lastFeedbackMessage}
        showSttDiagram={state.showSttDiagram}
        onMicStateChange={onMicStateChange}
        onVolumeChange={setMicVolume}
        onFinalTranscript={onFinalTranscript}
      />

      {/* Round 1 Completion Celebration Modal ("فرماندهٔ صدا") */}
      {state.phase === 'ROUND_COMPLETE' && (
        <div
          className="fixed inset-0 z-40 bg-[#021827]/85 flex items-center justify-center p-4 pointer-events-auto"
          data-testid="round1-victory-modal"
        >
          <div className="w-full max-w-md rounded-3xl bg-[#042f4b] border-2 border-[#FFD76B] shadow-2xl p-6 text-center">
            <div className="flex justify-center gap-2 text-3xl text-[#FFD76B] mb-2">
              <span>★</span>
              <span>★</span>
              <span>★</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FFD76B]/20 border border-[#FFD76B] text-[#FFD76B] text-xs font-black mb-3">
              <Award className="w-4 h-4" />
              <span>مدال «فرماندهٔ صدا» دریافت شد!</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-display text-[#FFF8EE] mb-2">
              هورا! دروازهٔ صدفی باز شد!
            </h2>
            <p className="text-sm text-[#A5F3FC] font-semibold mb-5 leading-relaxed">
              ژله‌خان با حرکت فنری کنار رفت و مسیر تالار اصلی قلعه باز شد! حالا بریم تا مروارید صدا رو از هشت‌پا پس بگیریم!
            </p>

            <button
              type="button"
              onClick={onProceedAfterRound1Victory}
              data-testid="proceed-to-midstory-btn"
              className="w-full py-3.5 rounded-2xl bg-[#FFD76B] hover:bg-amber-300 text-[#042f4b] font-black text-base shadow-[0_5px_0_#B45309] flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-5 h-5" />
              <span>بریم سراغ هشت‌پا!</span>
            </button>
          </div>
        </div>
      )}

      {/* Pause Modal */}
      {state.phase === 'PAUSED' && (
        <div
          className="fixed inset-0 z-40 bg-[#021827]/85 flex items-center justify-center p-4 pointer-events-auto"
          data-testid="pause-modal"
        >
          <div className="w-full max-w-sm rounded-3xl bg-[#042f4b] border-2 border-[#39D5D0] shadow-2xl p-6 text-center space-y-4">
            <h2 className="text-2xl font-display text-[#FFD76B]">توقف بازی</h2>
            <p className="text-xs sm:text-sm text-[#A5F3FC] font-medium">
              هر وقت آماده بودی دوباره برگرد تا قلعهٔ مرجانی رو نجات بدیم!
            </p>
            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={onTogglePause}
                data-testid="resume-game-btn"
                className="w-full py-3 rounded-2xl bg-[#FFD76B] text-[#042f4b] font-black text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>ادامهٔ بازی</span>
              </button>
              <button
                type="button"
                onClick={onRestartRound}
                className="w-full py-3 rounded-2xl bg-[#39D5D0] text-[#042f4b] font-black text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>شروع دوبارهٔ این مرحله</span>
              </button>
              <button
                type="button"
                onClick={onReturnTitle}
                className="w-full py-3 rounded-2xl bg-[#074268] text-[#FFF8EE] font-bold text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>بازگشت به صفحهٔ اول</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
