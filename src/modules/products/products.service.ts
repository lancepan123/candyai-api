import { db } from '../../db';
import { products } from '../../db/schema/products';

export const createProduct = async (data: any) => {
    // Convert number to string for decimal if needed, or rely on driver
    // Drizzle decimal is usually string
    return await db.insert(products).values({
        ...data,
        price: data.price.toString()
    });
};

export const getProducts = async (limit: number = 20, offset: number = 0) => {
    return await db.select().from(products).limit(limit).offset(offset);
};
