/*
  Warnings:

  - You are about to drop the column `currency` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `currency` on the `subscription_plans` table. All the data in the column will be lost.
  - Added the required column `currency_id` to the `payments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currency_id` to the `subscription_plans` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "payments" DROP COLUMN "currency",
ADD COLUMN     "currency_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "subscription_plans" DROP COLUMN "currency",
ADD COLUMN     "currency_id" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "currencies" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "currencies_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "currencies_code_key" ON "currencies"("code");

-- CreateIndex
CREATE UNIQUE INDEX "currencies_name_key" ON "currencies"("name");

-- AddForeignKey
ALTER TABLE "subscription_plans" ADD CONSTRAINT "subscription_plans_currency_id_fkey" FOREIGN KEY ("currency_id") REFERENCES "currencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_currency_id_fkey" FOREIGN KEY ("currency_id") REFERENCES "currencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
