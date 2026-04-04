'use client';

import { useState } from 'react';

type Props = {
  code: string;
  isAdmin: boolean;
  onJoin: (name: string, isVoter: boolean) => Promise<void>;
};

export default function JoinForm({ code, isAdmin, onJoin }: Props) {
  const [name, setName] = useState('');
  const [isVoter, setIsVoter] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError('');
    try {
      await onJoin(name.trim(), isVoter);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error joining room';
      setError(message);
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-3">
          <JesterHat size={52} />
        </div>
        <h1 className="text-2xl font-bold text-white mb-1">Planning Poker</h1>
        <p className="text-rd-subtle text-sm">
          Room{' '}
          <span className="font-mono font-bold text-rd-yellow tracking-widest">{code}</span>
        </p>
      </div>

      <div className="bg-rd-surface border border-rd-border rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Join room</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm text-rd-subtle mb-1.5">
              Your name <span className="text-red-400">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Alex"
              maxLength={50}
              autoFocus
              className="w-full bg-rd-surface-2 border border-rd-border-2 text-white placeholder-rd-muted rounded-lg px-4 py-3 focus:outline-none focus:border-rd-yellow focus:ring-1 focus:ring-rd-yellow transition"
            />
          </div>

          {/* Voter toggle — only shown to admin */}
          {isAdmin && (
            <div className="flex items-center justify-between gap-3 bg-rd-surface-2 border border-rd-border-2 rounded-lg px-4 py-3 select-none">
              <div>
                <p className="text-sm font-medium text-white">Participate in voting?</p>
                <p className="text-xs text-rd-muted mt-0.5">
                  {isVoter ? 'Yes — vote as a team member' : 'No — observe as a facilitator'}
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={isVoter}
                onClick={() => setIsVoter(v => !v)}
                className={[
                  'relative w-11 h-6 rounded-full transition-colors flex-shrink-0 overflow-hidden focus:outline-none focus:ring-2 focus:ring-rd-yellow',
                  isVoter ? 'bg-rd-yellow' : 'bg-rd-border-2',
                ].join(' ')}
              >
                <span
                  className={[
                    'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform',
                    isVoter ? 'translate-x-5' : 'translate-x-0',
                  ].join(' ')}
                />
              </button>
            </div>
          )}

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="w-full bg-rd-yellow hover:bg-rd-yellow-hover disabled:bg-rd-surface-2 disabled:text-rd-muted disabled:cursor-not-allowed text-rd-dark font-semibold py-3 rounded-lg transition-colors"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-rd-dark/30 border-t-rd-dark rounded-full animate-spin" />
                Joining...
              </span>
            ) : (
              'Join room'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

function JesterHat({ size = 44 }: { size?: number }) {
  const h = Math.round(size * 0.9);
  return (
    <svg width={size} height={h} viewBox="0 0 44 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 35 L6 15 L14 22 L22 2 L30 22 L38 15 L43 35 Z" fill="#FFD000" />
      <rect x="0" y="33" width="44" height="7" rx="3.5" fill="#FFD000" />
      <circle cx="6" cy="13" r="4" fill="#121212" />
      <circle cx="22" cy="1.5" r="4" fill="#121212" />
      <circle cx="38" cy="13" r="4" fill="#121212" />
    </svg>
  );
}
