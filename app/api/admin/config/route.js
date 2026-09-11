import { NextResponse } from 'next/server';
import { readConfig, writeConfig, verifyPassword } from '@/lib/adminStore';

export const dynamic = 'force-dynamic';

// Public: any visitor can read the site config (it contains no secrets).
export async function GET() {
  const config = await readConfig();
  return NextResponse.json(config, {
    headers: { 'Cache-Control': 'no-store' },
  });
}

// Admin only: saving requires the admin password via the x-admin-password header.
// The payload is normalized so a bad client can't corrupt the shared config.
export async function POST(request) {
  let password = request.headers.get('x-admin-password') || '';
  let body = null;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  if (!password && body?.password) {
    password = body.password;
  }
  if (!verifyPassword(password)) {
    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
  }
  const saved = await writeConfig(body.config || {});
  return NextResponse.json({ ok: true, config: saved });
}
