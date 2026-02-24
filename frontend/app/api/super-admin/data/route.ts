import { NextRequest, NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
    const session = await getSession();
    if (!session || session.role !== 'SUPER_ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = getDb();

    const stats = {
        totalUsers: db.users.filter(u => u.role === 'USER').length,
        totalAdmins: db.users.filter(u => u.role === 'ADMIN').length,
        totalTurfs: db.turfs.length,
        totalBookings: db.bookings.length,
    };

    return NextResponse.json({
        stats,
        users: db.users.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role, is_approved: u.is_approved })),
        turfs: db.turfs,
        bookings: db.bookings.map(b => {
            const turf = db.turfs.find(t => t.id === b.turf_id);
            const user = db.users.find(u => u.id === b.user_id);
            return { ...b, turfName: turf?.name, userName: user?.name };
        })
    });
}

// DELETE Turf
export async function DELETE(request: NextRequest) {
    const session = await getSession();
    if (!session || session.role !== 'SUPER_ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const turfId = searchParams.get('id');

    if (!turfId) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const db = getDb();
    db.turfs = db.turfs.filter(t => t.id !== turfId);
    db.slots = db.slots.filter(s => s.turf_id !== turfId);
    db.bookings = db.bookings.filter(b => b.turf_id !== turfId);
    saveDb(db);

    return NextResponse.json({ success: true });
}
