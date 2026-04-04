import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

const ALLOWED_EMOJIS = ['👍', '🔥', '😱', '😂', '🤔', '🎉', '💀', '🫠'];

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await context.params;
    const sql = getDb();
    const upperCode = code.toUpperCase();
    const body = await request.json();
    const { emoji, participantName } = body as { emoji?: string; participantName?: string };

    if (!emoji || !ALLOWED_EMOJIS.includes(emoji)) {
      return NextResponse.json({ error: 'Invalid emoji' }, { status: 400 });
    }
    if (!participantName) {
      return NextResponse.json({ error: 'participantName is required' }, { status: 400 });
    }

    const rooms = await sql`SELECT id FROM rooms WHERE code = ${upperCode}`;
    if (rooms.length === 0) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    await sql`
      INSERT INTO reactions (room_id, participant_name, emoji)
      VALUES (${rooms[0].id}, ${participantName}, ${emoji})
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Reaction error:', error);
    return NextResponse.json({ error: 'Failed to send reaction' }, { status: 500 });
  }
}
