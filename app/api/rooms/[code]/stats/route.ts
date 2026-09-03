import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { FIBONACCI_NUMBERS } from '@/lib/constants';

const NUMERIC_DECK = new Set(FIBONACCI_NUMBERS.map(String));

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await context.params;
    const sql = getDb();
    const upperCode = code.toUpperCase();

    const rooms = await sql`
      SELECT id, round_number, status FROM rooms WHERE code = ${upperCode}
    `;
    if (rooms.length === 0) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }
    const room = rooms[0];
    const currentRound = Number(room.round_number);
    const currentIsRevealed = room.status === 'revealed';
    // Include the current round in stats if it's already revealed — the
    // discussion is done and its Final SP (auto-set or picked) can score.
    const highestScorable = currentIsRevealed ? currentRound : currentRound - 1;

    if (highestScorable < 1) {
      return NextResponse.json({ totalRounds: 0, totalPlayed: 0, podium: [] });
    }

    // All voter votes across scorable rounds — used both for scoring and to
    // derive an effective Final SP for rounds without an explicit round_finals
    // entry (e.g. legacy unanimous rounds pre-dating the auto-set logic).
    const votes = await sql`
      SELECT v.round_number, v.value, p.id AS participant_id, p.name
      FROM votes v
      JOIN participants p ON p.id = v.participant_id
      WHERE v.room_id = ${room.id}
        AND p.is_voter = TRUE
        AND v.round_number <= ${highestScorable}
    `;

    type VoteRow = { round: number; value: string; participantId: string; name: string };
    const byRound = new Map<number, VoteRow[]>();
    for (const v of votes) {
      const round = Number(v.round_number);
      if (!byRound.has(round)) byRound.set(round, []);
      byRound.get(round)!.push({
        round,
        value: v.value as string,
        participantId: v.participant_id as string,
        name: v.name as string,
      });
    }

    // Explicit Final SP entries (admin-picked or auto-set on unanimous reveal).
    let explicitFinals = new Map<number, string>();
    try {
      const rows = await sql`
        SELECT round_number, final_sp FROM round_finals
        WHERE room_id = ${room.id} AND round_number <= ${highestScorable}
      `;
      explicitFinals = new Map(rows.map(r => [Number(r.round_number), r.final_sp as string]));
    } catch {
      // round_finals table may not exist yet — fallback logic still applies
    }

    // For each round, determine effective Final SP: explicit entry wins;
    // otherwise, unanimous numeric consensus (voters > 1, all same numeric
    // Fibonacci value) counts too. Rounds without either are unscored.
    const effectiveFinals = new Map<number, string>();
    for (const [round, roundVotes] of byRound) {
      const explicit = explicitFinals.get(round);
      if (explicit) {
        effectiveFinals.set(round, explicit);
        continue;
      }
      if (roundVotes.length > 1) {
        const unique = new Set(roundVotes.map(v => v.value));
        const only = unique.size === 1 ? [...unique][0] : null;
        if (only && NUMERIC_DECK.has(only)) {
          effectiveFinals.set(round, only);
        }
      }
    }

    const scoredRounds = effectiveFinals.size;
    const totalPlayed = highestScorable;

    if (scoredRounds === 0) {
      return NextResponse.json({ totalRounds: 0, totalPlayed, podium: [] });
    }

    const matchCount = new Map<string, { name: string; matches: number }>();
    for (const [round, roundVotes] of byRound) {
      const finalSp = effectiveFinals.get(round);
      if (!finalSp) continue;
      for (const v of roundVotes) {
        if (v.value !== finalSp) continue;
        if (!matchCount.has(v.participantId)) {
          matchCount.set(v.participantId, { name: v.name, matches: 0 });
        }
        matchCount.get(v.participantId)!.matches += 1;
      }
    }

    const podium = [...matchCount.values()]
      .filter(p => p.matches > 0)
      .sort((a, b) => b.matches - a.matches)
      .map(p => ({
        name: p.name,
        matches: p.matches,
        totalRounds: scoredRounds,
      }));

    return NextResponse.json({ totalRounds: scoredRounds, totalPlayed, podium });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json({ error: 'Failed to get stats' }, { status: 500 });
  }
}
