import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { login } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();

        const db = getDb();
        const user = db.users.find(u => u.email === email && u.password === password);

        if (!user) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        if (user.role === 'ADMIN' && !user.is_approved) {
            return NextResponse.json({ error: 'Your account is pending approval by Super Admin' }, { status: 403 });
        }

        await login({
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name
        });

        return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
