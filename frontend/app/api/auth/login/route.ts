import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { encrypt } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();

        // 1. Find user in PostgreSQL
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // 2. Verify hashed password
        const isPasswordCorrect = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordCorrect) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // 3. Check for Admin approval
        if (user.role === 'ADMIN' && !user.is_approved) {
            return NextResponse.json({ error: 'Your account is pending approval by Super Admin' }, { status: 403 });
        }

        // 4. Create Session payload
        const sessionPayload = {
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name || user.email.split('@')[0],
            is_approved: user.is_approved
        };

        // 5. Encrypt and set cookie in response explicitly
        const session = await encrypt(sessionPayload);
        const response = NextResponse.json({
            user: sessionPayload,
            success: true
        });

        // Set the cookie on the response object
        response.cookies.set('session', session, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 2 // 2 hours in seconds
        });

        return response;
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
