
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';

// Create Product (Single or Batch)
export async function POST(req: Request) {
  await dbConnect();
  try {
    const body = await req.json();
    if (Array.isArray(body)) {
      const products = await Product.insertMany(body);
      return NextResponse.json({ success: true, count: products.length, data: products });
    } else {
      const product = await Product.create(body);
      return NextResponse.json({ success: true, data: product });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

// Update/Delete usually use [id] in path, but Next.js App Router uses segments.
// I'll create a dynamic route file for [id] next.
