/*
  Warnings:

  - You are about to drop the `available_hours` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "available_hours" DROP CONSTRAINT "available_hours_teacher_id_fkey";

-- DropTable
DROP TABLE "available_hours";

-- CreateTable
CREATE TABLE "available_slots" (
    "id" SERIAL NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "rrule" TEXT,
    "timezone" TEXT NOT NULL,
    "teacher_id" INTEGER NOT NULL,

    CONSTRAINT "available_slots_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "available_slots" ADD CONSTRAINT "available_slots_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teachers"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
