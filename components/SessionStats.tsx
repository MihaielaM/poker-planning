'use client';

import { useState } from 'react';

type PodiumEntry = {
  name: string;
  matches: number;
  totalRounds: number;
};

type StatsData = {
  totalRounds: number;
  podium: PodiumEntry[];
};

const BADGES = [
  { minPct: 100, label: 'The Oracle', emoji: '🔮', message: 'Never wrong. Suspiciously accurate.' },
  { minPct: 80,  label: 'Human Fibonacci', emoji: '🧮', message: 'Your brain IS the formula.' },
  { minPct: 60,  label: 'Team Player', emoji: '🤝', message: 'Thinks like the team. Scarily so.' },
  { minPct: 40,  label: 'Lucky Guesser', emoji: '🍀', message: 'Right enough to feel good about it.' },
  { minPct: 1,   label: 'Participant', emoji: '🎟️', message: 'Showed up. That counts.' },
];

function getBadge(matches: number, totalRounds: number) {
  const pct = totalRounds > 0 ? (matches / totalRounds) * 100 : 0;
  return BADGES.find(b => pct >= b.minPct) ?? BADGES[BADGES.length - 1];
}

type Props = {
  roomCode: string;
  adminToken: string;
};

export default function SessionStats({ roomCode, adminToken }: Props) {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

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
        className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-yellow-400 text-zinc-400 hover:text-yellow-400 text-xs font-black uppercase tracking-widest px-3 py-2 transition-colors flex items-center gap-2 disabled:opacity-50"
      >
        📊 Stats
      </button>

      {open && stats && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-zinc-900 border border-zinc-800 w-full max-w-lg max-h-[80vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="border-b-2 border-yellow-400 px-5 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-black uppercase tracking-widest text-white">Session Summary</h2>
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-0.5">
                  {stats.totalRounds} completed round{stats.totalRounds !== 1 ? 's' : ''}
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-zinc-600 hover:text-yellow-400 text-xl font-black transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-5">
              {stats.totalRounds === 0 ? (
                <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest text-center py-8">
                  No completed rounds yet. Finish at least one round to see stats.
                </p>
              ) : stats.podium.length === 0 ? (
                <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest text-center py-8">
                  No numeric votes recorded.
                </p>
              ) : (
                <div className="space-y-2">
                  <p className="text-zinc-600 text-xs font-black uppercase tracking-widest mb-4">
                    🏆 Best estimators this session
                  </p>
                  {stats.podium.map((entry, i) => {
                    const badge = getBadge(entry.matches, entry.totalRounds);
                    const pct = Math.round((entry.matches / entry.totalRounds) * 100);
                    return (
                      <div
                        key={entry.name}
                        className={[
                          'flex items-center gap-4 px-4 py-3 border-l-4',
                          i === 0
                            ? 'bg-zinc-800 border-l-yellow-400'
                            : 'bg-zinc-950 border-l-zinc-700',
                        ].join(' ')}
                      >
                        {/* Rank */}
                        <span className="text-2xl w-8 text-center flex-shrink-0">
                          {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                        </span>

                        {/* Name + badge */}
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-black uppercase tracking-wide text-sm truncate">
                            {entry.name}
                          </p>
                          <p className="text-zinc-500 text-xs mt-0.5 font-bold">
                            {badge.emoji}{' '}
                            <span className="text-yellow-400">{badge.label}</span>
                            {' — '}{badge.message}
                          </p>
                        </div>

                        {/* Score */}
                        <div className="text-right flex-shrink-0">
                          <p className={[
                            'font-black text-lg',
                            i === 0 ? 'text-yellow-400' : 'text-white',
                          ].join(' ')}>{pct}%</p>
                          <p className="text-zinc-600 text-xs font-bold">{entry.matches}/{entry.totalRounds}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
