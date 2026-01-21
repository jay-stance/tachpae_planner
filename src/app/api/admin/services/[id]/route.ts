import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Service from '@/models/Service';
import { isAdmin } from '@/lib/middleware';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const { id } = await params;

  const auth = await isAdmin(req);
  if (!auth.authorized) return auth.response;

  try {
    const body = await req.json();
    const service = await Service.findByIdAndUpdate(id, body, { new: true });
    if (!service) return NextResponse.json({ success: false, error: 'Service not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: service });
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
    const service = await Service.findByIdAndDelete(id);
    if (!service) return NextResponse.json({ success: false, error: 'Service not found' }, { status: 404 });
    return NextResponse.json({ success: true, message: 'Service deleted' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
