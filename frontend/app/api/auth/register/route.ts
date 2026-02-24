import { NextRequest, NextResponse } from 'next/server';
import { getDb, saveDb, User } from '@/lib/db';
import { login } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const { name, email, password, role } = await request.json();

        if (!name || !email || !password || !role) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        const db = getDb();
        if (db.users.find(u => u.email === email)) {
            return NextResponse.json({ error: 'User already exists' }, { status: 400 });
        }

        const newUser: User = {
            id: Math.random().toString(36).substring(7),
            name,
            email,
            password, // In real app, bcrypt.hash
            role,
            is_approved: role === 'USER' || role === 'SUPER_ADMIN' ? true : false,
        };

        db.users.push(newUser);
        saveDb(db);

        await login({
            id: newUser.id,
            email: newUser.email,
            role: newUser.role,
            name: newUser.name
        });

        return NextResponse.json({ user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role, is_approved: newUser.is_approved } });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
