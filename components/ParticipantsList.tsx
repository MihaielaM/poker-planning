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

  const [justRevealed, setJustRevealed] = useState(false);
  const prevRevealedRef = useRef(isRevealed);

  useEffect(() => {
    if (isRevealed && !prevRevealedRef.current) setJustRevealed(true);
    if (!isRevealed) setJustRevealed(false);
    prevRevealedRef.current = isRevealed;
  }, [isRevealed]);

  return (
    <div className="bg-zinc-900 border border-zinc-800">
      <div className="border-b border-zinc-800 px-5 py-3 flex items-center justify-between">
        <p className="text-xs font-black uppercase tracking-widest text-zinc-500">Participants</p>
        <span className="text-xs font-bold text-zinc-500">
          {votedCount}/{totalVoters} voted
        </span>
      </div>

      <div className="p-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {participants.map(p => (
          <ParticipantCard
            key={p.id}
            participant={p}
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
  isCurrentUser,
  isRevealed,
  justRevealed,
  showSlowMessage,
  roundNumber,
}: {
  participant: Participant;
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

  const highlightDelay = justRevealed ? '600ms' : '0ms';

  return (
    <div
      className={[
        'flex flex-col items-center gap-2 p-3 border transition-all',
        isCurrentUser
          ? 'bg-zinc-800 border-yellow-400/50'
          : 'bg-zinc-900 border-zinc-800',
        showSlowMessage ? 'border-yellow-600/40' : '',
      ].join(' ')}
    >
      {/* Card visual */}
      {!p.isVoter ? (
        <div className="w-12 h-16 border-2 border-dashed border-zinc-700 flex items-center justify-center text-zinc-600 text-xl">
          👁
        </div>
      ) : p.hasVoted ? (
        <div className="w-12 h-16 card-3d-scene">
          <div
            className={[
              'card-3d-inner',
              isRevealed ? 'is-flipped' : '',
              isRevealed && !justRevealed ? 'no-transition' : '',
            ].join(' ')}
          >
            {/* Back face */}
            <div className="card-3d-face card-back border-2 border-yellow-400/40" />
            {/* Front face */}
            <div
              className={[
                'card-3d-face card-3d-face-front flex items-center justify-center font-black text-xl border-2',
                p.isHighlight
                  ? 'bg-yellow-400 border-yellow-300 text-zinc-950 card-highlight'
                  : 'bg-white border-zinc-300 text-zinc-950',
              ].join(' ')}
              style={p.isHighlight ? { animationDelay: highlightDelay } : undefined}
            >
              {p.vote ?? '?'}
            </div>
          </div>
        </div>
      ) : (
        <div
          className={[
            'w-12 h-16 border-2 border-dashed flex items-center justify-center',
            showSlowMessage ? 'border-yellow-600/50' : 'border-zinc-700',
          ].join(' ')}
        >
          <span className={showSlowMessage ? 'text-yellow-600 text-sm' : 'text-zinc-700 text-xs'}>
            {showSlowMessage ? '⏳' : '—'}
          </span>
        </div>
      )}

      {/* Name */}
      <p
        className={[
          'text-xs font-bold uppercase tracking-wide text-center truncate w-full',
          isCurrentUser ? 'text-yellow-400' : 'text-zinc-300',
        ].join(' ')}
        title={p.name}
      >
        {p.name}
        {isCurrentUser && <span className="text-zinc-600 font-normal normal-case"> (you)</span>}
      </p>

      {/* Status badge */}
      <span
        className={[
          'text-xs px-2 py-0.5 font-bold uppercase tracking-wide border',
          !p.isVoter
            ? 'border-zinc-700 text-zinc-600'
            : p.hasVoted
              ? 'border-yellow-400/50 text-yellow-400'
              : p.isOnline
                ? 'border-zinc-700 text-zinc-500'
                : 'border-zinc-800 text-zinc-700',
        ].join(' ')}
      >
        {!p.isVoter ? 'Observer' : p.hasVoted ? '✓ Voted' : p.isOnline ? 'Waiting' : 'Offline'}
      </span>

      {slowMessage && (
        <p className="text-xs text-yellow-600/80 text-center italic leading-tight w-full">
          {slowMessage}
        </p>
      )}

      {extremeCardMessage && (
        <p className="text-xs text-yellow-400 text-center font-bold uppercase tracking-wide w-full">
          {extremeCardMessage}
        </p>
      )}
    </div>
  );
}
