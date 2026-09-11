import { NextResponse } from 'next/server';
import { verifyPassword } from '@/lib/adminStore';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  let body = {};
  try {
    body = await request.json();
  } catch {
    // treated as missing password
  }
  if (!verifyPassword(body.password)) {
    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
  }
  return NextResponse.json({ ok: true });
}
