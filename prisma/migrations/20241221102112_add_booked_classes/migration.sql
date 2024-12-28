-- CreateTable
CREATE TABLE "booked_classes" (
    "id" SERIAL NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "timezone" TEXT NOT NULL,
    "student_id" INTEGER NOT NULL,
    "teacher_id" INTEGER NOT NULL,

    CONSTRAINT "booked_classes_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "booked_classes" ADD CONSTRAINT "booked_classes_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booked_classes" ADD CONSTRAINT "booked_classes_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teachers"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
