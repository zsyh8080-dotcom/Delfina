import { DifficultyMode, GameProgress } from './types';

const STORAGE_KEY = 'delfina_sea_knight_progress_v1';

export const DEFAULT_PROGRESS: GameProgress = {
  introSeen: false,
  round1Completed: false,
  round2Completed: false,
  quizCompleted: false,
  bestScore: 0,
  starsRound1: 0,
  starsRound2: 0,
  medals: [],
  difficulty: 'easy',
};

export function loadGameProgress(): GameProgress {
  if (typeof window === 'undefined' || !window.localStorage) {
    return { ...DEFAULT_PROGRESS };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_PROGRESS };
    const parsed = JSON.parse(raw) as Partial<GameProgress>;
    return {
      introSeen: Boolean(parsed.introSeen),
      round1Completed: Boolean(parsed.round1Completed),
      round2Completed: Boolean(parsed.round2Completed),
      quizCompleted: Boolean(parsed.quizCompleted),
      bestScore: typeof parsed.bestScore === 'number' ? parsed.bestScore : 0,
      starsRound1: typeof parsed.starsRound1 === 'number' ? parsed.starsRound1 : 0,
      starsRound2: typeof parsed.starsRound2 === 'number' ? parsed.starsRound2 : 0,
      medals: Array.isArray(parsed.medals) ? parsed.medals : [],
      difficulty:
        parsed.difficulty === 'easy' ||
        parsed.difficulty === 'normal' ||
        parsed.difficulty === 'challenge'
          ? parsed.difficulty
          : 'easy',
    };
  } catch {
    return { ...DEFAULT_PROGRESS };
  }
}

export function saveGameProgress(update: Partial<GameProgress>): GameProgress {
  const current = loadGameProgress();
  const merged: GameProgress = {
    ...current,
    ...update,
    bestScore: Math.max(current.bestScore, update.bestScore ?? current.bestScore),
    starsRound1: Math.max(current.starsRound1, update.starsRound1 ?? current.starsRound1),
    starsRound2: Math.max(current.starsRound2, update.starsRound2 ?? current.starsRound2),
    medals: Array.from(new Set([...current.medals, ...(update.medals ?? [])])),
  };

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    } catch {
      // Ignore storage quota errors
    }
  }
  return merged;
}

export function setSavedDifficulty(difficulty: DifficultyMode): GameProgress {
  return saveGameProgress({ difficulty });
}
