'use client';

import { useEffect, useRef, useState } from 'react';
import { Participant } from '@/lib/types';
import { SLOW_VOTER_MESSAGES, EXTREME_CARD_MESSAGES, seededPick } from '@/lib/messages';

type Props = {
  participants: Participant[];
  currentUserId: string;
  isRevealed: boolean;
  roundNumber: number;
};

export default function ParticipantsList({ participants, currentUserId, isRevealed, roundNumber }: Props) {
  const voters = participants.filter(p => p.isVoter);
  const votedCount = voters.filter(p => p.hasVoted).length;
  const totalVoters = voters.length;
  const majorityVoted = totalVoters > 0 && votedCount / totalVoters > 0.5;

  // Track reveal transition to trigger flip animation only on the moment of reveal
  const [justRevealed, setJustRevealed] = useState(false);
  const prevRevealedRef = useRef(isRevealed);

  useEffect(() => {
    if (isRevealed && !prevRevealedRef.current) {
      setJustRevealed(true);
    }
    if (!isRevealed) {
      setJustRevealed(false);
    }
    prevRevealedRef.current = isRevealed;
  }, [isRevealed]);

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">
          Participants
        </p>
        <span className="text-slate-500 text-xs">
          {votedCount}/{totalVoters} voted
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {participants.map((p, index) => (
          <ParticipantCard
            key={p.id}
            participant={p}
            index={index}
            isCurrentUser={p.id === currentUserId}
            isRevealed={isRevealed}
            justRevealed={justRevealed}
            showSlowMessage={!isRevealed && majorityVoted && p.isVoter && !p.hasVoted}
            roundNumber={roundNumber}
          />
        ))}
      </div>
    </div>
  );
}

function ParticipantCard({
  participant: p,
  index,
  isCurrentUser,
  isRevealed,
  justRevealed,
  showSlowMessage,
  roundNumber,
}: {
  participant: Participant;
  index: number;
  isCurrentUser: boolean;
  isRevealed: boolean;
  justRevealed: boolean;
  showSlowMessage: boolean;
  roundNumber: number;
}) {
  const slowMessage = showSlowMessage
    ? seededPick(SLOW_VOTER_MESSAGES, p.id + roundNumber)
    : null;

  const extremeCardMessage =
    isRevealed && p.isHighlight && p.hasVoted
      ? seededPick(EXTREME_CARD_MESSAGES, p.id)
      : null;

  // Stagger delay: each card flips 80ms after the previous
  const flipDelay = justRevealed ? index * 80 : 0;

  // Highlight-pulse starts after flip animation completes
  const highlightDelay = justRevealed ? `${flipDelay + 600}ms` : '0ms';

  return (
    <div
      className={[
        'flex flex-col items-center gap-2 p-3 rounded-xl border transition-all',
        isCurrentUser
          ? 'bg-slate-700 border-indigo-700'
          : 'bg-slate-700/50 border-slate-700',
        showSlowMessage ? 'border-amber-700/50' : '',
      ].join(' ')}
    >
      {/* Card visual */}
      {!p.isVoter ? (
        /* Facilitator — eye icon */
        <div className="w-12 h-16 rounded-lg border-2 border-dashed border-slate-600 flex items-center justify-center text-slate-500 text-xl">
          👁
        </div>
      ) : p.hasVoted ? (
        /* Voted — flip card (back → front on reveal) */
        <div className="w-12 h-16 card-3d-scene">
          <div
            className={[
              'card-3d-inner',
              isRevealed ? 'is-flipped' : '',
              isRevealed && !justRevealed ? 'no-transition' : '',
            ].join(' ')}
            style={{ transitionDelay: `${flipDelay}ms` }}
          >
            {/* Back face */}
            <div className="card-3d-face card-back border-2 border-indigo-500" />

            {/* Front face */}
            <div
              className={[
                'card-3d-face card-3d-face-front flex items-center justify-center font-bold text-lg border-2',
                p.isHighlight
                  ? 'bg-amber-400 border-amber-300 text-slate-900 card-highlight'
                  : 'bg-white border-slate-300 text-slate-900',
              ].join(' ')}
              style={p.isHighlight ? { animationDelay: highlightDelay } : undefined}
            >
              {p.vote ?? '?'}
            </div>
          </div>
        </div>
      ) : (
        /* Not voted */
        <div
          className={[
            'w-12 h-16 rounded-lg border-2 border-dashed flex items-center justify-center',
            showSlowMessage ? 'border-amber-600/60' : 'border-slate-600',
          ].join(' ')}
        >
          <span className={showSlowMessage ? 'text-amber-600 text-sm' : 'text-slate-600 text-xs'}>
            {showSlowMessage ? '⏳' : '—'}
          </span>
        </div>
      )}

      {/* Name */}
      <p
        className={[
          'text-xs font-medium text-center truncate w-full',
          isCurrentUser ? 'text-white' : 'text-slate-300',
        ].join(' ')}
        title={p.name}
      >
        {p.name}
        {isCurrentUser && (
          <span className="text-indigo-400 font-normal"> (you)</span>
        )}
      </p>

      {/* Status badge */}
      <span
        className={[
          'text-xs px-2 py-0.5 rounded-full font-medium',
          !p.isVoter
            ? 'bg-slate-700 text-slate-400'
            : p.hasVoted
              ? 'bg-emerald-900/70 text-emerald-400'
              : p.isOnline
                ? 'bg-slate-600 text-slate-400'
                : 'bg-slate-700 text-slate-600',
        ].join(' ')}
      >
        {!p.isVoter ? 'Facilitator' : p.hasVoted ? '✓ Voted' : p.isOnline ? 'Not voted' : 'Offline'}
      </span>

      {/* Slow voter message */}
      {slowMessage && (
        <p className="text-xs text-amber-500/80 text-center italic leading-tight w-full">
          {slowMessage}
        </p>
      )}

      {/* Extreme vote message on card */}
      {extremeCardMessage && (
        <p className="text-xs text-amber-400 text-center font-medium w-full">
          {extremeCardMessage}
        </p>
      )}
    </div>
  );
}
