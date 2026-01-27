import { db } from '../../db';
import { users } from '../../db/schema/users';
import { admins } from '../../db/schema/admins';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import { FastifyInstance } from 'fastify';

export const registerUser = async (app: FastifyInstance, body: any) => {
    const { username, email, password } = body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    try {
        await db.insert(users).values({
            username,
            email,
            passwordHash: hashedPassword,
        });
        return { message: 'User registered' };
    } catch (e) {
        throw new Error('User already exists');
    }
}

export const registerAdmin = async (app: FastifyInstance, body: any) => {
    const { username, password } = body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    try {
        await db.insert(admins).values({
            username,
            passwordHash: hashedPassword,
        });
        return { message: 'Admin registered' };
    } catch (e) {
        throw new Error('Admin already exists');
    }
}

export const loginUser = async (app: FastifyInstance, body: any) => {
    const { email, password } = body;
    const user = await db.select().from(users).where(eq(users.email, email)).limit(1);
    
    if (user.length === 0) {
        throw new Error('Invalid credentials');
    }
    
    const isValid = await bcrypt.compare(password, user[0].passwordHash);
    if (!isValid) {
        throw new Error('Invalid credentials');
    }
    
    const token = app.jwt.sign({ id: user[0].id, role: 'user' });
    return { token };
}

export const loginAdmin = async (app: FastifyInstance, body: any) => {
    const { username, password } = body;
    const admin = await db.select().from(admins).where(eq(admins.username, username)).limit(1);
    
    if (admin.length === 0) {
        throw new Error('Invalid credentials');
    }
    
    const isValid = await bcrypt.compare(password, admin[0].passwordHash);
    if (!isValid) {
        throw new Error('Invalid credentials');
    }
    
    const token = app.jwt.sign({ id: admin[0].id, role: 'admin' });
    return { token };
}
