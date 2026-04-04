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
      if (!res.ok) throw new Error(data.error || 'Failed to create room');
      localStorage.setItem(`ppoker-${data.code}-admin`, data.adminToken);
      router.push(`/room/${data.code}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Hero */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-5xl">🃏</span>
            <div className="h-12 w-1 bg-yellow-400" />
            <div>
              <h1 className="text-5xl font-black uppercase tracking-tight text-white leading-none">
                Planning<br />Poker
              </h1>
            </div>
          </div>
          <p className="text-zinc-400 text-lg leading-relaxed border-l-2 border-zinc-700 pl-4">
            Agile estimation for remote SCRUM teams.<br />
            Create a room and share the link with your team.
          </p>
        </div>

        {/* CTA */}
        <button
          onClick={createRoom}
          disabled={loading}
          className="w-full bg-yellow-400 hover:bg-yellow-300 active:bg-yellow-500 disabled:bg-zinc-700 disabled:text-zinc-500 disabled:cursor-not-allowed text-zinc-950 font-black uppercase tracking-widest px-8 py-4 text-lg transition-colors"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-3">
              <span className="w-4 h-4 border-2 border-zinc-600 border-t-zinc-950 rounded-full animate-spin" />
              Creating room...
            </span>
          ) : (
            '+ Create room'
          )}
        </button>

        {error && (
          <div className="mt-3 border border-red-700 bg-red-950/40 text-red-400 text-sm px-4 py-3">
            {error}
          </div>
        )}

        {/* Features */}
        <div className="mt-10 space-y-3">
          {[
            { icon: '🔒', text: 'Private voting — cards revealed simultaneously' },
            { icon: '🔢', text: 'Fibonacci sequence: 1, 2, 3, 5, 8, 13, 21' },
            { icon: '⚡', text: 'Auto-reveal when all active participants vote' },
            { icon: '🔥', text: 'Highlights extreme votes for team debate' },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-start gap-3 text-zinc-500 text-sm">
              <span className="mt-0.5">{icon}</span>
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
