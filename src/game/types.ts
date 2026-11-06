export type VoiceCommandType = 'ATTACK' | 'SHIELD' | 'JUMP' | 'BUBBLE_POWER' | 'UNKNOWN';

export type BattlePhase =
  | 'INTRO'
  | 'TUTORIAL'
  | 'PLAYER_READY'
  | 'LISTENING'
  | 'PROCESSING'
  | 'COMMAND_VALIDATION'
  | 'PLAYER_ACTION'
  | 'ENEMY_TELEGRAPH'
  | 'ENEMY_ACTION'
  | 'ROUND_COMPLETE'
  | 'VICTORY'
  | 'PAUSED'
  | 'ERROR';

export type AxieAnimationState =
  | 'Idle'
  | 'Greeting'
  | 'Listening'
  | 'Thinking'
  | 'Attack'
  | 'Shield'
  | 'Jump'
  | 'BubblePower'
  | 'Hit'
  | 'Victory'
  | 'Confused'
  | 'Celebrate';

export type JellyAnimationState =
  | 'Idle'
  | 'TelegraphBall'
  | 'TelegraphWave'
  | 'Hit'
  | 'StepAside';

export type OctopusAnimationState =
  | 'Idle'
  | 'Laugh'
  | 'TelegraphTentacle'
  | 'TelegraphWave'
  | 'Dizzy'
  | 'Hit'
  | 'TrappedInBubble'
  | 'HealedHappy';

export type BossBehaviorState =
  | 'APPROACHING_CENTER'
  | 'TELEGRAPHING_ATTACK'
  | 'HIT_RECOIL'
  | 'DIZZY_STAGGER'
  | 'BUBBLE_TRAPPED'
  | 'DEFEATED';

export type MicrophoneStatus =
  | 'INACTIVE'
  | 'AWAITING_PERMISSION'
  | 'READY'
  | 'LISTENING'
  | 'PROCESSING'
  | 'RECOGNIZED'
  | 'UNKNOWN_COMMAND'
  | 'PERMISSION_DENIED'
  | 'UNSUPPORTED_OR_ERROR';

export type DifficultyMode = 'easy' | 'normal' | 'challenge';

export type GameScreen =
  | 'TITLE'
  | 'DELFINA_HUB'
  | 'INTRO_STORY'
  | 'ROUND_1'
  | 'ROUND_1_VICTORY'
  | 'MID_STORY'
  | 'ROUND_2'
  | 'ENDING_STORY'
  | 'LEARNING_SUMMARY'
  | 'QUIZ';

export interface ParsedCommandResult {
  rawText: string;
  normalizedText: string;
  command: VoiceCommandType;
  matchedPhrase: string | null;
  isLockedBubblePower: boolean;
  canonicalLabel: string;
}

export interface CombatStepConfig {
  stepIndex: number;
  title: string;
  expectedCommand: Exclude<VoiceCommandType, 'UNKNOWN'>;
  axiePrompt: string;
  enemyDialogue?: string;
  tutorialHint: string;
  enemyTelegraphType: 'NONE' | 'JELLY_BALL' | 'SMALL_WAVE' | 'TENTACLE_SLAM' | 'GIANT_WAVE' | 'DIZZY_OPENING' | 'BUBBLE_AURA' | 'WEAKENED_CROWN';
  damageToEnemy: number;
  axieSuccessReply: string;
  enemyReactionReply?: string;
  showSttPipelineDiagram?: boolean;
}

export interface CombatState {
  round: 1 | 2;
  difficulty: DifficultyMode;
  phase: BattlePhase;
  stepIndex: number;
  totalSteps: number;
  enemyHp: number;
  enemyMaxHp: number;
  axieHearts: number;
  axieMaxHearts: number;
  starsEarned: number;
  score: number;
  bubblePowerUnlocked: boolean;
  consecutiveWrongCommandsOnStep: number;
  lastRecognizedText: string;
  lastFeedbackMessage: string;
  lastFloatingDamage: number | null;
  showSttDiagram: boolean;
  axieAnim: AxieAnimationState;
  jellyAnim: JellyAnimationState;
  octopusAnim: OctopusAnimationState;
  gateOpened: boolean;
  pearlFreed: boolean;
}

export interface GameProgress {
  introSeen: boolean;
  round1Completed: boolean;
  round2Completed: boolean;
  quizCompleted: boolean;
  bestScore: number;
  starsRound1: number;
  starsRound2: number;
  medals: ('VOICE_COMMANDER' | 'MAGIC_VOICE_HERO')[];
  difficulty: DifficultyMode;
}
