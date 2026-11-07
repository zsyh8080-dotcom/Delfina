import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizePersianText,
  parseVoiceCommand,
  parseVoiceAlternatives,
  parseVoiceAlternativesWithConfidence,
  toPersianPhoneticSkeleton,
} from './CommandParser';
import {
  createInitialCombatState,
  evaluateFinalSpeechCommand,
  advanceAfterPlayerAction,
} from './CombatEngine';

test('normalizePersianText and toPersianPhoneticSkeleton handle Persian/Arabic letters and homophones', () => {
  assert.equal(normalizePersianText('  حملهههه   كُن!! '), 'حمله کن');
  assert.equal(normalizePersianText('قدرتِ حبابيِ جادويي'), 'قدرت حبابی جادویی');
  assert.equal(normalizePersianText('بپّر!'), 'بپر');
  assert.equal(normalizePersianText('سپررر بگیررر'), 'سپر بگیر');
  assert.equal(toPersianPhoneticSkeleton('حمله کن'), toPersianPhoneticSkeleton('همله کن'));
  assert.equal(toPersianPhoneticSkeleton('قدرت حبابی'), toPersianPhoneticSkeleton('غدرت هبابی'));
});

test('parseVoiceCommand and parseVoiceAlternativesWithConfidence handle exact, colloquial, and Web Speech fa-IR acoustic homophones without confusion', () => {
  // Attack variations including phonetic STT misspellings
  assert.equal(parseVoiceCommand('حمله کن', false).command, 'ATTACK');
  assert.equal(parseVoiceCommand('همله کن', false).command, 'ATTACK');
  assert.equal(parseVoiceCommand('حامله کن', false).command, 'ATTACK');
  assert.equal(parseVoiceCommand('خمله کن', false).command, 'ATTACK');
  assert.equal(parseVoiceCommand('حمل کن', false).command, 'ATTACK');
  assert.equal(parseVoiceCommand('شمشیر بزن!', false).command, 'ATTACK');

  // Shield variations vs Jump variations (strict initial consonant guard + «بپر بکن»)
  assert.equal(parseVoiceCommand('سپر بگیر', false).command, 'SHIELD');
  assert.equal(parseVoiceCommand('سه پر بگیر', false).command, 'SHIELD');
  assert.equal(parseVoiceCommand('پسر بگیر', false).command, 'SHIELD');
  assert.equal(parseVoiceCommand('سفر بگیر', false).command, 'SHIELD');
  assert.equal(parseVoiceCommand('سپربگی', false).command, 'SHIELD');
  assert.equal(parseVoiceCommand('دفاع کن', false).command, 'SHIELD');
  assert.equal(parseVoiceCommand('بپر بکن', false).command, 'JUMP');
  assert.equal(parseVoiceCommand('بپر بکن', false).canonicalLabel, 'بپر بکن');
  assert.equal(parseVoiceCommand('بفر بکن', false).command, 'JUMP');
  assert.equal(parseVoiceCommand('بهتر بکن', false).command, 'JUMP');
  assert.equal(parseVoiceCommand('بپربکن', false).command, 'JUMP');
  assert.equal(parseVoiceCommand('به پر بکن', false).command, 'JUMP');
  assert.equal(parseVoiceCommand('بپر', false).command, 'JUMP');
  assert.equal(parseVoiceCommand('به پر', false).command, 'JUMP');
  assert.equal(parseVoiceCommand('پرش کن', false).command, 'JUMP');

  // Bubble Power acoustic homophones
  assert.equal(parseVoiceCommand('قدرت بابایی', true).command, 'BUBBLE_POWER');
  assert.equal(parseVoiceCommand('قدرت هوایی', true).command, 'BUBBLE_POWER');

  // Soft-voice / whispered (صدای یواش) partial syllable detection
  assert.equal(parseVoiceCommand('حمل', false, 'ATTACK').command, 'ATTACK');
  assert.equal(parseVoiceCommand('سپر', false, 'SHIELD').command, 'SHIELD');
  assert.equal(parseVoiceCommand('پر بکن', false, 'JUMP').command, 'JUMP');
  assert.equal(parseVoiceCommand('حباب', true, 'BUBBLE_POWER').command, 'BUBBLE_POWER');

  // Multi-alternative Web Speech API scanning & confidence threshold filtering
  const multiRes = parseVoiceAlternatives(['امروز', 'سه پر بگیر'], false);
  assert.equal(multiRes.command, 'SHIELD');

  const confRes = parseVoiceAlternativesWithConfidence(
    [
      { transcript: 'امروز هوا خوبه', confidence: 0.9 },
      { transcript: 'حمله کن', confidence: 0.72 },
    ],
    false,
    0.25
  );
  assert.equal(confRes.command, 'ATTACK');

  assert.equal(
    parseVoiceAlternatives(['بپر بکن', 'حمله کن'], true, 'ATTACK').command,
    'JUMP'
  );
  assert.equal(
    parseVoiceAlternatives(['سپر بگیر', 'بپر بکن'], true, 'JUMP').command,
    'SHIELD'
  );

  // Bubble Power locked vs unlocked
  const lockedBubble = parseVoiceCommand('غدرت هبابی', false);
  assert.equal(lockedBubble.command, 'BUBBLE_POWER');
  assert.equal(lockedBubble.isLockedBubblePower, true);

  const unlockedBubble = parseVoiceCommand('غدرت هبابی', true);
  assert.equal(unlockedBubble.command, 'BUBBLE_POWER');
  assert.equal(unlockedBubble.isLockedBubblePower, false);

  // Unrelated sentences must not trigger random commands
  assert.equal(parseVoiceCommand('امروز هوا خیلی خوبه', true).command, 'UNKNOWN');
  assert.equal(parseVoiceCommand('سلام آکسی خوبی', true).command, 'UNKNOWN');
});

test('Round 1 tutorial state machine completes all 4 steps with reasonable small score (+2 per step = 8 total) and opens the Shell Gate', () => {
  let state = createInitialCombatState(1, 'easy');
  assert.equal(state.round, 1);
  assert.equal(state.stepIndex, 0);
  assert.equal(state.score, 0);

  const step1 = evaluateFinalSpeechCommand(state, 'حمله کن');
  assert.equal(step1.accepted, true);
  assert.equal(step1.nextState.showSttDiagram, true);
  assert.equal(step1.nextState.enemyHp, 50);
  assert.equal(step1.nextState.score, 2);
  state = advanceAfterPlayerAction(step1.nextState);
  assert.equal(state.stepIndex, 1);

  const step2 = evaluateFinalSpeechCommand(state, 'سپر بگیر');
  assert.equal(step2.accepted, true);
  assert.equal(step2.nextState.score, 4);
  state = advanceAfterPlayerAction(step2.nextState);
  assert.equal(state.stepIndex, 2);

  const step3 = evaluateFinalSpeechCommand(state, 'بپر بکن');
  assert.equal(step3.accepted, true);
  assert.equal(step3.nextState.score, 6);
  state = advanceAfterPlayerAction(step3.nextState);
  assert.equal(state.stepIndex, 3);

  const step4 = evaluateFinalSpeechCommand(state, 'آکسی زود باش بزن');
  assert.equal(step4.accepted, true);
  assert.equal(step4.nextState.enemyHp, 0);
  assert.equal(step4.nextState.gateOpened, true);
  assert.equal(step4.nextState.score, 8);
  state = advanceAfterPlayerAction(step4.nextState);
  assert.equal(state.phase, 'ROUND_COMPLETE');
  assert.equal(state.starsEarned, 3);
});

test('Round 2 Octopus Boss fight supports FAR dodge vs NEAR hit and reasonable small scores', () => {
  let state = createInitialCombatState(2, 'normal');
  assert.equal(state.enemyHp, 100);
  assert.equal(state.bossRange, 'NEAR');
  assert.equal(state.score, 0);

  // Test Distance-Based Dodge: when bossRange is FAR, attacking causes OctopusBoss to dodge with 0 damage!
  const farState = { ...state, bossRange: 'FAR' as const };
  const dodgeRes = evaluateFinalSpeechCommand(farState, 'حمله کن');
  assert.equal(dodgeRes.accepted, false);
  assert.equal(dodgeRes.nextState.enemyHp, 100);
  assert.equal(dodgeRes.nextState.octopusAnim, 'Dodge');

  // Standard 6-step Round 2 progression
  let res = evaluateFinalSpeechCommand(state, 'حمله کن');
  assert.equal(res.accepted, true);
  assert.equal(res.nextState.enemyHp, 80);
  assert.equal(res.nextState.lastFloatingDamage, 20);
  assert.equal(res.nextState.score, 2);
  state = advanceAfterPlayerAction(res.nextState);

  res = evaluateFinalSpeechCommand(state, 'سپر بگیر');
  assert.equal(res.accepted, true);
  assert.equal(res.nextState.enemyHp, 80);
  assert.equal(res.nextState.score, 4);
  state = advanceAfterPlayerAction(res.nextState);

  res = evaluateFinalSpeechCommand(state, 'حمله کن');
  assert.equal(res.accepted, true);
  assert.equal(res.nextState.enemyHp, 60);
  assert.equal(res.nextState.score, 6);
  state = advanceAfterPlayerAction(res.nextState);

  res = evaluateFinalSpeechCommand(state, 'بپر بکن');
  assert.equal(res.accepted, true);
  assert.equal(res.nextState.enemyHp, 60);
  assert.equal(res.nextState.score, 8);
  state = advanceAfterPlayerAction(res.nextState);
  assert.equal(state.bubblePowerUnlocked, true);

  res = evaluateFinalSpeechCommand(state, 'قدرت حبابی');
  assert.equal(res.accepted, true);
  assert.equal(res.nextState.enemyHp, 25);
  assert.equal(res.nextState.lastFloatingDamage, 35);
  assert.equal(res.nextState.score, 12);
  state = advanceAfterPlayerAction(res.nextState);

  res = evaluateFinalSpeechCommand(state, 'حمله کن');
  assert.equal(res.accepted, true);
  assert.equal(res.nextState.enemyHp, 0);
  assert.equal(res.nextState.pearlFreed, true);
  assert.equal(res.nextState.score, 14);
  state = advanceAfterPlayerAction(res.nextState);
  assert.equal(state.phase, 'VICTORY');
});
