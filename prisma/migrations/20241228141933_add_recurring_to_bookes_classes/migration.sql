/*
  Warnings:

  - Added the required column `recurring` to the `booked_classes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "booked_classes" ADD COLUMN     "recurring" BOOLEAN NOT NULL;
