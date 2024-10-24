/*
  Warnings:

  - You are about to drop the column `stripe_customer_id` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `stripe_subscription_id` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[stripe_customer_id]` on the table `students` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[stripe_subscription_id]` on the table `students` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `stripe_customer_id` to the `students` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "users_stripe_customer_id_key";

-- DropIndex
DROP INDEX "users_stripe_subscription_id_key";

-- AlterTable
ALTER TABLE "credits" ADD COLUMN     "studentUserId" INTEGER;

-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "studentUserId" INTEGER;

-- AlterTable
ALTER TABLE "students" ADD COLUMN     "stripe_customer_id" TEXT NOT NULL,
ADD COLUMN     "stripe_subscription_id" TEXT;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "stripe_customer_id",
DROP COLUMN "stripe_subscription_id";

-- CreateIndex
CREATE UNIQUE INDEX "students_stripe_customer_id_key" ON "students"("stripe_customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "students_stripe_subscription_id_key" ON "students"("stripe_subscription_id");

-- AddForeignKey
ALTER TABLE "credits" ADD CONSTRAINT "credits_studentUserId_fkey" FOREIGN KEY ("studentUserId") REFERENCES "students"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_studentUserId_fkey" FOREIGN KEY ("studentUserId") REFERENCES "students"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;
