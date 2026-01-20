
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Category from '@/models/Category';

export async function POST(req: Request) {
  await dbConnect();
  try {
    const body = await req.json();
    if (Array.isArray(body)) {
      const categories = await Category.insertMany(body);
      return NextResponse.json({ success: true, count: categories.length, data: categories });
    } else {
      const category = await Category.create(body);
      return NextResponse.json({ success: true, data: category });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
