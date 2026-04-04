'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function createRoom() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/rooms', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Eroare la creare cameră');
      localStorage.setItem(`ppoker-${data.code}-admin`, data.adminToken);
      router.push(`/room/${data.code}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'A apărut o eroare';
      setError(message);
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="text-center max-w-md w-full">
        <div className="mb-10">
          <div className="text-7xl mb-5">🃏</div>
          <h1 className="text-4xl font-bold text-white mb-3">Planning Poker</h1>
          <p className="text-slate-400 text-lg leading-relaxed">
            Estimare agilă pentru echipe SCRUM remote.<br />
            Creează o cameră și trimite link-ul colegilor tăi.
          </p>
        </div>

        <button
          onClick={createRoom}
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-semibold px-8 py-4 rounded-xl text-lg transition-colors shadow-lg"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Se creează camera...
            </span>
          ) : (
            '+ Creează cameră'
          )}
        </button>

        {error && (
          <div className="mt-4 bg-red-900/40 border border-red-700 text-red-300 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        <div className="mt-10 grid grid-cols-1 gap-3 text-left">
          {[
            { icon: '🔒', text: 'Votare privată — cardurile se dezvăluie simultan' },
            { icon: '🔢', text: 'Șirul Fibonacci: 1, 2, 3, 5, 8, 13, 21' },
            { icon: '📊', text: 'Medie automată + Fibonacci recomandat' },
            { icon: '⚡', text: 'Auto-reveal când toți participanții activi au votat' },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-start gap-3 text-slate-400 text-sm">
              <span className="text-base mt-0.5">{icon}</span>
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
