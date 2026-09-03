import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { FIBONACCI_NUMBERS } from '@/lib/constants';

const ALLOWED = new Set(FIBONACCI_NUMBERS.map(String));

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await context.params;
    const sql = getDb();
    const upperCode = code.toUpperCase();
    const body = await request.json();
    const { adminToken, finalSp } = body as { adminToken?: string; finalSp?: string };

    if (!adminToken) {
      return NextResponse.json({ error: 'adminToken is required' }, { status: 400 });
    }
    if (!finalSp || !ALLOWED.has(finalSp)) {
      return NextResponse.json({ error: 'Invalid finalSp value' }, { status: 400 });
    }

    const rooms = await sql`
      SELECT id, round_number, status
      FROM rooms
      WHERE code = ${upperCode} AND admin_token = ${adminToken}
    `;
    if (rooms.length === 0) {
      return NextResponse.json({ error: 'Room not found or invalid admin token' }, { status: 403 });
    }
    const room = rooms[0];
    if (room.status !== 'revealed') {
      return NextResponse.json({ error: 'Votes must be revealed before setting final SP' }, { status: 409 });
    }

    await sql`
      CREATE TABLE IF NOT EXISTS round_finals (
        room_id      UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
        round_number INTEGER NOT NULL,
        final_sp     VARCHAR(10) NOT NULL,
        set_at       TIMESTAMPTZ DEFAULT NOW(),
        PRIMARY KEY (room_id, round_number)
      )
    `;

    await sql`
      INSERT INTO round_finals (room_id, round_number, final_sp)
      VALUES (${room.id}, ${room.round_number}, ${finalSp})
      ON CONFLICT (room_id, round_number)
      DO UPDATE SET final_sp = EXCLUDED.final_sp, set_at = NOW()
    `;

    await sql`UPDATE rooms SET last_active = NOW() WHERE id = ${room.id}`;

    return NextResponse.json({ success: true, finalSp });
  } catch (error) {
    console.error('Set final SP error:', error);
    return NextResponse.json({ error: 'Failed to set final SP' }, { status: 500 });
  }
}
