// scripts/test-db.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("Attempting to connect to database...");
    const userCount = await prisma.user.count();
    console.log(`Connection Successful! User count: ${userCount}`);
}

main()
    .catch((e) => {
        console.error("Connection Failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
