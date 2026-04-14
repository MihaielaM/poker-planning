'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { RoomData } from '@/lib/types';
import JoinForm from './JoinForm';
import VotingCards from './VotingCards';
import ParticipantsList from './ParticipantsList';
import ReactionBar from './ReactionBar';
import SessionStats from './SessionStats';
import ConsensusAlert from './ConsensusAlert';
import WelcomeOverlay from './WelcomeOverlay';
import LateVoteToast from './LateVoteToast';
import RoomExpired from './RoomExpired';
import JesterHat from './JesterHat';

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
  const [showWelcome, setShowWelcome] = useState(false);
  const [showLateVote, setShowLateVote] = useState(false);
  const welcomeShownRef = useRef(false);
  const lastRoundRef = useRef<number | null>(null);
  const lastStatusRef = useRef<string | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pingRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  const fetchRoom = useCallback(async () => {
    try {
      const res = await fetch(`/api/rooms/${code}`);
      if (!res.ok) {
        if (res.status === 404) setRoomError('Room not found.');
        setInitialLoading(false);
        return;
      }
      const data: RoomData = await res.json();
      setRoomData(data);

      if (lastRoundRef.current !== null && lastRoundRef.current !== data.room.roundNumber) {
        setSelectedCard(null);
        setShowConsensus(false);
      }
      lastRoundRef.current = data.room.roundNumber;

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

  useEffect(() => {
    fetchRoom();
    pollingRef.current = setInterval(fetchRoom, POLL_INTERVAL_MS);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [fetchRoom]);

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

  useEffect(() => {
    if (!session) return;
    fetch(`/api/rooms/${code}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ existingToken: session.token }),
    })
      .then(async res => {
        if (!res.ok) {
          localStorage.removeItem(`ppoker-${code}-session`);
          setSession(null);
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  useEffect(() => {
    if (session && !adminToken && !welcomeShownRef.current) {
      welcomeShownRef.current = true;
      const welcomeKey = `ppoker-${code}-welcome-${session.id}`;
      if (!localStorage.getItem(welcomeKey)) {
        localStorage.setItem(welcomeKey, '1');
        setShowWelcome(true);
      }
    }
  }, [session, adminToken, code]);

  // Restore selectedCard after refresh when votes are revealed
  useEffect(() => {
    if (!roomData || !session || selectedCard !== null) return;
    const participant = roomData.participants.find(p => p.id === session.id);
    if (participant?.vote) setSelectedCard(participant.vote);
  }, [roomData, session]);

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

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-rd-dark flex items-center justify-center">
        <span className="w-8 h-8 border-2 border-rd-border-2 border-t-rd-yellow rounded-full animate-spin" />
      </div>
    );
  }

  if (roomError) {
    return <RoomExpired />;
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-rd-dark flex items-center justify-center p-4">
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
    <div className="min-h-screen bg-rd-dark text-white">
      {showWelcome && <WelcomeOverlay name={session.name} />}
      {showLateVote && <LateVoteToast onDone={() => setShowLateVote(false)} />}
      {showConsensus && <ConsensusAlert roundNumber={roundNumber} />}

      {/* ── Header ── */}
      <header className="bg-rd-surface/80 backdrop-blur-sm border-b border-rd-border px-4 py-2 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <JesterHat size={44} />
            <div>
              {adminToken ? (
                <a href="/" className="block hover:opacity-80 transition-opacity">
                  <h1 className="text-2xl font-bold text-white leading-tight tracking-wider uppercase">
                    Planning Poker
                  </h1>
                </a>
              ) : (
                <h1 className="text-2xl font-bold text-white leading-tight tracking-wider uppercase">
                  Planning Poker
                </h1>
              )}
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <span className="text-rd-muted text-base">Room:</span>
                {adminToken ? (
                  <a href="/" className="font-mono font-bold text-rd-yellow text-base tracking-widest hover:opacity-80 transition-opacity">
                    {code}
                  </a>
                ) : (
                  <span className="font-mono font-bold text-rd-yellow text-base tracking-widest">
                    {code}
                  </span>
                )}
                {adminToken && (
                  <span className="bg-rd-yellow/10 text-rd-yellow text-base px-2 py-0.5 rounded font-medium border border-rd-yellow/20">
                    Admin
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {adminToken && <SessionStats roomCode={code} adminToken={adminToken} />}
            <button
              onClick={handleCopyLink}
              className="bg-rd-surface-2 hover:bg-rd-border border border-rd-border-2 text-rd-subtle hover:text-white text-base px-3 py-2 rounded-xl transition-all duration-200 flex items-center gap-2"
            >
              {copied ? '✓ Copied!' : '🔗 Copy link'}
            </button>
          </div>
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="max-w-7xl mx-auto px-4 py-6 space-y-4">
        {/* Status bar */}
        <div
          className={[
            'rounded-2xl px-4 py-3 flex items-center justify-between',
            isRevealed
              ? 'border border-rd-yellow-border'
              : 'bg-rd-surface border border-rd-border',
          ].join(' ')}
          style={isRevealed ? { background: 'linear-gradient(135deg, #1a1200 0%, #2a1e00 100%)' } : undefined}
        >
          <div className="flex items-center gap-2.5">
            <span
              className={[
                'w-2 h-2 rounded-full flex-shrink-0',
                isRevealed ? 'bg-rd-yellow' : 'bg-rd-yellow animate-pulse',
              ].join(' ')}
            />
            <span
              className="text-base font-semibold tracking-tight"
              style={isRevealed ? {
                background: 'linear-gradient(90deg, #FFE033 0%, #FFD000 50%, #CCAA00 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              } : { color: 'white' }}
            >
              {isRevealed ? 'Votes revealed' : 'Voting in progress'}
            </span>
          </div>
          <span className="text-rd-subtle text-base font-mono">
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

        {/* Voting cards — for voters during waiting and revealed */}
        {isVoter && (isWaiting || isRevealed) && (
          <VotingCards
            onVote={handleVote}
            onRevealedClick={() => setShowLateVote(true)}
            selectedCard={selectedCard}
            hasVoted={hasVoted}
            disabled={isSubmittingVote}
            isRevealed={isRevealed ?? false}
          />
        )}

        {/* Reaction bar */}
        {session && (
          <ReactionBar
            reactions={roomData?.reactions ?? []}
            participantToken={session.token}
            roomCode={code}
          />
        )}

        {/* Observer notice */}
        {isWaiting && !isVoter && (
          <div className="bg-rd-surface border border-rd-border rounded-xl px-4 py-3 text-rd-subtle text-sm flex items-center gap-2">
            <span>👁</span>
            <span>You are in facilitator mode — observing the vote without participating.</span>
          </div>
        )}

        {/* Action error */}
        {actionError && (
          <div className="bg-red-950 border border-red-800 text-red-300 text-sm px-4 py-3 rounded-xl">
            ⚠ {actionError}
          </div>
        )}

        {/* Admin controls */}
        {adminToken && (
          <div className="bg-rd-surface border border-rd-border rounded-xl p-4">
            <p className="text-rd-muted text-base mb-3 font-medium uppercase tracking-wider">
              Admin controls
            </p>
            <div className="flex gap-3 flex-wrap">
              {isWaiting && (
                <button
                  onClick={handleReveal}
                  className="bg-rd-yellow hover:bg-rd-yellow-hover active:bg-rd-yellow-active text-rd-dark font-semibold px-5 py-2.5 rounded-lg transition-colors text-base flex items-center gap-2"
                >
                  <img src="/joker-hat.png" alt="" style={{width: 99, height: 99}} className="object-contain" /> Reveal
                </button>
              )}
              {isRevealed && (
                <button
                  onClick={handleReset}
                  className="bg-rd-yellow hover:bg-rd-yellow-hover active:bg-rd-yellow-active text-rd-dark font-semibold px-5 py-2.5 rounded-lg transition-colors text-base flex items-center gap-2"
                >
                  <img src="/joker-hat.png" alt="" style={{width: 99, height: 99}} className="object-contain" /> New round
                </button>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
