import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import Category from '@/models/Category';

/**
 * GET /api/products/upsell
 * Fetches random products for upselling purposes
 * Query params:
 * - count: number of products per category (default: 2)
 * - categories: number of categories to fetch from (default: 3)
 * - eventId: optional event ID filter
 */
export async function GET(req: Request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(req.url);
    const countPerCategory = parseInt(searchParams.get('count') || '2');
    const categoryCount = parseInt(searchParams.get('categories') || '3');
    const eventId = searchParams.get('eventId');

    // Build base query
    const baseQuery: any = { isActive: true };
    if (eventId) {
      baseQuery.event = eventId;
    }

    // Get random categories that have products
    const categoriesWithProducts = await Product.aggregate([
      { $match: baseQuery },
      { $group: { _id: '$category' } },
      { $sample: { size: categoryCount } }
    ]);

    const categoryIds = categoriesWithProducts.map(c => c._id);

    // Fetch random products from each category
    const products: any[] = [];
    
    for (const catId of categoryIds) {
      const categoryProducts = await Product.aggregate([
        { $match: { ...baseQuery, category: catId } },
        { $sample: { size: countPerCategory } },
        {
          $project: {
            _id: 1,
            name: 1,
            basePrice: 1,
            mediaGallery: 1,
            description: 1,
            category: 1
          }
        }
      ]);
      products.push(...categoryProducts);
    }

    // Shuffle the final array for variety
    const shuffledProducts = products.sort(() => Math.random() - 0.5);

    return NextResponse.json({
      success: true,
      data: shuffledProducts
    });
  } catch (error: any) {
    console.error('Upsell Products Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
