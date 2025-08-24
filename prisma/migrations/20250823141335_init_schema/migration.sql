/*
  Warnings:

  - You are about to drop the column `avatarUrl` on the `Oap` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `Station` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `Station` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[stationId,dayOfWeek,startMin]` on the table `ScheduleSlot` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[title]` on the table `Show` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[stationId,title]` on the table `Show` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "OapOnShow" ADD COLUMN "role" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Oap" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "role" TEXT,
    "imageUrl" TEXT,
    "twitter" TEXT,
    "instagram" TEXT,
    "bio" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Oap" ("bio", "createdAt", "id", "name", "role", "updatedAt") SELECT "bio", "createdAt", "id", "name", "role", "updatedAt" FROM "Oap";
DROP TABLE "Oap";
ALTER TABLE "new_Oap" RENAME TO "Oap";
CREATE UNIQUE INDEX "Oap_name_key" ON "Oap"("name");
CREATE TABLE "new_Station" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "streamUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Station" ("createdAt", "id", "name", "streamUrl", "updatedAt") SELECT "createdAt", "id", "name", "streamUrl", "updatedAt" FROM "Station";
DROP TABLE "Station";
ALTER TABLE "new_Station" RENAME TO "Station";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "ScheduleSlot_stationId_dayOfWeek_startMin_key" ON "ScheduleSlot"("stationId", "dayOfWeek", "startMin");

-- CreateIndex
CREATE UNIQUE INDEX "Show_title_key" ON "Show"("title");

-- CreateIndex
CREATE UNIQUE INDEX "Show_stationId_title_key" ON "Show"("stationId", "title");
