import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const turf = await db.turf.findUnique({
            where: { id },
            include: {
                admin: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            }
        })

        if (!turf) {
            return NextResponse.json({ error: "Turf not found" }, { status: 404 })
        }

        return NextResponse.json(turf)
    } catch (error) {
        console.error("GET_TURF_BY_ID_ERROR", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await auth()
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const turf = await db.turf.findUnique({
            where: { id }
        })

        if (!turf) {
            return NextResponse.json({ error: "Turf not found" }, { status: 404 })
        }

        // RBAC: Only owning admin or super admin can update
        if (session.user.role !== 'SUPER_ADMIN' && turf.admin_id !== session.user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        const body = await req.json()
        const {
            name, location, sport_type, opening_time, closing_time, image_url,
            description, amenities, precautions, images, operational_status,
            weekday_price, weekend_price, peak_hour_multiplier, peak_start_time, peak_end_time,
            latitude, longitude, address,
            status: turfApprovalStatus
        } = body

        const data: any = {
            name,
            location,
            sport_type: (sport_type === 'Football/Cricket' || sport_type === 'FOOTBALL_CRICKET') ? 'FOOTBALL_CRICKET' : 'PICKLEBALL',
            opening_time,
            closing_time,
            image_url,
            description,
            amenities: Array.isArray(amenities) ? amenities : undefined,
            precautions: Array.isArray(precautions) ? precautions : undefined,
            images: Array.isArray(images) ? images : undefined,
            operational_status,
            weekday_price: weekday_price !== undefined ? parseFloat(weekday_price) : undefined,
            weekend_price: weekend_price !== undefined ? parseFloat(weekend_price) : undefined,
            peak_hour_multiplier: peak_hour_multiplier !== undefined ? parseFloat(peak_hour_multiplier) : undefined,
            peak_start_time,
            peak_end_time,
            latitude: latitude !== undefined ? parseFloat(latitude) : undefined,
            longitude: longitude !== undefined ? parseFloat(longitude) : undefined,
            address
        }

        // Map price_per_hour to weekday_price for backward compatibility
        if (weekday_price !== undefined) {
            data.price_per_hour = parseFloat(weekday_price);
        } else if (body.price_per_hour !== undefined) {
            data.price_per_hour = parseFloat(body.price_per_hour);
        }

        // Update approval status if super admin
        if (session.user.role === 'SUPER_ADMIN') {
            if (turfApprovalStatus) data.status = turfApprovalStatus;
            if (body.is_approved !== undefined) {
                data.status = body.is_approved ? 'APPROVED' : 'REJECTED';
            }
        }

        const updatedTurf = await db.turf.update({
            where: { id },
            data
        })

        // Regenerate slots ONLY if timing actually changed
        const timingChanged = (opening_time && opening_time !== turf.opening_time) ||
            (closing_time && closing_time !== turf.closing_time);

        if (timingChanged) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            for (let i = 0; i < 7; i++) {
                const date = new Date(today);
                date.setDate(today.getDate() + i);

                const Y = date.getFullYear();
                const M = String(date.getMonth() + 1).padStart(2, '0');
                const D = String(date.getDate()).padStart(2, '0');
                const normalizedDate = new Date(`${Y}-${M}-${D}T00:00:00Z`);

                try {
                    // Only delete unbooked slots
                    await db.slot.deleteMany({
                        where: {
                            turf_id: id,
                            date: normalizedDate,
                            is_booked: false,
                            booking: { is: null }
                        }
                    });

                    const finalOpeningTime = opening_time || updatedTurf.opening_time;
                    const finalClosingTime = closing_time || updatedTurf.closing_time;

                    if (!finalOpeningTime || !finalClosingTime) continue;

                    const startHour = parseInt(finalOpeningTime.split(':')[0]);
                    const endHour = parseInt(finalClosingTime.split(':')[0]);

                    if (isNaN(startHour) || isNaN(endHour)) continue;

                    const newSlots = [];
                    for (let h = startHour; h < endHour; h++) {
                        const startTime = `${h.toString().padStart(2, '0')}:00`;
                        const endTime = `${(h + 1).toString().padStart(2, '0')}:00`;

                        const exists = await db.slot.findUnique({
                            where: {
                                turf_id_date_start_time_end_time: {
                                    turf_id: id,
                                    date: normalizedDate,
                                    start_time: startTime,
                                    end_time: endTime
                                }
                            }
                        });

                        if (!exists) {
                            newSlots.push({
                                turf_id: id,
                                date: normalizedDate,
                                start_time: startTime,
                                end_time: endTime,
                                is_booked: false
                            });
                        }
                    }

                    if (newSlots.length > 0) {
                        await db.slot.createMany({
                            data: newSlots,
                            skipDuplicates: true
                        });
                    }
                } catch (slotErr: any) {
                    console.error(`Error regenerating slots for ${id} on ${Y}-${M}-${D}:`, slotErr.message);
                }
            }
        }

        return NextResponse.json(updatedTurf)
    } catch (error) {
        console.error("PUT_TURF_ERROR", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await auth()
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const turf = await db.turf.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { bookings: true }
                }
            }
        })

        if (!turf) {
            return NextResponse.json({ error: "Turf not found" }, { status: 404 })
        }

        // RBAC: Only owning admin or super admin can delete
        if (session.user.role !== 'SUPER_ADMIN' && turf.admin_id !== session.user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        // Prevent deletion if there are bookings
        if (turf._count.bookings > 0) {
            return NextResponse.json({ error: "Cannot delete turf with active bookings" }, { status: 400 })
        }

        await db.turf.delete({
            where: { id }
        })

        return NextResponse.json({ message: "Turf deleted successfully" })
    } catch (error) {
        console.error("DELETE_TURF_ERROR", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
