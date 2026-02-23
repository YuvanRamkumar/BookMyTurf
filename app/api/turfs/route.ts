import { NextRequest, NextResponse } from 'next/server';
import { getDb, saveDb, Turf, Slot } from '@/lib/db';
import { getSession } from '@/lib/auth';

/**
 * Ensures every turf has slots for today + next 6 days.
 * Only generates missing slots — skips days that already have slots for that turf.
 */
function ensureSlotsForNextDays(db: ReturnType<typeof getDb>) {
    const today = new Date();
    let changed = false;

    db.turfs.forEach(turf => {
        const startHour = parseInt(turf.opening_time.split(':')[0]);
        const endHour = parseInt(turf.closing_time.split(':')[0]);

        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];

            // Check if any slot already exists for this turf + date
            const existing = db.slots.some(s => s.turf_id === turf.id && s.date === dateStr);
            if (existing) continue;

            // Generate hourly slots for the whole day
            for (let h = startHour; h < endHour; h++) {
                const slotId = `s-${turf.id}-${dateStr}-${h}`;
                // Avoid duplicates
                if (db.slots.some(s => s.id === slotId)) continue;

                db.slots.push({
                    id: slotId,
                    turf_id: turf.id,
                    date: dateStr,
                    start_time: `${h.toString().padStart(2, '0')}:00`,
                    end_time: `${(h + 1).toString().padStart(2, '0')}:00`,
                    is_booked: false,
                });
                changed = true;
            }
        }
    });

    if (changed) saveDb(db);
    return db;
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const adminId = searchParams.get('adminId');
    const sportType = searchParams.get('sportType');
    const maxPrice = searchParams.get('maxPrice');
    const minPrice = searchParams.get('minPrice');
    const includePending = searchParams.get('includePending') === 'true';

    const session = await getSession();

    // Auto-generate missing slots for next 7 days before returning
    const db = ensureSlotsForNextDays(getDb());
    let turfs = db.turfs;

    // Filter by approval status
    // 1. Super admin sees everything
    // 2. Admin sees their own turfs (even if pending)
    // 3. Others (or unauthenticated) see only approved turfs
    if (session?.role === 'SUPER_ADMIN') {
        // No filtering by approval, but can filter by adminId if requested
    } else {
        turfs = turfs.filter(t => t.is_approved || (session && t.admin_id === session.id));
    }

    if (adminId) {
        turfs = turfs.filter(t => t.admin_id === adminId);
    }
    if (sportType) {
        turfs = turfs.filter(t => t.sport_type === sportType);
    }
    if (minPrice) {
        turfs = turfs.filter(t => t.price_per_hour >= Number(minPrice));
    }
    if (maxPrice) {
        turfs = turfs.filter(t => t.price_per_hour <= Number(maxPrice));
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
            is_approved: session.role === 'SUPER_ADMIN', // Auto-approve if added by super admin
            status: 'active',
        };

        db.turfs.push(newTurf);

        // Auto-generate slots for today and the next 7 days
        const today = new Date();
        const startHour = parseInt(opening_time.split(':')[0]);
        const endHour = parseInt(closing_time.split(':')[0]);

        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];

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
