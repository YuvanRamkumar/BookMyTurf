import { NextRequest, NextResponse } from 'next/server';
import { getDb, saveDb, Turf, Slot } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const adminId = searchParams.get('adminId');
    const sportType = searchParams.get('sportType');

    const db = getDb();
    let turfs = db.turfs;

    if (adminId) {
        turfs = turfs.filter(t => t.admin_id === adminId);
    }
    if (sportType) {
        turfs = turfs.filter(t => t.sport_type === sportType);
    }

    return NextResponse.json(turfs);
}

export async function POST(request: NextRequest) {
    const session = await getSession();
    if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { name, location, sport_type, price_per_hour, opening_time, closing_time, image_url } = await request.json();

        const db = getDb();
        const newTurf: Turf = {
            id: Math.random().toString(36).substring(7),
            name,
            location,
            sport_type,
            price_per_hour: Number(price_per_hour),
            opening_time,
            closing_time,
            admin_id: session.id,
            image_url: image_url || undefined,
        };

        db.turfs.push(newTurf);

        // Auto-generate slots for today and the next 7 days
        const today = new Date();
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];

            const startHour = parseInt(opening_time.split(':')[0]);
            const endHour = parseInt(closing_time.split(':')[0]);

            for (let h = startHour; h < endHour; h++) {
                db.slots.push({
                    id: `s-${newTurf.id}-${dateStr}-${h}`,
                    turf_id: newTurf.id,
                    date: dateStr,
                    start_time: `${h.toString().padStart(2, '0')}:00`,
                    end_time: `${(h + 1).toString().padStart(2, '0')}:00`,
                    is_booked: false
                });
            }
        }

        saveDb(db);
        return NextResponse.json(newTurf);
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
