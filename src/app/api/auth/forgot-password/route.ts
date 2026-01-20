
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function POST(req: Request) {
  await dbConnect();
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
    }

    // This is a placeholder for real email sending logic
    const user = await User.findOne({ email: email.toLowerCase() });
    
    // Security best practice: don't reveal if user exists
    return NextResponse.json({ 
      success: true, 
      message: 'If an account exists with that email, a reset link will be sent.' 
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
