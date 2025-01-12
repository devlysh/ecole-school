-- CreateTable
CREATE TABLE "vacations" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "teacher_id" INTEGER NOT NULL,

    CONSTRAINT "vacations_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "vacations" ADD CONSTRAINT "vacations_teacher_id_fkey" FOREIGN KEY ("teacher_id") REFERENCES "teachers"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
