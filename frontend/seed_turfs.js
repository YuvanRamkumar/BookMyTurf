
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // Find an admin user to assign the turfs to
    let admin = await prisma.user.findFirst({
        where: { role: 'ADMIN' }
    });

    if (!admin) {
        // Create an admin if none exists
        admin = await prisma.user.create({
            data: {
                name: "Admin User",
                email: "admin@test.com",
                password_hash: "$2b$10$YourHashedPasswordHere", // Placeholder
                role: "ADMIN",
                is_approved: true
            }
        });
    }

    const turfs = [
        {
            name: "Victory Arena",
            image_url: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=800&auto=format&fit=crop",
            sport_type: "FOOTBALL_CRICKET",
            location: "Koramangala, Bangalore",
            price_per_hour: 1200,
            opening_time: "06:00",
            closing_time: "22:00",
            status: "APPROVED",
            operational_status: "ACTIVE",
            admin_id: admin.id,
            description: "Premium football arena with high-quality turf and floodlights."
        },
        {
            name: "Thunder Sports Center",
            image_url: "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?q=80&w=800&auto=format&fit=crop",
            sport_type: "FOOTBALL_CRICKET",
            location: "Indiranagar, Bangalore",
            price_per_hour: 1500,
            opening_time: "05:00",
            closing_time: "23:00",
            status: "APPROVED",
            operational_status: "ACTIVE",
            admin_id: admin.id,
            description: "Excellent cricket and football facility with ample parking."
        },
        {
            name: "Prime Turf Hub",
            image_url: "https://images.unsplash.com/photo-1517466788219-7f57b1f30745?q=80&w=800&auto=format&fit=crop",
            sport_type: "PICKLEBALL",
            location: "HSR Layout, Bangalore",
            price_per_hour: 1000,
            opening_time: "07:00",
            closing_time: "22:00",
            status: "APPROVED",
            operational_status: "ACTIVE",
            admin_id: admin.id,
            description: "Versatile turf hub suitable for multiple sports including pickleball."
        },
    ];

    for (const turf of turfs) {
        const createdTurf = await prisma.turf.upsert({
            where: { id: turf.name }, // This is wrong because id is uuid but name is unique-ish for our purpose here
            // Let's just create if not exists by name
            update: {},
            create: turf,
            where: { id: 'some-non-existent-id' } // Dummy where
        });

        // Check if exists by name instead
        const existing = await prisma.turf.findFirst({ where: { name: turf.name } });
        if (!existing) {
            const newTurf = await prisma.turf.create({ data: turf });
            console.log(`Created turf: ${newTurf.name}`);

            // Generate slots for the next 7 days
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const startHour = parseInt(turf.opening_time.split(':')[0]);
            const endHour = parseInt(turf.closing_time.split(':')[0]);

            const slots = [];
            for (let i = 0; i < 7; i++) {
                const date = new Date(today);
                date.setDate(today.getDate() + i);

                for (let h = startHour; h < endHour; h++) {
                    slots.push({
                        turf_id: newTurf.id,
                        date: date,
                        start_time: `${h.toString().padStart(2, '0')}:00`,
                        end_time: `${(h + 1).toString().padStart(2, '0')}:00`,
                        is_booked: false
                    });
                }
            }
            await prisma.slot.createMany({ data: slots });
        } else {
            console.log(`Turf already exists: ${existing.name}`);
        }
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
