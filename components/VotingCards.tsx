'use client';

import { DECK } from '@/lib/constants';

type Props = {
  onVote: (value: string) => void;
  selectedCard: string | null;
  hasVoted: boolean;
  disabled: boolean;
};

export default function VotingCards({ onVote, selectedCard, hasVoted, disabled }: Props) {
  return (
    <div className="bg-rd-surface border border-rd-border rounded-xl p-5">
      <p className="text-rd-subtle text-xs mb-4 font-medium uppercase tracking-wider">
        {hasVoted
          ? `You voted: ${selectedCard} — you can change until reveal`
          : 'Choose your estimate'}
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        {DECK.map(card => {
          const isSelected = selectedCard === card;
          return (
            <button
              key={card}
              onClick={() => !disabled && onVote(card)}
              disabled={disabled}
              className={[
                'w-14 h-20 rounded-xl font-bold text-xl border-2 transition-all select-none',
                isSelected
                  ? 'bg-rd-yellow border-rd-yellow text-rd-dark scale-110 shadow-lg shadow-rd-yellow/20'
                  : 'bg-rd-surface-2 border-rd-border-2 text-rd-text hover:border-rd-yellow hover:text-rd-yellow hover:scale-105 active:scale-95',
                disabled && !isSelected ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
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
