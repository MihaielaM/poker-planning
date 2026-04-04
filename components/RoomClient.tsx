'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { RoomData } from '@/lib/types';
import JoinForm from './JoinForm';
import VotingCards from './VotingCards';
import ParticipantsList from './ParticipantsList';
import ReactionBar from './ReactionBar';
import SessionStats from './SessionStats';
import ConsensusAlert from './ConsensusAlert';

type Session = {
  token: string;
  id: string;
  name: string;
  isVoter: boolean;
};

const POLL_INTERVAL_MS = 2000;
const PING_INTERVAL_MS = 30000;

export default function RoomClient({ code }: { code: string }) {
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(`ppoker-${code}-admin`);
  });
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [roomError, setRoomError] = useState('');
  const [actionError, setActionError] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSubmittingVote, setIsSubmittingVote] = useState(false);

  const [showConsensus, setShowConsensus] = useState(false);
  const lastRoundRef = useRef<number | null>(null);
  const lastStatusRef = useRef<string | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Read localStorage on mount ──────────────────────────────────────────
  useEffect(() => {
    const stored = localStorage.getItem(`ppoker-${code}-session`);
    const storedAdmin = localStorage.getItem(`ppoker-${code}-admin`);

    if (stored) {
      try {
        setSession(JSON.parse(stored) as Session);
      } catch {
        localStorage.removeItem(`ppoker-${code}-session`);
      }
    }
    if (storedAdmin && !adminToken) {
      setAdminToken(storedAdmin);
    }
  }, [code]);

  // ── Fetch room state ────────────────────────────────────────────────────
  const fetchRoom = useCallback(async () => {
    try {
      const res = await fetch(`/api/rooms/${code}`);
      if (!res.ok) {
        if (res.status === 404) setRoomError('Room not found.');
        return;
      }
      const data: RoomData = await res.json();
      setRoomData(data);

      // Reset card selection when a new round starts
      if (lastRoundRef.current !== null && lastRoundRef.current !== data.room.roundNumber) {
        setSelectedCard(null);
        setShowConsensus(false);
      }
      lastRoundRef.current = data.room.roundNumber;

      // Detect consensus on the moment of reveal
      const justBecameRevealed = lastStatusRef.current === 'waiting' && data.room.status === 'revealed';
      lastStatusRef.current = data.room.status;
      if (justBecameRevealed) {
        const votedVoters = data.participants.filter(p => p.isVoter && p.hasVoted);
        const uniqueVotes = new Set(votedVoters.map(p => p.vote));
        if (votedVoters.length > 1 && uniqueVotes.size === 1) {
          setShowConsensus(true);
        }
      }

      setInitialLoading(false);
    } catch {
      // Silent — network hiccup, will retry
    }
  }, [code]);

  // ── Polling ─────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchRoom();
    pollingRef.current = setInterval(fetchRoom, POLL_INTERVAL_MS);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [fetchRoom]);

  // ── Ping to stay "online" ────────────────────────────────────────────────
  useEffect(() => {
    if (!session) return;

    const ping = () => {
      fetch(`/api/rooms/${code}/ping`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantToken: session.token }),
      }).catch(() => {});
    };

    ping();
    pingRef.current = setInterval(ping, PING_INTERVAL_MS);
    return () => {
      if (pingRef.current) clearInterval(pingRef.current);
    };
  }, [session, code]);

  // ── Reconnect on load if token exists ───────────────────────────────────
  useEffect(() => {
    if (!session) return;
    fetch(`/api/rooms/${code}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ existingToken: session.token }),
    })
      .then(async res => {
        if (!res.ok) {
          // Token is invalid — force re-join
          localStorage.removeItem(`ppoker-${code}-session`);
          setSession(null);
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]); // Only on mount

  // ── Join handler ─────────────────────────────────────────────────────────
  const handleJoin = async (name: string, isVoter: boolean) => {
    const res = await fetch(`/api/rooms/${code}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, isVoter }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error joining room');

    const newSession: Session = {
      token: data.participantToken,
      id: data.participantId,
      name: data.name,
      isVoter: data.isVoter,
    };
    localStorage.setItem(`ppoker-${code}-session`, JSON.stringify(newSession));
    setSession(newSession);
    fetchRoom();
  };

  // ── Vote handler ──────────────────────────────────────────────────────────
  const handleVote = async (value: string) => {
    if (!session || isSubmittingVote) return;
    setIsSubmittingVote(true);
    setSelectedCard(value);
    setActionError('');

    try {
      const res = await fetch(`/api/rooms/${code}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value, participantToken: session.token }),
      });
      if (!res.ok) {
        const data = await res.json();
        setActionError(data.error || 'Vote error');
        setSelectedCard(null);
      } else {
        fetchRoom();
      }
    } catch {
      setActionError('Network error while voting');
      setSelectedCard(null);
    } finally {
      setIsSubmittingVote(false);
    }
  };

  // ── Admin: reveal ────────────────────────────────────────────────────────
  const handleReveal = async () => {
    if (!adminToken) return;
    setActionError('');
    try {
      const res = await fetch(`/api/rooms/${code}/reveal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminToken }),
      });
      if (!res.ok) {
        const data = await res.json();
        setActionError(data.error || 'Reveal error');
      } else {
        fetchRoom();
      }
    } catch {
      setActionError('Network error');
    }
  };

  // ── Admin: reset round ───────────────────────────────────────────────────
  const handleReset = async () => {
    if (!adminToken) return;
    setActionError('');
    try {
      const res = await fetch(`/api/rooms/${code}/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminToken }),
      });
      if (!res.ok) {
        const data = await res.json();
        setActionError(data.error || 'Reset error');
      } else {
        setSelectedCard(null);
        fetchRoom();
      }
    } catch {
      setActionError('Network error');
    }
  };

  // ── Copy link ────────────────────────────────────────────────────────────
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Renders ──────────────────────────────────────────────────────────────
  if (initialLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <span className="w-8 h-8 border-2 border-zinc-700 border-t-yellow-400 rounded-full animate-spin" />
      </div>
    );
  }

  if (roomError) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-5xl mb-4">😕</div>
          <p className="text-red-400 text-lg font-bold mb-4">{roomError}</p>
          <a href="/" className="text-yellow-400 hover:text-yellow-300 text-sm font-black uppercase tracking-widest">
            ← Create a new room
          </a>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <JoinForm code={code} isAdmin={!!adminToken} onJoin={handleJoin} />
      </div>
    );
  }

  const currentParticipant = roomData?.participants.find(p => p.id === session.id);
  const hasVoted = currentParticipant?.hasVoted ?? false;
  const isVoter = session.isVoter;
  const isWaiting = roomData?.room.status === 'waiting';
  const isRevealed = roomData?.room.status === 'revealed';
  const voters = roomData?.participants.filter(p => p.isVoter) ?? [];
  const votedCount = voters.filter(p => p.hasVoted).length;
  const totalCount = voters.length;
  const roundNumber = roomData?.room.roundNumber ?? 1;

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {showConsensus && <ConsensusAlert roundNumber={roundNumber} />}

      {/* ── Header ── */}
      <header className="bg-zinc-900 border-b-2 border-yellow-400 px-4 py-3 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🃏</span>
            <div className="h-8 w-0.5 bg-yellow-400" />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-black uppercase tracking-tight text-white leading-none">
                  Planning Poker
                </h1>
                {adminToken && (
                  <span className="bg-yellow-400 text-zinc-950 text-xs font-black uppercase tracking-widest px-2 py-0.5">
                    Admin
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-zinc-600 text-xs font-bold uppercase tracking-widest">Room</span>
                <span className="font-black text-yellow-400 text-sm tracking-widest">{code}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {adminToken && <SessionStats roomCode={code} adminToken={adminToken} />}
            <button
              onClick={handleCopyLink}
              className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-yellow-400 text-zinc-400 hover:text-yellow-400 text-xs font-black uppercase tracking-widest px-3 py-2 transition-colors flex items-center gap-2"
            >
              {copied ? '✓ Copied!' : '🔗 Copy link'}
            </button>
          </div>
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {/* Status bar */}
        <div
          className={[
            'px-4 py-3 flex items-center justify-between border-l-4',
            isRevealed
              ? 'bg-zinc-900 border-yellow-400'
              : 'bg-zinc-900 border-zinc-600',
          ].join(' ')}
        >
          <div className="flex items-center gap-2">
            <span
              className={[
                'w-2 h-2',
                isRevealed ? 'bg-yellow-400' : 'bg-zinc-500 animate-pulse',
              ].join(' ')}
            />
            <span className="text-xs font-black uppercase tracking-widest">
              {isRevealed ? 'Votes revealed' : 'Voting in progress'}
            </span>
          </div>
          <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest">
            {votedCount}/{totalCount} voters · Round {roundNumber}
          </span>
        </div>

        {/* Participants */}
        {roomData && (
          <ParticipantsList
            participants={roomData.participants}
            currentUserId={session.id}
            isRevealed={isRevealed ?? false}
            roundNumber={roundNumber}
          />
        )}

        {/* Voting cards — only for voters */}
        {isWaiting && isVoter && (
          <VotingCards
            onVote={handleVote}
            selectedCard={selectedCard}
            hasVoted={hasVoted}
            disabled={isSubmittingVote}
          />
        )}

        {/* Reaction bar */}
        {session && (
          <ReactionBar
            reactions={roomData?.reactions ?? []}
            participantName={session.name}
            roomCode={code}
          />
        )}

        {/* Observer notice */}
        {isWaiting && !isVoter && (
          <div className="bg-zinc-900 border border-zinc-800 border-l-4 border-l-zinc-600 px-4 py-3 text-zinc-500 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
            <span>👁</span>
            <span>Facilitator mode — observing only</span>
          </div>
        )}

        {/* Action error */}
        {actionError && (
          <div className="border border-red-800 bg-red-950/40 text-red-400 text-xs font-bold uppercase tracking-widest px-4 py-3">
            ⚠ {actionError}
          </div>
        )}

        {/* Admin controls */}
        {adminToken && (
          <div className="bg-zinc-900 border border-zinc-800">
            <div className="border-b border-zinc-800 px-5 py-3">
              <p className="text-xs font-black uppercase tracking-widest text-zinc-600">Admin controls</p>
            </div>
            <div className="p-4 flex gap-3 flex-wrap">
              {isWaiting && (
                <button
                  onClick={handleReveal}
                  className="bg-yellow-400 hover:bg-yellow-300 active:bg-yellow-500 text-zinc-950 font-black uppercase tracking-widest px-5 py-2.5 transition-colors text-sm"
                >
                  🃏 Reveal
                </button>
              )}
              {isRevealed && (
                <button
                  onClick={handleReset}
                  className="bg-zinc-700 hover:bg-zinc-600 border border-zinc-600 hover:border-yellow-400 text-white font-black uppercase tracking-widest px-5 py-2.5 transition-colors text-sm"
                >
                  🔄 New round
                </button>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
