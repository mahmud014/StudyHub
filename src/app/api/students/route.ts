import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json(
        { success: false, error: 'অননুমোদিত অ্যাক্সেস' },
        { status: 401 }
      );
    }

    if (sessionUser.role === 'student') {
      return NextResponse.json(
        { success: false, error: 'অননুমোদিত অ্যাক্সেস' },
        { status: 403 }
      );
    }

    let students = [];

    if (sessionUser.role === 'guardian') {
      // Find guardian profile first
      const guardian = await db.guardian.findUnique({
        where: { userId: sessionUser.id },
        include: {
          children: {
            include: {
              user: {
                select: { id: true, name: true, email: true, phone: true, avatar: true },
              },
            },
          },
        },
      });

      if (guardian) {
        students = guardian.children.map(child => ({
          id: child.user.id,
          name: child.user.name,
          email: child.user.email,
          phone: child.user.phone,
          avatar: child.user.avatar,
          class: child.class,
          roll: child.roll,
          school: child.school,
        }));
      }
    } else {
      // Admin/Teacher: return all students
      const studentProfiles = await db.studentProfile.findMany({
        include: {
          user: {
            select: { id: true, name: true, email: true, phone: true, avatar: true },
          },
        },
        orderBy: { roll: 'asc' },
      });

      students = studentProfiles.map(profile => ({
        id: profile.user.id,
        name: profile.user.name,
        email: profile.user.email,
        phone: profile.user.phone,
        avatar: profile.user.avatar,
        class: profile.class,
        roll: profile.roll,
        school: profile.school,
      }));
    }

    return NextResponse.json({ success: true, data: students });
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json(
      { success: false, error: 'শিক্ষার্থীদের তালিকা লোড করতে সমস্যা হয়েছে' },
      { status: 500 }
    );
  }
}
