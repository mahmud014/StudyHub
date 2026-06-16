import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get('subjectId');

    const where: any = {};
    if (subjectId) where.subjectId = subjectId;

    const groups = await db.studyGroup.findMany({
      where,
      include: {
        subject: true,
        creator: { select: { id: true, name: true, avatar: true } },
        members: { include: { user: { select: { id: true, name: true, avatar: true } } } },
        _count: { select: { members: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: groups });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch study groups' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const creatorId = sessionUser.id;

    const body = await req.json();
    const group = await db.studyGroup.create({
      data: {
        name: body.name,
        description: body.description,
        subjectId: body.subjectId,
        creatorId,
        maxMembers: body.maxMembers || 10,
        members: {
          create: { userId: creatorId, role: 'admin' },
        },
      },
      include: { subject: true, creator: true, members: true },
    });
    return NextResponse.json({ success: true, data: group });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create study group' }, { status: 500 });
  }
}
