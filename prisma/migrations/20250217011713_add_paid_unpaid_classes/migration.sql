/*
  Warnings:

  - You are about to drop the column `used_with_booked_class_id` on the `credits` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "credits" DROP CONSTRAINT "credits_used_with_booked_class_id_fkey";

-- DropIndex
DROP INDEX "idx_booked_class_date_teacher_id_student_id";

-- AlterTable
ALTER TABLE "credits" DROP COLUMN "used_with_booked_class_id",
ADD COLUMN     "usedWithPaidClassId" INTEGER;

-- CreateTable
CREATE TABLE "paid_classes" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "student_id" INTEGER NOT NULL,
    "teacher_id" INTEGER NOT NULL,

    CONSTRAINT "paid_classes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unpaid_classes" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "student_id" INTEGER NOT NULL,
    "teacher_id" INTEGER NOT NULL,

    CONSTRAINT "unpaid_classes_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "paid_classes" ADD CONSTRAINT "paid_classes_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paid_classes" ADD CONSTRAINT "paid_classes_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teachers"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unpaid_classes" ADD CONSTRAINT "unpaid_classes_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "unpaid_classes" ADD CONSTRAINT "unpaid_classes_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teachers"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credits" ADD CONSTRAINT "credits_usedWithPaidClassId_fkey" FOREIGN KEY ("usedWithPaidClassId") REFERENCES "paid_classes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
