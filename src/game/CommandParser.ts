import { ParsedCommandResult, VoiceCommandType } from './types';

/**
 * Normalizes Persian text from Speech-to-Text engines:
 * - Converts Arabic Yeh/Kaf/Alef variants to standard Persian
 * - Strips diacritics, tashdid, and kashida (tatweel)
 * - Replaces ZWNJ (\u200c) and punctuation with spaces
 * - Collapses elongated repeated characters (e.g., "بپرررر" -> "بپر", "حملهههه" -> "حمله")
 */
export function normalizePersianText(input: string): string {
  if (!input || typeof input !== 'string') return '';

  let text = input.trim();

  // Arabic to Persian character unification
  text = text
    .replace(/[\u064A\u0649\u0626\u06CC]/g, 'ی') // ي ى ئ -> ی
    .replace(/[\u0643\u06A9]/g, 'ک') // ك -> ک
    .replace(/[\u0623\u0625\u0622]/g, 'ا') // أ إ آ -> ا
    .replace(/\u0629/g, 'ه') // ة -> ه
    .replace(/\u0640/g, '') // Tatweel / Kashida ـ
    .replace(/[\u064B-\u065F\u0670]/g, ''); // Harakat & Tashdid

  // Replace ZWNJ and punctuation with spaces
  text = text.replace(/[\u200c\u200b\u00a0!؟?.,،؛:"'«»()[\]{}\-_\\/|]/g, ' ');

  // Collapse 3+ identical consecutive letters caused by child stretching sound
  text = text.replace(/(.)\1{2,}/g, '$1');

  // Collapse multiple whitespaces
  text = text.replace(/\s+/g, ' ').trim();

  return text;
}

/**
 * Maps Persian text to a phonetic skeleton so homophone letters in Persian speech
 * (ح/ه, س/ص/ث, ت/ط, ز/ذ/ض/ظ, ق/غ) match identically even when Web Speech API
 * picks a homophone spelling.
 */
export function toPersianPhoneticSkeleton(input: string): string {
  const norm = normalizePersianText(input).replace(/\s+/g, '');
  return norm
    .replace(/[حه]/g, 'ه')
    .replace(/[سصث]/g, 'س')
    .replace(/[تط]/g, 'ت')
    .replace(/[زذضظ]/g, 'ز')
    .replace(/[قغ]/g, 'ق');
}

/**
 * Standard Levenshtein edit distance between two strings (used in open-source Persian voice command matchers).
 */
export function levenshteinDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix: number[][] = Array.from({ length: a.length + 1 }, () =>
    new Array(b.length + 1).fill(0)
  );

  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }
  return matrix[a.length][b.length];
}

export function stringSimilarity(a: string, b: string): number {
  if (!a && !b) return 1;
  if (!a || !b) return 0;
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  const dist = levenshteinDistance(a, b);
  return (maxLen - dist) / maxLen;
}

interface CommandDictionaryEntry {
  command: Exclude<VoiceCommandType, 'UNKNOWN'>;
  canonicalLabel: string;
  exactPhrases: string[];
  keywords: string[];
}

const COMMAND_DICTIONARY: CommandDictionaryEntry[] = [
  {
    command: 'BUBBLE_POWER',
    canonicalLabel: 'قدرت حبابی',
    exactPhrases: [
      'قدرت حبابی',
      'قدرته حبابی',
      'قدرت حباب',
      'غدرت حبابی',
      'قدرت هبابی',
      'غدرت هبابی',
      'قدرت بابایی',
      'قدرت هوایی',
      'قدرت آبی',
      'قدرت حبابی کن',
      'قدرت حبابی بکن',
      'حباب جادویی',
      'حباب طلایی',
      'حباب ها رو بفرست',
      'حبابها رو بفرست',
      'شلیک حباب',
      'ضربه حبابی',
      'حباب کن',
      'حباب بکن',
      'حبابی',
      'حباب',
    ],
    keywords: [
      'قدرت حبابی',
      'حباب جادویی',
      'حباب طلایی',
      'حبابها رو بفرست',
      'حباب ها رو بفرست',
      'قدرت حباب',
      'قدرت بابایی',
      'قدرت هوایی',
      'ضربه حبابی',
      'حباب بکن',
      'حباب کن',
      'حبابی',
      'حباب',
    ],
  },
  {
    command: 'SHIELD',
    canonicalLabel: 'سپر بگیر',
    exactPhrases: [
      'سپر بگیر',
      'سپربگیر',
      'سپر بگی',
      'سپه بگیر',
      'سپر بکن',
      'سپر کن',
      'سپر',
      'دفاع کن',
      'دفاع بکن',
      'دفاع',
      'سپر جادویی',
      'سپرت رو بگیر',
      'سپرو بگیر',
      'سپر و بگیر',
      'سه پر بگیر',
      'سه پر بکن',
      'سه پر',
      'سفر بگیر',
      'صفر بگیر',
      'پسر بگیر',
      'تبر بگیر',
      'چتر بگیر',
      'سپر رو بگیر',
      'محافظت کن',
      'جلوشو بگیر',
    ],
    keywords: [
      'سپر بگیر',
      'سپر بکن',
      'دفاع کن',
      'دفاع بکن',
      'سه پر بگیر',
      'سفر بگیر',
      'صفر بگیر',
      'پسر بگیر',
      'سپرو بگیر',
      'جلوشو بگیر',
      'سپر',
      'دفاع',
      'محافظت',
    ],
  },
  {
    command: 'JUMP',
    canonicalLabel: 'بپر بکن',
    exactPhrases: [
      'بپر بکن',
      'بپربکن',
      'بپر کن',
      'بپرکن',
      'به پر بکن',
      'به پر کن',
      'پر بکن',
      'ببر بکن',
      'پپر بکن',
      'بفر بکن',
      'بهتر بکن',
      'پدر بکن',
      'بپر',
      'بپره',
      'بپرو',
      'بپرید',
      'به پر',
      'ببر',
      'به بر',
      'پپر',
      'بفر',
      'بپا',
      'پرش بکن',
      'پرش کن',
      'پرش',
      'بپر بالا',
      'بالا بپر',
      'جاخالی بده',
      'جا خالی بده',
      'جاخالی بکن',
      'از روش بپر',
      'بجه بکن',
      'بجه',
      'پریدن',
    ],
    keywords: [
      'بپر بکن',
      'بپربکن',
      'بپر کن',
      'به پر بکن',
      'پر بکن',
      'ببر بکن',
      'بفر بکن',
      'بهتر بکن',
      'بپر بالا',
      'بپر',
      'بپره',
      'بپرو',
      'به پر',
      'پپر',
      'بفر',
      'بپا',
      'پرش بکن',
      'پرش کن',
      'پرش',
      'جاخالی',
      'جا خالی',
      'بجه',
      'پریدن',
    ],
  },
  {
    command: 'ATTACK',
    canonicalLabel: 'حمله کن',
    exactPhrases: [
      'حمله کن',
      'حمله‌کن',
      'حمله بکن',
      'حمله',
      'همله کن',
      'همله بکن',
      'همله',
      'امله کن',
      'امله بکن',
      'حمل کن',
      'حامله کن',
      'خمله کن',
      'کمله کن',
      'حمله کون',
      'حمله کنید',
      'همه کن',
      'همه بکن',
      'همه رو کن',
      'هم له کن',
      'شمشیر بزن',
      'شمشیر بکن',
      'ضربه بزن',
      'ضربه بکن',
      'شمشیر جادویی',
      'بزن',
      'شمشیر',
      'ضربه',
    ],
    keywords: [
      'حمله کن',
      'حمله بکن',
      'همله کن',
      'همله بکن',
      'حمل کن',
      'حامله کن',
      'خمله کن',
      'شمشیر بزن',
      'ضربه بزن',
      'همه کن',
      'هم له کن',
      'حمله',
      'همله',
      'شمشیر',
      'ضربه',
      'بزن',
    ],
  },
];

/**
 * Controlled Persian command parser with Gboard-style Phonetic Skeleton, Substring & Levenshtein Fuzzy Matching.
 * Carefully distinguishes "بپر بکن / بپر" (JUMP, labial initial ب/پ) from "سپر بگیر" (SHIELD, sibilant initial س/ص).
 */
export function parseVoiceCommand(
  rawText: string,
  bubblePowerUnlocked = false,
  expectedCommand?: VoiceCommandType
): ParsedCommandResult {
  const normalizedText = normalizePersianText(rawText);

  if (!normalizedText) {
    return {
      rawText,
      normalizedText: '',
      command: 'UNKNOWN',
      matchedPhrase: null,
      isLockedBubblePower: false,
      canonicalLabel: 'نامشخص',
    };
  }

  const tokens = normalizedText.split(' ');
  const inputPhonetic = toPersianPhoneticSkeleton(normalizedText);

  // 1. Check exact or phonetic-skeleton exact match first
  for (const entry of COMMAND_DICTIONARY) {
    for (const phrase of entry.exactPhrases) {
      const normPhrase = normalizePersianText(phrase);
      const phrasePhonetic = toPersianPhoneticSkeleton(phrase);
      if (normalizedText === normPhrase || inputPhonetic === phrasePhonetic) {
        if (entry.command === 'BUBBLE_POWER' && !bubblePowerUnlocked) {
          return {
            rawText,
            normalizedText,
            command: 'BUBBLE_POWER',
            matchedPhrase: phrase,
            isLockedBubblePower: true,
            canonicalLabel: entry.canonicalLabel,
          };
        }
        return {
          rawText,
          normalizedText,
          command: entry.command,
          matchedPhrase: phrase,
          isLockedBubblePower: false,
          canonicalLabel: entry.canonicalLabel,
        };
      }
    }
  }

  // 2. Careful disambiguation if "بپر / بپر بکن" or "سپر / سپر بگیر" appear in the transcript
  const hasBepar =
    tokens.includes('بپر') ||
    tokens.includes('بپربکن') ||
    tokens.includes('بپره') ||
    tokens.includes('بپرو') ||
    tokens.includes('بپرید') ||
    tokens.includes('پپر') ||
    tokens.includes('پرش') ||
    normalizedText.includes('بپر بکن') ||
    normalizedText.includes('به پر') ||
    normalizedText.includes('پر بکن') ||
    normalizedText.includes('ببر بکن') ||
    normalizedText.includes('جاخالی');
  const hasSepar =
    tokens.includes('سپر') ||
    tokens.includes('سپرو') ||
    tokens.includes('سپربگیر') ||
    tokens.includes('دفاع') ||
    normalizedText.includes('سه پر') ||
    normalizedText.includes('سفر بگیر') ||
    normalizedText.includes('صفر بگیر');

  if (hasBepar && !hasSepar) {
    return {
      rawText,
      normalizedText,
      command: 'JUMP',
      matchedPhrase: normalizedText.includes('بکن') ? 'بپر بکن' : 'بپر',
      isLockedBubblePower: false,
      canonicalLabel: 'بپر بکن',
    };
  }

  if (hasSepar && !hasBepar) {
    return {
      rawText,
      normalizedText,
      command: 'SHIELD',
      matchedPhrase: 'سپر بگیر',
      isLockedBubblePower: false,
      canonicalLabel: 'سپر بگیر',
    };
  }

  // 3. Controlled keyword/token matching inside utterances (<= 12 words)
  if (tokens.length <= 12) {
    for (const entry of COMMAND_DICTIONARY) {
      for (const kw of entry.keywords) {
        const normKw = normalizePersianText(kw);
        const kwTokens = normKw.split(' ');
        const matchesAllTokens = kwTokens.every((kt) => tokens.includes(kt));
        if (matchesAllTokens) {
          if (entry.command === 'BUBBLE_POWER' && !bubblePowerUnlocked) {
            return {
              rawText,
              normalizedText,
              command: 'BUBBLE_POWER',
              matchedPhrase: kw,
              isLockedBubblePower: true,
              canonicalLabel: entry.canonicalLabel,
            };
          }
          return {
            rawText,
            normalizedText,
            command: entry.command,
            matchedPhrase: kw,
            isLockedBubblePower: false,
            canonicalLabel: entry.canonicalLabel,
          };
        }
      }
    }
  }

  // 4. Soft-Voice / Whisper Partial-Syllable Matcher (صدای یواش)
  // Matches ONLY distinctive root syllables of each command (never auxiliary verbs like "کن" or "بکن" alone!)
  if (tokens.length <= 5) {
    const hasSoftAttack =
      normalizedText.includes('حمل') ||
      normalizedText.includes('همل') ||
      normalizedText.includes('امل') ||
      normalizedText.includes('مله') ||
      normalizedText.includes('شمشیر') ||
      normalizedText.includes('ضربه') ||
      normalizedText.includes('همه کن') ||
      normalizedText.includes('هم له') ||
      tokens.includes('بزن');

    const hasSoftShield =
      normalizedText.includes('سپر') ||
      normalizedText.includes('سپه') ||
      normalizedText.includes('سه پر') ||
      normalizedText.includes('سفر') ||
      normalizedText.includes('صفر') ||
      normalizedText.includes('دفاع') ||
      normalizedText.includes('دفا') ||
      normalizedText.includes('محافظ') ||
      tokens.includes('بگیر') ||
      tokens.includes('بگی');

    const hasSoftJump =
      normalizedText.includes('بپر') ||
      normalizedText.includes('به پر') ||
      normalizedText.includes('پپر') ||
      normalizedText.includes('ببر') ||
      normalizedText.includes('پرش') ||
      normalizedText.includes('پر بکن') ||
      normalizedText.includes('پر کن') ||
      normalizedText.includes('بجه') ||
      normalizedText.includes('جاخالی') ||
      normalizedText.includes('جا خالی') ||
      tokens.includes('پر') ||
      tokens.includes('بالا');

    const hasSoftBubble =
      normalizedText.includes('حباب') ||
      normalizedText.includes('هباب') ||
      normalizedText.includes('اباب') ||
      normalizedText.includes('بابی') ||
      normalizedText.includes('قدرت') ||
      normalizedText.includes('غدرت') ||
      tokens.includes('طلایی') ||
      tokens.includes('جادویی');

    // Match unambiguous soft-voice root stems directly (without letting expectedCommand override a different spoken root!)
    if (hasSoftBubble && !hasSoftAttack && !hasSoftShield && !hasSoftJump) {
      return {
        rawText,
        normalizedText,
        command: 'BUBBLE_POWER',
        matchedPhrase: 'قدرت حبابی',
        isLockedBubblePower: !bubblePowerUnlocked,
        canonicalLabel: 'قدرت حبابی',
      };
    }
    if (hasSoftShield && !hasSoftJump && !hasSoftAttack && !hasSoftBubble) {
      return {
        rawText,
        normalizedText,
        command: 'SHIELD',
        matchedPhrase: 'سپر بگیر',
        isLockedBubblePower: false,
        canonicalLabel: 'سپر بگیر',
      };
    }
    if (hasSoftJump && !hasSoftShield && !hasSoftAttack && !hasSoftBubble) {
      return {
        rawText,
        normalizedText,
        command: 'JUMP',
        matchedPhrase: 'بپر بکن',
        isLockedBubblePower: false,
        canonicalLabel: 'بپر بکن',
      };
    }
    if (hasSoftAttack && !hasSoftShield && !hasSoftJump && !hasSoftBubble) {
      return {
        rawText,
        normalizedText,
        command: 'ATTACK',
        matchedPhrase: 'حمله کن',
        isLockedBubblePower: false,
        canonicalLabel: 'حمله کن',
      };
    }
  }

  // 5. Root-Stem Levenshtein Fuzzy Matching on phonetic skeletons (<= 4 words)
  // Strips shared auxiliary verbs ("بکن", "کن", "بگیر", "بده") before comparing so commands NEVER cross-match on suffixes!
  const stripAuxVerbs = (s: string) =>
    normalizePersianText(s)
      .split(' ')
      .filter((w) => w !== 'کن' && w !== 'بکن' && w !== 'کنید' && w !== 'بده')
      .join(' ');

  const rootInputPhonetic = toPersianPhoneticSkeleton(stripAuxVerbs(normalizedText) || normalizedText);

  if (tokens.length <= 4 && rootInputPhonetic.length >= 2) {
    let bestEntry: CommandDictionaryEntry | null = null;
    let bestPhrase: string | null = null;
    let bestScore = 0;

    for (const entry of COMMAND_DICTIONARY) {
      for (const phrase of entry.exactPhrases) {
        const targetRoot = stripAuxVerbs(phrase) || phrase;
        const targetPhonetic = toPersianPhoneticSkeleton(targetRoot);
        if (targetPhonetic.length < 2) continue;

        // Strict initial-consonant family guard so JUMP (ب/پ/ج), SHIELD (س/د/م), ATTACK (ه/ا/ش/ز/بز), and BUBBLE (ق/ه) never cross-match
        const firstChar = rootInputPhonetic[0];
        if (entry.command === 'JUMP' && !['ب', 'پ', 'ج'].includes(firstChar)) {
          continue;
        }
        if (entry.command === 'SHIELD' && !['س', 'د', 'م'].includes(firstChar)) {
          continue;
        }
        if (entry.command === 'ATTACK' && !['ه', 'ا', 'ش', 'ز', 'ب'].includes(firstChar)) {
          continue;
        }
        if (entry.command === 'ATTACK' && firstChar === 'ب' && !rootInputPhonetic.startsWith('بز')) {
          continue;
        }
        if (entry.command === 'BUBBLE_POWER' && !['ق', 'ه', 'ا'].includes(firstChar)) {
          continue;
        }

        const sim = stringSimilarity(rootInputPhonetic, targetPhonetic);
        const threshold = 0.74;

        if (sim >= threshold && sim > bestScore) {
          bestScore = sim;
          bestEntry = entry;
          bestPhrase = phrase;
        }
      }
    }

    if (bestEntry && bestPhrase) {
      if (bestEntry.command === 'BUBBLE_POWER' && !bubblePowerUnlocked) {
        return {
          rawText,
          normalizedText,
          command: 'BUBBLE_POWER',
          matchedPhrase: bestPhrase,
          isLockedBubblePower: true,
          canonicalLabel: bestEntry.canonicalLabel,
        };
      }
      return {
        rawText,
        normalizedText,
        command: bestEntry.command,
        matchedPhrase: bestPhrase,
        isLockedBubblePower: false,
        canonicalLabel: bestEntry.canonicalLabel,
      };
    }
  }

  return {
    rawText,
    normalizedText,
    command: 'UNKNOWN',
    matchedPhrase: null,
    isLockedBubblePower: false,
    canonicalLabel: 'نامشخص',
  };
}

export interface VoiceRecognitionCandidate {
  transcript: string;
  confidence: number;
}

/**
 * Evaluates Web Speech API alternatives in strict confidence order (alt[0] first)
 * so a lower-confidence alternative NEVER overrides the word the player actually spoke!
 */
export function parseVoiceAlternatives(
  alternatives: string[],
  bubblePowerUnlocked = false,
  expectedCommand?: VoiceCommandType
): ParsedCommandResult {
  if (!alternatives || alternatives.length === 0) {
    return parseVoiceCommand('', bubblePowerUnlocked, expectedCommand);
  }

  for (const alt of alternatives) {
    const res = parseVoiceCommand(alt, bubblePowerUnlocked, expectedCommand);
    if (res.command !== 'UNKNOWN') {
      return res;
    }
  }

  return parseVoiceCommand(alternatives[0], bubblePowerUnlocked, expectedCommand);
}

/**
 * Evaluates Web Speech API candidates using a confidence threshold check (default 0.35)
 * to minimize misinterpretations of commands like 'حمله کن', 'سپر بگیر', and 'بپر'.
 * Note: Web Speech API reports confidence === 0 on interim or uncalibrated browsers,
 * which is treated as uncalibrated and allowed if it matches a dictionary phrase.
 */
export function parseVoiceAlternativesWithConfidence(
  candidates: VoiceRecognitionCandidate[],
  bubblePowerUnlocked = false,
  confidenceThreshold = 0.35
): ParsedCommandResult {
  if (!candidates || candidates.length === 0) {
    return parseVoiceCommand('', bubblePowerUnlocked);
  }

  // First pass: check high-confidence (or uncalibrated confidence === 0) candidates in rank order
  for (const item of candidates) {
    const conf = typeof item.confidence === 'number' ? item.confidence : 0;
    if (conf === 0 || conf >= confidenceThreshold) {
      const res = parseVoiceCommand(item.transcript, bubblePowerUnlocked);
      if (res.command !== 'UNKNOWN') {
        return res;
      }
    }
  }

  // Second pass: if all candidates had 0 < confidence < threshold, check top candidate only
  return parseVoiceCommand(candidates[0].transcript, bubblePowerUnlocked);
}

export function getCanonicalCommandLabel(cmd: VoiceCommandType): string {
  switch (cmd) {
    case 'ATTACK':
      return 'حمله کن';
    case 'SHIELD':
      return 'سپر بگیر';
    case 'JUMP':
      return 'بپر بکن';
    case 'BUBBLE_POWER':
      return 'قدرت حبابی';
    default:
      return 'نامشخص';
  }
}
