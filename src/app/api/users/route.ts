import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json(
        { success: false, error: 'অননুমোদিত অ্যাক্সেস' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'email প্রয়োজন' },
        { status: 400 }
      );
    }

    // Permit only if user is admin/teacher, or is fetching their own profile
    if (sessionUser.role !== 'admin' && sessionUser.role !== 'teacher' && sessionUser.email !== email) {
      return NextResponse.json(
        { success: false, error: 'অননুমোদিত অ্যাক্সেস' },
        { status: 403 }
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
        { success: false, error: 'ব্যবহারকারী পাওয়া যায়নি' },
        { status: 404 }
      );
    }

    // Don't return password
    const { password: _password, ...userWithoutPassword } = user;

    return NextResponse.json({ success: true, data: userWithoutPassword });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { success: false, error: 'ব্যবহারকারী খুঁজতে সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
}
