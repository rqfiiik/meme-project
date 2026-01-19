
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany();
    console.log("All Users:", JSON.stringify(users, null, 2));

    // Check for specific admin ID
    const admin = await prisma.user.findUnique({ where: { id: "admin-user-id" } });
    console.log("Admin User by ID 'admin-user-id':", admin);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
