import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST() {
  try {
    const sql = getDb();

    await sql`
      CREATE TABLE IF NOT EXISTS rooms (
        id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        code         VARCHAR(8) UNIQUE NOT NULL,
        admin_token  VARCHAR(64) NOT NULL,
        status       VARCHAR(20) NOT NULL DEFAULT 'waiting',
        round_number INTEGER NOT NULL DEFAULT 1,
        created_at   TIMESTAMPTZ DEFAULT NOW(),
        last_active  TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS participants (
        id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        room_id           UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
        name              VARCHAR(50) NOT NULL,
        participant_token VARCHAR(64) NOT NULL,
        is_voter          BOOLEAN NOT NULL DEFAULT TRUE,
        last_seen         TIMESTAMPTZ DEFAULT NOW(),
        created_at        TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(room_id, participant_token)
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS votes (
        id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        room_id        UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
        participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
        round_number   INTEGER NOT NULL,
        value          VARCHAR(10) NOT NULL,
        created_at     TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(participant_id, round_number)
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS reactions (
        id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        room_id        UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
        participant_name VARCHAR(50) NOT NULL,
        emoji          VARCHAR(10) NOT NULL,
        created_at     TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    return NextResponse.json({ success: true, message: 'Database tables created successfully' });
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json({ error: 'Setup failed', details: String(error) }, { status: 500 });
  }
}
