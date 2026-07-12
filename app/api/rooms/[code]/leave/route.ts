import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await context.params;
    const sql = getDb();
    const upperCode = code.toUpperCase();
    const body = await request.json();
    const { participantToken } = body as { participantToken?: string };

    if (!participantToken) {
      return NextResponse.json({ error: 'participantToken is required' }, { status: 400 });
    }

    const rooms = await sql`SELECT id FROM rooms WHERE code = ${upperCode}`;
    if (rooms.length === 0) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }
    const roomId = rooms[0].id;

    // Deleting the participant cascades to their votes, so a vote cast in the
    // current round stops counting the moment they leave.
    await sql`
      DELETE FROM participants
      WHERE room_id = ${roomId} AND participant_token = ${participantToken}
    `;
    await sql`UPDATE rooms SET last_active = NOW() WHERE id = ${roomId}`;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Leave room error:', error);
    return NextResponse.json({ error: 'Failed to leave room' }, { status: 500 });
  }
}
