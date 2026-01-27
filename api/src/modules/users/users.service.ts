import { db } from '../../db';
import { users } from '../../db/schema/users';
import { roles } from '../../db/schema/roles';
import { count, eq, sql, like, and } from 'drizzle-orm';

export const getRoles = async () => {
    const roleList = await db.select({
        name: roles.name,
    }).from(roles);

    return roleList.map(role => ({
        title: role.name.charAt(0).toUpperCase() + role.name.slice(1), // Capitalize first letter
        value: role.name
    }));
};

export const getUsers = async (page: number = 1, limit: number = 10, search?: string, role?: string) => {
    const offset = (page - 1) * limit;
    
    let whereClause = undefined;
    const conditions = [];

    if (search) {
        conditions.push(like(users.username, `%${search}%`));
    }

    if (role) {
        conditions.push(eq(roles.name, role));
    }

    if (conditions.length > 0) {
        whereClause = and(...conditions);
    }

    const [userList, totalCount] = await Promise.all([
        db.select({
            id: users.id,
            username: users.username,
            phone: users.phone,
            avatarUrl: users.avatarUrl,
            status: users.status,
            role: roles.name,
            createdAt: users.createdAt,
            updatedAt: users.updatedAt
        })
        .from(users)
        .leftJoin(roles, eq(users.roleId, roles.id))
        .where(whereClause)
        .limit(limit)
        .offset(offset),
        db.select({ count: count() })
        .from(users)
        .leftJoin(roles, eq(users.roleId, roles.id))
        .where(whereClause)
    ]);

    const mappedUsers = userList.map(user => ({
        ...user,
        email: user.phone, // Map phone to email
        currentPlan: 'Basic',
        billing: 'Auto Debit',
        fullName: user.username, // Map username to fullName
        avatar: user.avatarUrl // Map avatarUrl to avatar
    }));

    return {
        users: mappedUsers, // Changed to 'users' to match frontend expectation if possible, or I'll change frontend
        totalUsers: totalCount[0].count, // Changed to match frontend expectation
        page,
        limit,
        totalPages: Math.ceil(totalCount[0].count / limit)
    };
};

export const getUserById = async (id: number) => {
    const user = await db.select({
        id: users.id,
        username: users.username,
        phone: users.phone,
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

    const u = user[0];
    return {
        ...u,
        email: u.phone,
        currentPlan: 'Basic',
        billing: 'Auto Debit',
        fullName: u.username,
        avatar: u.avatarUrl
    };
};

export const updateUserBanStatus = async (id: number, isBanned: boolean) => {
    const status = isBanned ? 'banned' : 'active';
    await db.update(users).set({ status }).where(eq(users.id, id));
    return { message: `User ${status} successfully` };
};

export const deleteUser = async (id: number) => {
    await db.delete(users).where(eq(users.id, id));
    return { message: 'User deleted successfully' };
};

export const getUserStats = async () => {
    const totalUsers = await db.select({ count: count() }).from(users);
    const activeUsers = await db.select({ count: count() }).from(users).where(eq(users.status, 'active'));
    const bannedUsers = await db.select({ count: count() }).from(users).where(eq(users.status, 'banned'));
    
    return {
        totalUsers: totalUsers[0].count,
        activeUsers: activeUsers[0].count,
        bannedUsers: bannedUsers[0].count,
        pendingUsers: 0,
        paidUsers: 0
    };
};
