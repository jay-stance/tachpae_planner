import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import City from '@/models/City';
import { isAdmin } from '@/lib/middleware';

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const { id } = await params;

  const auth = await isAdmin(req);
  if (!auth.authorized) return auth.response;

  try {
    const body = await req.json();
    const city = await City.findByIdAndUpdate(id, body, { new: true });
    if (!city) return NextResponse.json({ success: false, error: 'City not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: city });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const { id } = await params;

  const auth = await isAdmin(req);
  if (!auth.authorized) return auth.response;

  try {
    const city = await City.findByIdAndDelete(id);
    if (!city) return NextResponse.json({ success: false, error: 'City not found' }, { status: 404 });
    return NextResponse.json({ success: true, message: 'City deleted' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
