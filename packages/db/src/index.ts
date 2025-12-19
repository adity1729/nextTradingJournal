import { PrismaClient } from './generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// const connectionString = process.env.DATABASE_URL;
const connectionString = "postgresql://postgres:postgres@localhost:5432/notesapp"

// 1. Create the Pool and Adapter
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

// 2. Singleton Function
const prismaClientSingleton = () => {
    return new PrismaClient({ adapter });
};

// 3. Global Object Handling (prevents hot-reload crashes)
const globalForPrisma = global;
//@ts-ignore
const prismaClient = globalForPrisma.prismaClient || prismaClientSingleton();
export default prismaClient;
//@ts-ignore
if (process.env.NODE_ENV !== 'production') globalForPrisma.prismaClient = prismaClient;