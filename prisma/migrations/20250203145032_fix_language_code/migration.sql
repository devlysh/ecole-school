/*
  Warnings:

  - Made the column `code` on table `languages` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "languages" ALTER COLUMN "code" SET NOT NULL;
