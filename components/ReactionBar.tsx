'use client';

import { useEffect, useRef, useState } from 'react';
import { Reaction } from '@/lib/types';

const EMOJIS = ['👍', '🔥', '😱', '😂', '🤔\uFE0F', '🎉', '💀', '🥴'];
const COOLDOWN_MS = 2000;

type FloatingReaction = {
  id: string;
  emoji: string;
  name: string;
  x: number;
};

type Props = {
  reactions: Reaction[];
  participantToken: string;
  roomCode: string;
};

export default function ReactionBar({ reactions, participantToken, roomCode }: Props) {
  const [floating, setFloating] = useState<FloatingReaction[]>([]);
  const [cooldowns, setCooldowns] = useState<Record<string, boolean>>({});
  const seenIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    reactions.forEach(r => {
      const id = `${r.participantName}-${r.emoji}-${r.createdAt}`;
      if (!seenIds.current.has(id)) {
        seenIds.current.add(id);
        const floater: FloatingReaction = {
          id,
          emoji: r.emoji,
          name: r.participantName,
          x: 10 + Math.random() * 80,
        };
        setFloating(prev => [...prev, floater]);
        setTimeout(() => {
          setFloating(prev => prev.filter(f => f.id !== id));
        }, 2800);
      }
    });
  }, [reactions]);

  const sendReaction = async (emoji: string) => {
    if (cooldowns[emoji]) return;
    setCooldowns(prev => ({ ...prev, [emoji]: true }));
    setTimeout(() => setCooldowns(prev => ({ ...prev, [emoji]: false })), COOLDOWN_MS);
    try {
      await fetch(`/api/rooms/${roomCode}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emoji, participantToken }),
      });
    } catch {
      // Silent fail
    }
  };

  return (
    <>
      {/* Floating reactions overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {floating.map(f => (
          <div
            key={f.id}
            className="absolute bottom-24 flex flex-col items-center gap-1 reaction-float"
            style={{ left: `${f.x}%` }}
          >
            <span className="text-3xl">{f.emoji}</span>
            <span className="text-xs text-white/70 bg-black/50 px-1.5 py-0.5 rounded-full whitespace-nowrap">
              {f.name}
            </span>
          </div>
        ))}
      </div>

      {/* Vertical glass panel */}
      <div className="glass-panel rounded-2xl p-2 flex flex-col gap-1" style={{boxShadow: '0 0 30px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,193,7,0.06)'}}>
        <p className="text-center text-[10px] font-medium uppercase tracking-widest py-1 mb-1" style={{color: 'rgba(255,193,7,0.4)'}}>React</p>
        {EMOJIS.map(emoji => (
          <button
            key={emoji}
            onClick={() => sendReaction(emoji)}
            disabled={!!cooldowns[emoji]}
            className="w-10 h-10 flex items-center justify-center text-xl rounded-xl transition-all select-none disabled:opacity-30 disabled:cursor-not-allowed hover:scale-125 active:scale-95"
            style={{
              background: cooldowns[emoji] ? 'rgba(255,193,7,0.05)' : 'transparent',
            }}
            onMouseEnter={e => {
              if (!cooldowns[emoji]) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,193,7,0.1)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
            }}
            title={emoji}
          >
            {emoji}
          </button>
        ))}
      </div>
    </>
  );
}
