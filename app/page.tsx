'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import JesterHat from '@/components/JesterHat';

const PREVIEW_CARDS = ['1', '2', '3', '5', '8', '13', '21'];

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
      <div className="absolute inset-0 cyber-mesh pointer-events-none" />
      <div className="absolute inset-0 grid-bg pointer-events-none" />
      <div className="absolute inset-0 grid-vignette pointer-events-none" />

      <div className="flex flex-col items-center text-center max-w-md w-full gap-10 relative z-10">

        {/* Logo */}
        <div className="flex flex-col items-center gap-5">
          <div className="relative">
            <div className="absolute inset-0 rounded-full blur-3xl scale-150 opacity-20" style={{background: 'radial-gradient(circle, #FFC107, transparent)'}} />
            <JesterHat size={120} />
          </div>
          <div>
            <h1 className="text-5xl font-bold tracking-tight text-white leading-none mb-3">
              Planning Poker
            </h1>
            <p className="text-rd-text text-base leading-relaxed">
              Agile estimation for remote SCRUM teams.<br />
              Create a room and share the link.
            </p>
          </div>
        </div>

        {/* Card preview */}
        <div className="flex items-end justify-center gap-2">
          {PREVIEW_CARDS.map((val, i) => (
            <div
              key={val}
              className="glass-card rounded-xl flex items-center justify-center select-none transition-transform duration-200 hover:-translate-y-2"
              style={{
                width: 44,
                height: 62,
                transform: `translateY(${i % 2 === 0 ? '0px' : '-7px'})`,
              }}
            >
              <span className="font-bold text-xl text-rd-yellow">{val}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="w-full flex flex-col gap-3">
          <button
            onClick={createRoom}
            disabled={loading}
            className="w-full disabled:opacity-40 disabled:cursor-not-allowed font-semibold px-8 py-4 rounded-xl text-base transition-all duration-200 hover:-translate-y-0.5 uppercase tracking-widest"
            style={{
              background: loading ? undefined : 'linear-gradient(135deg, #FFD740 0%, #FFC107 50%, #FFA000 100%)',
              color: '#080808',
              boxShadow: loading ? undefined : '0 0 24px rgba(255,193,7,0.35), 0 4px 16px rgba(0,0,0,0.4)',
            }}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                Creating room...
              </span>
            ) : '+ Create room'}
          </button>

          {error && (
            <div className="glass-card border-red-800/40 text-red-300 text-sm px-4 py-3 rounded-xl" style={{borderColor: 'rgba(239,68,68,0.3)'}}>
              {error}
            </div>
          )}
        </div>

        {/* Feature list */}
        <div className="w-full flex flex-col glass-panel rounded-xl overflow-hidden">
          {[
            { num: '01', title: 'Private voting', desc: 'Cards stay hidden until all votes are in.' },
            { num: '02', title: 'Fibonacci sequence', desc: '1, 2, 3, 5, 8, 13, 21, ?, ☕' },
            { num: '03', title: 'Auto-reveal', desc: 'Votes flip simultaneously when everyone is done.' },
          ].map(({ num, title, desc }) => (
            <div key={num} className="flex items-start gap-4 px-5 py-4 border-b last:border-b-0" style={{borderColor: 'rgba(255,193,7,0.08)'}}>
              <span className="text-sm font-bold tracking-wider mt-0.5 flex-shrink-0" style={{color: '#FFC107'}}>{num}</span>
              <div className="text-left">
                <p className="text-white text-[18px] font-semibold leading-tight">{title}</p>
                <p className="text-rd-text text-[16px] mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}
