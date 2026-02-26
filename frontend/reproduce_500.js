const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testPut() {
    const id = "sxpvta";
    const updates = {
        name: "Amrita Arena",
        opening_time: "06:00",
        closing_time: "22:00"
    };

    try {
        console.log("Fetching turf...");
        const turf = await prisma.turf.findUnique({ where: { id } });
        console.log("Turf found:", turf.name);

        console.log("Updating turf...");
        const updatedTurf = await prisma.turf.update({
            where: { id },
            data: {
                name: updates.name,
                opening_time: updates.opening_time,
                closing_time: updates.closing_time
            }
        });
        console.log("Turf updated!");

        if (updates.opening_time || updates.closing_time) {
            console.log("Regenerating slots...");
            const today = new Date();
            for (let i = 0; i < 7; i++) {
                const date = new Date(today);
                date.setDate(today.getDate() + i);
                const dateStr = date.toISOString().split('T')[0];
                const normalizedDate = new Date(dateStr);

                console.log(`Deleting slots for ${dateStr}...`);
                await prisma.slot.deleteMany({
                    where: {
                        turf_id: id,
                        date: normalizedDate,
                        is_booked: false,
                        booking: null
                    }
                });

                const startHour = parseInt(updatedTurf.opening_time.split(':')[0]);
                const endHour = parseInt(updatedTurf.closing_time.split(':')[0]);

                const newSlots = [];
                for (let h = startHour; h < endHour; h++) {
                    const startTime = `${h.toString().padStart(2, '0')}:00`;
                    const endTime = `${(h + 1).toString().padStart(2, '0')}:00`;

                    console.log(`Checking slot ${startTime}-${endTime} for ${dateStr}...`);
                    // This is where I suspect the crash!
                    const exists = await prisma.slot.findUnique({
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
                    console.log(`Creating ${newSlots.length} slots for ${dateStr}...`);
                    await prisma.slot.createMany({ data: newSlots });
                }
            }
        }
        console.log("SUCCESS!");

    } catch (e) {
        console.error("FAILED with error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

testPut();
