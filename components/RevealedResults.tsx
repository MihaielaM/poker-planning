import { EXTREME_BANNER_MESSAGES, seededPick } from '@/lib/messages';

type Stats = {
  average: number | null;
  nearestFibonacci: number | null;
  totalVoters: number;
};

export default function RevealedResults({ stats, hasExtremeVotes, roundNumber }: { stats: Stats; hasExtremeVotes: boolean; roundNumber: number }) {
  const bannerMessage = hasExtremeVotes
    ? seededPick(EXTREME_BANNER_MESSAGES, String(roundNumber))
    : null;

  return (
    <div className="space-y-3">
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
      <p className="text-slate-400 text-xs mb-4 font-medium uppercase tracking-wider">
        Round results
      </p>

      {stats.average !== null ? (
        <div className="flex flex-wrap gap-8 items-center">
          <StatBlock
            value={stats.average.toFixed(1)}
            label="Vote average"
            color="text-white"
          />
          {stats.nearestFibonacci !== null && (
            <StatBlock
              value={String(stats.nearestFibonacci)}
              label="Recommended Fibonacci"
              color="text-indigo-400"
              highlight
            />
          )}
          <StatBlock
            value={String(stats.totalVoters)}
            label="Numeric votes"
            color="text-slate-300"
          />
        </div>
      ) : (
        <p className="text-slate-500 text-sm">
          No numeric votes in this round.
        </p>
      )}
    </div>

    {/* Debate banner for extreme votes */}
    {bannerMessage && (
      <div className="bg-amber-950/60 border border-amber-700/60 rounded-xl px-4 py-3 flex items-start gap-3">
        <span className="text-xl mt-0.5">🔥</span>
        <p className="text-amber-300 text-sm font-medium leading-snug">{bannerMessage}</p>
      </div>
    )}
    </div>
  );
}

function StatBlock({
  value,
  label,
  color,
  highlight,
}: {
  value: string;
  label: string;
  color: string;
  highlight?: boolean;
}) {
  return (
    <div className="text-center">
      <p
        className={[
          'text-3xl font-bold',
          color,
          highlight ? 'ring-2 ring-indigo-500/40 bg-indigo-900/30 px-3 py-1 rounded-lg' : '',
        ].join(' ')}
      >
        {value}
      </p>
      <p className="text-slate-500 text-xs mt-1">{label}</p>
    </div>
  );
}
