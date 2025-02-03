-- CreateTable
CREATE TABLE "student_languages" (
    "student_id" INTEGER NOT NULL,
    "language_id" INTEGER NOT NULL,

    CONSTRAINT "student_languages_pkey" PRIMARY KEY ("student_id","language_id")
);

-- AddForeignKey
ALTER TABLE "student_languages" ADD CONSTRAINT "student_languages_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_languages" ADD CONSTRAINT "student_languages_language_id_fkey" FOREIGN KEY ("language_id") REFERENCES "languages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
