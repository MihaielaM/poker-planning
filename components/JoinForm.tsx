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
      const message = err instanceof Error ? err.message : 'Eroare la intrare în cameră';
      setError(message);
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <div className="text-5xl mb-3">🃏</div>
        <h1 className="text-2xl font-bold text-white mb-1">Planning Poker</h1>
        <p className="text-slate-400 text-sm">
          Camera{' '}
          <span className="font-mono font-bold text-indigo-400 tracking-widest">{code}</span>
        </p>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Intră în cameră</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm text-slate-400 mb-1.5">
              Numele tău <span className="text-red-400">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="ex: Mihai"
              maxLength={50}
              autoFocus
              className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-500 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
            />
          </div>

          {/* Voter toggle — only shown to admin */}
          {isAdmin && (
            <div className="flex items-center justify-between gap-3 bg-slate-700/60 border border-slate-600 rounded-lg px-4 py-3 select-none">
              <div>
                <p className="text-sm font-medium text-white">Participi la votare?</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isVoter ? 'Da — votezi ca un membru al echipei' : 'Nu — observi sesiunea ca facilitator'}
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={isVoter}
                onClick={() => setIsVoter(v => !v)}
                className={[
                  'relative w-11 h-6 rounded-full transition-colors flex-shrink-0 overflow-hidden focus:outline-none focus:ring-2 focus:ring-indigo-500',
                  isVoter ? 'bg-indigo-600' : 'bg-slate-500',
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
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Se intră...
              </span>
            ) : (
              'Intră în cameră'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
