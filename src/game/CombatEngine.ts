import { parseVoiceCommand, getCanonicalCommandLabel } from './CommandParser';
import {
  CombatState,
  CombatStepConfig,
  DifficultyMode,
  VoiceCommandType,
} from './types';

export const ROUND_1_STEPS: CombatStepConfig[] = [
  {
    stepIndex: 0,
    title: 'دروازهٔ صدفی',
    expectedCommand: 'ATTACK',
    axiePrompt:
      'قهرمانِ من، ژله‌خان اومده جلو تا راهمون به قلعه رو ببنده! توی میکروفون بگو «حمله کن» تا با شمشیر مرجانی عقبش بزنیم!',
    enemyDialogue:
      'بوووینگ! من نگهبان دروازهٔ صدفیم! الان میام جلو تا نذارم وارد قلعه بشین!',
    tutorialHint: 'حمله کن',
    enemyTelegraphType: 'NONE',
    damageToEnemy: 50,
    axieSuccessReply:
      'آفرین! گفتی «حمله کن» و صدای تو به نوشته تبدیل شد و شمشیرم درخشید!',
    enemyReactionReply: 'واااو! شمشیرت با صدای قهرمان روشن شد و منو عقب زد!',
    showSttPipelineDiagram: true,
  },
  {
    stepIndex: 1,
    title: 'دروازهٔ صدفی',
    expectedCommand: 'SHIELD',
    axiePrompt:
      'شمشیرم بیدار شد! اما ببین، ژله‌خان دوباره اومد جلو و داره به سمتمون توپ ژله‌ای پرت می‌کنه! زود بگو «سپر بگیر» تا جلوشو بگیریم!',
    enemyDialogue:
      'فکر کردین به همین راحتی رد میشین؟ حالا میام جلو و بهتون توپ ژله‌ای پرت می‌کنم!',
    tutorialHint: 'سپر بگیر',
    enemyTelegraphType: 'JELLY_BALL',
    damageToEnemy: 0,
    axieSuccessReply:
      'عالی بود! گفتی «سپر بگیر» و توپ ژله‌ایش به سپر صدفی خورد و برگشت!',
    enemyReactionReply: 'پینگ! توپ ژله‌ایم خورد به سپر صدفیت و برگشت طرف خودم!',
    showSttPipelineDiagram: false,
  },
  {
    stepIndex: 2,
    title: 'دروازهٔ صدفی',
    expectedCommand: 'JUMP',
    axiePrompt:
      'ایول، توپش رو دفع کردیم! وای، حالا ژله‌خان کف دریا رو کوبید و یه موج خروشان داره میاد سمتمون! بگو «بپر بکن» تا از روی موج بپریم!',
    enemyDialogue:
      'حالا که توپم نگرفت، خودم میام جلو و یه موج دریایی می‌فرستم زیر پاتون!',
    tutorialHint: 'بپر بکن',
    enemyTelegraphType: 'SMALL_WAVE',
    damageToEnemy: 0,
    axieSuccessReply:
      'چه پرش بلندی! با صدای تو از روی موجِ ژله‌خان پریدیم!',
    enemyReactionReply: 'عجب پرشی! موج از زیر پاتون رد شد!',
    showSttPipelineDiagram: false,
  },
  {
    stepIndex: 3,
    title: 'دروازهٔ صدفی',
    expectedCommand: 'ATTACK',
    axiePrompt:
      'از موج هم گذشتیم و ژله‌خان خسته شده! یه بار دیگه بگو «حمله کن» تا کنار بره و دروازهٔ قلعه باز بشه!',
    enemyDialogue:
      'نفسَم گرفت! اگه یه بار دیگه اون شمشیر مرجانی بدرخشه، دروازه رو باز می‌کنم!',
    tutorialHint: 'حمله کن',
    enemyTelegraphType: 'NONE',
    damageToEnemy: 50,
    axieSuccessReply:
      'هورا! دروازهٔ صدفی باز شد و حالا می‌تونیم بریم به تالار اصلی قلعه!',
    enemyReactionReply:
      'باشه باشه، شما بردین! دروازه رو باز کردم، برین مروارید صدا رو نجات بدین!',
    showSttPipelineDiagram: false,
  },
];

export const ROUND_2_STEPS: CombatStepConfig[] = [
  {
    stepIndex: 0,
    title: 'تالار مرجانی',
    expectedCommand: 'ATTACK',
    axiePrompt:
      'از دروازه رد شدیم، اما هشت‌پا با طلسم سکوت داره میاد جلو تا بهمون حمله کنه! بگو «حمله کن» تا اولین ضربه رو بزنیم!',
    enemyDialogue:
      'هاهاها! مروارید صدا توی قفس منه! الان میام جلو و با شاخک‌هام بیرونتون می‌کنم!',
    tutorialHint: 'حمله کن',
    enemyTelegraphType: 'NONE',
    damageToEnemy: 20,
    axieSuccessReply:
      'ضربهٔ اول به هدف خورد و طلسم تاریکش رو لرزوند!',
    enemyReactionReply: 'اوووف! این شمشیر کوچولو چقدر پرقدرته!',
  },
  {
    stepIndex: 1,
    title: 'تالار مرجانی',
    expectedCommand: 'SHIELD',
    axiePrompt:
      'ضربه‌مون بهش خورد ولی هشت‌پا عصبانی شد و اومد جلو! داره شاخک بزرگش رو می‌کوبه سمتمون، زود بگو «سپر بگیر»!',
    enemyDialogue:
      'حالا میام جلو و با این شاخک غول‌پیکرم محکم می‌زنم به سپرتون!',
    tutorialHint: 'سپر بگیر',
    enemyTelegraphType: 'TENTACLE_SLAM',
    damageToEnemy: 0,
    axieSuccessReply:
      'آفرین! با سپر صدفی جلوی ضربهٔ شاخکش رو گرفتیم و سرش گیج رفت!',
    enemyReactionReply: 'آخ! شاخکم خورد به سپر صدفی و سرم داره گیج میره...',
  },
  {
    stepIndex: 2,
    title: 'تالار مرجانی',
    expectedCommand: 'ATTACK',
    axiePrompt:
      'سپر صدفی شاخکش رو دفع کرد و الان هشت‌پا وسط میدان گیج شده! بهترین فرصته، بگو «حمله کن»!',
    enemyDialogue: 'ستاره‌ها دارن دور تاجم می‌چرخن... نمی‌تونم جلوتونو بگیرم...',
    tutorialHint: 'حمله کن',
    enemyTelegraphType: 'DIZZY_OPENING',
    damageToEnemy: 20,
    axieSuccessReply:
      'ایول! تا حواسش پرت بود یه ضربهٔ چرخشی زدیم و طلسم تاجش ترک برداشت!',
    enemyReactionReply: 'وااای! طلسم تاریک تاجم داره ضعیف میشه!',
  },
  {
    stepIndex: 3,
    title: 'تالار مرجانی',
    expectedCommand: 'JUMP',
    axiePrompt:
      'هشت‌پا به خودش اومد و با هر هشت شاخکش کف تالار رو کوبید! یه موج بزرگ داره میاد طرفمون، زود بگو «بپر بکن»!',
    enemyDialogue:
      'حالا زمین تالار رو می‌لرزونم و این موج غول‌پیکر رو می‌فرستم طرفتون!',
    tutorialHint: 'بپر بکن',
    enemyTelegraphType: 'GIANT_WAVE',
    damageToEnemy: 0,
    axieSuccessReply:
      'پرش درخشان! از روی موج بزرگ تالار پریدیم و شمشیرم پر از نور طلایی شد!',
    enemyReactionReply: 'چی؟! از روی موج بزرگم هم پریدی؟!',
  },
  {
    stepIndex: 4,
    title: 'تالار مرجانی',
    expectedCommand: 'BUBBLE_POWER',
    axiePrompt:
      'ببین! بعد از پرش، صدای تو شمشیرم رو طلایی کرد! هشت‌پا داره دوباره میاد جلو؛ بگو «قدرت حبابی» تا توی حباب جادویی بفرستیمش!',
    enemyDialogue:
      'چرا شمشیرت داره طلایی می‌درخشه؟! بازم میام جلو تا نذارم به مروارید برسین!',
    tutorialHint: 'قدرت حبابی',
    enemyTelegraphType: 'BUBBLE_AURA',
    damageToEnemy: 35,
    axieSuccessReply:
      'عجب قدرتی! با فرمان تو هشت‌پا رفت توی یه حباب جادویی بزرگ و طلسمش تقریباً شکست!',
    enemyReactionReply: 'کمک! حباب‌های طلایی منو بردن بالا و طلسمم داره می‌ریزه!',
  },
  {
    stepIndex: 5,
    title: 'تالار مرجانی',
    expectedCommand: 'ATTACK',
    axiePrompt:
      'هشت‌پا از حباب اومد بیرون و طلسم سیاه تاجش به مو بنده! برای شکستن کامل طلسم و آزادی مروارید صدا، بگو «حمله کن»!',
    enemyDialogue: 'نور این حباب‌ها چشممو باز کرد... فقط یه ذره از طلسم تاریک مونده...',
    tutorialHint: 'حمله کن',
    enemyTelegraphType: 'WEAKENED_CROWN',
    damageToEnemy: 25,
    axieSuccessReply:
      'طلسم سکوت شکست و مروارید صدا آزاد شد! هشت‌پا هم دوباره مهربون شد!',
    enemyReactionReply:
      'اِ؟ چی شد؟ انگار از یه خواب بد بیدار شدم! ممنونم که نجاتم دادین دوستای کوچولو!',
  },
];

export function createInitialCombatState(
  round: 1 | 2,
  difficulty: DifficultyMode = 'easy'
): CombatState {
  const steps = round === 1 ? ROUND_1_STEPS : ROUND_2_STEPS;
  const firstStep = steps[0];

  return {
    round,
    difficulty,
    phase: 'PLAYER_READY',
    stepIndex: 0,
    totalSteps: steps.length,
    enemyHp: 100,
    enemyMaxHp: 100,
    axieHearts: 3,
    axieMaxHearts: 3,
    starsEarned: 0,
    score: 0,
    bubblePowerUnlocked: false,
    consecutiveWrongCommandsOnStep: 0,
    lastRecognizedText: '',
    lastFeedbackMessage: firstStep.axiePrompt,
    lastFloatingDamage: null,
    showSttDiagram: false,
    axieAnim: 'Idle',
    jellyAnim: round === 1 ? 'Idle' : 'StepAside',
    octopusAnim: round === 2 ? 'Idle' : 'Idle',
    gateOpened: false,
    pearlFreed: false,
  };
}

export function getCurrentStepConfig(state: CombatState): CombatStepConfig {
  const steps = state.round === 1 ? ROUND_1_STEPS : ROUND_2_STEPS;
  return steps[Math.min(state.stepIndex, steps.length - 1)];
}

export interface CommandExecutionOutcome {
  nextState: CombatState;
  accepted: boolean;
  reason:
    | 'SUCCESS'
    | 'IGNORED_BUSY_PHASE'
    | 'UNKNOWN_SPEECH'
    | 'BUBBLE_POWER_LOCKED'
    | 'WRONG_COMMAND_FOR_SITUATION';
  parsedCommand: VoiceCommandType;
  normalizedTranscript: string;
}

/**
 * Pure state machine transition when a final speech transcript is received.
 * Guarantees:
 * - Never executes while already in PLAYER_ACTION / ENEMY_ACTION / VICTORY / PAUSED
 * - Never lets enemyHp drop below 0
 * - Never penalizes hearts on UNKNOWN speech or in Round 1
 */
export function evaluateFinalSpeechCommand(
  currentState: CombatState,
  rawTranscript: string
): CommandExecutionOutcome {
  if (
    currentState.phase === 'PLAYER_ACTION' ||
    currentState.phase === 'ENEMY_ACTION' ||
    currentState.phase === 'ROUND_COMPLETE' ||
    currentState.phase === 'VICTORY' ||
    currentState.phase === 'PAUSED'
  ) {
    return {
      nextState: currentState,
      accepted: false,
      reason: 'IGNORED_BUSY_PHASE',
      parsedCommand: 'UNKNOWN',
      normalizedTranscript: '',
    };
  }

  const trimmed = (rawTranscript || '').trim();
  const step = getCurrentStepConfig(currentState);

  // Only reject if transcript is completely empty
  if (!trimmed) {
    return {
      nextState: {
        ...currentState,
        phase: 'PLAYER_READY',
        lastRecognizedText: '',
        lastFeedbackMessage: `صدایی نیومد قهرمان! توی میکروفون بگو: «${getCanonicalCommandLabel(step.expectedCommand)}»`,
        axieAnim: 'Confused',
      },
      accepted: false,
      reason: 'UNKNOWN_SPEECH',
      parsedCommand: 'UNKNOWN',
      normalizedTranscript: '',
    };
  }

  // Parse with bubblePowerUnlocked = true so any command the player speaks is always allowed
  const parsed = parseVoiceCommand(trimmed, true, step.expectedCommand);

  // "هر چیزی گفتم انجام بده":
  // - If speech matched one of the 4 commands (ATTACK, SHIELD, JUMP, BUBBLE_POWER), execute that exact command!
  // - If speech was any other spoken phrase/word, execute the current step's expected command so voice ALWAYS works!
  const executedCommand: Exclude<VoiceCommandType, 'UNKNOWN'> =
    parsed.command !== 'UNKNOWN' ? parsed.command : step.expectedCommand;

  const steps = currentState.round === 1 ? ROUND_1_STEPS : ROUND_2_STEPS;
  const isFinalStep = currentState.stepIndex >= steps.length - 1;

  const baseDamage =
    step.damageToEnemy > 0
      ? step.damageToEnemy
      : executedCommand === 'BUBBLE_POWER'
      ? 25
      : executedCommand === 'ATTACK'
      ? 15
      : 0;

  const newEnemyHp = isFinalStep
    ? 0
    : Math.max(0, currentState.enemyHp - baseDamage);

  const completedRatio = (currentState.stepIndex + 1) / steps.length;
  const newStars = isFinalStep
    ? 3
    : Math.max(currentState.starsEarned, Math.min(2, Math.floor(completedRatio * 3)));
  const scoreGain = executedCommand === 'BUBBLE_POWER' ? 20 : 10;

  let axieActionAnim: CombatState['axieAnim'] = 'Attack';
  if (executedCommand === 'SHIELD') axieActionAnim = 'Shield';
  if (executedCommand === 'JUMP') axieActionAnim = 'Jump';
  if (executedCommand === 'BUBBLE_POWER') axieActionAnim = 'BubblePower';

  let feedbackReply = step.axieSuccessReply;
  if (executedCommand !== step.expectedCommand) {
    if (executedCommand === 'ATTACK') {
      feedbackReply = 'ایول! با فرمان «حمله کن» تو، شمشیر مرجانی درخشید و دشمن رو عقب زد!';
    } else if (executedCommand === 'SHIELD') {
      feedbackReply = 'عالی بود! با فرمان «سپر بگیر» تو، سپر صدفی درخشید و جلوی حمله رو گرفت!';
    } else if (executedCommand === 'JUMP') {
      feedbackReply = 'چه پرش بلندی! با فرمان «بپر بکن» تو با سرعت از بالای خطر پریدیم!';
    } else if (executedCommand === 'BUBBLE_POWER') {
      feedbackReply = 'عجب قدرتی! با فرمان «قدرت حبابی» تو، حباب‌های طلایی دشمن رو محاصره کردن!';
    }
  }

  const displayRecognized =
    parsed.normalizedText || trimmed || getCanonicalCommandLabel(executedCommand);

  return {
    nextState: {
      ...currentState,
      phase: 'PLAYER_ACTION',
      enemyHp: newEnemyHp,
      starsEarned: newStars,
      score: currentState.score + scoreGain,
      consecutiveWrongCommandsOnStep: 0,
      lastRecognizedText: displayRecognized,
      lastFeedbackMessage: feedbackReply,
      lastFloatingDamage: baseDamage > 0 ? baseDamage : null,
      showSttDiagram: Boolean(step.showSttPipelineDiagram),
      axieAnim: axieActionAnim,
      jellyAnim:
        currentState.round === 1
          ? newEnemyHp === 0
            ? 'StepAside'
            : baseDamage > 0
            ? 'Hit'
            : 'Idle'
          : currentState.jellyAnim,
      octopusAnim:
        currentState.round === 2
          ? newEnemyHp === 0
            ? 'HealedHappy'
            : executedCommand === 'BUBBLE_POWER'
            ? 'TrappedInBubble'
            : executedCommand === 'SHIELD'
            ? 'Dizzy'
            : baseDamage > 0
            ? 'Hit'
            : 'Idle'
          : currentState.octopusAnim,
      gateOpened: currentState.round === 1 && newEnemyHp === 0,
      pearlFreed: currentState.round === 2 && newEnemyHp === 0,
    },
    accepted: true,
    reason: 'SUCCESS',
    parsedCommand: executedCommand,
    normalizedTranscript: displayRecognized,
  };
}

/**
 * Advances from PLAYER_ACTION to the next step or ROUND_COMPLETE / VICTORY
 * after the action animation finishes.
 */
export function advanceAfterPlayerAction(currentState: CombatState): CombatState {
  const steps = currentState.round === 1 ? ROUND_1_STEPS : ROUND_2_STEPS;
  const nextStepIndex = currentState.stepIndex + 1;

  if (nextStepIndex >= steps.length) {
    return {
      ...currentState,
      phase: currentState.round === 1 ? 'ROUND_COMPLETE' : 'VICTORY',
      starsEarned: 3,
      axieAnim: 'Victory',
      jellyAnim: currentState.round === 1 ? 'StepAside' : currentState.jellyAnim,
      octopusAnim: currentState.round === 2 ? 'HealedHappy' : currentState.octopusAnim,
      gateOpened: currentState.round === 1 ? true : currentState.gateOpened,
      pearlFreed: currentState.round === 2 ? true : currentState.pearlFreed,
    };
  }

  const nextStep = steps[nextStepIndex];
  const unlockBubble =
    currentState.round === 2 && nextStep.expectedCommand === 'BUBBLE_POWER';

  let nextJellyAnim = currentState.jellyAnim;
  if (currentState.round === 1) {
    if (nextStep.enemyTelegraphType === 'JELLY_BALL') nextJellyAnim = 'TelegraphBall';
    else if (nextStep.enemyTelegraphType === 'SMALL_WAVE') nextJellyAnim = 'TelegraphWave';
    else nextJellyAnim = 'Idle';
  }

  let nextOctopusAnim = currentState.octopusAnim;
  if (currentState.round === 2) {
    if (nextStep.enemyTelegraphType === 'TENTACLE_SLAM') nextOctopusAnim = 'TelegraphTentacle';
    else if (nextStep.enemyTelegraphType === 'DIZZY_OPENING') nextOctopusAnim = 'Dizzy';
    else if (nextStep.enemyTelegraphType === 'GIANT_WAVE') nextOctopusAnim = 'TelegraphWave';
    else nextOctopusAnim = 'Idle';
  }

  return {
    ...currentState,
    phase: 'PLAYER_READY',
    stepIndex: nextStepIndex,
    bubblePowerUnlocked: currentState.bubblePowerUnlocked || unlockBubble,
    consecutiveWrongCommandsOnStep: 0,
    lastFeedbackMessage: nextStep.axiePrompt,
    lastFloatingDamage: null,
    axieAnim: 'Idle',
    jellyAnim: nextJellyAnim,
    octopusAnim: nextOctopusAnim,
  };
}
