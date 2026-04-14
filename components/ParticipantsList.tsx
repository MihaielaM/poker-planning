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

const AVATAR_COLORS = ['#E91E63','#9C27B0','#3F51B5','#2196F3','#00BCD4','#009688','#FF9800','#FF5722'];

function getAvatarColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

function initials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

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
    <div className="glass-panel rounded-2xl p-5">
      <div className="flex items-center justify-between mb-5">
        <p className="text-base font-medium uppercase tracking-wider" style={{color: 'rgba(255,193,7,0.5)'}}>
          Participants
        </p>
        <span className="text-base font-mono" style={{color: 'rgba(255,193,7,0.4)'}}>
          {votedCount}/{totalVoters} voted
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
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
  const avatarColor = getAvatarColor(p.name);

  const cardClass = [
    'glass-card flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-200',
    isCurrentUser ? 'glass-card-current' : '',
    p.hasVoted && !isCurrentUser ? 'glass-card-voted' : '',
    p.hasVoted ? 'pulse-gold' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={cardClass}>
      {/* Avatar */}
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
        style={{background: avatarColor, boxShadow: `0 0 8px ${avatarColor}40`}}
      >
        {initials(p.name)}
      </div>

      {/* Card visual */}
      {!p.isVoter ? (
        <div className="w-12 h-16 rounded-lg flex items-center justify-center text-xl" style={{border: '2px dashed rgba(255,193,7,0.15)', color: 'rgba(255,193,7,0.3)'}}>
          👁
        </div>
      ) : p.hasVoted ? (
        <div className="w-12 h-16 card-3d-scene">
          <div
            className={['card-3d-inner', isRevealed ? 'is-flipped' : '', isRevealed && !justRevealed ? 'no-transition' : ''].join(' ')}
          >
            <div className="card-3d-face card-back rounded-lg" style={{border: '1.5px solid rgba(255,193,7,0.3)'}} />
            <div
              className={['card-3d-face card-3d-face-front flex items-center justify-center font-bold text-2xl rounded-lg', p.isHighlight ? 'shimmer-overlay card-highlight' : ''].join(' ')}
              style={p.isHighlight ? {
                background: 'linear-gradient(135deg, #FFD740 0%, #FFC107 50%, #FFA000 100%)',
                border: '1.5px solid #FFD740',
                color: '#080808',
                animationDelay: highlightDelay,
              } : {
                background: '#F5F4F0',
                border: '1.5px solid #e0ddd5',
                color: '#111',
              }}
            >
              {p.vote ?? '?'}
            </div>
          </div>
        </div>
      ) : (
        <div
          className="w-12 h-16 rounded-lg flex items-center justify-center"
          style={{border: `2px dashed ${showSlowMessage ? 'rgba(255,193,7,0.3)' : 'rgba(255,193,7,0.1)'}`}}
        >
          <span style={{color: showSlowMessage ? 'rgba(255,193,7,0.5)' : 'rgba(255,193,7,0.2)', fontSize: showSlowMessage ? '1rem' : '0.75rem'}}>
            {showSlowMessage ? '⏳' : '—'}
          </span>
        </div>
      )}

      {/* Name */}
      <p
        className="text-base font-medium text-center truncate w-full"
        style={{color: isCurrentUser ? '#FFC107' : 'rgba(255,255,255,0.85)'}}
        title={p.name}
      >
        {p.name}
        {isCurrentUser && <span className="font-normal" style={{color: 'rgba(255,193,7,0.5)'}}> (you)</span>}
      </p>

      {/* Status badge */}
      <span
        className="text-sm px-2 py-0.5 rounded-full font-medium"
        style={!p.isVoter ? {
          background: 'rgba(255,193,7,0.05)',
          color: 'rgba(255,193,7,0.3)',
        } : p.hasVoted ? {
          background: 'rgba(0,230,118,0.12)',
          color: '#00E676',
          border: '1px solid rgba(0,230,118,0.2)',
        } : p.isOnline ? {
          background: 'rgba(255,193,7,0.05)',
          color: 'rgba(255,193,7,0.35)',
        } : {
          background: 'rgba(255,193,7,0.03)',
          color: 'rgba(255,193,7,0.2)',
        }}
      >
        {!p.isVoter ? 'Facilitator' : p.hasVoted ? '✓ Voted' : p.isOnline ? 'Not voted' : 'Offline'}
      </span>

      {slowMessage && (
        <p className="text-xs text-center italic leading-tight w-full" style={{color: 'rgba(255,193,7,0.5)'}}>
          {slowMessage}
        </p>
      )}
      {extremeCardMessage && (
        <p className="text-xs text-center font-medium w-full" style={{color: '#FFC107'}}>
          {extremeCardMessage}
        </p>
      )}
    </div>
  );
}
