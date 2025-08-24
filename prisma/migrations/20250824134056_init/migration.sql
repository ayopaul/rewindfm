-- DropIndex
DROP INDEX "Show_title_key";

-- CreateIndex
CREATE INDEX "OapOnShow_showId_idx" ON "OapOnShow"("showId");

-- CreateIndex
CREATE INDEX "OapOnShow_oapId_idx" ON "OapOnShow"("oapId");

-- CreateIndex
CREATE INDEX "ScheduleSlot_stationId_dayOfWeek_idx" ON "ScheduleSlot"("stationId", "dayOfWeek");

-- CreateIndex
CREATE INDEX "ScheduleSlot_showId_idx" ON "ScheduleSlot"("showId");
