import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Tag, { SYSTEM_TAGS } from '@/models/Tag';
import { isAdmin } from '@/lib/middleware';

// GET all tags
export async function GET() {
  await dbConnect();

  try {
    const tags = await Tag.find().sort({ displayOrder: 1 });
    return NextResponse.json({ success: true, data: tags });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

// POST - Create new tag or seed system tags
export async function POST(req: Request) {
  await dbConnect();

  const auth = await isAdmin(req);
  if (!auth.authorized) return auth.response;

  try {
    const body = await req.json();
    
    // Special action to seed system tags
    if (body.action === 'seed') {
      const existingTags = await Tag.find({ isSystem: true });
      if (existingTags.length === 0) {
        const tags = await Tag.insertMany(SYSTEM_TAGS);
        return NextResponse.json({ success: true, message: 'System tags seeded', count: tags.length, data: tags });
      }
      return NextResponse.json({ success: true, message: 'System tags already exist', data: existingTags });
    }
    
    // Create custom tag
    const tag = await Tag.create({
      ...body,
      isSystem: false, // Only system tags created via seed
    });
    return NextResponse.json({ success: true, data: tag });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
