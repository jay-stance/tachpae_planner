import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Bundle from '@/models/Bundle';
import { isAdmin } from '@/lib/middleware';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET single bundle
export async function GET(req: Request, { params }: RouteParams) {
  await dbConnect();
  const { id } = await params;

  try {
    const bundle = await Bundle.findById(id)
      .populate('products', 'name basePrice mediaGallery description')
      .populate('event', 'name slug');
      
    if (!bundle) {
      return NextResponse.json({ success: false, error: 'Bundle not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: bundle });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

// PATCH - Update bundle
export async function PATCH(req: Request, { params }: RouteParams) {
  await dbConnect();
  const { id } = await params;

  const auth = await isAdmin(req);
  if (!auth.authorized) return auth.response;

  try {
    const body = await req.json();
    
    const bundle = await Bundle.findByIdAndUpdate(id, body, { new: true, runValidators: true })
      .populate('products', 'name basePrice mediaGallery');
      
    if (!bundle) {
      return NextResponse.json({ success: false, error: 'Bundle not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: bundle });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

// DELETE - Delete bundle
export async function DELETE(req: Request, { params }: RouteParams) {
  await dbConnect();
  const { id } = await params;

  const auth = await isAdmin(req);
  if (!auth.authorized) return auth.response;

  try {
    const bundle = await Bundle.findByIdAndDelete(id);
    if (!bundle) {
      return NextResponse.json({ success: false, error: 'Bundle not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Bundle deleted' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
