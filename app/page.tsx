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
    <main className="min-h-screen bg-rd-dark flex items-center justify-center p-4">
      <div className="text-center max-w-md w-full">
        <div className="mb-10">
          <div className="flex justify-center mb-5">
            <JesterHat size={96} />
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">Planning Poker</h1>
          <p className="text-rd-subtle text-lg leading-relaxed">
            Agile estimation for remote SCRUM teams.<br />
            Create a room and share the link with your team.
          </p>
        </div>

        <button
          onClick={createRoom}
          disabled={loading}
          className="w-full bg-rd-yellow hover:bg-rd-yellow-hover active:bg-rd-yellow-active disabled:bg-rd-surface-2 disabled:text-rd-muted disabled:cursor-not-allowed text-rd-dark font-semibold px-8 py-4 rounded-xl text-lg transition-colors shadow-lg"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-rd-dark/30 border-t-rd-dark rounded-full animate-spin" />
              Creating room...
            </span>
          ) : (
            '+ Create room'
          )}
        </button>

        {error && (
          <div className="mt-4 bg-red-900/40 border border-red-700 text-red-300 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        <div className="mt-10 grid grid-cols-1 gap-3 text-left">
          {[
            { icon: '🔒', text: 'Private voting — cards are revealed simultaneously' },
            { icon: '🔢', text: 'Fibonacci sequence: 1, 2, 3, 5, 8, 13, 21' },
            { icon: '📊', text: 'Automatic average + recommended Fibonacci' },
            { icon: '⚡', text: 'Auto-reveal when all active participants have voted' },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-start gap-3 text-rd-subtle text-sm">
              <span className="text-base mt-0.5">{icon}</span>
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

function JesterHat({ size = 80 }: { size?: number }) {
  return (
    <div
      className="rounded-full bg-white flex items-center justify-center overflow-hidden shadow-lg"
      style={{ width: size, height: size, padding: size * 0.08 }}
    >
      <img src="/joker-hat.jpg" alt="Planning Poker" className="w-full h-full object-contain" />
    </div>
  );
}
