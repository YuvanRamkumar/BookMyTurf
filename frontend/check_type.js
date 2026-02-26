const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const result = await prisma.$queryRaw`SELECT table_name, column_name, data_type FROM information_schema.columns WHERE table_name = 'Turf' AND column_name = 'id'`;
    console.log(JSON.stringify(result, null, 2))
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
