import React from 'react';
import { JellyAnimationState } from '../game/types';

interface JellyGuardianProps {
  animation: JellyAnimationState;
  isAdvancingToAttack?: boolean;
  floatingHealthBar?: React.ReactNode;
  className?: string;
}

/**
 * Jelly-Khan (ژله‌خان) — Friendly Bouncy Jellyfish Gate Guardian for Round 1
 * Includes moving overhead health bar, close-up sword slash impact arc, and grounded tentacles!
 */
export const JellyGuardian: React.FC<JellyGuardianProps> = ({
  animation,
  isAdvancingToAttack = true,
  floatingHealthBar,
  className = '',
}) => {
  const isHit = animation === 'Hit';
  const isStepAside = animation === 'StepAside';
  const isTelegraphBall = animation === 'TelegraphBall';
  const isTelegraphWave = animation === 'TelegraphWave';

  let motionClass = 'animate-float-slow';
  if (isHit) {
    motionClass = 'animate-monster-hit-closeup';
  } else if (!isStepAside && isAdvancingToAttack) {
    motionClass = 'animate-monster-charge';
  }

  return (
    <div
      className={`relative select-none transition-transform duration-300 ease-out flex flex-col items-center ${motionClass} ${className}`}
      style={
        isStepAside
          ? { transform: 'translate3d(-85px, 0px, 0) scale(0.86) rotate(-8deg)' }
          : undefined
      }
      data-testid="jelly-guardian"
      data-animation={animation}
    >
      {/* Floating Health Bar attached inside animated character container so it moves with Jelly-Khan */}
      {floatingHealthBar && (
        <div className="mb-1 z-30 pointer-events-none">{floatingHealthBar}</div>
      )}

      {/* Close-Up Sword Impact Flash & Diagonal Slash Cut directly on Jelly-Khan */}
      {isHit && (
        <div
          className="absolute -inset-6 z-20 pointer-events-none flex items-center justify-center"
          data-testid="jelly-closeup-hit-fx"
        >
          <div className="absolute inset-0 rounded-full bg-[#FFD76B]/45 blur-md animate-hit-flash-burst" />
          <svg
            viewBox="0 0 200 200"
            className="w-48 h-48 sm:w-56 sm:h-56 animate-slash-arc overflow-visible"
          >
            {/* Glowing Sword Slash Crescent */}
            <path
              d="M 20 165 Q 100 85 185 25 Q 125 110 20 165 Z"
              fill="#FFF8EE"
              stroke="#39D5D0"
              strokeWidth="6"
            />
            {/* Impact Starbursts */}
            <polygon
              points="100,25 112,55 145,55 118,75 128,108 100,88 72,108 82,75 55,55 88,55"
              fill="#FFD76B"
              stroke="#FFF8EE"
              strokeWidth="3"
            />
            <circle cx="48" cy="52" r="9" fill="#FF84B2" />
            <circle cx="156" cy="138" r="10" fill="#39D5D0" />
            <circle cx="148" cy="48" r="7" fill="#FFD76B" />
          </svg>
        </div>
      )}

      <svg
        viewBox="0 0 200 202"
        className="w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 drop-shadow-[0_10px_18px_rgba(88,28,135,0.55)] overflow-visible"
        role="img"
        aria-label="ژله‌خان، نگهبان دروازه"
      >
        <defs>
          <linearGradient id="jellyBellGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={isHit ? '#FFF8EE' : '#60A5FA'} />
            <stop offset="55%" stopColor={isHit ? '#FF84B2' : '#8D68DB'} />
            <stop offset="100%" stopColor="#C084FC" />
          </linearGradient>
          <linearGradient id="jellyHelmetGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFD76B" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
        </defs>

        {/* Ground Shadow planted right under Jelly-Khan's tentacles */}
        <ellipse cx="106" cy="194" rx="56" ry="8" fill="rgba(2, 18, 34, 0.58)" />

        {/* Grounded Tentacles standing firmly on the seabed floor (y=194) */}
        <g strokeLinecap="round" fill="none" strokeWidth="11">
          <path d="M 65 130 Q 48 164 62 192" stroke="#A78BFA" />
          <path d="M 88 134 Q 88 168 98 193" stroke="#60A5FA" />
          <path d="M 114 134 Q 126 168 136 193" stroke="#A78BFA" />
          <path
            d={
              isTelegraphBall
                ? 'M 134 126 Q 175 112 192 104'
                : isTelegraphWave
                ? 'M 134 130 Q 168 176 186 193'
                : 'M 134 130 Q 158 164 168 192'
            }
            stroke="#FF84B2"
            strokeWidth="11"
          />
        </g>
        {/* Tentacle Foot-Pads resting on the ground */}
        <g fill="#C084FC">
          <ellipse cx="62" cy="193" rx="9" ry="4.5" />
          <ellipse cx="98" cy="194" rx="9" ry="4.5" />
          <ellipse cx="136" cy="194" rx="9" ry="4.5" />
          {!isTelegraphBall && <ellipse cx={isTelegraphWave ? '186' : '168'} cy="193" rx="9" ry="4.5" fill="#FF84B2" />}
        </g>

        {/* Main Jelly Dome Body */}
        <path
          d="M 38 118 C 38 56, 162 56, 162 118 C 162 136, 142 138, 130 132 C 118 126, 110 138, 100 134 C 90 138, 82 126, 70 132 C 58 138, 38 136, 38 118 Z"
          fill="url(#jellyBellGrad)"
          stroke={isHit ? '#FFD76B' : '#E9D5FF'}
          strokeWidth={isHit ? '5' : '3'}
        />

        {/* Glossy Jelly Highlights */}
        <ellipse cx="72" cy="82" rx="16" ry="8" transform="rotate(-24 72 82)" fill="#FFFFFF" opacity="0.45" />
        <circle cx="132" cy="86" r="6" fill="#FFFFFF" opacity="0.35" />

        {/* Small Cute Guard Helmet (tilts up when hit!) */}
        <g
          style={{
            transform: isHit ? 'translate(-8px, -14px) rotate(-18deg)' : 'translate(0px, 0px)',
            transition: 'transform 180ms ease-out',
          }}
        >
          <path
            d="M 68 62 Q 100 32 132 62 Z"
            fill="url(#jellyHelmetGrad)"
            stroke="#FFF8EE"
            strokeWidth="2.5"
          />
          <circle cx="100" cy="42" r="5" fill="#39D5D0" />
        </g>

        {/* Big Cartoon Eyes (Shocked >< eyes when hit!) */}
        {isHit ? (
          <g stroke="#1E1B4B" strokeWidth="4" strokeLinecap="round" fill="none">
            <path d="M 74 92 L 90 100 L 74 108" />
            <path d="M 130 92 L 114 100 L 130 108" />
          </g>
        ) : (
          <g>
            <circle cx="82" cy="100" r="12" fill="#FFFFFF" />
            <circle cx="86" cy="100" r="6.5" fill="#1E1B4B" />
            <circle cx="84" cy="97" r="2.5" fill="#FFFFFF" />

            <circle cx="122" cy="100" r="12" fill="#FFFFFF" />
            <circle cx="126" cy="100" r="6.5" fill="#1E1B4B" />
            <circle cx="124" cy="97" r="2.5" fill="#FFFFFF" />
          </g>
        )}

        {/* Cute Mouth */}
        {isHit ? (
          <ellipse cx="104" cy="118" rx="9" ry="11" fill="#4C1D95" stroke="#FFF8EE" strokeWidth="2" />
        ) : (
          <path
            d="M 90 116 Q 104 128 118 116"
            stroke="#4C1D95"
            strokeWidth="3.5"
            fill="none"
            strokeLinecap="round"
          />
        )}

        {/* Glowing Jelly Ball Charging in Tentacle Tip */}
        {isTelegraphBall && (
          <g className="animate-pulse">
            <circle cx="192" cy="102" r="16" fill="#FF84B2" stroke="#FFF8EE" strokeWidth="3" />
            <circle cx="187" cy="97" r="5" fill="#FFFFFF" opacity="0.8" />
          </g>
        )}
      </svg>
    </div>
  );
};
