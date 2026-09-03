import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { FIBONACCI_NUMBERS } from '@/lib/constants';

const NUMERIC_DECK = new Set(FIBONACCI_NUMBERS.map(String));

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await context.params;
    const sql = getDb();
    const upperCode = code.toUpperCase();
    const body = await request.json();
    const { adminToken } = body as { adminToken?: string };

    if (!adminToken) {
      return NextResponse.json({ error: 'adminToken is required' }, { status: 400 });
    }

    const result = await sql`
      UPDATE rooms
      SET status = 'revealed', last_active = NOW()
      WHERE code = ${upperCode} AND admin_token = ${adminToken}
      RETURNING id, round_number
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Room not found or invalid admin token' }, { status: 403 });
    }
    const room = result[0];

    // Unanimous consensus on a numeric value → auto-record Final SP so the
    // round counts toward the leaderboard without the admin having to pick it.
    const voterVotes = await sql`
      SELECT v.value
      FROM votes v
      JOIN participants p ON p.id = v.participant_id
      WHERE v.room_id = ${room.id}
        AND v.round_number = ${room.round_number}
        AND p.is_voter = TRUE
    `;
    if (voterVotes.length >= 1) {
      const unique = new Set(voterVotes.map(v => v.value as string));
      const only = unique.size === 1 ? [...unique][0] : null;
      if (only && NUMERIC_DECK.has(only)) {
        try {
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
            VALUES (${room.id}, ${room.round_number}, ${only})
            ON CONFLICT (room_id, round_number)
            DO UPDATE SET final_sp = EXCLUDED.final_sp, set_at = NOW()
          `;
        } catch (e) {
          console.error('Auto-set Final SP on unanimous reveal failed:', e);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Reveal error:', error);
    return NextResponse.json({ error: 'Failed to reveal votes' }, { status: 500 });
  }
}
