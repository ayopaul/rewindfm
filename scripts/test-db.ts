/**
 * Comprehensive Supabase Database Connection Test
 * Run with: npx tsx scripts/test-db.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
  duration?: number;
}

const results: TestResult[] = [];

async function runTest(name: string, testFn: () => Promise<string>): Promise<void> {
  const start = Date.now();
  try {
    const message = await testFn();
    results.push({ name, passed: true, message, duration: Date.now() - start });
    console.log(`✅ ${name}: ${message} (${Date.now() - start}ms)`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    results.push({ name, passed: false, message, duration: Date.now() - start });
    console.log(`❌ ${name}: ${message}`);
  }
}

async function main() {
  console.log('\n🔍 SUPABASE DATABASE CONNECTION TESTS\n');
  console.log('=' .repeat(50));
  console.log(`Database URL: ${process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@')}`);
  console.log('=' .repeat(50) + '\n');

  // Test 1: Basic Connection
  await runTest('Database Connection', async () => {
    await prisma.$connect();
    return 'Successfully connected to Supabase PostgreSQL';
  });

  // Test 2: Query Database Version
  await runTest('PostgreSQL Version', async () => {
    const result = await prisma.$queryRaw<[{ version: string }]>`SELECT version()`;
    return result[0].version.split(' ').slice(0, 2).join(' ');
  });

  // Test 3: Check Tables Exist
  await runTest('Schema Tables', async () => {
    const tables = await prisma.$queryRaw<{ tablename: string }[]>`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    `;
    const tableNames = tables.map(t => t.tablename);
    const expected = ['Station', 'Show', 'Oap', 'OapOnShow', 'ScheduleSlot', 'Settings'];
    const found = expected.filter(t => tableNames.includes(t));
    return `Found ${found.length}/${expected.length} tables: ${found.join(', ')}`;
  });

  // Test 4: Create a test station
  await runTest('Create Station', async () => {
    const station = await prisma.station.create({
      data: {
        name: 'Test Station ' + Date.now(),
        streamUrl: 'https://test.stream/audio',
      },
    });
    return `Created station with ID: ${station.id}`;
  });

  // Test 5: Read stations
  await runTest('Read Stations', async () => {
    const stations = await prisma.station.findMany();
    return `Found ${stations.length} station(s)`;
  });

  // Test 6: Create a test OAP
  await runTest('Create OAP', async () => {
    const oap = await prisma.oap.create({
      data: {
        name: 'Test OAP ' + Date.now(),
        role: 'Test Host',
        bio: 'Test biography',
      },
    });
    return `Created OAP with ID: ${oap.id}`;
  });

  // Test 7: Create a show with relation
  await runTest('Create Show with Relations', async () => {
    const station = await prisma.station.findFirst();
    if (!station) throw new Error('No station found');

    const show = await prisma.show.create({
      data: {
        title: 'Test Show ' + Date.now(),
        description: 'A test show',
        stationId: station.id,
      },
    });
    return `Created show "${show.title}" linked to station`;
  });

  // Test 8: Query with relations
  await runTest('Query with Relations', async () => {
    const shows = await prisma.show.findMany({
      include: {
        station: true,
        oaps: { include: { oap: true } },
      },
    });
    return `Queried ${shows.length} shows with relations`;
  });

  // Test 9: Cleanup test data
  await runTest('Cleanup Test Data', async () => {
    const deletedShows = await prisma.show.deleteMany({
      where: { title: { startsWith: 'Test Show' } },
    });
    const deletedOaps = await prisma.oap.deleteMany({
      where: { name: { startsWith: 'Test OAP' } },
    });
    const deletedStations = await prisma.station.deleteMany({
      where: { name: { startsWith: 'Test Station' } },
    });
    return `Deleted ${deletedShows.count} shows, ${deletedOaps.count} OAPs, ${deletedStations.count} stations`;
  });

  // Test 10: Transaction test
  await runTest('Transaction Support', async () => {
    const result = await prisma.$transaction(async (tx) => {
      const station = await tx.station.create({
        data: { name: 'Transaction Test ' + Date.now() },
      });
      await tx.station.delete({ where: { id: station.id } });
      return 'Transaction completed';
    });
    return result;
  });

  // Summary
  console.log('\n' + '=' .repeat(50));
  console.log('📊 TEST SUMMARY');
  console.log('=' .repeat(50));

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const totalTime = results.reduce((sum, r) => sum + (r.duration || 0), 0);

  console.log(`\nTotal: ${results.length} tests`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⏱️  Total time: ${totalTime}ms`);

  if (failed > 0) {
    console.log('\n❌ FAILED TESTS:');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`   - ${r.name}: ${r.message}`);
    });
  }

  console.log('\n' + (failed === 0 ? '🎉 All tests passed!' : '⚠️  Some tests failed.') + '\n');

  await prisma.$disconnect();
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error('Fatal error:', e);
  prisma.$disconnect();
  process.exit(1);
});
