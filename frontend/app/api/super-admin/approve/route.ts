import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
    const session = await getSession();
    if (!session || session.role !== 'SUPER_ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { userId, approve } = await request.json();

        await prisma.user.update({
            where: { id: userId },
            data: { is_approved: !!approve }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Approve user error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
