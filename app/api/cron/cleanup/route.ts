import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request: NextRequest) {
  // Verify the request is from Vercel Cron
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const sql = getDb();
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const deleted = await sql`
      DELETE FROM rooms
      WHERE last_active < ${cutoff}::timestamptz
      RETURNING code
    `;

    console.log(`Cleanup: deleted ${deleted.length} rooms inactive for 24h`);
    return NextResponse.json({ deleted: deleted.length });
  } catch (error) {
    console.error('Cleanup error:', error);
    return NextResponse.json({ error: 'Cleanup failed' }, { status: 500 });
  }
}
