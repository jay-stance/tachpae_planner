import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import City from '@/models/City';
import { isAdmin } from '@/lib/middleware';

export async function POST(req: Request) {
  await dbConnect();

  const auth = await isAdmin(req);
  if (!auth.authorized) return auth.response;

  try {
    const body = await req.json();
    const city = await City.create(body);
    return NextResponse.json({ success: true, data: city });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
