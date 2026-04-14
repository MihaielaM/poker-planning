'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

type PodiumEntry = {
  name: string;
  matches: number;
  totalRounds: number;
};

type StatsData = {
  totalRounds: number;
  podium: PodiumEntry[];
};

const BADGES: { minPct: number; label: string; emoji: string; messages: string[] }[] = [
  { minPct: 100, label: 'The Oracle', emoji: '🔮', messages: [
    'Never wrong. Suspiciously accurate.',
    'Are you reading the backlog or the future?',
    'Statistically impossible. Yet here we are.',
    'The Fibonacci gods bow to you.',
    'Every. Single. Round. How.',
    'The team should just ask you and skip the vote.',
  ]},
  { minPct: 80, label: 'Human Fibonacci', emoji: '🧮', messages: [
    'Your brain IS the formula.',
    'Almost psychic. Almost.',
    'Consistently close. Disturbingly so.',
    'You and the team share one brain.',
    'Right more often than wrong. Impressively.',
  ]},
  { minPct: 60, label: 'Team Player', emoji: '🤝', messages: [
    'Thinks like the team. Scarily so.',
    'More often right than not. Respectable.',
    'In sync with the majority. Usually.',
    'A reliable voice in the chaos.',
  ]},
  { minPct: 40, label: 'Lucky Guesser', emoji: '🍀', messages: [
    'Right enough to feel good about it.',
    'Coin flip energy, but make it Fibonacci.',
    'Sometimes a shot in the dark hits.',
    'Not the worst estimator in the room.',
  ]},
  { minPct: 1, label: 'Participant', emoji: '🎟️', messages: [
    'Showed up. That counts.',
    'Voted. Points for participation.',
    'Present and accounted for.',
    'At least you were there.',
  ]},
];

function seededIndex(name: string, len: number) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return h % len;
}

function getBadge(matches: number, totalRounds: number, name: string) {
  const pct = totalRounds > 0 ? (matches / totalRounds) * 100 : 0;
  const badge = BADGES.find(b => pct >= b.minPct) ?? BADGES[BADGES.length - 1];
  return { ...badge, message: badge.messages[seededIndex(name, badge.messages.length)] };
}

type Props = {
  roomCode: string;
  adminToken: string;
};

export default function SessionStats({ roomCode, adminToken }: Props) {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/rooms/${roomCode}/stats`);
      const data = await res.json();
      setStats(data);
      setOpen(true);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  if (!adminToken) return null;

  return (
    <>
      <button
        onClick={load}
        disabled={loading}
        className="bg-rd-surface-2 hover:bg-rd-border border border-rd-border-2 text-rd-subtle hover:text-white text-sm px-3 py-2 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
      >
        🏆 Session stats
      </button>

      {mounted && open && stats && createPortal(
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-rd-surface border border-rd-border rounded-2xl p-6 w-full max-w-lg"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-white">Session Summary</h2>
                <p className="text-rd-subtle text-sm">
                  {stats.totalRounds} completed round{stats.totalRounds !== 1 ? 's' : ''}
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-rd-muted hover:text-rd-text text-xl"
              >
                ✕
              </button>
            </div>

            {stats.totalRounds === 0 ? (
              <p className="text-rd-muted text-sm text-center py-8">
                No completed rounds yet. Finish at least one round to see stats.
              </p>
            ) : stats.podium.length === 0 ? (
              <p className="text-rd-muted text-sm text-center py-8">
                No numeric votes recorded.
              </p>
            ) : (
              <div className="space-y-3">
                <p className="text-rd-subtle text-xs font-medium uppercase tracking-wider mb-4">
                  🏆 Best estimators this session
                </p>
                {stats.podium.map((entry, i) => {
                  const badge = getBadge(entry.matches, entry.totalRounds, entry.name);
                  const pct = Math.round((entry.matches / entry.totalRounds) * 100);
                  return (
                    <div
                      key={entry.name}
                      className={[
                        'flex items-center gap-4 p-4 rounded-xl border',
                        i === 0
                          ? 'bg-rd-yellow-dim border-rd-yellow-border'
                          : 'bg-rd-surface-2 border-rd-border',
                      ].join(' ')}
                    >
                      <span className="text-2xl w-8 text-center flex-shrink-0">
                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                      </span>

                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold truncate">{entry.name}</p>
                        <p className="text-rd-subtle text-xs mt-0.5">
                          {badge.emoji}{' '}
                          <span className="text-rd-yellow font-medium">{badge.label}</span>
                          {' — '}{badge.message}
                        </p>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <p className={[
                          'font-bold text-lg',
                          i === 0 ? 'text-rd-yellow' : 'text-white',
                        ].join(' ')}>{pct}%</p>
                        <p className="text-rd-muted text-xs">{entry.matches}/{entry.totalRounds}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
