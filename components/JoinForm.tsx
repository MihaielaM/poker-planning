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
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl">🃏</span>
          <div className="h-10 w-1 bg-yellow-400" />
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight text-white leading-none">
              Planning Poker
            </h1>
          </div>
        </div>
        <p className="text-zinc-500 text-sm border-l-2 border-zinc-700 pl-3">
          Room <span className="font-black text-yellow-400 tracking-widest">{code}</span>
        </p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800">
        <div className="border-b-2 border-yellow-400 px-5 py-3">
          <h2 className="text-sm font-black uppercase tracking-widest text-white">Join room</h2>
        </div>
        <div className="p-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">
                Your name <span className="text-yellow-400">*</span>
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Alex"
                maxLength={50}
                autoFocus
                className="w-full bg-zinc-950 border border-zinc-700 focus:border-yellow-400 text-white placeholder-zinc-600 px-4 py-3 outline-none transition-colors text-sm"
              />
            </div>

            {/* Voter toggle — only shown to admin */}
            {isAdmin && (
              <div className="flex items-center justify-between gap-3 bg-zinc-950 border border-zinc-700 px-4 py-3 select-none">
                <div>
                  <p className="text-sm font-bold uppercase tracking-wide text-white">Participate in voting?</p>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {isVoter ? 'Yes — vote as a team member' : 'No — observe as a facilitator'}
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={isVoter}
                  onClick={() => setIsVoter(v => !v)}
                  className={[
                    'relative w-11 h-6 rounded-full transition-colors flex-shrink-0 overflow-hidden focus:outline-none',
                    isVoter ? 'bg-yellow-400' : 'bg-zinc-700',
                  ].join(' ')}
                >
                  <span
                    className={[
                      'absolute top-0.5 left-0.5 w-5 h-5 rounded-full shadow transition-transform',
                      isVoter ? 'bg-zinc-950 translate-x-5' : 'bg-zinc-400 translate-x-0',
                    ].join(' ')}
                  />
                </button>
              </div>
            )}

            {error && <p className="text-red-400 text-xs font-bold uppercase tracking-wide">{error}</p>}

            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="w-full bg-yellow-400 hover:bg-yellow-300 disabled:bg-zinc-700 disabled:text-zinc-500 disabled:cursor-not-allowed text-zinc-950 font-black uppercase tracking-widest py-3 transition-colors text-sm"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-zinc-600 border-t-zinc-950 rounded-full animate-spin" />
                  Joining...
                </span>
              ) : (
                'Join room'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
