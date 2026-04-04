import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { analyzeVotes } from '@/lib/utils';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await context.params;
    const sql = getDb();
    const upperCode = code.toUpperCase();

    const rooms = await sql`
      SELECT id, code, status, round_number
      FROM rooms WHERE code = ${upperCode}
    `;
    if (rooms.length === 0) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }
    const room = rooms[0];

    const participants = await sql`
      SELECT p.id, p.name, p.last_seen, p.is_voter, v.value AS vote
      FROM participants p
      LEFT JOIN votes v ON v.participant_id = p.id AND v.round_number = ${room.round_number}
      WHERE p.room_id = ${room.id}
      ORDER BY p.created_at ASC
    `;

    const isRevealed = room.status === 'revealed';
    const onlineThreshold = new Date(Date.now() - 3 * 60 * 1000);
    const votes = participants.filter(p => p.vote != null).map(p => p.vote as string);
    const analysis = isRevealed ? analyzeVotes(votes) : null;

    const participantsData = participants.map(p => {
      const isOnline = new Date(p.last_seen) > onlineThreshold;
      const hasVoted = p.vote != null;

      let isHighlight = false;
      if (isRevealed && analysis && hasVoted) {
        const n = p.vote !== '?' && p.vote !== '∞' ? parseInt(p.vote as string, 10) : null;
        if (n !== null && !isNaN(n)) {
          isHighlight =
            analysis.highlightMinValues.includes(n) ||
            analysis.highlightMaxValues.includes(n);
        }
      }

      return {
        id: p.id,
        name: p.name,
        isOnline,
        isVoter: p.is_voter as boolean,
        hasVoted,
        vote: isRevealed ? p.vote : undefined,
        isHighlight,
      };
    });

    // Fetch reactions from last 4 seconds (graceful fallback if table missing)
    const recentCutoff = new Date(Date.now() - 4000).toISOString();
    let recentReactions: { participant_name: string; emoji: string; created_at: string }[] = [];
    try {
      const rows = await sql`
        SELECT participant_name, emoji, created_at
        FROM reactions
        WHERE room_id = ${room.id}
          AND created_at >= ${recentCutoff}::timestamptz
        ORDER BY created_at DESC
        LIMIT 20
      `;
      recentReactions = rows as { participant_name: string; emoji: string; created_at: string }[];
    } catch {
      // reactions table may not exist yet — return empty
    }

    return NextResponse.json({
      room: {
        code: room.code,
        status: room.status,
        roundNumber: room.round_number,
      },
      participants: participantsData,
      reactions: recentReactions.map(r => ({
        participantName: r.participant_name,
        emoji: r.emoji,
        createdAt: r.created_at,
      })),
      stats:
        isRevealed && analysis
          ? {
              average: analysis.average !== null ? Math.round(analysis.average * 10) / 10 : null,
              nearestFibonacci: analysis.nearestFib,
              totalVoters: votes.length,
            }
          : null,
    });
  } catch (error) {
    console.error('Get room error:', error);
    return NextResponse.json({ error: 'Failed to get room' }, { status: 500 });
  }
}
