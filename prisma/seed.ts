import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function getOrCreateOap(name: string, role?: string) {
  // Works whether or not Oap.name is @unique
  const existing = await prisma.oap.findFirst({ where: { name } });
  if (existing) {
    if (role && existing.role !== role) {
      return prisma.oap.update({ where: { id: existing.id }, data: { role } });
    }
    return existing;
  }
  return prisma.oap.create({ data: { name, role } });
}

async function main() {
  console.log(" Seeding database...");

  // 1. Create or get Station
  let station = await prisma.station.findFirst();
  if (!station) {
    station = await prisma.station.create({
      data: {
        name: "Rewind FM",
        streamUrl: "https://example.com/stream.mp3",
        // Add other required Station fields here if needed
      },
    });
    console.log("  Created Station:", station.name);
  } else {
    console.log("  Station already exists:", station.name);
  }

  // 2. Create or get Settings
  let settings = await prisma.settings.findFirst();
  if (!settings) {
    settings = await prisma.settings.create({
      data: {
        station: { connect: { id: station.id } },
        streamUrl: station.streamUrl ?? "",
        timezone: "Europe/London",
        uploadsNamespace: "rewindfm",
        theme: { blogHeaderBg: "#FBB63B" },
        socials: {
          instagram: "https://instagram.com/rewindfm",
          twitter: "https://x.com/rewindfm",
          youtube: "https://youtube.com/@rewindfm",
        },
      },
    });
    console.log("  Created Settings");
  } else {
    console.log("  Settings already exist");
  }

  // 3. Create sample OAPs
  const oap1 = await getOrCreateOap("John Doe", "Morning Host");
  const oap2 = await getOrCreateOap("Jane Smith", "Afternoon Host");
  const oap3 = await getOrCreateOap("Mike Johnson", "Evening Host");
  console.log("  Created/Updated OAPs");

  // 4. Create sample Shows
  const existingShows = await prisma.show.findMany();
  if (existingShows.length === 0) {
    const show1 = await prisma.show.create({
      data: {
        title: "Morning Drive",
        description: "Start your day with the best throwback hits",
        station: { connect: { id: station.id } },
      },
    });

    const show2 = await prisma.show.create({
      data: {
        title: "Midday Mix",
        description: "The perfect soundtrack for your afternoon",
        station: { connect: { id: station.id } },
      },
    });

    const show3 = await prisma.show.create({
      data: {
        title: "Afternoon Drive",
        description: "Cruise through the evening with classic tunes",
        station: { connect: { id: station.id } },
      },
    });

    console.log("  Created sample Shows");

    // 5. Create schedule slots for the shows (Monday through Friday)
    for (let dayOfWeek = 1; dayOfWeek <= 5; dayOfWeek++) {
      await prisma.scheduleSlot.createMany({
        data: [
          {
            stationId: station.id,
            showId: show1.id,
            dayOfWeek,
            startMin: 6 * 60,  // 6:00 AM
            endMin: 10 * 60,   // 10:00 AM
          },
          {
            stationId: station.id,
            showId: show2.id,
            dayOfWeek,
            startMin: 10 * 60, // 10:00 AM
            endMin: 14 * 60,   // 2:00 PM
          },
          {
            stationId: station.id,
            showId: show3.id,
            dayOfWeek,
            startMin: 14 * 60, // 2:00 PM
            endMin: 18 * 60,   // 6:00 PM
          },
        ],
      });
    }
    console.log("Created schedule slots for weekdays");
  } else {
    console.log("Shows already exist");
  }

  console.log(" Seeding completed!");
}

main()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });