import React from 'react';
import { AxieAnimationState } from '../game/types';

interface AxieCharacterProps {
  animation: AxieAnimationState;
  isSpeaking?: boolean;
  swordGlowingGold?: boolean;
  className?: string;
}

/**
 * Axie — The Sea Axolotl Shell Knight (آکسی، شوالیهٔ صدفی)
 */
export const AxieCharacter: React.FC<AxieCharacterProps> = ({
  animation,
  isSpeaking = false,
  swordGlowingGold = false,
  className = '',
}) => {
  const isJumping = animation === 'Jump';
  const isAttacking = animation === 'Attack';
  const isShielding = animation === 'Shield';
  const isBubblePower = animation === 'BubblePower';
  const isListening = animation === 'Listening';
  const isThinking = animation === 'Thinking';
  const isConfused = animation === 'Confused';
  const isVictory = animation === 'Victory' || animation === 'Celebrate';
  const isGreeting = animation === 'Greeting';
  const isHit = animation === 'Hit';

  // Multi-phase fluid animation classes per action state
  let motionClass = 'animate-float-slow';
  if (isAttacking) motionClass = 'animate-axie-fluid-attack';
  else if (isJumping) motionClass = 'animate-axie-fluid-jump';
  else if (isShielding) motionClass = 'animate-axie-fluid-shield';
  else if (isBubblePower) motionClass = 'animate-axie-fluid-bubble';

  let fallbackTransform: string | undefined;
  if (isHit) fallbackTransform = 'translate3d(32px, 4px, 0) rotate(8deg) scale(0.94)';
  else if (isVictory) fallbackTransform = 'translate3d(0px, -16px, 0) scale(1.06)';

  return (
    <div
      className={`relative select-none transition-transform duration-300 ease-out ${motionClass} ${className}`}
      style={fallbackTransform ? { transform: fallbackTransform } : undefined}
      data-testid="axie-character"
      data-animation={animation}
    >
      {/* Golden Bubble Power Aura when unlocked or casting */}
      {(swordGlowingGold || isBubblePower) && (
        <div className="absolute -inset-4 rounded-full bg-amber-300/30 blur-xl animate-pulse pointer-events-none" />
      )}

      {/* Shield Barrier Dome when Shielding */}
      {isShielding && (
        <div
          className="absolute -inset-5 rounded-full border-4 border-[#39D5D0] bg-[#39D5D0]/25 shadow-[0_0_35px_#39D5D0] animate-pulse pointer-events-none"
          data-testid="axie-shield-dome"
        />
      )}

      <svg
        viewBox="0 0 220 206"
        className="w-36 h-36 sm:w-44 sm:h-44 md:w-52 md:h-52 drop-shadow-[0_10px_16px_rgba(4,47,75,0.6)] overflow-visible"
        role="img"
        aria-label="آکسی، شوالیهٔ صدفی"
      >
        <defs>
          <linearGradient id="axieBodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FF9EC4" />
            <stop offset="100%" stopColor="#FF6FA5" />
          </linearGradient>
          <linearGradient id="axieBellyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFF8EE" />
            <stop offset="100%" stopColor="#FFE1EC" />
          </linearGradient>
          <linearGradient id="shellHelmetGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFDF9" />
            <stop offset="55%" stopColor="#E0F7FA" />
            <stop offset="100%" stopColor="#FFD76B" />
          </linearGradient>
          <linearGradient id="coralSwordGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={swordGlowingGold || isBubblePower ? '#FFF3B0' : '#A5F3FC'} />
            <stop offset="50%" stopColor={swordGlowingGold || isBubblePower ? '#FFD76B' : '#39D5D0'} />
            <stop offset="100%" stopColor={swordGlowingGold || isBubblePower ? '#F59E0B' : '#087EB7'} />
          </linearGradient>
          <linearGradient id="capeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#087EB7" />
            <stop offset="100%" stopColor="#03486C" />
          </linearGradient>
        </defs>

        {/* Ground Shadow planted right under Axie's feet */}
        <ellipse
          cx="108"
          cy="198"
          rx={isJumping ? '26' : '54'}
          ry={isJumping ? '5' : '8'}
          fill="rgba(2, 18, 34, 0.58)"
        />

        {/* Floating Short Blue Cape */}
        <path
          d={
            isJumping || isAttacking
              ? 'M 95 110 Q 155 118 176 164 Q 140 175 112 162 Z'
              : 'M 95 112 Q 145 125 162 174 Q 130 182 108 168 Z'
          }
          fill="url(#capeGrad)"
          stroke="#39D5D0"
          strokeWidth="2.5"
        />

        {/* Cute Axolotl Tail */}
        <path
          d="M 132 156 Q 178 152 186 135 Q 178 175 134 174 Z"
          fill="#FF84B2"
          stroke="#D94B82"
          strokeWidth="2.5"
        />
        <path
          d="M 142 160 Q 172 156 177 144"
          stroke="#FFF8EE"
          strokeWidth="2"
          fill="none"
          opacity="0.7"
        />

        {/* Feathery Gill Branches (Left & Right) */}
        <g
          className="origin-center transition-transform duration-300"
          style={{
            transform: isJumping ? 'rotate(-8deg)' : isListening ? 'rotate(5deg)' : 'rotate(0deg)',
          }}
        >
          <path d="M 58 72 Q 26 58 22 68 Q 34 76 55 78" fill="#FF5D98" stroke="#D94B82" strokeWidth="2" />
          <path d="M 55 85 Q 18 80 18 92 Q 34 96 55 92" fill="#FF5D98" stroke="#D94B82" strokeWidth="2" />
          <path d="M 60 98 Q 28 102 30 112 Q 44 112 62 103" fill="#FF5D98" stroke="#D94B82" strokeWidth="2" />
          <path d="M 156 72 Q 188 58 192 68 Q 180 76 159 78" fill="#FF5D98" stroke="#D94B82" strokeWidth="2" />
          <path d="M 159 85 Q 196 80 196 92 Q 180 96 159 92" fill="#FF5D98" stroke="#D94B82" strokeWidth="2" />
          <path d="M 154 98 Q 186 102 184 112 Q 170 112 152 103" fill="#FF5D98" stroke="#D94B82" strokeWidth="2" />
        </g>

        {/* Feet (Tucked smoothly during Jump) */}
        <g
          style={{
            transform: isJumping ? 'translate(0px, -8px) rotate(12deg)' : 'translate(0px, 0px)',
            transition: 'transform 220ms ease-out',
          }}
        >
          <ellipse cx="88" cy="186" rx="15" ry="9" fill="#FF84B2" stroke="#D94B82" strokeWidth="2.5" />
          <ellipse cx="128" cy="186" rx="15" ry="9" fill="#FF84B2" stroke="#D94B82" strokeWidth="2.5" />
        </g>

        {/* Hydrodynamic Water Splash Ring & Bubble Trail when Jumping */}
        {isJumping && (
          <g className="animate-hit-flash-burst" data-testid="axie-jump-water-trail">
            <ellipse
              cx="108"
              cy="202"
              rx="42"
              ry="10"
              fill="none"
              stroke="#67E8F9"
              strokeWidth="3.5"
            />
            <circle cx="78" cy="196" r="6" fill="#FFF8EE" opacity="0.9" />
            <circle cx="108" cy="206" r="7" fill="#39D5D0" opacity="0.85" />
            <circle cx="138" cy="194" r="5.5" fill="#FFF8EE" opacity="0.9" />
          </g>
        )}

        {/* Torso & Light Armor */}
        <rect
          x="74"
          y="112"
          width="68"
          height="68"
          rx="32"
          fill="url(#axieBodyGrad)"
          stroke="#D94B82"
          strokeWidth="3"
        />

        {/* Soft Belly & Turquoise/Gold Chestplate */}
        <ellipse cx="108" cy="147" rx="24" ry="26" fill="url(#axieBellyGrad)" />
        <path
          d="M 82 122 Q 108 136 134 122 L 130 154 Q 108 168 86 154 Z"
          fill="#39D5D0"
          stroke="#FFD76B"
          strokeWidth="3"
        />
        <circle cx="108" cy="140" r="6" fill="#FFD76B" />

        {/* Head */}
        <ellipse
          cx="108"
          cy="84"
          rx="52"
          ry="44"
          fill="url(#axieBodyGrad)"
          stroke="#D94B82"
          strokeWidth="3"
        />

        {/* Pearlescent Seashell Helmet */}
        <g>
          <path
            d="M 60 68 Q 108 22 156 68 Q 132 58 108 62 Q 84 58 60 68 Z"
            fill="url(#shellHelmetGrad)"
            stroke="#087EB7"
            strokeWidth="3"
          />
          <path d="M 108 32 L 108 60" stroke="#39D5D0" strokeWidth="2.5" />
          <path d="M 108 34 L 86 60" stroke="#39D5D0" strokeWidth="2" />
          <path d="M 108 34 L 130 60" stroke="#39D5D0" strokeWidth="2" />
          <circle cx="108" cy="52" r="7" fill="#FFF8EE" stroke="#FFD76B" strokeWidth="2.5" />
        </g>

        {/* Big Kind Shiny Eyes */}
        <g>
          <circle cx="86" cy="84" r="11" fill="#1E1B4B" />
          <circle cx="83" cy="80" r="4" fill="#FFFFFF" />
          <circle cx="89" cy="87" r="2" fill="#A5F3FC" />

          <circle cx="130" cy="84" r="11" fill="#1E1B4B" />
          <circle cx="127" cy="80" r="4" fill="#FFFFFF" />
          <circle cx="133" cy="87" r="2" fill="#A5F3FC" />

          {isConfused && (
            <>
              <path d="M 74 68 Q 86 62 96 70" stroke="#9D174D" strokeWidth="3" fill="none" strokeLinecap="round" />
              <path d="M 120 72 Q 130 68 142 66" stroke="#9D174D" strokeWidth="3" fill="none" strokeLinecap="round" />
            </>
          )}
        </g>

        {/* Rosy Cheeks */}
        <ellipse cx="70" cy="95" rx="8" ry="4.5" fill="#FF4785" opacity="0.55" />
        <ellipse cx="146" cy="95" rx="8" ry="4.5" fill="#FF4785" opacity="0.55" />

        {/* Expressive Mouth */}
        {isSpeaking || isVictory || isGreeting || isBubblePower ? (
          <path
            d="M 96 96 Q 108 112 120 96 Z"
            fill="#9D174D"
            stroke="#FFF8EE"
            strokeWidth="1.5"
          />
        ) : isConfused || isHit ? (
          <circle cx="108" cy="100" r="5" fill="#9D174D" />
        ) : (
          <path
            d="M 96 97 Q 108 107 120 97"
            stroke="#9D174D"
            strokeWidth="3.2"
            fill="none"
            strokeLinecap="round"
          />
        )}

        {/* Glowing Sword Slash Trail Arc during fluid swing */}
        {(isAttacking || isBubblePower) && (
          <path
            d="M 85 16 Q -28 65 18 168 Q 4 78 85 16 Z"
            fill={swordGlowingGold || isBubblePower ? '#FFD76B' : '#39D5D0'}
            stroke="#FFF8EE"
            strokeWidth="2.5"
            opacity="0.88"
            className="animate-slash-arc"
          />
        )}

        {/* Coral Blue Magic Sword with Fluid Multi-Phase Swing */}
        <g
          className={isAttacking ? 'animate-sword-fluid-swing' : ''}
          style={
            !isAttacking
              ? {
                  transformOrigin: '68px 134px',
                  transform: isBubblePower
                    ? 'rotate(-42deg) translate(-8px, -24px) scale(1.25)'
                    : isVictory
                    ? 'rotate(-28deg) translate(0px, -18px)'
                    : isGreeting
                    ? 'rotate(15deg)'
                    : 'rotate(-12deg)',
                  transition: 'transform 260ms cubic-bezier(0.22, 1, 0.36, 1)',
                }
              : undefined
          }
        >
          <path
            d="M 46 42 L 58 22 L 70 42 L 66 118 L 50 118 Z"
            fill="url(#coralSwordGrad)"
            stroke="#FFF8EE"
            strokeWidth="2.5"
          />
          <line x1="58" y1="30" x2="58" y2="112" stroke="#FFF8EE" strokeWidth="3" strokeLinecap="round" />
          <path
            d="M 38 116 Q 58 126 78 116 L 74 126 Q 58 132 42 126 Z"
            fill="#FFD76B"
            stroke="#B45309"
            strokeWidth="2"
          />
          <rect x="53" y="126" width="10" height="18" rx="4" fill="#087EB7" />
          <circle cx="58" cy="146" r="6" fill="#FFD76B" />
          <circle cx="64" cy="134" r="10" fill="#FF84B2" stroke="#D94B82" strokeWidth="2.5" />
        </g>

        {/* Round Seashell Shield (or Hand to Ear when Listening) */}
        {isListening ? (
          <g>
            <circle cx="154" cy="84" r="12" fill="#FF84B2" stroke="#D94B82" strokeWidth="2.5" />
            <path
              d="M 168 72 Q 182 84 168 96"
              stroke="#39D5D0"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M 176 64 Q 194 84 176 104"
              stroke="#FFD76B"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
          </g>
        ) : (
          <g
            style={{
              transformOrigin: '142px 142px',
              transform: isShielding
                ? 'translate(-66px, -18px) scale(1.42)'
                : isGreeting
                ? 'translate(8px, -26px) rotate(22deg)'
                : 'translate(0px, 0px)',
              transition: 'transform 220ms cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <circle
              cx="144"
              cy="144"
              r="24"
              fill="url(#shellHelmetGrad)"
              stroke="#FFD76B"
              strokeWidth="4"
            />
            <circle cx="144" cy="144" r="15" fill="#39D5D0" opacity="0.45" />
            <circle cx="144" cy="144" r="6" fill="#FFF8EE" stroke="#FFD76B" strokeWidth="2" />
          </g>
        )}
      </svg>
    </div>
  );
};
