import { NextRequest, NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
    const session = await getSession();
    if (!session || session.role !== 'SUPER_ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { turfId, approve } = await request.json();
        const db = getDb();
        const turfIndex = db.turfs.findIndex(t => t.id === turfId);

        if (turfIndex === -1) {
            return NextResponse.json({ error: 'Turf not found' }, { status: 404 });
        }

        if (approve) {
            db.turfs[turfIndex].is_approved = true;
        } else {
            // Reject - for now we'll just keep it unapproved or we could delete it.
            // Let's delete it if rejected to clean up.
            db.turfs.splice(turfIndex, 1);
            // Also delete associated slots
            db.slots = db.slots.filter(s => s.turf_id !== turfId);
        }

        saveDb(db);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
