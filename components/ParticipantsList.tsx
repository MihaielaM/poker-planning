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
    if (isRevealed && !prevRevealedRef.current) {
      setJustRevealed(true);
    }
    if (!isRevealed) {
      setJustRevealed(false);
    }
    prevRevealedRef.current = isRevealed;
  }, [isRevealed]);

  return (
    <div className="bg-rd-surface border border-rd-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-rd-subtle text-xs font-medium uppercase tracking-wider">
          Participants
        </p>
        <span className="text-rd-muted text-xs">
          {votedCount}/{totalVoters} voted
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
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
        'flex flex-col items-center gap-2 p-3 rounded-xl border transition-all',
        isCurrentUser
          ? 'bg-rd-surface-2 border-rd-yellow/40'
          : 'bg-rd-surface/50 border-rd-border',
        showSlowMessage ? 'border-rd-yellow/30' : '',
      ].join(' ')}
    >
      {/* Card visual */}
      {!p.isVoter ? (
        <div className="w-12 h-16 rounded-lg border-2 border-dashed border-rd-border-2 flex items-center justify-center text-rd-muted text-xl">
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
            <div className="card-3d-face card-back border-2 border-rd-yellow/50" />

            {/* Front face */}
            <div
              className={[
                'card-3d-face card-3d-face-front flex items-center justify-center font-bold text-2xl border-2',
                p.isHighlight
                  ? 'bg-rd-yellow border-rd-yellow text-rd-dark card-highlight'
                  : 'bg-rd-card-face border-[#e0ddd5] text-rd-dark',
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
            'w-12 h-16 rounded-lg border-2 border-dashed flex items-center justify-center',
            showSlowMessage ? 'border-rd-yellow/40' : 'border-rd-border-2',
          ].join(' ')}
        >
          <span className={showSlowMessage ? 'text-rd-yellow/60 text-sm' : 'text-rd-muted text-xs'}>
            {showSlowMessage ? '⏳' : '—'}
          </span>
        </div>
      )}

      {/* Name */}
      <p
        className={[
          'text-xs font-medium text-center truncate w-full',
          isCurrentUser ? 'text-white' : 'text-rd-text',
        ].join(' ')}
        title={p.name}
      >
        {p.name}
        {isCurrentUser && (
          <span className="text-rd-yellow/70 font-normal"> (you)</span>
        )}
      </p>

      {/* Status badge */}
      <span
        className={[
          'text-xs px-2 py-0.5 rounded-full font-medium',
          !p.isVoter
            ? 'bg-rd-surface-2 text-rd-muted'
            : p.hasVoted
              ? 'bg-rd-yellow/15 text-rd-yellow'
              : p.isOnline
                ? 'bg-rd-surface-2 text-rd-subtle'
                : 'bg-rd-surface-2 text-rd-muted',
        ].join(' ')}
      >
        {!p.isVoter ? 'Facilitator' : p.hasVoted ? '✓ Voted' : p.isOnline ? 'Not voted' : 'Offline'}
      </span>

      {slowMessage && (
        <p className="text-xs text-rd-yellow/70 text-center italic leading-tight w-full">
          {slowMessage}
        </p>
      )}

      {extremeCardMessage && (
        <p className="text-xs text-rd-yellow text-center font-medium w-full">
          {extremeCardMessage}
        </p>
      )}
    </div>
  );
}
