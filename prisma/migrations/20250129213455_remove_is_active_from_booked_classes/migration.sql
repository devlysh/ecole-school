/*
  Warnings:

  - You are about to drop the column `is_active` on the `booked_classes` table. All the data in the column will be lost.
  - You are about to drop the `system_settings` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "booked_classes" DROP COLUMN "is_active";

-- DropTable
DROP TABLE "system_settings";
