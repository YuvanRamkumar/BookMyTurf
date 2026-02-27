-- AlterTable
ALTER TABLE "Turf" ADD COLUMN     "peak_end_time" TEXT NOT NULL DEFAULT '21:00',
ADD COLUMN     "peak_start_time" TEXT NOT NULL DEFAULT '18:00';
