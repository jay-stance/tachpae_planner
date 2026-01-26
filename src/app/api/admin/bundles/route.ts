import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Bundle from '@/models/Bundle';
import { isAdmin } from '@/lib/middleware';

// GET all bundles
export async function GET(req: Request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get('eventId');
    const cityId = searchParams.get('cityId');
    
    const query: any = { isActive: true };
    if (eventId) query.event = eventId;
    
    let bundles = await Bundle.find(query)
      .populate('products', 'name basePrice mediaGallery')
      .populate('event', 'name slug')
      .sort({ displayOrder: 1 });
    
    // Filter by location if cityId provided
    if (cityId) {
      bundles = bundles.filter(bundle => 
        bundle.locations.length === 0 || bundle.locations.some((loc: any) => loc.toString() === cityId)
      );
    }
    
    return NextResponse.json({ success: true, data: bundles });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

// POST - Create new bundle
export async function POST(req: Request) {
  await dbConnect();

  const auth = await isAdmin(req);
  if (!auth.authorized) return auth.response;

  try {
    const body = await req.json();
    
    // Generate slug if not provided
    if (!body.slug && body.name) {
      body.slug = body.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    }
    
    const bundle = await Bundle.create(body);
    return NextResponse.json({ success: true, data: bundle });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
