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