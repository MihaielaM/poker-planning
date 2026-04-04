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
    const { adminToken } = body as { adminToken?: string };

    if (!adminToken) {
      return NextResponse.json({ error: 'adminToken is required' }, { status: 400 });
    }

    const result = await sql`
      UPDATE rooms
      SET status = 'revealed', last_active = NOW()
      WHERE code = ${upperCode} AND admin_token = ${adminToken}
      RETURNING id
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Room not found or invalid admin token' }, { status: 403 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Reveal error:', error);
    return NextResponse.json({ error: 'Failed to reveal votes' }, { status: 500 });
  }
}
