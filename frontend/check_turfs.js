
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const turfs = await prisma.turf.findMany();
    console.log(JSON.stringify(turfs, null, 2));
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
