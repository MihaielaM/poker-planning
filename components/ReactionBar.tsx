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
            <span className="text-xs text-white/70 bg-black/40 px-1.5 py-0.5 rounded-full whitespace-nowrap">
              {f.name}
            </span>
          </div>
        ))}
      </div>

      {/* Reaction buttons */}
      <div className="bg-rd-surface border border-rd-border rounded-xl px-4 py-3">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-rd-muted text-xs font-medium uppercase tracking-wider">React</span>
          <div className="flex gap-2 flex-wrap">
            {EMOJIS.map(emoji => (
              <button
                key={emoji}
                onClick={() => sendReaction(emoji)}
                disabled={!!cooldowns[emoji]}
                className="text-xl transition-all select-none disabled:opacity-30 disabled:cursor-not-allowed hover:scale-125 active:scale-95"
                title={emoji}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
