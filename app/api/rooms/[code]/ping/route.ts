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
    if (rooms.length === 0) return NextResponse.json({ error: 'Room not found' }, { status: 404 });

    await sql`
      UPDATE participants
      SET last_seen = NOW()
      WHERE room_id = ${rooms[0].id} AND participant_token = ${participantToken}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Ping error:', error);
    return NextResponse.json({ error: 'Failed to ping' }, { status: 500 });
  }
}
