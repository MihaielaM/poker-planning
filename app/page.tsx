'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

function DeckMindLogo({ size = 44 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="8" width="26" height="34" rx="4" fill="#1a1a1a" stroke="#FFD000" strokeWidth="1.5"/>
      <rect x="14" y="2" width="26" height="34" rx="4" fill="#FFD000"/>
      <rect x="17" y="7" width="4" height="4" rx="1" fill="#0f0f0f"/>
      <rect x="25" y="25" width="4" height="4" rx="1" fill="#0f0f0f"/>
    </svg>
  );
}

const PREVIEW_CARDS = ['1', '2', '5', '8', '13', '21'];

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

      {/* Grid background */}
      <div className="absolute inset-0 grid-bg pointer-events-none" />
      {/* Vignette over grid */}
      <div className="absolute inset-0 grid-vignette pointer-events-none" />

      <div className="flex flex-col items-center text-center max-w-md w-full gap-10 relative z-10">

        {/* Logo + branding */}
        <div className="flex flex-col items-center gap-4">
          <DeckMindLogo size={52} />
          <div>
            <h1 className="font-display text-5xl font-bold tracking-wider text-white leading-none mb-2 uppercase">
              Planning Poker
            </h1>
            <p className="text-rd-subtle text-sm font-light">
              Estimate together.
            </p>
          </div>
        </div>

        {/* Card preview row */}
        <div className="flex items-end justify-center gap-2">
          {PREVIEW_CARDS.map((val, i) => (
            <div
              key={val}
              className="card-face rounded-lg flex items-end justify-start p-1.5 select-none"
              style={{
                width: 42,
                height: 58,
                transform: `translateY(${i % 2 === 0 ? '0px' : '-5px'})`,
                transition: 'transform 0.2s',
              }}
            >
              <span className="font-display text-xs font-bold text-rd-muted leading-none">{val}</span>
              <span className="font-display text-2xl font-bold text-rd-dark absolute inset-0 flex items-center justify-center">
                {val}
              </span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="w-full flex flex-col gap-3">
          <button
            onClick={createRoom}
            disabled={loading}
            className="w-full bg-rd-yellow hover:bg-rd-yellow-hover active:bg-rd-yellow-active disabled:bg-rd-surface-2 disabled:text-rd-muted disabled:cursor-not-allowed text-rd-dark font-semibold px-8 py-4 rounded-xl text-base transition-all duration-200 shadow-lg hover:shadow-rd-yellow/20 hover:shadow-xl hover:-translate-y-0.5 font-display tracking-widest uppercase"
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
        <div className="w-full flex flex-col gap-0 border border-rd-border rounded-xl overflow-hidden">
          {[
            { num: '01', title: 'Private voting', desc: 'Cards stay hidden until all votes are in.' },
            { num: '02', title: 'Fibonacci sequence', desc: '1, 2, 3, 5, 8, 13, 21, ?, ☕' },
            { num: '03', title: 'Auto-reveal', desc: 'Votes flip simultaneously when everyone is done.' },
          ].map(({ num, title, desc }) => (
            <div key={num} className="flex items-start gap-4 px-4 py-3.5 border-b border-rd-border last:border-b-0 bg-rd-surface/60">
              <span className="font-display text-rd-yellow text-sm font-bold tracking-wider mt-0.5 flex-shrink-0">{num}</span>
              <div className="text-left">
                <p className="text-white text-sm font-semibold leading-tight">{title}</p>
                <p className="text-rd-subtle text-xs mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}
