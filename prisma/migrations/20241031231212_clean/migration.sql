/*
  Warnings:

  - You are about to drop the `available_hours` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `booked_lessons` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `credits` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `lesson_notes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `notifications` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "available_hours" DROP CONSTRAINT "available_hours_teacher_id_fkey";

-- DropForeignKey
ALTER TABLE "booked_lessons" DROP CONSTRAINT "booked_lessons_credit_id_fkey";

-- DropForeignKey
ALTER TABLE "booked_lessons" DROP CONSTRAINT "booked_lessons_student_id_fkey";

-- DropForeignKey
ALTER TABLE "booked_lessons" DROP CONSTRAINT "booked_lessons_teacher_id_fkey";

-- DropForeignKey
ALTER TABLE "credits" DROP CONSTRAINT "credits_studentUserId_fkey";

-- DropForeignKey
ALTER TABLE "credits" DROP CONSTRAINT "credits_user_id_fkey";

-- DropForeignKey
ALTER TABLE "lesson_notes" DROP CONSTRAINT "lesson_notes_lesson_id_fkey";

-- DropForeignKey
ALTER TABLE "lesson_notes" DROP CONSTRAINT "lesson_notes_user_id_fkey";

-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_user_id_fkey";

-- DropTable
DROP TABLE "available_hours";

-- DropTable
DROP TABLE "booked_lessons";

-- DropTable
DROP TABLE "credits";

-- DropTable
DROP TABLE "lesson_notes";

-- DropTable
DROP TABLE "notifications";
