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
            <JesterHat size={64} />
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
