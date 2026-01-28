const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('Applying RLS optimizations...');

    try {
        // 1. AdminLog Policies
        console.log('Updating AdminLog policies...');
        await prisma.$executeRawUnsafe(`DROP POLICY IF EXISTS "Admins can insert logs" ON "AdminLog";`);
        await prisma.$executeRawUnsafe(`
      CREATE POLICY "Admins can insert logs"
      ON "AdminLog"
      FOR INSERT
      WITH CHECK ((select auth.uid())::text = "adminId");
    `);

        await prisma.$executeRawUnsafe(`DROP POLICY IF EXISTS "Admins can view logs" ON "AdminLog";`);
        await prisma.$executeRawUnsafe(`
      CREATE POLICY "Admins can view logs"
      ON "AdminLog"
      FOR SELECT
      USING ((select auth.uid())::text = "adminId");
    `);

        // 2. AffiliateEarning Policies
        console.log('Updating AffiliateEarning policies...');
        await prisma.$executeRawUnsafe(`DROP POLICY IF EXISTS "Creators can view own earnings" ON "AffiliateEarning";`);
        await prisma.$executeRawUnsafe(`
      CREATE POLICY "Creators can view own earnings"
      ON "AffiliateEarning"
      FOR SELECT
      USING ((select auth.uid())::text = "creatorId");
    `);

        console.log('Successfully optimized RLS policies.');
    } catch (e) {
        console.error('Error applying optimizations:', e);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
