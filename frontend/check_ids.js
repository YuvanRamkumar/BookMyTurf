const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const turfs = await prisma.turf.findMany({
        select: { id: true, name: true }
    })
    console.log(JSON.stringify(turfs, null, 2))
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
