import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Event from '@/models/Event';
import { isAdmin } from '@/lib/middleware';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const { id } = await params;

  const auth = await isAdmin(req);
  if (!auth.authorized) return auth.response;

  try {
    const body = await req.json();
    const event = await Event.findByIdAndUpdate(id, body, { new: true });
    if (!event) return NextResponse.json({ success: false, error: 'Event not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: event });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const { id } = await params;

  const auth = await isAdmin(req);
  if (!auth.authorized) return auth.response;

  try {
    const event = await Event.findByIdAndDelete(id);
    if (!event) return NextResponse.json({ success: false, error: 'Event not found' }, { status: 404 });
    return NextResponse.json({ success: true, message: 'Event deleted' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
