import { PrismaClient, Role, SportType } from '@prisma/client'
import bcrypt from 'bcryptjs'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function main() {
    console.log('Reading data from db.json...')

    // Path to db.json (located in frontend/data/db.json relative to project root)
    // Assuming we run this from the backend directory
    const dbJsonPath = path.join(__dirname, '../../frontend/data/db.json')

    if (!fs.existsSync(dbJsonPath)) {
        throw new Error(`File not found: ${dbJsonPath}`)
    }

    const rawData = fs.readFileSync(dbJsonPath, 'utf8')
    const data = JSON.parse(rawData)

    console.log('Cleaning existing data...')
    // Delete in reverse order of dependency
    await prisma.booking.deleteMany({})
    await prisma.slot.deleteMany({})
    await prisma.turf.deleteMany({})
    await prisma.user.deleteMany({})

    console.log('Seeding Users...')
    for (const user of data.users) {
        const passwordHash = await bcrypt.hash(user.password, 10)
        await prisma.user.create({
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                password_hash: passwordHash,
                role: user.role as Role,
                is_approved: user.is_approved,
            }
        })
    }

    console.log('Seeding Turfs...')
    for (const turf of data.turfs) {
        await prisma.turf.create({
            data: {
                id: turf.id,
                name: turf.name,
                location: turf.location,
                sport_type: turf.sport_type === 'Football/Cricket' ? SportType.FOOTBALL_CRICKET : SportType.PICKLEBALL,
                price_per_hour: turf.price_per_hour,
                opening_time: turf.opening_time,
                closing_time: turf.closing_time,
                image_url: turf.image_url,
                admin_id: turf.admin_id,
                is_approved: turf.is_approved,
            }
        })
    }

    console.log('Seeding Slots...')
    // Inserting slots in batches to avoid overwhelming the connection
    const slotsData = data.slots.map((slot: any) => ({
        id: slot.id,
        turf_id: slot.turf_id,
        date: new Date(slot.date), // schema.prisma expects DateTime (@db.Date)
        start_time: slot.start_time,
        end_time: slot.end_time,
        is_booked: slot.is_booked,
    }))

    // Batch create for performance
    const batchSize = 100
    for (let i = 0; i < slotsData.length; i += batchSize) {
        const batch = slotsData.slice(i, i + batchSize)
        await prisma.slot.createMany({ data: batch })
        console.log(`Seeded ${Math.min(i + batchSize, slotsData.length)} / ${slotsData.length} slots`)
    }

    console.log('Seed data imported successfully from db.json')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
