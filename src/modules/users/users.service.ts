import { db } from '../../db';
import { users } from '../../db/schema/users';
import { roles } from '../../db/schema/roles';
import { count, eq } from 'drizzle-orm';

export const getUsers = async (page: number = 1, limit: number = 10) => {
    const offset = (page - 1) * limit;
    
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
        .limit(limit)
        .offset(offset),
        db.select({ count: count() }).from(users)
    ]);

    return {
        data: userList,
        meta: {
            total: totalCount[0].count,
            page,
            limit,
            totalPages: Math.ceil(totalCount[0].count / limit)
        }
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

    return user[0];
};

export const updateUserBanStatus = async (id: number, isBanned: boolean) => {
    const status = isBanned ? 'banned' : 'active';
    await db.update(users).set({ status }).where(eq(users.id, id));
    return { message: `User ${status} successfully` };
};
