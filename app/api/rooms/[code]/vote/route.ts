import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { DECK } from '@/lib/utils';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await context.params;
    const sql = getDb();
    const upperCode = code.toUpperCase();
    const body = await request.json();
    const { value, participantToken } = body as { value?: string; participantToken?: string };

    if (!value || !DECK.includes(value)) {
      return NextResponse.json({ error: 'Invalid vote value' }, { status: 400 });
    }
    if (!participantToken) {
      return NextResponse.json({ error: 'participantToken is required' }, { status: 400 });
    }

    const rooms = await sql`
      SELECT id, status, round_number FROM rooms WHERE code = ${upperCode}
    `;
    if (rooms.length === 0) return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    const room = rooms[0];

    if (room.status === 'revealed') {
      return NextResponse.json({ error: 'Voting is closed — round has been revealed' }, { status: 400 });
    }

    const participants = await sql`
      SELECT id FROM participants
      WHERE room_id = ${room.id} AND participant_token = ${participantToken}
    `;
    if (participants.length === 0) {
      return NextResponse.json({ error: 'Participant not found' }, { status: 404 });
    }
    const participantId = participants[0].id;

    // Upsert vote (allow changing before reveal)
    await sql`
      INSERT INTO votes (room_id, participant_id, round_number, value)
      VALUES (${room.id}, ${participantId}, ${room.round_number}, ${value})
      ON CONFLICT (participant_id, round_number)
      DO UPDATE SET value = EXCLUDED.value, created_at = NOW()
    `;

    await sql`UPDATE participants SET last_seen = NOW() WHERE id = ${participantId}`;

    // Auto-reveal: all online VOTERS (last 2 min) have voted
    const twoMinAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();
    const onlineVoters = await sql`
      SELECT
        (v.id IS NOT NULL) AS has_voted
      FROM participants p
      LEFT JOIN votes v ON v.participant_id = p.id AND v.round_number = ${room.round_number}
      WHERE p.room_id = ${room.id}
        AND p.last_seen >= ${twoMinAgo}::timestamptz
        AND p.is_voter = TRUE
    `;

    const allVoted = onlineVoters.length > 0 && onlineVoters.every(r => r.has_voted);

    if (allVoted) {
      await sql`
        UPDATE rooms SET status = 'revealed', last_active = NOW() WHERE id = ${room.id}
      `;
      return NextResponse.json({ success: true, autoRevealed: true });
    }

    await sql`UPDATE rooms SET last_active = NOW() WHERE id = ${room.id}`;
    return NextResponse.json({ success: true, autoRevealed: false });
  } catch (error) {
    console.error('Vote error:', error);
    return NextResponse.json({ error: 'Failed to submit vote' }, { status: 500 });
  }
}
