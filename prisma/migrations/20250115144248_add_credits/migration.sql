-- CreateTable
CREATE TABLE "credits" (
    "id" SERIAL NOT NULL,
    "student_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "used_at" TIMESTAMP(3),
    "used_with_booked_class_id" INTEGER,

    CONSTRAINT "credits_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "credits" ADD CONSTRAINT "credits_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credits" ADD CONSTRAINT "credits_used_with_booked_class_id_fkey" FOREIGN KEY ("used_with_booked_class_id") REFERENCES "booked_classes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
