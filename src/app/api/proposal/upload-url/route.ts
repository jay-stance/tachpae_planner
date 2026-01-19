
import { NextResponse } from 'next/server';
import { getPresignedUploadUrl } from '@/actions/proposal';

export async function POST() {
  try {
    const result = await getPresignedUploadUrl();
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
