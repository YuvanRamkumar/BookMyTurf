
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const turfs = await prisma.turf.findMany({
        select: {
            id: true,
            name: true,
            location: true,
            sport_type: true
        }
    });

    const groups = {};
    turfs.forEach(t => {
        const key = `${t.name}|${t.location}|${t.sport_type}`;
        if (!groups[key]) groups[key] = [];
        groups[key].push(t.id);
    });

    for (const key in groups) {
        if (groups[key].length > 1) {
            console.log(`Duplicate found for "${key}": ${groups[key].length} entries`);
            const idsToDelete = groups[key].slice(1); // Keep the first one
            console.log(`IDs to delete: ${idsToDelete.join(', ')}`);

            // Delete dependent records first if necessary, but Slot has Cascade.
            // Reviews and Bookings might exist. Let's check them.
            for (const id of idsToDelete) {
                const bookings = await prisma.booking.count({ where: { turf_id: id } });
                const reviews = await prisma.review.count({ where: { turf_id: id } });

                if (bookings > 0 || reviews > 0) {
                    console.log(`Warning: Turf ${id} has ${bookings} bookings and ${reviews} reviews. Manual intervention might be safer, but we will delete them as requested.`);
                    await prisma.booking.deleteMany({ where: { turf_id: id } });
                    await prisma.review.deleteMany({ where: { turf_id: id } });
                }

                await prisma.turf.delete({ where: { id: id } });
                console.log(`Deleted turf ${id}`);
            }
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
