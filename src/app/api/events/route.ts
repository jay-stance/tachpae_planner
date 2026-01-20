
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Event from '@/models/Event';

export async function GET() {
  await dbConnect();

  try {
    const events = await Event.find({ isActive: true }).lean();
    return NextResponse.json({
      success: true,
      data: events
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
