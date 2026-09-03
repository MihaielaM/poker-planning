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
  totalPlayed: number;
  podium: PodiumEntry[];
};

const BADGES: { minPct: number; variants: { label: string; emoji: string; message: string }[] }[] = [
  { minPct: 100, variants: [
    { label: 'The Oracle',       emoji: '🔮', message: 'Never wrong. Suspiciously accurate.' },
    { label: 'Mind Reader',      emoji: '🧠', message: 'Are you reading the backlog or the future?' },
    { label: 'Fibonacci Saint',  emoji: '✨', message: 'The Fibonacci gods bow to you.' },
    { label: 'Time Traveler',    emoji: '⏳', message: 'Statistically impossible. Yet here we are.' },
    { label: 'Zero Misses',      emoji: '🎯', message: 'Every. Single. Round. How.' },
    { label: 'The Algorithm',    emoji: '💡', message: 'The team should just ask you and skip the vote.' },
  ]},
  { minPct: 80, variants: [
    { label: 'Human Fibonacci',  emoji: '📏', message: 'Your brain IS the formula.' },
    { label: 'Almost Psychic',   emoji: '🔭', message: 'Almost psychic. Almost.' },
    { label: 'Pattern Seeker',   emoji: '📐', message: 'Consistently close. Disturbingly so.' },
    { label: 'Team Brain',       emoji: '👥', message: 'You and the team share one brain.' },
    { label: 'Reliable Voice',   emoji: '📣', message: 'Right more often than wrong. Impressively.' },
  ]},
  { minPct: 60, variants: [
    { label: 'Team Player',      emoji: '🤝', message: 'Thinks like the team. Scarily so.' },
    { label: 'Solid Estimator',  emoji: '📊', message: 'More often right than not. Respectable.' },
    { label: 'In Sync',          emoji: '🎵', message: 'In sync with the majority. Usually.' },
    { label: 'Steady Hand',      emoji: '⚖️', message: 'A reliable voice in the chaos.' },
  ]},
  { minPct: 40, variants: [
    { label: 'Lucky Guesser',    emoji: '🍀', message: 'Right enough to feel good about it.' },
    { label: 'Coin Flipper',     emoji: '🎲', message: 'Coin flip energy, but make it Fibonacci.' },
    { label: 'Dark Horse',       emoji: '🌙', message: 'Sometimes a shot in the dark hits.' },
    { label: 'Could Be Worse',   emoji: '🤷', message: 'Not the worst estimator in the room.' },
  ]},
  { minPct: 1, variants: [
    { label: 'Participant',      emoji: '🎟️', message: 'Showed up. That counts.' },
    { label: 'Present',          emoji: '🙋', message: 'Voted. Points for participation.' },
    { label: 'Here I Am',        emoji: '👋', message: 'Present and accounted for.' },
    { label: 'Just Vibing',      emoji: '😌', message: 'At least you were there.' },
  ]},
  { minPct: 0, variants: [
    { label: 'Lone Wolf',        emoji: '🐺', message: 'Marched to their own beat every round.' },
    { label: 'The Contrarian',   emoji: '🎭', message: 'Zero matches. Perfectly disagreeable.' },
    { label: 'Free Spirit',      emoji: '🕊️', message: 'Never quite with the herd.' },
    { label: 'The Rebel',        emoji: '🃏', message: 'Everyone else zigged. They zagged.' },
  ]},
];

function seededIndex(name: string, len: number) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return h % len;
}

// Assigns one badge per podium entry, guaranteeing no two entries ever share
// the same badge text. Preference order: seeded pick inside the entry's own
// tier, then the first free variant in that tier, then free variants borrowed
// from the nearest tiers (lower first) once the tier runs out of variants.
function assignBadges(podium: PodiumEntry[]) {
  const used = new Set<{ label: string; emoji: string; message: string }>();

  return podium.map(entry => {
    const pct = entry.totalRounds > 0 ? (entry.matches / entry.totalRounds) * 100 : 0;
    const tierIdx = Math.max(0, BADGES.findIndex(b => pct >= b.minPct));
    // search own tier first, then neighbours: lower tiers, then higher ones
    const searchOrder = [
      BADGES[tierIdx],
      ...BADGES.slice(tierIdx + 1),
      ...BADGES.slice(0, tierIdx).reverse(),
    ];

    for (const tier of searchOrder) {
      const start = seededIndex(entry.name, tier.variants.length);
      for (let step = 0; step < tier.variants.length; step++) {
        const variant = tier.variants[(start + step) % tier.variants.length];
        if (!used.has(variant)) {
          used.add(variant);
          return variant;
        }
      }
    }
    // all 23 variants taken (podium larger than the full pool) — last resort
    const tier = BADGES[tierIdx];
    return tier.variants[seededIndex(entry.name, tier.variants.length)];
  });
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

  const badges = stats ? assignBadges(stats.podium) : [];
  // Competition ranking: ties share the same rank (1, 1, 3 rather than 1, 2, 3).
  const ranks: number[] = [];
  stats?.podium.forEach((entry, i) => {
    if (i === 0) ranks.push(1);
    else if (entry.matches === stats.podium[i - 1].matches) ranks.push(ranks[i - 1]);
    else ranks.push(i + 1);
  });
  const rankEmoji = (rank: number) =>
    rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;

  return (
    <>
      <button
        onClick={load}
        disabled={loading}
        className="bg-rd-surface-2 hover:bg-rd-border border border-rd-border-2 text-rd-subtle hover:text-white text-base px-3 py-2 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
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
                <h2 className="text-xl font-bold text-white">Session Summary</h2>
                <p className="text-rd-subtle text-base">
                  {stats.totalRounds} scored / {stats.totalPlayed} total round{stats.totalPlayed !== 1 ? 's' : ''}
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-rd-muted hover:text-rd-text text-xl"
              >
                ✕
              </button>
            </div>

            {stats.totalPlayed === 0 ? (
              <p className="text-rd-muted text-base text-center py-8">
                No completed rounds yet. Finish at least one round to see stats.
              </p>
            ) : stats.totalRounds === 0 ? (
              <p className="text-rd-muted text-base text-center py-8">
                No rounds scored yet. Set a <span className="text-rd-yellow font-medium">Final SP</span> after reveal to include a round in the leaderboard.
              </p>
            ) : stats.podium.length === 0 ? (
              <p className="text-rd-muted text-base text-center py-8">
                No votes recorded in the scored rounds.
              </p>
            ) : (
              <div className="space-y-3">
                <p className="text-rd-subtle text-sm font-medium uppercase tracking-wider mb-4">
                  🏆 Best estimators this session
                </p>
                {stats.podium.map((entry, i) => {
                  const badge = badges[i];
                  const pct = Math.round((entry.matches / entry.totalRounds) * 100);
                  const rank = ranks[i];
                  const isFirst = rank === 1;
                  return (
                    <div
                      key={entry.name}
                      className={[
                        'flex items-center gap-4 p-4 rounded-xl border',
                        isFirst
                          ? 'bg-rd-yellow-dim border-rd-yellow-border'
                          : 'bg-rd-surface-2 border-rd-border',
                      ].join(' ')}
                    >
                      <span className="text-2xl w-8 text-center flex-shrink-0">
                        {rankEmoji(rank)}
                      </span>

                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold truncate">{entry.name}</p>
                        <p className="text-rd-subtle text-sm mt-0.5">
                          {badge.emoji}{' '}
                          <span className="text-rd-yellow font-medium">{badge.label}</span>
                          {' — '}{badge.message}
                        </p>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <p className={[
                          'font-bold text-xl',
                          isFirst ? 'text-rd-yellow' : 'text-white',
                        ].join(' ')}>{pct}%</p>
                        <p className="text-rd-muted text-sm">{entry.matches}/{entry.totalRounds}</p>
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
