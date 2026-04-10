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
    <div className="bg-rd-surface border border-rd-border rounded-2xl p-6">
      <p className="text-rd-subtle text-xs mb-6 font-medium uppercase tracking-widest">
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
              style={isSelected
                ? { background: 'linear-gradient(135deg, #FFE033 0%, #FFD000 50%, #CCAA00 100%)', boxShadow: '0 0 18px rgba(255,208,0,0.55), 0 0 6px rgba(255,208,0,0.35), 3px 3px 0 rgba(255,208,0,0.3)' }
                : { boxShadow: '3px 3px 0 #262626' }
              }
              className={[
                'relative w-16 h-[88px] rounded-xl font-bold text-3xl select-none transition-all duration-150',
                isSelected
                  ? 'border-2 border-rd-yellow text-rd-dark scale-110 -translate-y-2'
                  : isRevealed
                    ? 'bg-rd-surface-2 border border-rd-border text-rd-muted hover:border-rd-border-2 hover:-translate-y-1 cursor-pointer'
                    : 'bg-rd-yellow border border-rd-yellow-active text-rd-dark hover:bg-rd-yellow-hover hover:-translate-y-1.5 hover:shadow-none active:translate-y-0 cursor-pointer',
                disabled && !isSelected && !isRevealed ? 'opacity-30 cursor-not-allowed' : '',
              ].join(' ')}
            >
              {card}
            </button>
          );
        })}
      </div>
    </div>
  );
}
