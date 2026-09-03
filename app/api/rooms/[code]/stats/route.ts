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
    const totalPlayed = Math.max(0, Number(room.round_number) - 1);

    if (totalPlayed === 0) {
      return NextResponse.json({ totalRounds: 0, totalPlayed: 0, podium: [] });
    }

    // Fetch admin-set final SP per completed round (graceful fallback if table missing)
    let finals: { round_number: number; final_sp: string }[] = [];
    try {
      const rows = await sql`
        SELECT round_number, final_sp FROM round_finals
        WHERE room_id = ${room.id} AND round_number < ${room.round_number}
      `;
      finals = rows.map(r => ({
        round_number: Number(r.round_number),
        final_sp: r.final_sp as string,
      }));
    } catch {
      // round_finals table may not exist yet — no scored rounds
    }

    const scoredRounds = finals.length;
    if (scoredRounds === 0) {
      return NextResponse.json({ totalRounds: 0, totalPlayed, podium: [] });
    }

    const finalByRound = new Map(finals.map(f => [f.round_number, f.final_sp]));
    const scoredRoundNumbers = finals.map(f => f.round_number);

    const votes = await sql`
      SELECT v.round_number, v.value, p.id AS participant_id, p.name
      FROM votes v
      JOIN participants p ON p.id = v.participant_id
      WHERE v.room_id = ${room.id}
        AND p.is_voter = TRUE
        AND v.round_number = ANY(${scoredRoundNumbers}::int[])
    `;

    const matchCount = new Map<string, { name: string; matches: number }>();
    for (const v of votes) {
      const round = Number(v.round_number);
      const finalSp = finalByRound.get(round);
      if (!finalSp) continue;
      if (v.value !== finalSp) continue;

      const key = v.participant_id as string;
      if (!matchCount.has(key)) {
        matchCount.set(key, { name: v.name as string, matches: 0 });
      }
      matchCount.get(key)!.matches += 1;
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
