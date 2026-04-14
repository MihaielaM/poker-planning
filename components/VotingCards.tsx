'use client';

import { DECK } from '@/lib/constants';

type Props = {
  onVote: (value: string) => void;
  onRevealedClick?: () => void;
  selectedCard: string | null;
  hasVoted: boolean;
  disabled: boolean;
  isRevealed?: boolean;
};

export default function VotingCards({ onVote, onRevealedClick, selectedCard, hasVoted, disabled, isRevealed = false }: Props) {
  return (
    <div className="glass-panel rounded-2xl px-5 py-4" style={{maxWidth: '100%'}}>
      <p className="text-center text-base mb-4 font-medium uppercase tracking-widest" style={{color: 'rgba(255,193,7,0.5)'}}>
        {isRevealed
          ? 'Votes revealed — round closed'
          : hasVoted
            ? `Your vote: ${selectedCard}`
            : 'Choose your estimate'}
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        {DECK.map(card => {
          const isSelected = selectedCard === card;
          return (
            <button
              key={card}
              onClick={() => {
                if (isRevealed) { if (card !== selectedCard) onRevealedClick?.(); return; }
                if (!disabled) onVote(card);
              }}
              disabled={disabled && !isRevealed}
              className="relative w-16 h-[88px] rounded-xl font-bold text-3xl select-none transition-all duration-200"
              style={isSelected ? {
                background: 'linear-gradient(135deg, #FFD740 0%, #FFC107 50%, #FFA000 100%)',
                border: '1.5px solid rgba(255,215,64,0.8)',
                color: '#080808',
                transform: 'translateY(-8px) scale(1.08)',
                boxShadow: '0 0 28px rgba(255,193,7,0.6), 0 0 8px rgba(255,193,7,0.4), 0 12px 32px rgba(0,0,0,0.5)',
              } : isRevealed ? {
                background: 'rgba(14,11,6,0.6)',
                border: '1px solid rgba(255,193,7,0.08)',
                color: 'rgba(255,193,7,0.3)',
                cursor: 'pointer',
              } : {
                background: 'rgba(14,11,6,0.75)',
                border: '1px solid rgba(255,193,7,0.18)',
                color: '#FFC107',
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.3 : 1,
              }}
              onMouseEnter={e => {
                if (!isSelected && !isRevealed && !disabled) {
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-5px)';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,193,7,0.5)';
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 16px rgba(255,193,7,0.25), 0 8px 24px rgba(0,0,0,0.4)';
                }
              }}
              onMouseLeave={e => {
                if (!isSelected && !isRevealed) {
                  (e.currentTarget as HTMLButtonElement).style.transform = '';
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,193,7,0.18)';
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = '';
                }
              }}
            >
              {card}
            </button>
          );
        })}
      </div>
    </div>
  );
}
