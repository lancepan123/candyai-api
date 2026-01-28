import { db } from '../../db';
import { users } from '../../db/schema/users';
import { roles } from '../../db/schema/roles';
import { count, eq, like, or, and, desc } from 'drizzle-orm';
import bcrypt from 'bcrypt';

export const getUsers = async (
    page: number = 1, 
    limit: number = 10, 
    search?: string, 
    role?: string,
    status?: string
) => {
    const offset = (page - 1) * limit;
    
    let whereClause = undefined;
    const conditions = [];

    if (search) {
        conditions.push(or(
            like(users.username, `%${search}%`),
            like(users.phone, `%${search}%`)
        ));
    }

    if (role) {
        conditions.push(eq(roles.name, role));
    }

    if (status) {
        conditions.push(eq(users.status, status as any));
    }
    
    if (conditions.length > 0) {
        whereClause = and(...conditions);
    }

    const [userList, totalCount] = await Promise.all([
        db.select({
            id: users.id,
            fullName: users.username,
            username: users.username,
            email: users.phone, // Mapping phone to email for frontend compatibility
            phone: users.phone,
            avatar: users.avatarUrl,
            avatarUrl: users.avatarUrl,
            status: users.status,
            role: roles.name,
            currentPlan: users.status, // Mock
            billing: users.status, // Mock
            createdAt: users.createdAt,
            updatedAt: users.updatedAt
        })
        .from(users)
        .leftJoin(roles, eq(users.roleId, roles.id))
        .where(whereClause)
        .limit(limit)
        .offset(offset)
        .orderBy(desc(users.createdAt)),
        db.select({ count: count() }).from(users).leftJoin(roles, eq(users.roleId, roles.id)).where(whereClause)
    ]);

    return {
        users: userList,
        totalUsers: totalCount[0].count,
        totalPages: Math.ceil(totalCount[0].count / limit),
        currentPage: page
    };
};

export const getUserById = async (id: number) => {
    const user = await db.select({
        id: users.id,
        fullName: users.username,
        username: users.username,
        phone: users.phone,
        email: users.phone,
        avatar: users.avatarUrl,
        avatarUrl: users.avatarUrl,
        status: users.status,
        role: roles.name,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt
    })
    .from(users)
    .leftJoin(roles, eq(users.roleId, roles.id))
    .where(eq(users.id, id))
    .limit(1);

    if (user.length === 0) {
        return null;
    }

    return user[0];
};

export const updateUserBanStatus = async (id: number, isBanned: boolean) => {
    const status = isBanned ? 'banned' : 'active';
    await db.update(users).set({ status }).where(eq(users.id, id));
    return { message: `User ${status} successfully` };
};

export const deleteUser = async (id: number) => {
    await db.delete(users).where(eq(users.id, id));
};

export const getRoles = async () => {
    return await db.select({ title: roles.name, value: roles.name }).from(roles);
};

export const getUserStats = async () => {
    return {};
};

export const createUser = async (userData: any) => {
    const { fullName, username, email, password, role } = userData;
    // Basic implementation
    const hashedPassword = await bcrypt.hash(password || '123456', 10);
    
    // Find role id
    const roleRecord = await db.select().from(roles).where(eq(roles.name, role)).limit(1);
    let roleId = null;
    if (roleRecord.length > 0) roleId = roleRecord[0].id;

    const [result] = await db.insert(users).values({
        username: fullName || username,
        phone: email || '00000000000', // Mock phone if email provided
        passwordHash: hashedPassword,
        roleId,
        status: 'active'
    });
    
    return { id: result.insertId, ...userData };
};
