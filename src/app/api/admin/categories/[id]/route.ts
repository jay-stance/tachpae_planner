import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Category from '@/models/Category';
import { isAdmin } from '@/lib/middleware';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const { id } = await params;

  const auth = await isAdmin(req);
  if (!auth.authorized) return auth.response;

  try {
    const body = await req.json();
    const category = await Category.findByIdAndUpdate(id, body, { new: true });
    if (!category) return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: category });
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
    const category = await Category.findByIdAndDelete(id);
    if (!category) return NextResponse.json({ success: false, error: 'Category not found' }, { status: 404 });
    return NextResponse.json({ success: true, message: 'Category deleted' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
