import { NextResponse, NextRequest } from 'next/server';
import { getSession } from '@/lib/auth';
import { auth } from '@/lib/auth-config';

export async function GET(req: NextRequest) {
    // 1. Check custom JWT session
    const session = await getSession();
    if (session) {
        return NextResponse.json({ user: session });
    }

    // 2. Check NextAuth session
    const nextAuthSession = await auth();
    if (nextAuthSession?.user) {
        return NextResponse.json({ user: nextAuthSession.user });
    }

    // 3. No session found
    return NextResponse.json({ user: null });
}
