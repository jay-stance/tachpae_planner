
import { NextResponse } from 'next/server';
import { verifyJWT } from './auth';

export async function isAdmin(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { authorized: false, response: NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 }) };
  }

  const token = authHeader.split(' ')[1];
  const payload = await verifyJWT(token);

  if (!payload || payload.role !== 'ADMIN') {
    return { authorized: false, response: NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 }) };
  }

  return { authorized: true, user: payload };
}
