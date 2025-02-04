/*
  Warnings:

  - You are about to drop the column `stripe_subscription_id` on the `students` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "students_stripe_subscription_id_key";

-- AlterTable
ALTER TABLE "students" DROP COLUMN "stripe_subscription_id";
