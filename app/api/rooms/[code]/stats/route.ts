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
      if (roundVotes.length >= 1) {
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

    // Everyone who cast at least one vote in a scored round shows up on the
    // podium, even with 0 matches — the summary is a full session recap, not
    // a hall of fame filtered by score.
    const participants = new Map<string, string>();
    const matchCount = new Map<string, number>();
    for (const [round, roundVotes] of byRound) {
      const finalSp = effectiveFinals.get(round);
      if (!finalSp) continue;
      for (const v of roundVotes) {
        if (!participants.has(v.participantId)) {
          participants.set(v.participantId, v.name);
        }
        if (v.value === finalSp) {
          matchCount.set(v.participantId, (matchCount.get(v.participantId) ?? 0) + 1);
        }
      }
    }

    const podium = [...participants.entries()]
      .map(([id, name]) => ({
        name,
        matches: matchCount.get(id) ?? 0,
        totalRounds: scoredRounds,
      }))
      .sort((a, b) => b.matches - a.matches || a.name.localeCompare(b.name));

    return NextResponse.json({ totalRounds: scoredRounds, totalPlayed, podium });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json({ error: 'Failed to get stats' }, { status: 500 });
  }
}
