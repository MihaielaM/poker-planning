'use client';

import { useEffect, useState } from 'react';

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
        className="bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white text-sm px-3 py-2 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
      >
        📊 Session stats
      </button>

      {open && stats && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div
            className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-white">Session Summary</h2>
                <p className="text-slate-400 text-sm">{stats.totalRounds} completed round{stats.totalRounds !== 1 ? 's' : ''}</p>
              </div>
              <button onClick={() => setOpen(false)} className="text-slate-500 hover:text-slate-300 text-xl">✕</button>
            </div>

            {stats.totalRounds === 0 ? (
              <p className="text-slate-500 text-sm text-center py-8">No completed rounds yet. Finish at least one round to see stats.</p>
            ) : stats.podium.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-8">No numeric votes recorded.</p>
            ) : (
              <div className="space-y-3">
                <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-4">
                  🏆 Best estimators this session
                </p>
                {stats.podium.map((entry, i) => {
                  const badge = getBadge(entry.matches, entry.totalRounds);
                  const pct = Math.round((entry.matches / entry.totalRounds) * 100);
                  return (
                    <div
                      key={entry.name}
                      className={[
                        'flex items-center gap-4 p-4 rounded-xl border',
                        i === 0
                          ? 'bg-amber-950/50 border-amber-700/60'
                          : 'bg-slate-700/40 border-slate-700',
                      ].join(' ')}
                    >
                      {/* Rank */}
                      <span className="text-2xl w-8 text-center flex-shrink-0">
                        {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                      </span>

                      {/* Name + badge */}
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold truncate">{entry.name}</p>
                        <p className="text-slate-400 text-xs mt-0.5">
                          {badge.emoji} <span className="text-amber-400 font-medium">{badge.label}</span>
                          {' — '}{badge.message}
                        </p>
                      </div>

                      {/* Score */}
                      <div className="text-right flex-shrink-0">
                        <p className="text-white font-bold text-lg">{pct}%</p>
                        <p className="text-slate-500 text-xs">{entry.matches}/{entry.totalRounds}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
