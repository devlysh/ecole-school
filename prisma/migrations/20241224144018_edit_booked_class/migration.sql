/*
  Warnings:

  - You are about to drop the column `end_time` on the `booked_classes` table. All the data in the column will be lost.
  - You are about to drop the column `start_time` on the `booked_classes` table. All the data in the column will be lost.
  - Added the required column `date` to the `booked_classes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "booked_classes" DROP COLUMN "end_time",
DROP COLUMN "start_time",
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "idx_booked_class_date_teacher_id_student_id" ON "booked_classes"("date", "teacher_id", "student_id");
