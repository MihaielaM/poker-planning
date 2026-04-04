import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await context.params;
    const sql = getDb();
    const upperCode = code.toUpperCase();

    const rooms = await sql`
      SELECT id, round_number FROM rooms WHERE code = ${upperCode}
    `;
    if (rooms.length === 0) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }
    const room = rooms[0];
    const totalRounds = room.round_number; // current round_number = rounds played so far

    if (totalRounds <= 1) {
      return NextResponse.json({ totalRounds: 0, podium: [] });
    }

    // For each completed round, find the mode vote (most common numeric value)
    // Then count per participant how many times they matched the mode
    const votes = await sql`
      SELECT v.round_number, v.value, p.id AS participant_id, p.name
      FROM votes v
      JOIN participants p ON p.id = v.participant_id
      WHERE v.room_id = ${room.id}
        AND v.round_number < ${totalRounds}
        AND p.is_voter = TRUE
        AND v.value != '?'
        AND v.value != '∞'
    `;

    // Group votes by round
    const byRound = new Map<number, { value: string; participantId: string; name: string }[]>();
    for (const v of votes) {
      const round = Number(v.round_number);
      if (!byRound.has(round)) byRound.set(round, []);
      byRound.get(round)!.push({ value: v.value, participantId: v.participant_id, name: v.name });
    }

    // Per participant: count rounds where their vote matched the mode
    const matchCount = new Map<string, { name: string; matches: number }>();

    for (const [, roundVotes] of byRound) {
      // Find mode for this round
      const freq = new Map<string, number>();
      for (const v of roundVotes) {
        freq.set(v.value, (freq.get(v.value) ?? 0) + 1);
      }
      const maxFreq = Math.max(...freq.values());
      const modes = [...freq.entries()].filter(([, f]) => f === maxFreq).map(([v]) => v);

      // Credit participants who voted a mode value
      for (const v of roundVotes) {
        if (modes.includes(v.value)) {
          if (!matchCount.has(v.participantId)) {
            matchCount.set(v.participantId, { name: v.name, matches: 0 });
          }
          matchCount.get(v.participantId)!.matches += 1;
        }
      }
    }

    // Build podium: only participants with at least 1 match, sorted desc
    const completedRounds = byRound.size;
    const podium = [...matchCount.values()]
      .filter(p => p.matches > 0)
      .sort((a, b) => b.matches - a.matches)
      .map(p => ({
        name: p.name,
        matches: p.matches,
        totalRounds: completedRounds,
      }));

    return NextResponse.json({ totalRounds: completedRounds, podium });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json({ error: 'Failed to get stats' }, { status: 500 });
  }
}
