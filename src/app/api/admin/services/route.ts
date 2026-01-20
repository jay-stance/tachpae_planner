import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Service from '@/models/Service';
import { isAdmin } from '@/lib/middleware';

export async function POST(req: Request) {
  await dbConnect();

  const auth = await isAdmin(req);
  if (!auth.authorized) return auth.response;

  try {
    const body = await req.json();
    if (Array.isArray(body)) {
      const services = await Service.insertMany(body);
      return NextResponse.json({ success: true, count: services.length, data: services });
    } else {
      const service = await Service.create(body);
      return NextResponse.json({ success: true, data: service });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
