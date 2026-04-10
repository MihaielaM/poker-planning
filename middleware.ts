import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory rate limiter.
// Resets on cold start; not shared across edge instances — still effective
// against single-source bursts which is the primary threat here.
const requests = new Map<string, { count: number; resetAt: number }>();

function allow(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = requests.get(key);
  if (!entry || now >= entry.resetAt) {
    requests.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= max) return false;
  entry.count++;
  return true;
}

function getIp(request: NextRequest): string {
  // Use x-real-ip (set by Vercel/trusted proxy) to prevent spoofing via x-forwarded-for.
  // Fall back to the last hop in x-forwarded-for rather than the first (which can be faked).
  return (
    request.headers.get('x-real-ip') ??
    request.headers.get('x-forwarded-for')?.split(',').pop()?.trim() ??
    'unknown'
  );
}

export function middleware(request: NextRequest) {
  const ip = getIp(request);
  const { pathname } = request.nextUrl;
  const method = request.method;

  // 5 room creations per minute per IP
  if (method === 'POST' && pathname === '/api/rooms') {
    if (!allow(`${ip}:create`, 5, 60_000)) {
      return NextResponse.json(
        { error: 'Too many requests — please wait before creating another room.' },
        { status: 429 }
      );
    }
  }

  // 10 join attempts per minute per IP
  if (method === 'POST' && /^\/api\/rooms\/[^/]+\/join$/.test(pathname)) {
    if (!allow(`${ip}:join`, 10, 60_000)) {
      return NextResponse.json(
        { error: 'Too many requests — please wait before joining.' },
        { status: 429 }
      );
    }
  }

  // 60 requests per minute per IP for all other room API endpoints
  if (/^\/api\/rooms\/[^/]+(\/|$)/.test(pathname) && pathname !== '/api/rooms') {
    if (!allow(`${ip}:room`, 60, 60_000)) {
      return NextResponse.json(
        { error: 'Too many requests.' },
        { status: 429 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/rooms', '/api/rooms/:code*', '/api/setup'],
};
