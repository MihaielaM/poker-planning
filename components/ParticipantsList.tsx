import { Participant } from '@/lib/types';

type Props = {
  participants: Participant[];
  currentUserId: string;
  isRevealed: boolean;
  isAdmin?: boolean;
};

export default function ParticipantsList({ participants, currentUserId, isRevealed, isAdmin }: Props) {
  const votedCount = participants.filter(p => p.hasVoted).length;

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">
          Participanți
        </p>
        <span className="text-slate-500 text-xs">
          {votedCount}/{participants.length} au votat
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {participants.map(p => (
          <ParticipantCard
            key={p.id}
            participant={p}
            isCurrentUser={p.id === currentUserId}
            isRevealed={isRevealed}
            hideVotingStatus={!isRevealed && isAdmin && p.id !== currentUserId}
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
  hideVotingStatus,
}: {
  participant: Participant;
  isCurrentUser: boolean;
  isRevealed: boolean;
  hideVotingStatus?: boolean;
}) {
  return (
    <div
      className={[
        'flex flex-col items-center gap-2 p-3 rounded-xl border transition-all',
        isCurrentUser
          ? 'bg-slate-700 border-indigo-700'
          : 'bg-slate-700/50 border-slate-700',
      ].join(' ')}
    >
      {/* Card visual */}
      {!p.isVoter ? (
        /* Non-voter (facilitator) — eye icon instead of card */
        <div className="w-12 h-16 rounded-lg border-2 border-dashed border-slate-600 flex items-center justify-center text-slate-500 text-xl">
          👁
        </div>
      ) : isRevealed && p.hasVoted ? (
        /* Revealed: show the actual vote value */
        <div
          className={[
            'w-12 h-16 rounded-lg flex items-center justify-center font-bold text-lg border-2 transition-all',
            p.isHighlight
              ? 'bg-amber-400 border-amber-300 text-slate-900 card-highlight'
              : 'bg-white border-slate-300 text-slate-900',
          ].join(' ')}
        >
          {p.vote ?? '?'}
        </div>
      ) : hideVotingStatus ? (
        /* Admin view during voting: all cards hidden equally (no bias) */
        <div className="w-12 h-16 rounded-lg border-2 border-dashed border-slate-600 flex items-center justify-center">
          <span className="text-slate-600 text-xs">—</span>
        </div>
      ) : p.hasVoted ? (
        /* Voting in progress: face-down card (has voted) */
        <div className="w-12 h-16 rounded-lg border-2 border-indigo-500 card-back" />
      ) : (
        /* Voting in progress: empty slot (not voted yet) */
        <div className="w-12 h-16 rounded-lg border-2 border-dashed border-slate-600 flex items-center justify-center">
          <span className="text-slate-600 text-xs">—</span>
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
          <span className="text-indigo-400 font-normal"> (tu)</span>
        )}
      </p>

      {/* Status badge */}
      <span
        className={[
          'text-xs px-2 py-0.5 rounded-full font-medium',
          !p.isVoter
            ? 'bg-slate-700 text-slate-400'
            : hideVotingStatus
              ? 'bg-slate-700 text-slate-500'
              : p.hasVoted
                ? 'bg-emerald-900/70 text-emerald-400'
                : p.isOnline
                  ? 'bg-slate-600 text-slate-400'
                  : 'bg-slate-700 text-slate-600',
        ].join(' ')}
      >
        {!p.isVoter ? 'Facilitator' : hideVotingStatus ? '?' : p.hasVoted ? '✓ Votat' : p.isOnline ? 'Nevotat' : 'Offline'}
      </span>
    </div>
  );
}
