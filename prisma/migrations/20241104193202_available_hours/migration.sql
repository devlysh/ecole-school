-- CreateTable
CREATE TABLE "available_hours" (
    "id" SERIAL NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "recurrence_rule" TEXT,
    "timezone" TEXT NOT NULL,
    "teacher_id" INTEGER NOT NULL,

    CONSTRAINT "available_hours_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "available_hours" ADD CONSTRAINT "available_hours_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teachers"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
