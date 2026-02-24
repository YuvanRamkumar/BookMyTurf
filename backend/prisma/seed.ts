import { PrismaClient, Role, SportType } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const passwordHash = await bcrypt.hash('password123', 10)

    // 1. Create Super Admin
    const superAdmin = await prisma.user.upsert({
        where: { email: 'superadmin@bookmyturf.com' },
        update: {},
        create: {
            email: 'superadmin@bookmyturf.com',
            name: 'Super Admin',
            password_hash: passwordHash,
            role: Role.SUPER_ADMIN,
            is_approved: true,
        },
    })

    // 2. Create Approved Admin
    const approvedAdmin = await prisma.user.upsert({
        where: { email: 'admin@bookmyturf.com' },
        update: {},
        create: {
            email: 'admin@bookmyturf.com',
            name: 'John Admin',
            password_hash: passwordHash,
            role: Role.ADMIN,
            is_approved: true,
        },
    })

    // 3. Create Turfs
    const turf1 = await prisma.turf.create({
        data: {
            name: 'Arena Sports Hub',
            location: 'Downtown, Cityville',
            sport_type: SportType.FOOTBALL_CRICKET,
            price_per_hour: 1200,
            opening_time: '06:00',
            closing_time: '23:00',
            admin_id: approvedAdmin.id,
            image_url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=2000',
        },
    })

    const turf2 = await prisma.turf.create({
        data: {
            name: 'Smash Pickle Arena',
            location: 'Westside, Cityville',
            sport_type: SportType.PICKLEBALL,
            price_per_hour: 800,
            opening_time: '07:00',
            closing_time: '22:00',
            admin_id: approvedAdmin.id,
            image_url: 'https://images.unsplash.com/photo-1626225443592-d74828113401?q=80&w=2000',
        },
    })

    // 4. Generate today's slots for both turfs
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const generateSlots = async (turfId: string, open: number, close: number) => {
        const slots = []
        for (let hour = open; hour < close; hour++) {
            const startTime = `${hour.toString().padStart(2, '0')}:00`
            const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`
            slots.push({
                turf_id: turfId,
                date: today,
                start_time: startTime,
                end_time: endTime,
                is_booked: false,
            })
        }
        await prisma.slot.createMany({ data: slots })
    }

    await generateSlots(turf1.id, 6, 23)
    await generateSlots(turf2.id, 7, 22)

    console.log('Seed data created successfully')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
