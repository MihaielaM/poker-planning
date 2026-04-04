import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { generateToken } from '@/lib/utils';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await context.params;
    const sql = getDb();
    const upperCode = code.toUpperCase();
    const body = await request.json();
    const { name, existingToken, isVoter } = body as {
      name?: string;
      existingToken?: string;
      isVoter?: boolean;
    };

    const rooms = await sql`SELECT id FROM rooms WHERE code = ${upperCode}`;
    if (rooms.length === 0) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }
    const roomId = rooms[0].id;

    // Reconnect with existing token
    if (existingToken) {
      const existing = await sql`
        SELECT id, name, participant_token, is_voter
        FROM participants
        WHERE room_id = ${roomId} AND participant_token = ${existingToken}
      `;
      if (existing.length > 0) {
        await sql`UPDATE participants SET last_seen = NOW() WHERE id = ${existing[0].id}`;
        return NextResponse.json({
          participantToken: existing[0].participant_token,
          participantId: existing[0].id,
          name: existing[0].name,
          isVoter: existing[0].is_voter as boolean,
        });
      }
    }

    // New participant
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    const trimmedName = name.trim().slice(0, 50);
    const participantToken = generateToken();
    const voterFlag = isVoter !== false;

    const result = await sql`
      INSERT INTO participants (room_id, name, participant_token, is_voter)
      VALUES (${roomId}, ${trimmedName}, ${participantToken}, ${voterFlag})
      RETURNING id
    `;

    return NextResponse.json({
      participantToken,
      participantId: result[0].id,
      name: trimmedName,
      isVoter: voterFlag,
    });
  } catch (error) {
    console.error('Join room error:', error);
    return NextResponse.json({ error: 'Failed to join room' }, { status: 500 });
  }
}
