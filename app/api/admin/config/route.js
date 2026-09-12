import { NextResponse } from 'next/server';
import { readConfig, writeConfig, verifyPassword, DEFAULT_CONFIG } from '@/lib/adminStore';

export const dynamic = 'force-dynamic';

// Public: any visitor can read the site config (it contains no secrets).
export async function GET() {
  const config = await readConfig();
  return NextResponse.json(config, {
    headers: { 'Cache-Control': 'no-store' },
  });
}

// Admin only: saving requires the admin password via the x-admin-password header.
// Body: { config: {...} } to save, or { action: 'reset' } to restore defaults.
export async function POST(request) {
  const password = request.headers.get('x-admin-password');
  if (typeof password !== 'string' || !verifyPassword(password)) {
    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
  }

  let body = {};
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (body.action === 'reset') {
    const fresh = await writeConfig({ ...DEFAULT_CONFIG });
    return NextResponse.json({ ok: true, config: fresh });
  }

  if (!body.config || typeof body.config !== 'object') {
    return NextResponse.json({ error: 'Missing config object' }, { status: 400 });
  }

  const saved = await writeConfig(body.config);
  return NextResponse.json({ ok: true, config: saved });
}
