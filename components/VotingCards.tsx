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
    <div className="bg-rd-surface border border-rd-border rounded-2xl p-5">
      <p
        className="text-rd-muted text-xs mb-5 font-medium uppercase tracking-widest"
        
      >
        {isRevealed
          ? 'Votes revealed — round closed'
          : hasVoted
            ? `Your vote: ${selectedCard}`
            : 'Choose your estimate'}
      </p>
      <div className="flex flex-wrap gap-2.5 justify-center">
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
              
              className={[
                'w-14 h-[76px] rounded-xl font-bold text-xl border-2 transition-all duration-200 select-none relative',
                isSelected
                  ? 'bg-rd-yellow border-rd-yellow text-rd-dark scale-110 shadow-lg shadow-rd-yellow/25'
                  : isRevealed
                    ? 'bg-rd-surface-2 border-rd-border text-rd-muted hover:border-rd-border-2 hover:scale-105 cursor-pointer'
                    : 'bg-rd-surface-2 border-rd-border-2 text-rd-text hover:border-rd-yellow/60 hover:text-rd-yellow hover:scale-105 hover:shadow-md hover:shadow-rd-yellow/10 active:scale-95 cursor-pointer',
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
