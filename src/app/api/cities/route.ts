
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import City from '@/models/City';

export async function GET() {
  await dbConnect();

  try {
    const cities = await City.find({ isActive: true }).lean();
    return NextResponse.json({
      success: true,
      data: cities
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
