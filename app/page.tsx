'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import JesterHat from '@/components/JesterHat';

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
    <main className="min-h-screen bg-rd-dark flex items-center justify-center p-6 relative overflow-hidden">

      {/* Background accent blobs */}
      <div className="absolute top-[-120px] right-[-80px] w-[400px] h-[400px] rounded-full bg-rd-yellow opacity-[0.03] blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-100px] left-[-60px] w-[320px] h-[320px] rounded-full bg-rd-purple opacity-[0.04] blur-[80px] pointer-events-none" />

      <div className="flex flex-col items-center text-center max-w-sm w-full gap-8 relative z-10">

        {/* Logo + title */}
        <div className="flex flex-col items-center gap-5">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-rd-yellow opacity-10 blur-2xl scale-150" />
            <JesterHat size={88} />
          </div>
          <div>
            <h1
              className="text-4xl font-bold tracking-tight text-white leading-none mb-2"
              
            >
              Planning Poker
            </h1>
            <p className="text-rd-subtle text-sm leading-relaxed">
              Agile estimation for remote SCRUM teams.<br />
              Create a room and share the link.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="w-full flex flex-col gap-3">
          <button
            onClick={createRoom}
            disabled={loading}
            className="w-full bg-rd-yellow hover:bg-rd-yellow-hover active:bg-rd-yellow-active disabled:bg-rd-surface-2 disabled:text-rd-muted disabled:cursor-not-allowed text-rd-dark font-semibold px-8 py-4 rounded-xl text-base transition-all duration-200 shadow-lg hover:shadow-rd-yellow/20 hover:shadow-xl hover:-translate-y-0.5"
            
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
            <div className="bg-red-950/60 border border-red-800/60 text-red-300 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}
        </div>

        {/* Features */}
        <div className="w-full flex flex-col gap-2.5">
          {[
            { icon: '🔒', text: 'Private voting — cards revealed simultaneously', color: 'text-rd-yellow' },
            { icon: '🔢', text: 'Fibonacci sequence: 1, 2, 3, 5, 8, 13, 21', color: 'text-rd-purple' },
            { icon: '⚡', text: 'Auto-reveal when all participants have voted', color: 'text-rd-cyan' },
          ].map(({ icon, text, color }) => (
            <div key={text} className="flex items-center gap-3 text-rd-subtle text-sm bg-rd-surface/60 border border-rd-border/60 rounded-lg px-3 py-2.5">
              <span className={`text-base flex-shrink-0 ${color}`}>{icon}</span>
              <span>{text}</span>
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}
