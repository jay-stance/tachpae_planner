
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Category from '@/models/Category';

export async function GET(req: Request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get('eventId');
    
    const query: any = { isActive: true };
    if (eventId) query.event = eventId;

    const categories = await Category.find(query).lean();
    return NextResponse.json({
      success: true,
      data: categories
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
