'use client';

import { useState } from 'react';
import JesterHat from './JesterHat';

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
        <div className="flex justify-center mb-4 relative">
          <div className="absolute inset-0 rounded-full blur-3xl scale-150 opacity-20" style={{background: 'radial-gradient(circle, #FFC107, transparent)'}} />
          <JesterHat size={80} />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
          Planning Poker
        </h1>
        <p className="text-rd-text text-base">
          Room{' '}
          <span className="font-mono font-bold tracking-widest neon-gold">{code}</span>
        </p>
      </div>

      <div className="glass-panel rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-white mb-4 uppercase tracking-widest" style={{color: 'rgba(255,193,7,0.7)'}}>
          Join room
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-xs mb-1.5 uppercase tracking-wider" style={{color: 'rgba(255,193,7,0.5)'}}>
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
              className="w-full text-white placeholder-rd-subtle rounded-xl px-4 py-3 focus:outline-none transition-all text-sm"
              style={{
                background: 'rgba(10,8,4,0.8)',
                border: '1px solid rgba(255,193,7,0.15)',
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(255,193,7,0.4)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,193,7,0.15)'}
            />
          </div>

          {isAdmin && (
            <div className="flex items-center justify-between gap-3 rounded-xl px-4 py-3 select-none" style={{background: 'rgba(10,8,4,0.6)', border: '1px solid rgba(255,193,7,0.1)'}}>
              <div>
                <p className="text-sm font-medium text-white">Participate in voting?</p>
                <p className="text-xs mt-0.5" style={{color: 'rgba(255,193,7,0.4)'}}>
                  {isVoter ? 'Yes — vote as a team member' : 'No — observe as a facilitator'}
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={isVoter}
                onClick={() => setIsVoter(v => !v)}
                className="relative w-11 h-6 rounded-full transition-colors flex-shrink-0 focus:outline-none"
                style={{background: isVoter ? '#FFC107' : 'rgba(255,193,7,0.15)'}}
              >
                <span
                  className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200"
                  style={{transform: isVoter ? 'translateX(20px)' : 'translateX(0)'}}
                />
              </button>
            </div>
          )}

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="w-full disabled:opacity-40 disabled:cursor-not-allowed font-semibold py-3 rounded-xl transition-all duration-200 text-sm tracking-widest hover:-translate-y-0.5 uppercase"
            style={{
              background: 'linear-gradient(135deg, #FFD740 0%, #FFC107 50%, #FFA000 100%)',
              color: '#080808',
              boxShadow: '0 0 20px rgba(255,193,7,0.3)',
            }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                Joining...
              </span>
            ) : 'Join room'}
          </button>
        </form>
      </div>
    </div>
  );
}
