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
    <div className="bg-zinc-900 border border-zinc-800">
      <div className="border-b border-zinc-800 px-5 py-3 flex items-center justify-between">
        <p className="text-xs font-black uppercase tracking-widest text-zinc-500">
          {hasVoted ? `Your vote: ${selectedCard} — change until reveal` : 'Choose your estimate'}
        </p>
        {hasVoted && (
          <span className="text-xs font-black uppercase tracking-widest text-yellow-400">✓ Voted</span>
        )}
      </div>
      <div className="p-5 flex flex-wrap gap-3 justify-center">
        {DECK.map(card => {
          const isSelected = selectedCard === card;
          return (
            <button
              key={card}
              onClick={() => !disabled && onVote(card)}
              disabled={disabled}
              className={[
                'w-14 h-20 font-black text-xl border-2 transition-all select-none',
                isSelected
                  ? 'bg-yellow-400 border-yellow-400 text-zinc-950 scale-110 shadow-lg shadow-yellow-400/20'
                  : 'bg-zinc-950 border-zinc-700 text-white hover:border-yellow-400 hover:text-yellow-400 hover:scale-105 active:scale-95',
                disabled && !isSelected ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer',
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
