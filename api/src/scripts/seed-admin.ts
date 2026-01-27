import { db } from '../db';
import { admins } from '../db/schema/admins';
import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';

async function seedAdmin() {
  const username = 'admin';
  const password = 'admin';
  
  console.log(`Checking if admin user '${username}' exists...`);
  
  const existingAdmin = await db.select().from(admins).where(eq(admins.username, username)).limit(1);
  
  if (existingAdmin.length > 0) {
    console.log('Admin user already exists.');
    
    // Optional: Update password if needed
    // const hashedPassword = await bcrypt.hash(password, 10);
    // await db.update(admins).set({ passwordHash: hashedPassword }).where(eq(admins.username, username));
    // console.log('Admin password updated.');
    
    process.exit(0);
  }

  console.log('Creating admin user...');
  const hashedPassword = await bcrypt.hash(password, 10);
  
  await db.insert(admins).values({
    username,
    passwordHash: hashedPassword,
    status: 'active',
  });
  
  console.log('Admin user created successfully.');
  process.exit(0);
}

seedAdmin().catch((err) => {
  console.error('Error seeding admin:', err);
  process.exit(1);
});
