import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

const ALLOWED_EMOJIS = ['👍', '🔥', '😱', '😂', '🤔\uFE0F', '🎉', '💀', '🥴'];

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await context.params;
    const sql = getDb();
    const upperCode = code.toUpperCase();
    const body = await request.json();
    const { emoji, participantToken } = body as { emoji?: string; participantToken?: string };

    if (!emoji || !ALLOWED_EMOJIS.includes(emoji)) {
      return NextResponse.json({ error: 'Invalid emoji' }, { status: 400 });
    }
    if (!participantToken) {
      return NextResponse.json({ error: 'participantToken is required' }, { status: 400 });
    }

    const rooms = await sql`SELECT id FROM rooms WHERE code = ${upperCode}`;
    if (rooms.length === 0) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    // Validate token and fetch the authoritative name from DB
    const participants = await sql`
      SELECT name FROM participants
      WHERE room_id = ${rooms[0].id} AND participant_token = ${participantToken}
    `;
    if (participants.length === 0) {
      return NextResponse.json({ error: 'Participant not found' }, { status: 403 });
    }

    await sql`
      INSERT INTO reactions (room_id, participant_name, emoji)
      VALUES (${rooms[0].id}, ${participants[0].name}, ${emoji})
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Reaction error:', error);
    return NextResponse.json({ error: 'Failed to send reaction' }, { status: 500 });
  }
}
