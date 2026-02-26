const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkSpecificSlot() {
    const id = "s-sxpvta-2026-02-26-0";
    const slot = await prisma.slot.findUnique({
        where: { id },
        include: { booking: true }
    });
    console.log(JSON.stringify(slot, null, 2));
    await prisma.$disconnect();
}

checkSpecificSlot();
