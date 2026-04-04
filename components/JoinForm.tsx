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
          <JesterHat size={72} />
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

function JesterHat({ size = 64 }: { size?: number }) {
  return (
    <div
      className="rounded-full bg-white flex items-center justify-center overflow-hidden shadow-lg"
      style={{ width: size, height: size, padding: size * 0.08 }}
    >
      <img src="/joker-hat.jpg" alt="Planning Poker" className="w-full h-full object-contain" />
    </div>
  );
}
