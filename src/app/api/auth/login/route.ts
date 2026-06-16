import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { signJWT } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'ইমেইল ও পাসওয়ার্ড প্রয়োজন' },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { email },
      include: {
        studentProfile: true,
        teacherProfile: true,
        guardian: {
          include: {
            children: {
              include: {
                user: {
                  select: { id: true, name: true, email: true },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'ইমেইল বা পাসওয়ার্ড ভুল' },
        { status: 401 }
      );
    }

    // Validate password using bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, error: 'ইমেইল বা পাসওয়ার্ড ভুল' },
        { status: 401 }
      );
    }

    // Don't return password
    const { password: _password, ...userWithoutPassword } = user;

    // Generate JWT token
    const token = await signJWT({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    // Set secure HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set('studyhub_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return NextResponse.json({ success: true, data: userWithoutPassword });
  } catch (error) {
    console.error('Error during login:', error);
    return NextResponse.json(
      { success: false, error: 'লগইন করতে সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
}
