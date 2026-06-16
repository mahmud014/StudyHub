import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const userId = sessionUser.id;

    const { id } = await params;

    // Check if already a member
    const existing = await db.studyGroupMember.findUnique({
      where: { groupId_userId: { groupId: id, userId } },
    });

    if (existing) {
      return NextResponse.json({ success: false, error: 'Already a member' }, { status: 400 });
    }

    // Check if group is full
    const group = await db.studyGroup.findUnique({
      where: { id },
      include: { _count: { select: { members: true } } },
    });

    if (group && group._count.members >= group.maxMembers) {
      return NextResponse.json({ success: false, error: 'Group is full' }, { status: 400 });
    }

    const member = await db.studyGroupMember.create({
      data: { groupId: id, userId },
    });

    return NextResponse.json({ success: true, data: member });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to join group' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    const userId = sessionUser.id;

    const { id } = await params;

    const existing = await db.studyGroupMember.findUnique({
      where: { groupId_userId: { groupId: id, userId } },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Not a member' }, { status: 400 });
    }

    // Don't allow the creator/admin to leave (they would need to delete the group)
    if (existing.role === 'admin') {
      // Check if they're the only admin
      const adminCount = await db.studyGroupMember.count({
        where: { groupId: id, role: 'admin' },
      });
      if (adminCount <= 1) {
        return NextResponse.json({ success: false, error: 'একমাত্র অ্যাডমিন গ্রুপ ছেড়ে দিতে পারবেন না। প্রথমে অন্য কাউকে অ্যাডমিন করুন অথবা গ্রুপ মুছে ফেলুন।' }, { status: 400 });
      }
    }

    await db.studyGroupMember.delete({
      where: { id: existing.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to leave group' }, { status: 500 });
  }
}
