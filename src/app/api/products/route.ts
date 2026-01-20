
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';

export async function GET(req: Request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get('eventId');
    const categoryId = searchParams.get('categoryId');
    const search = searchParams.get('search');
    const citySlug = searchParams.get('city'); // This might need joining with Service/Addon if we wanted generic items

    const query: any = { isActive: true };

    if (eventId) {
      query.event = eventId;
    }

    if (categoryId) {
      query.category = categoryId;
    }

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const products = await Product.find(query)
      .populate('category')
      .populate('event')
      .lean();

    return NextResponse.json({
      success: true,
      data: products
    });
  } catch (error: any) {
    console.error('Fetch Products Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
