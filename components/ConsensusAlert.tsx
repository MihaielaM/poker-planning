'use client';

import { useEffect, useState } from 'react';

const CONFETTI_COLORS = ['#facc15', '#ffffff', '#a1a1aa', '#fde68a', '#fbbf24'];

const MESSAGES = [
  "Perfect consensus! The team is one mind 🧠",
  "Everyone agrees! That's practically a miracle 🎊",
  "Unanimous! Buy this team a coffee ☕",
  "100% agreement! Screenshot this, it won't happen again 📸",
  "The team has spoken — all with one voice 🎤",
  "Consensus achieved! No debate needed today 🕊️",
  "Flawless sync! Are you all the same person? 👀",
  "Full agreement! The Fibonacci gods are pleased 🔢",
];

function seededMessage(round: number) {
  return MESSAGES[round % MESSAGES.length];
}

type Particle = {
  id: number;
  x: number;
  delay: number;
  duration: number;
  color: string;
  size: number;
  rotate: number;
};

function makeParticles(count = 60): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    delay: Math.random() * 1.2,
    duration: 2.5 + Math.random() * 1.5,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    size: 6 + Math.random() * 8,
    rotate: Math.random() * 360,
  }));
}

export default function ConsensusAlert({ roundNumber }: { roundNumber: number }) {
  const [visible, setVisible] = useState(true);
  const [particles] = useState(makeParticles);

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 5000);
    return () => clearTimeout(t);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      {/* Confetti particles */}
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute top-0 confetti-fall"
          style={{
            left: `${p.x}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '0px',
            transform: `rotate(${p.rotate}deg)`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}

      {/* Banner */}
      <div className="pointer-events-auto absolute top-24 left-1/2 -translate-x-1/2 w-full max-w-sm px-4">
        <div className="bg-zinc-900 border-2 border-yellow-400 px-5 py-4 shadow-2xl shadow-yellow-400/10 text-center">
          <div className="text-4xl mb-2">🎉</div>
          <p className="text-yellow-400 font-black uppercase tracking-wide text-sm leading-snug">
            {seededMessage(roundNumber)}
          </p>
        </div>
      </div>
    </div>
  );
}
