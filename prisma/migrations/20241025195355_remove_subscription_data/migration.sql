/*
  Warnings:

  - You are about to drop the `subscription_plans` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "subscription_plans" DROP CONSTRAINT "subscription_plans_currency_id_fkey";

-- DropTable
DROP TABLE "subscription_plans";
