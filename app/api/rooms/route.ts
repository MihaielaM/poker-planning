import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { generateRoomCode, generateToken } from '@/lib/utils';

export async function POST() {
  try {
    const sql = getDb();
    const adminToken = generateToken();

    for (let attempt = 0; attempt < 5; attempt++) {
      const code = generateRoomCode();
      try {
        await sql`
          INSERT INTO rooms (code, admin_token)
          VALUES (${code}, ${adminToken})
        `;
        return NextResponse.json({ code, adminToken });
      } catch (err: unknown) {
        const pgError = err as { code?: string };
        if (pgError?.code === '23505' && attempt < 4) continue;
        throw err;
      }
    }

    return NextResponse.json({ error: 'Could not generate unique room code' }, { status: 500 });
  } catch (error) {
    console.error('Create room error:', error);
    return NextResponse.json({ error: 'Failed to create room' }, { status: 500 });
  }
}
