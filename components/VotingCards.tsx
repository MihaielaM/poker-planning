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
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
      <p className="text-slate-400 text-xs mb-4 font-medium uppercase tracking-wider">
        {hasVoted
          ? `Ai votat: ${selectedCard} — poți schimba până la reveal`
          : 'Alege estimarea ta'}
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
                  ? 'bg-indigo-600 border-indigo-400 text-white scale-110 shadow-lg shadow-indigo-900/60'
                  : 'bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600 hover:border-slate-400 hover:scale-105 active:scale-95',
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
