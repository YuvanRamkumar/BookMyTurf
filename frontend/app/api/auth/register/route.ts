import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { encrypt } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
    try {
        const { name, email, password, role } = await request.json();

        if (!name || !email || !password || !role) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        // 1. Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json({ error: 'User already exists' }, { status: 400 });
        }

        // 2. Hash password
        const password_hash = await bcrypt.hash(password, 10);

        // 3. Set approval status
        const is_approved = (role === 'USER' || role === 'SUPER_ADMIN');

        // 4. Create new user in database
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password_hash,
                role: role as any,
                is_approved,
            }
        });

        // 5. Create Session payload
        const sessionPayload = {
            id: newUser.id,
            email: newUser.email,
            role: newUser.role,
            name: newUser.name || newUser.email.split('@')[0],
            is_approved: newUser.is_approved
        };

        // 6. Encrypt and set cookie in response explicitly
        const session = await encrypt(sessionPayload);
        const response = NextResponse.json({
            user: sessionPayload,
            success: true
        });

        response.cookies.set('session', session, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 2 // 2 hours
        });

        return response;
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
