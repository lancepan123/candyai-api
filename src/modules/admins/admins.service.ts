import { db } from '../../db';
import { admins } from '../../db/schema/admins';
import { adminLogs } from '../../db/schema/admin_logs';
import { eq, desc } from 'drizzle-orm';
import bcrypt from 'bcrypt';

// Admin Management
export const getAdminById = async (id: number) => {
    const admin = await db.select({
        id: admins.id,
        username: admins.username,
        avatarUrl: admins.avatarUrl,
        status: admins.status,
        createdAt: admins.createdAt,
        updatedAt: admins.updatedAt
    })
    .from(admins)
    .where(eq(admins.id, id))
    .limit(1);

    if (admin.length === 0) {
        return null;
    }

    return admin[0];
};

export const getAdmins = async () => {
    return await db.select({
        id: admins.id,
        username: admins.username,
        avatarUrl: admins.avatarUrl,
        status: admins.status,
        createdAt: admins.createdAt,
        updatedAt: admins.updatedAt
    }).from(admins);
};

export const createAdmin = async (data: { username: string, password: string, avatarUrl?: string }) => {
    const passwordHash = await bcrypt.hash(data.password, 10);
    const [result] = await db.insert(admins).values({
        username: data.username,
        passwordHash,
        avatarUrl: data.avatarUrl,
        status: 'active'
    });
    return getAdminById(result.insertId);
};

export const updateAdminStatus = async (id: number, status: 'active' | 'banned') => {
    await db.update(admins).set({ status }).where(eq(admins.id, id));
    return getAdminById(id);
};

export const updateAdminProfile = async (id: number, data: { username?: string; avatarUrl?: string }) => {
    await db.update(admins).set(data).where(eq(admins.id, id));
    return getAdminById(id);
};

// Admin Logs
export const logAdminAction = async (adminId: number, action: string, details?: any, ipAddress?: string) => {
    await db.insert(adminLogs).values({
        adminId,
        action,
        details,
        ipAddress
    });
};

export const getAdminLogs = async (limit: number = 50) => {
    return await db.select({
        id: adminLogs.id,
        adminId: adminLogs.adminId,
        adminName: admins.username,
        action: adminLogs.action,
        details: adminLogs.details,
        ipAddress: adminLogs.ipAddress,
        createdAt: adminLogs.createdAt
    })
    .from(adminLogs)
    .leftJoin(admins, eq(adminLogs.adminId, admins.id))
    .orderBy(desc(adminLogs.createdAt))
    .limit(limit);
};