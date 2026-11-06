import React, { useState, useEffect, useCallback } from 'react';
import { Play, HelpCircle, Compass, X, Mic, Sparkles, Shield, ArrowUp } from 'lucide-react';
import {
  BossBehaviorState,
  CombatState,
  GameProgress,
  GameScreen,
  MicrophoneStatus,
} from '../game/types';
import {
  createInitialCombatState,
  evaluateFinalSpeechCommand,
  advanceAfterPlayerAction,
} from '../game/CombatEngine';
import {
  loadGameProgress,
  saveGameProgress,
} from '../game/ProgressManager';
import { gameAudio } from '../game/GameAudioManager';
import { AxieCharacter } from './AxieCharacter';
import { OctopusBoss } from './OctopusBoss';
import { StoryScene } from './StoryScene';
import { BattleArena } from './BattleArena';
import { LearningQuiz } from './LearningQuiz';
import { DelfinaHub } from './DelfinaHub';
import titleBgUrl from '../assets/images/title_bg_1793974344182.jpg';

export const SeaKnightGame: React.FC = () => {
  const [progress, setProgress] = useState<GameProgress>(() => loadGameProgress());
  const [screen, setScreen] = useState<GameScreen>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('autostart') === '1') {
        return 'ROUND_1';
      }
      if (window.location.hash === '#/games' || window.location.hash === '#/world') {
        return 'DELFINA_HUB';
      }
    }
    return 'TITLE';
  });

  const [combatState, setCombatState] = useState<CombatState>(() =>
    createInitialCombatState(1, 'easy')
  );
  const [bossBehaviorState, setBossBehaviorState] =
    useState<BossBehaviorState>('APPROACHING_CENTER');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showHowToPlayModal, setShowHowToPlayModal] = useState<boolean>(false);

  // Sync document.body.dataset.state for automated game verification
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (screen === 'TITLE' || screen === 'DELFINA_HUB') {
      document.body.dataset.state = 'title';
    } else if (combatState.phase === 'PAUSED') {
      document.body.dataset.state = 'paused';
    } else if (screen === 'QUIZ' || screen === 'LEARNING_SUMMARY') {
      document.body.dataset.state = 'gameover';
    } else {
      document.body.dataset.state = 'playing';
    }
  }, [screen, combatState.phase]);

  // Dynamic OctopusBoss State Machine: transitions from APPROACHING_CENTER -> TELEGRAPHING_ATTACK -> HIT_RECOIL / DIZZY_STAGGER / BUBBLE_TRAPPED / DEFEATED
  useEffect(() => {
    if (combatState.pearlFreed || combatState.octopusAnim === 'HealedHappy') {
      setBossBehaviorState('DEFEATED');
      return;
    }
    if (combatState.octopusAnim === 'TrappedInBubble') {
      setBossBehaviorState('BUBBLE_TRAPPED');
      return;
    }
    if (combatState.octopusAnim === 'Hit' || combatState.jellyAnim === 'Hit') {
      setBossBehaviorState('HIT_RECOIL');
      return;
    }
    if (combatState.octopusAnim === 'Dizzy') {
      setBossBehaviorState('DIZZY_STAGGER');
      return;
    }

    // When a new step becomes PLAYER_READY, boss first approaches center then telegraphs its attack
    setBossBehaviorState('APPROACHING_CENTER');
    const telegraphTimer = window.setTimeout(() => {
      if (
        combatState.octopusAnim === 'TelegraphTentacle' ||
        combatState.octopusAnim === 'TelegraphWave' ||
        combatState.jellyAnim === 'TelegraphBall' ||
        combatState.jellyAnim === 'TelegraphWave' ||
        combatState.phase === 'PLAYER_READY'
      ) {
        setBossBehaviorState('TELEGRAPHING_ATTACK');
      }
    }, 320);

    return () => window.clearTimeout(telegraphTimer);
  }, [
    combatState.round,
    combatState.stepIndex,
    combatState.phase,
    combatState.octopusAnim,
    combatState.jellyAnim,
    combatState.pearlFreed,
  ]);

  const startAdventureFromTitle = useCallback(() => {
    gameAudio.playClick();
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    setCombatState(createInitialCombatState(1, 'easy'));
    setScreen('INTRO_STORY');
  }, []);

  // Keyboard shortcuts on Title Screen (Enter/Space to Start, Escape/P to Pause in Battle)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (screen === 'TITLE' && !showHowToPlayModal && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        startAdventureFromTitle();
      } else if (
        (screen === 'ROUND_1' || screen === 'ROUND_2') &&
        (e.key === 'Escape' || e.key === 'p' || e.key === 'P')
      ) {
        e.preventDefault();
        setCombatState((prev) => ({
          ...prev,
          phase: prev.phase === 'PAUSED' ? 'PLAYER_READY' : 'PAUSED',
        }));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [screen, showHowToPlayModal, startAdventureFromTitle]);

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    gameAudio.setMuted(nextMuted);
  };

  const handleTogglePause = () => {
    gameAudio.playClick();
    setCombatState((prev) => ({
      ...prev,
      phase: prev.phase === 'PAUSED' ? 'PLAYER_READY' : 'PAUSED',
    }));
  };

  const handleRestartRound = () => {
    gameAudio.playClick();
    setCombatState(createInitialCombatState(combatState.round, 'easy'));
  };

  const handleMicStateChange = useCallback((status: MicrophoneStatus) => {
    setCombatState((prev) => {
      if (prev.phase === 'PLAYER_ACTION' || prev.phase === 'ROUND_COMPLETE' || prev.phase === 'VICTORY') {
        return prev;
      }
      if (status === 'LISTENING') {
        return { ...prev, axieAnim: 'Listening' };
      }
      if (status === 'PROCESSING') {
        return { ...prev, axieAnim: 'Thinking' };
      }
      return prev;
    });
  }, []);

  const handleFinalTranscript = useCallback(
    (transcript: string, _isPracticeFallback: boolean) => {
      setCombatState((prev) => {
        const outcome = evaluateFinalSpeechCommand(prev, transcript);

        if (!outcome.accepted) {
          gameAudio.playUnknownCommand();
          return outcome.nextState;
        }

        // Play matching sound effect for the executed voice command
        if (outcome.parsedCommand === 'ATTACK') {
          gameAudio.playSwordAttack();
          setBossBehaviorState('HIT_RECOIL');
        } else if (outcome.parsedCommand === 'SHIELD') {
          gameAudio.playShieldPing();
        } else if (outcome.parsedCommand === 'JUMP') {
          gameAudio.playJump();
        } else if (outcome.parsedCommand === 'BUBBLE_POWER') {
          gameAudio.playBubblePower();
          setBossBehaviorState('BUBBLE_TRAPPED');
        }

        // Schedule step progression after character animation completes
        setTimeout(() => {
          setCombatState((afterActionState) => {
            const advanced = advanceAfterPlayerAction(afterActionState);

            if (advanced.phase === 'ROUND_COMPLETE') {
              gameAudio.playGateOpen();
              const updated = saveGameProgress({
                round1Completed: true,
                starsRound1: 3,
                bestScore: advanced.score,
                medals: ['VOICE_COMMANDER'],
              });
              setProgress(updated);
            } else if (advanced.phase === 'VICTORY') {
              gameAudio.playVictoryFanfare();
              const updated = saveGameProgress({
                round2Completed: true,
                starsRound2: 3,
                bestScore: advanced.score,
                medals: ['VOICE_COMMANDER'],
              });
              setProgress(updated);
              setTimeout(() => {
                setScreen('ENDING_STORY');
              }, 1150);
            }
            return advanced;
          });
        }, 1250);

        return outcome.nextState;
      });
    },
    []
  );

  // Render active screen
  if (screen === 'DELFINA_HUB') {
    return (
      <DelfinaHub
        progress={progress}
        onLaunchSeaKnight={() => {
          gameAudio.playClick();
          setScreen('TITLE');
        }}
        onLaunchRound2Directly={() => {
          gameAudio.playClick();
          setCombatState(createInitialCombatState(2, 'easy'));
          setScreen('ROUND_2');
        }}
      />
    );
  }

  if (screen === 'INTRO_STORY') {
    return (
      <StoryScene
        mode="INTRO"
        onComplete={() => {
          const updated = saveGameProgress({ introSeen: true });
          setProgress(updated);
          setCombatState(createInitialCombatState(1, 'easy'));
          setScreen('ROUND_1');
        }}
      />
    );
  }

  if (screen === 'MID_BRIDGE' as GameScreen || screen === 'MID_STORY') {
    return (
      <StoryScene
        mode="MID_BRIDGE"
        onComplete={() => {
          const r2State = createInitialCombatState(2, 'easy');
          r2State.score = combatState.score;
          setCombatState(r2State);
          setScreen('ROUND_2');
        }}
      />
    );
  }

  if (screen === 'ENDING_STORY') {
    return (
      <StoryScene
        mode="ENDING"
        onComplete={() => {
          setScreen('LEARNING_SUMMARY');
        }}
      />
    );
  }

  if (screen === 'LEARNING_SUMMARY' || screen === 'QUIZ') {
    return (
      <LearningQuiz
        mode={screen === 'LEARNING_SUMMARY' ? 'SUMMARY' : 'QUIZ'}
        score={combatState.score}
        onFinishSummary={() => setScreen('QUIZ')}
        onCompleteQuiz={() => {
          const updated = saveGameProgress({
            quizCompleted: true,
            medals: ['VOICE_COMMANDER', 'MAGIC_VOICE_HERO'],
            bestScore: combatState.score + 20,
          });
          setProgress(updated);
        }}
        onPlayAgain={() => {
          setCombatState(createInitialCombatState(1, 'easy'));
          setScreen('ROUND_1');
        }}
        onOpenDelfinaHub={() => {
          setScreen('DELFINA_HUB');
        }}
      />
    );
  }

  if (screen === 'ROUND_1' || screen === 'ROUND_2') {
    return (
      <BattleArena
        state={combatState}
        bossBehaviorState={bossBehaviorState}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onTogglePause={handleTogglePause}
        onRestartRound={handleRestartRound}
        onReturnTitle={() => setScreen('TITLE')}
        onMicStateChange={handleMicStateChange}
        onFinalTranscript={handleFinalTranscript}
        onProceedAfterRound1Victory={() => {
          gameAudio.playClick();
          setScreen('MID_STORY');
        }}
      />
    );
  }

  // Default: Game Cover / Title Screen (No difficulty selector as requested)
  return (
    <div
      className="relative w-full min-h-screen overflow-hidden flex flex-col justify-between bg-[#042f4b] select-none"
      data-testid="title-screen"
    >
      {/* Key-Art Underwater Castle Backdrop */}
      <div className="absolute inset-0 pointer-events-none">
        <img
          src={titleBgUrl}
          alt="قلعهٔ مرجانی در اعماق اقیانوس"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
        />
        {/* Negative-space scrim on right/top for high-contrast Persian title typography */}
        <div className="absolute inset-0 bg-gradient-to-l from-[#031d30]/92 via-[#042f4b]/65 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#031d30]/90 via-transparent to-[#031d30]/40" />
      </div>

      {/* Main Asymmetric Split Content */}
      <main className="relative z-10 flex-1 w-full max-w-6xl mx-auto px-5 sm:px-8 py-6 flex flex-col lg:flex-row items-center justify-between gap-6">
        {/* Right Column (in RTL): Custom Inline SVG Title Lockup & 3 Primary Buttons over Negative Space */}
        <div className="w-full lg:w-7/12 text-right space-y-5">
          {/* Bespoke Inline SVG Title Emblem Lockup */}
          <div className="w-full max-w-xl">
            <svg
              viewBox="0 0 560 135"
              className="w-full h-auto drop-shadow-[0_8px_20px_rgba(0,0,0,0.6)]"
              role="img"
              aria-label="شوالیهٔ صدفی و هیولای سکوت"
            >
              <defs>
                <linearGradient id="titleGoldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FFF8EE" />
                  <stop offset="50%" stopColor="#FFD76B" />
                  <stop offset="100%" stopColor="#F59E0B" />
                </linearGradient>
                <linearGradient id="titleCyanGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#A5F3FC" />
                  <stop offset="100%" stopColor="#39D5D0" />
                </linearGradient>
              </defs>
              {/* Decorative Seashell Crest Frame */}
              <path
                d="M 16 26 Q 280 2 544 26 L 534 114 Q 280 130 26 114 Z"
                fill="rgba(4, 47, 75, 0.78)"
                stroke="url(#titleCyanGrad)"
                strokeWidth="3.5"
              />
              <circle cx="520" cy="40" r="8" fill="#FFD76B" />
              <circle cx="40" cy="40" r="8" fill="#39D5D0" />
              <text
                x="280"
                y="68"
                textAnchor="middle"
                fill="url(#titleGoldGrad)"
                fontFamily="Lalezar, Vazirmatn, sans-serif"
                fontSize="40"
                fontWeight="900"
              >
                شوالیهٔ صدفی و هیولای سکوت
              </text>
              <text
                x="280"
                y="102"
                textAnchor="middle"
                fill="#A5F3FC"
                fontFamily="Vazirmatn, sans-serif"
                fontSize="18"
                fontWeight="800"
              >
                صدات رو به آکسی برسون، قلعهٔ دریا رو نجات بده!
              </text>
            </svg>
          </div>

          <p className="text-base sm:text-xl font-extrabold text-[#FFF8EE] max-w-xl leading-relaxed">
            با صدات بجنگ و مروارید جادویی رو نجات بده! در این ماجراجویی زیرآبی، زره آکسی با فرمان‌های صوتی فارسی تو کار می‌کنه.
          </p>

          {/* 3 Large, Rounded, Finger-Friendly Action Buttons (Section 7) */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
            <button
              type="button"
              data-start="true"
              onClick={startAdventureFromTitle}
              data-testid="start-adventure-btn"
              className="px-7 py-4 rounded-3xl bg-[#FFD76B] hover:bg-amber-300 text-[#042f4b] font-black text-lg sm:text-xl shadow-[0_6px_0_#B45309] active:translate-y-0.5 transition-all flex items-center justify-center gap-2.5 cursor-pointer whitespace-nowrap"
            >
              <Play className="w-6 h-6 fill-current" />
              <span>شروع ماجراجویی</span>
            </button>

            <button
              type="button"
              onClick={() => {
                gameAudio.playClick();
                setShowHowToPlayModal(true);
              }}
              data-testid="how-to-play-btn"
              className="px-5 py-4 rounded-3xl bg-[#39D5D0] hover:bg-[#67E8F9] text-[#042f4b] font-black text-base shadow-[0_6px_0_#087EB7] active:translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <HelpCircle className="w-5 h-5" />
              <span>چطوری بازی کنم؟</span>
            </button>

            <button
              type="button"
              onClick={() => {
                gameAudio.playClick();
                setScreen('DELFINA_HUB');
              }}
              data-testid="back-to-delfina-btn"
              className="px-5 py-4 rounded-3xl bg-[#074268]/95 hover:bg-[#095382] border-2 border-[#A5F3FC]/60 text-[#FFF8EE] font-extrabold text-base transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <Compass className="w-5 h-5 text-[#FFD76B]" />
              <span>بازگشت به دلفینا</span>
            </button>
          </div>
        </div>

        {/* Left Column (in RTL): Hero Characters Showcase (Axie in Foreground, Octopus Boss in Distance) */}
        <div className="w-full lg:w-5/12 flex items-center justify-center relative py-4">
          {/* Octopus Boss in the distance */}
          <div className="opacity-90 scale-75 sm:scale-90 -ml-10 -mt-12">
            <OctopusBoss animation="Laugh" />
          </div>
          {/* Axie Hero in the foreground */}
          <div className="z-10 -mr-6 mt-8">
            <AxieCharacter animation="Greeting" swordGlowingGold />
          </div>
        </div>
      </main>

      {/* Single Flat Borderless Control-Hint Line in Bottom Safe Margin */}
      <footer className="relative z-10 w-full text-center pb-4 px-4 text-xs sm:text-sm text-[#A5F3FC] font-medium">
        فرمان‌های صوتی: «حمله کن» · «سپر بگیر» · «بپر بکن» · «قدرت حبابی» · کلید Enter یا Space برای شروع · Esc برای توقف
      </footer>

      {/* How-To-Play Modal ("چطوری بازی کنم؟") */}
      {showHowToPlayModal && (
        <div
          className="fixed inset-0 z-50 bg-[#021827]/85 flex items-center justify-center p-4"
          data-testid="how-to-play-modal"
        >
          <div className="w-full max-w-lg rounded-3xl bg-[#042f4b] border-2 border-[#39D5D0] shadow-2xl p-6 text-right space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-display text-[#FFD76B]">
                چطوری با صدام بازی کنم؟
              </h2>
              <button
                type="button"
                onClick={() => setShowHowToPlayModal(false)}
                aria-label="بستن راهنما"
                data-testid="close-howto-btn"
                className="w-9 h-9 rounded-xl bg-[#074268] text-[#FFF8EE] flex items-center justify-center cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-[#A5F3FC] leading-relaxed">
              زره جادوییِ آکسی به صدای تو (حتی با صدای آروم و یواش) گوش میده! هر نوبت روی دکمهٔ بزرگ میکروفون بزن و یکی از این فرمان‌های فارسی رو بگو:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
              <div className="p-3 rounded-2xl bg-[#074268] border border-[#39D5D0]/50 flex items-center gap-2.5">
                <Mic className="w-5 h-5 text-[#FFD76B] shrink-0" />
                <div>
                  <div className="font-black text-[#FFD76B]">«حمله کن!»</div>
                  <div className="text-[#A5F3FC]">ضربه با شمشیر مرجانی</div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-[#074268] border border-[#39D5D0]/50 flex items-center gap-2.5">
                <Shield className="w-5 h-5 text-[#39D5D0] shrink-0" />
                <div>
                  <div className="font-black text-[#39D5D0]">«سپر بگیر!»</div>
                  <div className="text-[#A5F3FC]">دفاع در برابر توپ و شاخک</div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-[#074268] border border-[#39D5D0]/50 flex items-center gap-2.5">
                <ArrowUp className="w-5 h-5 text-[#FF84B2] shrink-0" />
                <div>
                  <div className="font-black text-[#FF84B2]">«بپر بکن!»</div>
                  <div className="text-[#A5F3FC]">پرش از روی موج‌های دریایی</div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-[#074268] border border-[#39D5D0]/50 flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-amber-300 shrink-0" />
                <div>
                  <div className="font-black text-amber-300">«قدرت حبابی!»</div>
                  <div className="text-[#A5F3FC]">ضربهٔ ویژه وقتی شمشیر طلایی شد</div>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowHowToPlayModal(false);
                  startAdventureFromTitle();
                }}
                className="px-6 py-2.5 rounded-2xl bg-[#FFD76B] text-[#042f4b] font-black text-sm cursor-pointer"
              >
                یاد گرفتم! بزن بریم!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
