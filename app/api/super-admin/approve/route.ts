import { NextRequest, NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
    const session = await getSession();
    if (!session || session.role !== 'SUPER_ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { userId, approve } = await request.json();
        const db = getDb();
        const userIndex = db.users.findIndex(u => u.id === userId);

        if (userIndex === -1) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (approve) {
            db.users[userIndex].is_approved = true;
        } else {
            // Reject - maybe delete user or just leave as unapproved
            // For prototype, we'll just keep it unapproved or we could filter out rejected.
            db.users[userIndex].is_approved = false;
        }

        saveDb(db);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
