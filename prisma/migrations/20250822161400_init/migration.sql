/*
  Warnings:

  - You are about to drop the `OAP` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OAPOnShow` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "OAP";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "OAPOnShow";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Oap" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "role" TEXT,
    "avatarUrl" TEXT,
    "bio" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "OapOnShow" (
    "oapId" TEXT NOT NULL,
    "showId" TEXT NOT NULL,

    PRIMARY KEY ("oapId", "showId"),
    CONSTRAINT "OapOnShow_oapId_fkey" FOREIGN KEY ("oapId") REFERENCES "Oap" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "OapOnShow_showId_fkey" FOREIGN KEY ("showId") REFERENCES "Show" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
