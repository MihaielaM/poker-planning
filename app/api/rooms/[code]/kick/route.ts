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
    const { adminToken, participantId } = body as {
      adminToken?: string;
      participantId?: string;
    };

    if (!adminToken) {
      return NextResponse.json({ error: 'adminToken is required' }, { status: 400 });
    }
    if (!participantId) {
      return NextResponse.json({ error: 'participantId is required' }, { status: 400 });
    }

    const rooms = await sql`
      SELECT id FROM rooms WHERE code = ${upperCode} AND admin_token = ${adminToken}
    `;
    if (rooms.length === 0) {
      return NextResponse.json({ error: 'Room not found or invalid admin token' }, { status: 403 });
    }
    const roomId = rooms[0].id;

    // Deleting the participant cascades to their votes, so a vote cast in the
    // current round stops counting once they are removed.
    const result = await sql`
      DELETE FROM participants
      WHERE room_id = ${roomId} AND id = ${participantId}
      RETURNING id
    `;
    if (result.length === 0) {
      return NextResponse.json({ error: 'Participant not found' }, { status: 404 });
    }
    await sql`UPDATE rooms SET last_active = NOW() WHERE id = ${roomId}`;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Kick participant error:', error);
    return NextResponse.json({ error: 'Failed to remove participant' }, { status: 500 });
  }
}
