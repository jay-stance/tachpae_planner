import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Tag from '@/models/Tag';
import { isAdmin } from '@/lib/middleware';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET single tag
export async function GET(req: Request, { params }: RouteParams) {
  await dbConnect();
  const { id } = await params;

  try {
    const tag = await Tag.findById(id);
    if (!tag) {
      return NextResponse.json({ success: false, error: 'Tag not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: tag });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

// PATCH - Update tag
export async function PATCH(req: Request, { params }: RouteParams) {
  await dbConnect();
  const { id } = await params;

  const auth = await isAdmin(req);
  if (!auth.authorized) return auth.response;

  try {
    const body = await req.json();
    
    // Don't allow changing isSystem flag
    delete body.isSystem;
    
    const tag = await Tag.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    if (!tag) {
      return NextResponse.json({ success: false, error: 'Tag not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: tag });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

// DELETE - Delete tag (only non-system tags)
export async function DELETE(req: Request, { params }: RouteParams) {
  await dbConnect();
  const { id } = await params;

  const auth = await isAdmin(req);
  if (!auth.authorized) return auth.response;

  try {
    const tag = await Tag.findById(id);
    if (!tag) {
      return NextResponse.json({ success: false, error: 'Tag not found' }, { status: 404 });
    }
    
    if (tag.isSystem) {
      return NextResponse.json({ success: false, error: 'Cannot delete system tags' }, { status: 403 });
    }
    
    await Tag.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'Tag deleted' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
