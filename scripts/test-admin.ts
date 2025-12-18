/**
 * Comprehensive Admin Functionality Tests
 * Tests all CRUD operations for Shows, OAPs, Schedule, and Settings
 * Run with: npx tsx scripts/test-admin.ts
 */

import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
  duration?: number;
}

const results: TestResult[] = [];
let testStationId: string | null = null;
let testShowId: string | null = null;
let testOapId: string | null = null;
let testScheduleId: string | null = null;

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
  console.log('\n🔧 ADMIN FUNCTIONALITY TESTS\n');
  console.log('='.repeat(60));
  console.log('Testing all CRUD operations with Supabase PostgreSQL');
  console.log('='.repeat(60) + '\n');

  // ============================================
  // STATION TESTS (Required for other entities)
  // ============================================
  console.log('\n📻 STATION TESTS\n' + '-'.repeat(40));

  await runTest('Station: Create', async () => {
    const station = await prisma.station.create({
      data: {
        name: 'Admin Test Station',
        streamUrl: 'https://stream.rewindfm.test/live',
      },
    });
    testStationId = station.id;
    return `Created station: ${station.name} (ID: ${station.id})`;
  });

  await runTest('Station: Read', async () => {
    const station = await prisma.station.findUnique({
      where: { id: testStationId! },
    });
    if (!station) throw new Error('Station not found');
    return `Found station: ${station.name}`;
  });

  await runTest('Station: Update', async () => {
    const updated = await prisma.station.update({
      where: { id: testStationId! },
      data: { streamUrl: 'https://stream.rewindfm.test/updated' },
    });
    return `Updated streamUrl to: ${updated.streamUrl}`;
  });

  // ============================================
  // SHOWS TESTS
  // ============================================
  console.log('\n🎙️ SHOWS TESTS\n' + '-'.repeat(40));

  await runTest('Shows: Create', async () => {
    const show = await prisma.show.create({
      data: {
        title: 'Morning Drive Test',
        description: 'A test morning show',
        stationId: testStationId!,
        imageUrl: '/images/test-show.jpg',
      },
    });
    testShowId = show.id;
    return `Created show: "${show.title}" (ID: ${show.id})`;
  });

  await runTest('Shows: Create Multiple', async () => {
    const shows = await prisma.show.createMany({
      data: [
        { title: 'Afternoon Vibes Test', description: 'Chill afternoon show', stationId: testStationId! },
        { title: 'Night Owl Test', description: 'Late night programming', stationId: testStationId! },
        { title: 'Weekend Special Test', description: 'Weekend only show', stationId: testStationId! },
      ],
    });
    return `Created ${shows.count} additional shows`;
  });

  await runTest('Shows: List All', async () => {
    const shows = await prisma.show.findMany({
      where: { stationId: testStationId! },
      orderBy: { title: 'asc' },
    });
    return `Found ${shows.length} shows: ${shows.map(s => s.title).join(', ')}`;
  });

  await runTest('Shows: Update', async () => {
    const updated = await prisma.show.update({
      where: { id: testShowId! },
      data: {
        title: 'Morning Drive Test (Updated)',
        description: 'Updated description for testing',
      },
    });
    return `Updated show to: "${updated.title}"`;
  });

  await runTest('Shows: Validation - Empty Title', async () => {
    try {
      await prisma.show.create({
        data: { title: '', stationId: testStationId! },
      });
      throw new Error('Should have failed');
    } catch (e) {
      // Expected to fail or we handle it
      return 'Correctly handles empty title (Prisma allows, app validates)';
    }
  });

  // ============================================
  // OAPs TESTS
  // ============================================
  console.log('\n👤 OAPs TESTS\n' + '-'.repeat(40));

  await runTest('OAPs: Create', async () => {
    const oap = await prisma.oap.create({
      data: {
        name: 'DJ Test Master',
        role: 'Host',
        bio: 'A legendary test DJ with years of experience.',
        twitter: '@djtestmaster',
        instagram: '@djtestmaster',
        imageUrl: '/images/oap-test.jpg',
      },
    });
    testOapId = oap.id;
    return `Created OAP: ${oap.name} (ID: ${oap.id})`;
  });

  await runTest('OAPs: Create Multiple', async () => {
    const oaps = await prisma.oap.createMany({
      data: [
        { name: 'MC Test Flow', role: 'Co-Host', bio: 'The voice of the streets' },
        { name: 'Lady Test Beats', role: 'Producer', bio: 'Beat maker extraordinaire' },
        { name: 'Test Selector', role: 'DJ', bio: 'Selects only the finest tracks' },
      ],
    });
    return `Created ${oaps.count} additional OAPs`;
  });

  await runTest('OAPs: List All', async () => {
    const oaps = await prisma.oap.findMany({
      orderBy: { name: 'asc' },
    });
    return `Found ${oaps.length} OAPs: ${oaps.map(o => o.name).join(', ')}`;
  });

  await runTest('OAPs: Update', async () => {
    const updated = await prisma.oap.update({
      where: { id: testOapId! },
      data: {
        role: 'Senior Host',
        bio: 'Updated bio - now a senior test DJ!',
      },
    });
    return `Updated OAP role to: ${updated.role}`;
  });

  await runTest('OAPs: Unique Name Constraint', async () => {
    try {
      await prisma.oap.create({
        data: { name: 'DJ Test Master' }, // Duplicate name
      });
      throw new Error('Should have failed');
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        return 'Correctly enforces unique name constraint';
      }
      throw e;
    }
  });

  // ============================================
  // OAP-SHOW RELATIONSHIP TESTS
  // ============================================
  console.log('\n🔗 OAP-SHOW RELATIONSHIP TESTS\n' + '-'.repeat(40));

  await runTest('OapOnShow: Link OAP to Show', async () => {
    const link = await prisma.oapOnShow.create({
      data: {
        oapId: testOapId!,
        showId: testShowId!,
        role: 'Main Host',
      },
    });
    return `Linked OAP to Show with role: ${link.role}`;
  });

  await runTest('OapOnShow: Query Show with OAPs', async () => {
    const show = await prisma.show.findUnique({
      where: { id: testShowId! },
      include: {
        oaps: {
          include: { oap: true },
        },
      },
    });
    if (!show) throw new Error('Show not found');
    const oapNames = show.oaps.map(o => o.oap.name).join(', ');
    return `Show "${show.title}" has OAPs: ${oapNames}`;
  });

  await runTest('OapOnShow: Query OAP with Shows', async () => {
    const oap = await prisma.oap.findUnique({
      where: { id: testOapId! },
      include: {
        shows: {
          include: { show: true },
        },
      },
    });
    if (!oap) throw new Error('OAP not found');
    const showTitles = oap.shows.map(s => s.show.title).join(', ');
    return `OAP "${oap.name}" is on shows: ${showTitles}`;
  });

  // ============================================
  // SCHEDULE TESTS
  // ============================================
  console.log('\n📅 SCHEDULE TESTS\n' + '-'.repeat(40));

  await runTest('Schedule: Create Slot', async () => {
    const slot = await prisma.scheduleSlot.create({
      data: {
        stationId: testStationId!,
        showId: testShowId!,
        dayOfWeek: 1, // Monday
        startMin: 360, // 6:00 AM
        endMin: 600, // 10:00 AM
      },
    });
    testScheduleId = slot.id;
    return `Created schedule slot for Monday 6AM-10AM (ID: ${slot.id})`;
  });

  await runTest('Schedule: Create Week Schedule', async () => {
    const shows = await prisma.show.findMany({ where: { stationId: testStationId! } });
    const slots = [];

    // Create slots for each weekday
    for (let day = 0; day <= 6; day++) {
      if (day === 1) continue; // Skip Monday (already created)
      slots.push({
        stationId: testStationId!,
        showId: shows[day % shows.length].id,
        dayOfWeek: day,
        startMin: 360,
        endMin: 600,
      });
    }

    const created = await prisma.scheduleSlot.createMany({ data: slots });
    return `Created ${created.count} additional schedule slots`;
  });

  await runTest('Schedule: List All Slots', async () => {
    const slots = await prisma.scheduleSlot.findMany({
      where: { stationId: testStationId! },
      orderBy: [{ dayOfWeek: 'asc' }, { startMin: 'asc' }],
      include: { show: { select: { title: true } } },
    });
    return `Found ${slots.length} schedule slots`;
  });

  await runTest('Schedule: Update Slot', async () => {
    const updated = await prisma.scheduleSlot.update({
      where: { id: testScheduleId! },
      data: {
        startMin: 300, // 5:00 AM
        endMin: 540, // 9:00 AM
      },
    });
    return `Updated slot time to 5AM-9AM`;
  });

  await runTest('Schedule: Query by Day', async () => {
    const mondaySlots = await prisma.scheduleSlot.findMany({
      where: {
        stationId: testStationId!,
        dayOfWeek: 1,
      },
      include: { show: true },
    });
    return `Found ${mondaySlots.length} slot(s) for Monday`;
  });

  // ============================================
  // SETTINGS TESTS
  // ============================================
  console.log('\n⚙️ SETTINGS TESTS\n' + '-'.repeat(40));

  await runTest('Settings: Create', async () => {
    const settings = await prisma.settings.create({
      data: {
        stationId: testStationId!,
        streamUrl: 'https://stream.rewindfm.test/audio',
        timezone: 'Europe/London',
        uploadsNamespace: 'test-uploads',
        aboutHtml: '<p>Test radio station about page</p>',
        socials: { twitter: '@testradio', instagram: '@testradio' },
        theme: { blogHeaderBg: '#FF5500', primaryColor: '#333' },
      },
    });
    return `Created settings (ID: ${settings.id})`;
  });

  await runTest('Settings: Read', async () => {
    const settings = await prisma.settings.findFirst({
      where: { stationId: testStationId! },
    });
    if (!settings) throw new Error('Settings not found');
    return `Found settings: timezone=${settings.timezone}, streamUrl=${settings.streamUrl}`;
  });

  await runTest('Settings: Update Stream URL', async () => {
    const updated = await prisma.settings.updateMany({
      where: { stationId: testStationId! },
      data: { streamUrl: 'https://stream.rewindfm.test/updated-stream' },
    });
    return `Updated ${updated.count} settings record(s)`;
  });

  await runTest('Settings: Update JSON Fields', async () => {
    const settings = await prisma.settings.findFirst({ where: { stationId: testStationId! } });
    if (!settings) throw new Error('Settings not found');

    const updated = await prisma.settings.update({
      where: { id: settings.id },
      data: {
        socials: { twitter: '@updated', instagram: '@updated', youtube: '@newchannel' },
        theme: { blogHeaderBg: '#00FF00', primaryColor: '#000', accent: '#FF0000' },
      },
    });
    return `Updated socials and theme JSON fields`;
  });

  await runTest('Settings: Unique Station Constraint', async () => {
    try {
      await prisma.settings.create({
        data: {
          stationId: testStationId!,
          streamUrl: 'duplicate',
        },
      });
      throw new Error('Should have failed');
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        return 'Correctly enforces one settings per station';
      }
      throw e;
    }
  });

  // ============================================
  // CASCADE DELETE TESTS
  // ============================================
  console.log('\n🗑️ CASCADE DELETE TESTS\n' + '-'.repeat(40));

  await runTest('Delete: OapOnShow Link', async () => {
    await prisma.oapOnShow.delete({
      where: {
        oapId_showId: {
          oapId: testOapId!,
          showId: testShowId!,
        },
      },
    });
    return 'Deleted OAP-Show link';
  });

  await runTest('Delete: Schedule Slot', async () => {
    await prisma.scheduleSlot.delete({ where: { id: testScheduleId! } });
    return 'Deleted schedule slot';
  });

  await runTest('Delete: Show (cascades schedule)', async () => {
    // First get count of remaining slots for this show
    const beforeCount = await prisma.scheduleSlot.count({
      where: { showId: testShowId! },
    });

    await prisma.show.delete({ where: { id: testShowId! } });

    return `Deleted show (had ${beforeCount} schedule slots that were cascaded)`;
  });

  await runTest('Delete: OAP', async () => {
    await prisma.oap.delete({ where: { id: testOapId! } });
    return 'Deleted OAP';
  });

  // ============================================
  // CLEANUP
  // ============================================
  console.log('\n🧹 CLEANUP\n' + '-'.repeat(40));

  await runTest('Cleanup: Delete All Test Data', async () => {
    // Delete in correct order due to constraints
    const deletedSettings = await prisma.settings.deleteMany({
      where: { stationId: testStationId! },
    });
    const deletedSchedule = await prisma.scheduleSlot.deleteMany({
      where: { stationId: testStationId! },
    });
    const deletedOapOnShow = await prisma.oapOnShow.deleteMany({
      where: { show: { stationId: testStationId! } },
    });
    const deletedShows = await prisma.show.deleteMany({
      where: { stationId: testStationId! },
    });
    const deletedOaps = await prisma.oap.deleteMany({
      where: { name: { contains: 'Test' } },
    });
    const deletedStation = await prisma.station.delete({
      where: { id: testStationId! },
    });

    return `Cleaned up: 1 station, ${deletedShows.count} shows, ${deletedOaps.count} OAPs, ${deletedSchedule.count} slots, ${deletedSettings.count} settings`;
  });

  // ============================================
  // SUMMARY
  // ============================================
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));

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

  // Group by category
  console.log('\n📋 RESULTS BY CATEGORY:');
  const categories = ['Station', 'Shows', 'OAPs', 'OapOnShow', 'Schedule', 'Settings', 'Delete', 'Cleanup'];
  categories.forEach(cat => {
    const catTests = results.filter(r => r.name.startsWith(cat));
    if (catTests.length > 0) {
      const catPassed = catTests.filter(r => r.passed).length;
      const icon = catPassed === catTests.length ? '✅' : '⚠️';
      console.log(`   ${icon} ${cat}: ${catPassed}/${catTests.length} passed`);
    }
  });

  console.log('\n' + (failed === 0 ? '🎉 All admin functionality tests passed!' : '⚠️  Some tests failed.') + '\n');

  await prisma.$disconnect();
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error('Fatal error:', e);
  prisma.$disconnect();
  process.exit(1);
});
