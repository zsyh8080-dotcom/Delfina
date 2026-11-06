import React from 'react';
import { BossBehaviorState, OctopusAnimationState } from '../game/types';

interface OctopusBossProps {
  animation: OctopusAnimationState;
  bossBehaviorState?: BossBehaviorState;
  pearlFreed?: boolean;
  isAdvancingToAttack?: boolean;
  className?: string;
}

/**
 * Eight-Legged Monster of Silence (هشت‌پا، هیولای سکوت)
 * Grounded on the seabed floor with dynamic center-screen movement, telegraphic attack animations,
 * and fluid spring-physics hit recoil when reacting to 'حمله کن'!
 */
export const OctopusBoss: React.FC<OctopusBossProps> = ({
  animation,
  bossBehaviorState = 'APPROACHING_CENTER',
  pearlFreed = false,
  isAdvancingToAttack = false,
  className = '',
}) => {
  const isHit = animation === 'Hit' || bossBehaviorState === 'HIT_RECOIL';
  const isDizzy = animation === 'Dizzy' || bossBehaviorState === 'DIZZY_STAGGER';
  const isTrappedInBubble =
    animation === 'TrappedInBubble' || bossBehaviorState === 'BUBBLE_TRAPPED';
  const isHealed =
    animation === 'HealedHappy' || pearlFreed || bossBehaviorState === 'DEFEATED';
  const isTelegraphTentacle = animation === 'TelegraphTentacle';
  const isTelegraphWave = animation === 'TelegraphWave';
  const isTelegraphing =
    bossBehaviorState === 'TELEGRAPHING_ATTACK' || isTelegraphTentacle || isTelegraphWave;

  let manualTransform: string | undefined;
  if (isTrappedInBubble) {
    manualTransform = 'translate3d(18px, -10px, 0) scale(0.98)';
  } else if (isDizzy) {
    manualTransform = 'translate3d(38px, 0px, 0) rotate(5deg)';
  }

  let motionClass = 'animate-float-slow';
  if (isHit) {
    motionClass = 'animate-monster-hit-closeup';
  } else if (!manualTransform && !isHealed && (isAdvancingToAttack || isTelegraphing)) {
    motionClass = isTelegraphTentacle
      ? 'animate-monster-tentacle-lunge'
      : 'animate-monster-charge';
  }

  return (
    <div
      className={`relative select-none transition-transform duration-300 ease-out ${motionClass} ${className}`}
      style={manualTransform ? { transform: manualTransform } : undefined}
      data-testid="octopus-boss"
      data-animation={animation}
      data-boss-state={bossBehaviorState}
    >
      {/* Telegraphic Attack Warning Glow Ring on Ground when Telegraphing */}
      {isTelegraphing && !isHit && !isHealed && (
        <div
          className="absolute -bottom-1 inset-x-2 h-5 rounded-full bg-[#FF84B2]/35 border border-[#FF84B2] blur-[1px] animate-pulse pointer-events-none"
          data-testid="boss-telegraph-ground-aura"
        />
      )}

      {/* Close-Up Sword Slash Arc & Impact Starburst Directly on Octopus Boss when Hit */}
      {(isHit || isTrappedInBubble) && (
        <div
          className="absolute -inset-6 z-20 pointer-events-none flex items-center justify-center"
          data-testid="boss-closeup-hit-fx"
        >
          <div className="absolute inset-2 rounded-full bg-[#FFD76B]/45 blur-md animate-hit-flash-burst" />
          <svg
            viewBox="0 0 240 240"
            className="w-56 h-56 sm:w-64 sm:h-64 animate-slash-arc overflow-visible"
          >
            {/* Glowing Diagonal Sword Slash across Boss Body */}
            <path
              d="M 15 195 Q 115 95 225 20 Q 145 130 15 195 Z"
              fill="#FFF8EE"
              stroke="#FFD76B"
              strokeWidth="7"
            />
            {/* Big Impact Starburst */}
            <polygon
              points="120,30 135,70 178,70 142,95 155,135 120,110 85,135 98,95 62,70 105,70"
              fill="#39D5D0"
              stroke="#FFF8EE"
              strokeWidth="3.5"
            />
            <circle cx="52" cy="58" r="11" fill="#FFD76B" />
            <circle cx="192" cy="158" r="12" fill="#FF84B2" />
            <circle cx="182" cy="52" r="9" fill="#39D5D0" />
          </svg>
        </div>
      )}

      {/* Giant Magical Golden Bubble when hit by Bubble Power */}
      {isTrappedInBubble && (
        <div
          className="absolute -inset-4 rounded-full border-4 border-[#FFD76B] bg-[#39D5D0]/30 shadow-[0_0_45px_#FFD76B] animate-pulse pointer-events-none z-10"
          data-testid="boss-trapped-bubble"
        />
      )}

      <svg
        viewBox="0 0 280 238"
        className="w-48 h-48 sm:w-60 sm:h-60 md:w-72 md:h-72 drop-shadow-[0_12px_20px_rgba(46,16,101,0.65)] overflow-visible"
        role="img"
        aria-label="هشت‌پا، هیولای سکوت"
      >
        <defs>
          <linearGradient id="octopusBodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={isHit ? '#FFF8EE' : isHealed ? '#A78BFA' : '#9333EA'} />
            <stop offset="60%" stopColor={isHit ? '#FF84B2' : isHealed ? '#7C3AED' : '#6B21A8'} />
            <stop offset="100%" stopColor="#4C1D95" />
          </linearGradient>
          <radialGradient id="pearlGlowGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="60%" stopColor="#FFF8EE" />
            <stop offset="100%" stopColor="#FFD76B" />
          </radialGradient>
        </defs>

        {/* Pearl of Voice in Bubble Cage behind Boss */}
        <g
          style={{
            transform: pearlFreed ? 'translate(55px, -32px) scale(1.18)' : 'translate(0px, 0px)',
            transition: 'transform 500ms ease-out',
          }}
        >
          <circle
            cx="48"
            cy="52"
            r="24"
            fill={pearlFreed ? 'rgba(255, 215, 107, 0.35)' : 'rgba(141, 104, 219, 0.28)'}
            stroke={pearlFreed ? '#FFD76B' : '#A5F3FC'}
            strokeWidth="2.5"
            strokeDasharray={pearlFreed ? 'none' : '5 3'}
          />
          <circle cx="48" cy="52" r="14" fill="url(#pearlGlowGrad)" />
          <circle cx="44" cy="48" r="4" fill="#FFFFFF" />
        </g>

        {/* Ground Shadow planted right under Octopus tentacles */}
        <ellipse cx="135" cy="230" rx="78" ry="8" fill="rgba(2, 18, 34, 0.62)" />

        {/* 8 Expressive Tentacles reaching out to the Right (+X) toward Axie */}
        <g strokeLinecap="round" fill="none" strokeWidth="14">
          <path d="M 88 168 Q 36 175 26 208" stroke="#581C87" />
          <path d="M 92 178 Q 45 204 52 224" stroke="#7E22CE" />
          <path d="M 110 184 Q 82 218 96 230" stroke="#9333EA" />
          <path d="M 135 186 Q 135 220 148 230" stroke="#A855F7" />
          <path d="M 156 184 Q 186 218 205 224" stroke="#9333EA" />
          <path d="M 176 178 Q 222 195 244 205" stroke="#7E22CE" />
          <path
            d={
              isTelegraphWave
                ? 'M 180 165 Q 235 215 268 225'
                : 'M 180 165 Q 232 152 258 138'
            }
            stroke="#A855F7"
          />
          <path
            d={
              isTelegraphTentacle
                ? 'M 178 148 Q 245 78 276 118'
                : 'M 178 156 Q 235 112 262 96'
            }
            stroke={isTelegraphTentacle ? '#FF84B2' : '#C084FC'}
            strokeWidth={isTelegraphTentacle ? '18' : '15'}
          />
        </g>

        {/* Octopus Main Head/Body */}
        <ellipse
          cx="135"
          cy="122"
          rx="62"
          ry="58"
          fill="url(#octopusBodyGrad)"
          stroke={isHit ? '#FFD76B' : '#C084FC'}
          strokeWidth={isHit ? '5.5' : '3.5'}
        />
        <circle cx="96" cy="102" r="8" fill="#C084FC" opacity="0.5" />
        <circle cx="176" cy="104" r="9" fill="#C084FC" opacity="0.5" />
        <circle cx="110" cy="80" r="6" fill="#39D5D0" opacity="0.45" />
        <circle cx="162" cy="82" r="6" fill="#39D5D0" opacity="0.45" />

        {/* Coral Crown (Jolts upward when hit!) */}
        <g
          style={{
            transform: isHit ? 'translate(-10px, -16px) rotate(-15deg)' : 'translate(0px, 0px)',
            transition: 'transform 180ms ease-out',
          }}
        >
          <path
            d="M 98 68 L 106 38 L 124 56 L 135 30 L 148 56 L 164 38 L 172 68 Z"
            fill={isHealed ? '#FFD76B' : '#3B0764'}
            stroke={isHealed ? '#39D5D0' : '#A855F7'}
            strokeWidth="3"
          />
          <circle cx="135" cy="54" r="6" fill={isHealed ? '#39D5D0' : '#FF84B2'} />
        </g>

        {/* Spinning Stars when Dizzy or Hit */}
        {(isDizzy || isHit) && (
          <g className="animate-pulse">
            <circle cx="96" cy="34" r="7" fill="#FFD76B" />
            <circle cx="135" cy="20" r="8" fill="#39D5D0" />
            <circle cx="174" cy="34" r="7" fill="#FFD76B" />
          </g>
        )}

        {/* Large Expressive Eyes (Shocked >< when hit!) */}
        {isHit ? (
          <g stroke="#FFF8EE" strokeWidth="5" strokeLinecap="round" fill="none">
            <path d="M 100 112 L 122 122 L 100 132" />
            <path d="M 172 112 L 150 122 L 172 132" />
          </g>
        ) : (
          <g>
            <circle cx="114" cy="122" r="15" fill="#FFF8EE" />
            <circle cx="160" cy="122" r="15" fill="#FFF8EE" />

            {isDizzy ? (
              <>
                <circle cx="110" cy="120" r="6" fill="#3B0764" />
                <circle cx="164" cy="124" r="6" fill="#3B0764" />
              </>
            ) : (
              <>
                <circle cx="119" cy="122" r="7.5" fill="#3B0764" />
                <circle cx="116" cy="118" r="3" fill="#FFFFFF" />
                <circle cx="165" cy="122" r="7.5" fill="#3B0764" />
                <circle cx="162" cy="118" r="3" fill="#FFFFFF" />
              </>
            )}

            {/* Eyebrows */}
            {isHealed ? (
              <>
                <path d="M 96 102 Q 112 94 126 102" stroke="#FFF8EE" strokeWidth="4" fill="none" strokeLinecap="round" />
                <path d="M 144 102 Q 158 94 174 102" stroke="#FFF8EE" strokeWidth="4" fill="none" strokeLinecap="round" />
              </>
            ) : (
              <>
                <path d="M 96 100 L 128 110" stroke="#3B0764" strokeWidth="5.5" strokeLinecap="round" />
                <path d="M 176 100 L 144 110" stroke="#3B0764" strokeWidth="5.5" strokeLinecap="round" />
              </>
            )}
          </g>
        )}

        {/* Expressive Mouth */}
        {isHealed ? (
          <path
            d="M 116 146 Q 135 166 154 146 Z"
            fill="#FF84B2"
            stroke="#FFF8EE"
            strokeWidth="2"
          />
        ) : isHit || isDizzy || isTrappedInBubble ? (
          <ellipse cx="138" cy="152" rx="12" ry="14" fill="#3B0764" stroke="#FFD76B" strokeWidth="2.5" />
        ) : (
          <path
            d="M 118 148 Q 138 164 158 148"
            stroke="#3B0764"
            strokeWidth="4.5"
            fill="none"
            strokeLinecap="round"
          />
        )}
      </svg>
    </div>
  );
};
