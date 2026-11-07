import { VoiceCommandType } from './types';

export interface ParsedVoiceResult {
  command: VoiceCommandType;
  normalizedText: string;
  canonicalLabel: string;
  isLockedBubblePower: boolean;
}

export interface VoiceRecognitionCandidate {
  transcript: string;
  confidence: number;
}

/**
 * Normalizes Persian/Arabic characters, removes diacritics, punctuation, ZWNJ,
 * and collapses 3+ repeated characters (e.g., "حملهههه کننن" -> "حمله کن").
 */
export function normalizePersianText(raw: string): string {
  if (!raw) return '';

  return raw
    .trim()
    .toLowerCase()
    // Normalize Arabic Yeh / Alef Maksura / Kashmiri Yeh to Persian Yeh (ی)
    .replace(/[\u064A\u0649\u06CC\u06D2]/g, 'ی')
    // Normalize Arabic Kaf to Persian Kaf (ک)
    .replace(/[\u0643\u06A9]/g, 'ک')
    // Normalize Alef variants (آ، أ، إ، ٱ) to simple Alef (ا)
    .replace(/[\u0622\u0623\u0625\u0671]/g, 'ا')
    // Normalize Teh Marbuta (ة) and Heh goal (ۀ) to Heh (ه)
    .replace(/[\u0629\u06C0\u06BE]/g, 'ه')
    // Normalize Waw with Hamza (ؤ) to Waw (و)
    .replace(/\u0624/g, 'و')
    // Remove Arabic/Persian diacritics (Tashdid, Fatha, Kasra, Damma, Tanwin, Maddah)
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '')
    // Replace zero-width non-joiner (ZWNJ) and punctuation with space
    .replace(/[\u200C\u200B\u200D\u00A0.,!؟?،؛:;"'«»()[\]{}\-_+=/\\|~`@#$%^&*<>]/g, ' ')
    // Collapse 3+ repeated identical Persian letters (e.g., "سپررر" -> "سپر", while keeping "جادویی")
    .replace(/(.)\1{2,}/g, '$1')
    // Collapse multiple spaces
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Converts normalized Persian text into a phonetic skeleton so words that sound identical
 * in Persian speech-to-text (e.g. حمله / همله, غدرت / قدرت, حبابی / هبابی, سپر / صپر)
 * map to the exact same acoustic representation.
 */
export function toPersianPhoneticSkeleton(normalized: string): string {
  if (!normalized) return '';
  return normalized
    .replace(/[حهه]/g, 'ه')
    .replace(/[غق]/g, 'ق')
    .replace(/[سصث]/g, 'س')
    .replace(/[زذضظ]/g, 'ز')
    .replace(/[تط]/g, 'ت');
}

/**
 * Computes Levenshtein edit distance between two strings for fuzzy Persian speech tolerance.
 */
function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[m][n];
}

export const COMMAND_CANONICAL_LABELS: Record<Exclude<VoiceCommandType, 'UNKNOWN'>, string> = {
  MOVE_FORWARD: 'برو جلو',
  ATTACK: 'حمله کن',
  SHIELD: 'سپر بگیر',
  JUMP: 'بپر بکن',
  BUBBLE_POWER: 'قدرت حبابی',
};

/**
 * Rich dictionary of colloquial, child-friendly, and common Web Speech API (fa-IR)
 * acoustic homophones for each command.
 * Note: 'برو' alone is intentionally NOT in MOVE_FORWARD so it never steals 'بپر'.
 */
const COMMAND_PATTERNS: Record<Exclude<VoiceCommandType, 'UNKNOWN'>, string[]> = {
  MOVE_FORWARD: [
    'برو جلو',
    'بروجلو',
    'جلو برو',
    'جلوبرو',
    'بیا جلو',
    'قدم بزن',
    'قدم جلو',
    'حرکت کن',
    'برو سمتش',
    'برو داخل',
    'رد شو',
  ],
  BUBBLE_POWER: [
    'قدرت حبابی',
    'قدرت حباب',
    'حباب جادویی',
    'حباب طلایی',
    'ضربه حبابی',
    'حمله حبابی',
    'قدرت هبابی',
    'غدرت حبابی',
    'قدرت بابایی',
    'قدرت هوایی',
    'قدرت کبابی',
    'حبابی',
    'حباب',
    'هباب',
  ],
  ATTACK: [
    'حمله کن',
    'حمله',
    'همله کن',
    'همله',
    'حامله کن',
    'حامله',
    'همه کن',
    'خمله کن',
    'خمله',
    'حمل کن',
    'بزن',
    'شمشیر',
    'شمشیر بزن',
    'ضربه بزن',
    'ضربه',
    'بهش بزن',
  ],
  SHIELD: [
    'سپر بگیر',
    'سپر',
    'سپربگیر',
    'سپربگی',
    'سپر بگی',
    'سه پر بگیر',
    'سه پر',
    'سفر بگیر',
    'سفر بگی',
    'صفر بگیر',
    'پسر بگیر',
    'سوپر بگیر',
    'سپر کن',
    'دفاع کن',
    'دفاع',
    'محافظت',
    'سپر صدفی',
    'بگیر سپر',
  ],
  JUMP: [
    'بپر بکن',
    'بپربکن',
    'به پر بکن',
    'بفر بکن',
    'به فر بکن',
    'بهتر بکن',
    'بپر کن',
    'بپرکن',
    'پرش بکن',
    'بپر',
    'بپر بالا',
    'پرش',
    'پرش کن',
    'بجه',
    'بپر هوا',
    'از روش بپر',
    'به پر',
    'بفر',
    'پبر',
    'پپر',
    'ببر',
    'پریدن',
  ],
};

// Core stems for fuzzy word/phrase matching
const CORE_STEMS: {
  type: Exclude<VoiceCommandType, 'UNKNOWN'>;
  stem: string;
  maxDist: number;
  requiredInitials?: string[];
}[] = [
  { type: 'MOVE_FORWARD', stem: 'بروجلو', maxDist: 2, requiredInitials: ['ب', 'ج'] },
  { type: 'MOVE_FORWARD', stem: 'جلوبرو', maxDist: 2, requiredInitials: ['ج', 'ب'] },
  { type: 'BUBBLE_POWER', stem: 'قدرتهبابی', maxDist: 3 },
  { type: 'BUBBLE_POWER', stem: 'هبابی', maxDist: 1 },
  { type: 'ATTACK', stem: 'هملهکن', maxDist: 2, requiredInitials: ['ه', 'خ'] },
  { type: 'ATTACK', stem: 'همله', maxDist: 1, requiredInitials: ['ه', 'خ'] },
  { type: 'ATTACK', stem: 'شمشیر', maxDist: 2, requiredInitials: ['ش'] },
  { type: 'SHIELD', stem: 'سپربگیر', maxDist: 2, requiredInitials: ['س', 'پ'] },
  { type: 'SHIELD', stem: 'سپربگی', maxDist: 2, requiredInitials: ['س', 'پ'] },
  { type: 'SHIELD', stem: 'سفربگیر', maxDist: 2, requiredInitials: ['س'] },
  { type: 'SHIELD', stem: 'پسربگیر', maxDist: 2, requiredInitials: ['پ'] },
  { type: 'SHIELD', stem: 'سپر', maxDist: 1, requiredInitials: ['س'] },
  { type: 'SHIELD', stem: 'دفاع', maxDist: 1, requiredInitials: ['د'] },
  { type: 'JUMP', stem: 'بپربکن', maxDist: 2, requiredInitials: ['ب', 'پ'] },
  { type: 'JUMP', stem: 'بفربکن', maxDist: 2, requiredInitials: ['ب'] },
  { type: 'JUMP', stem: 'بهتربکن', maxDist: 2, requiredInitials: ['ب'] },
  { type: 'JUMP', stem: 'بپرکن', maxDist: 2, requiredInitials: ['ب', 'پ'] },
  { type: 'JUMP', stem: 'پرشبکن', maxDist: 2, requiredInitials: ['پ'] },
  { type: 'JUMP', stem: 'بپر', maxDist: 1, requiredInitials: ['ب', 'پ'] },
  { type: 'JUMP', stem: 'پرش', maxDist: 1, requiredInitials: ['پ'] },
];

/**
 * Parses a raw Persian transcript into a canonical game voice command.
 */
export function parseVoiceCommand(
  rawTranscript: string,
  bubblePowerUnlocked: boolean,
  expectedCommandHint?: Exclude<VoiceCommandType, 'UNKNOWN'>
): ParsedVoiceResult {
  const normalized = normalizePersianText(rawTranscript);

  if (!normalized) {
    return {
      command: 'UNKNOWN',
      normalizedText: '',
      canonicalLabel: '',
      isLockedBubblePower: false,
    };
  }

  const compact = normalized.replace(/\s+/g, '');
  const phoneticNormalized = toPersianPhoneticSkeleton(normalized);
  const phoneticCompact = phoneticNormalized.replace(/\s+/g, '');

  const commandOrder: Exclude<VoiceCommandType, 'UNKNOWN'>[] = [
    'MOVE_FORWARD',
    'BUBBLE_POWER',
    'SHIELD',
    'JUMP',
    'ATTACK',
  ];

  // 1. Exact or direct substring / phonetic match against pattern lists
  for (const cmdType of commandOrder) {
    const patterns = COMMAND_PATTERNS[cmdType];
    for (const rawPattern of patterns) {
      const pNorm = normalizePersianText(rawPattern);
      const pCompact = pNorm.replace(/\s+/g, '');
      const pPhonetic = toPersianPhoneticSkeleton(pNorm);
      const pPhoneticCompact = pPhonetic.replace(/\s+/g, '');

      if (
        normalized === pNorm ||
        normalized.includes(pNorm) ||
        compact.includes(pCompact) ||
        phoneticNormalized === pPhonetic ||
        phoneticNormalized.includes(pPhonetic) ||
        phoneticCompact.includes(pPhoneticCompact)
      ) {
        if (cmdType === 'BUBBLE_POWER' && !bubblePowerUnlocked) {
          return {
            command: 'BUBBLE_POWER',
            normalizedText: normalized,
            canonicalLabel: COMMAND_CANONICAL_LABELS.BUBBLE_POWER,
            isLockedBubblePower: true,
          };
        }
        return {
          command: cmdType,
          normalizedText: normalized,
          canonicalLabel: COMMAND_CANONICAL_LABELS[cmdType],
          isLockedBubblePower: false,
        };
      }
    }
  }

  // 2. Soft-voice / whispered (صدای یواش) partial syllable detection
  if (
    compact.includes('بروجلو') ||
    compact.includes('جلوبرو') ||
    compact.includes('بیاجلو') ||
    (expectedCommandHint === 'MOVE_FORWARD' &&
      (normalized.includes('جلو') || compact.includes('حرکت')))
  ) {
    return {
      command: 'MOVE_FORWARD',
      normalizedText: normalized,
      canonicalLabel: COMMAND_CANONICAL_LABELS.MOVE_FORWARD,
      isLockedBubblePower: false,
    };
  }

  if (
    compact.startsWith('سپ') ||
    compact.startsWith('سهپ') ||
    compact.includes('سپر') ||
    (compact.includes('بگیر') && !compact.startsWith('بپ'))
  ) {
    return {
      command: 'SHIELD',
      normalizedText: normalized,
      canonicalLabel: COMMAND_CANONICAL_LABELS.SHIELD,
      isLockedBubblePower: false,
    };
  }

  if (
    compact.startsWith('بپ') ||
    compact.startsWith('بهپ') ||
    compact.startsWith('بفرب') ||
    compact.includes('بپرب') ||
    compact.includes('پربکن') ||
    compact.includes('پرش')
  ) {
    return {
      command: 'JUMP',
      normalizedText: normalized,
      canonicalLabel: COMMAND_CANONICAL_LABELS.JUMP,
      isLockedBubblePower: false,
    };
  }

  if (
    phoneticCompact.startsWith('همل') ||
    phoneticCompact.includes('همله') ||
    compact.includes('حمل') ||
    compact.includes('شمش') ||
    compact.includes('ضرب')
  ) {
    return {
      command: 'ATTACK',
      normalizedText: normalized,
      canonicalLabel: COMMAND_CANONICAL_LABELS.ATTACK,
      isLockedBubblePower: false,
    };
  }

  if (
    phoneticCompact.includes('هباب') ||
    phoneticCompact.includes('قدرت') ||
    compact.includes('حباب')
  ) {
    return {
      command: 'BUBBLE_POWER',
      normalizedText: normalized,
      canonicalLabel: COMMAND_CANONICAL_LABELS.BUBBLE_POWER,
      isLockedBubblePower: !bubblePowerUnlocked,
    };
  }

  // 3. Fuzzy Levenshtein check on individual words and full phonetic phrase
  const words = phoneticNormalized.split(' ');
  const candidates = [...words, phoneticCompact];

  for (const candidate of candidates) {
    if (candidate.length < 2) continue;
    for (const { type, stem, maxDist, requiredInitials } of CORE_STEMS) {
      if (
        requiredInitials &&
        requiredInitials.length > 0 &&
        !requiredInitials.includes(candidate[0])
      ) {
        continue;
      }

      const dist = levenshteinDistance(candidate, stem);
      if (dist <= maxDist) {
        if (type === 'BUBBLE_POWER' && !bubblePowerUnlocked) {
          return {
            command: 'BUBBLE_POWER',
            normalizedText: normalized,
            canonicalLabel: COMMAND_CANONICAL_LABELS.BUBBLE_POWER,
            isLockedBubblePower: true,
          };
        }
        return {
          command: type,
          normalizedText: normalized,
          canonicalLabel: COMMAND_CANONICAL_LABELS[type],
          isLockedBubblePower: false,
        };
      }
    }
  }

  return {
    command: 'UNKNOWN',
    normalizedText: normalized,
    canonicalLabel: '',
    isLockedBubblePower: false,
  };
}

export interface SpeechAlternativeInput {
  transcript: string;
  confidence?: number;
}

/**
 * Evaluates multiple Web Speech API alternatives (including confidence scores)
 * and picks the first recognized command.
 */
export function parseVoiceAlternativesWithConfidence(
  alternatives: SpeechAlternativeInput[],
  bubblePowerUnlocked: boolean,
  minConfidence: number = 0.25,
  expectedCommandHint?: Exclude<VoiceCommandType, 'UNKNOWN'>
): ParsedVoiceResult {
  if (!alternatives || alternatives.length === 0) {
    return {
      command: 'UNKNOWN',
      normalizedText: '',
      canonicalLabel: '',
      isLockedBubblePower: false,
    };
  }

  const confidentAlternatives = alternatives.filter((alt, idx) => {
    if (idx === 0) return true;
    if (typeof alt.confidence !== 'number' || alt.confidence === 0) return true;
    return alt.confidence >= minConfidence;
  });

  const pool = confidentAlternatives.length > 0 ? confidentAlternatives : alternatives;

  let lockedBubbleMatch: ParsedVoiceResult | null = null;
  for (const alt of pool) {
    const res = parseVoiceCommand(alt.transcript, bubblePowerUnlocked, expectedCommandHint);
    if (res.command !== 'UNKNOWN') {
      if (res.isLockedBubblePower) {
        lockedBubbleMatch = lockedBubbleMatch || res;
      } else {
        return res;
      }
    }
  }

  if (lockedBubbleMatch) return lockedBubbleMatch;

  return parseVoiceCommand(pool[0]?.transcript || '', bubblePowerUnlocked, expectedCommandHint);
}

/**
 * Evaluates multiple string alternatives from Web Speech API and picks the best match.
 */
export function parseVoiceAlternatives(
  transcripts: string[],
  bubblePowerUnlocked: boolean,
  expectedCommandHint?: Exclude<VoiceCommandType, 'UNKNOWN'>
): ParsedVoiceResult {
  return parseVoiceAlternativesWithConfidence(
    (transcripts || []).map((t) => ({ transcript: t, confidence: 1 })),
    bubblePowerUnlocked,
    0,
    expectedCommandHint
  );
}

export function getCanonicalCommandLabel(cmd: Exclude<VoiceCommandType, 'UNKNOWN'>): string {
  return COMMAND_CANONICAL_LABELS[cmd];
}
