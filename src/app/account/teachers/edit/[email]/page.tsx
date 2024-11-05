"use server";

import React from "react";
import AccountLayout from "@/components/Account/layout";
import AccountTeachersForm from "@/components/Account/AccountTeachers/AccountTeachersForm";
import logger from "@/lib/logger";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";

interface AccountTeachersEditPageProps {
  params: {
    email: string;
  };
}

const AccountTeachersEditPage = async ({
  params,
}: AccountTeachersEditPageProps) => {
  const email = decodeURIComponent(params.email);

  try {
    const teacher = await prisma.user.findUnique({
      where: { email },
      include: {
        teacher: {
          include: {
            availableHours: true,
          },
        },
      },
    });

    const timeSlots = teacher?.teacher?.availableHours.map((hour) => ({
      start: hour.startTime,
      end: hour.endTime,
      rrule: hour.recurrenceRule || undefined,
      timezone: hour.timezone,
    }));

    logger.debug({ teacher, timeSlots }, "Teacher and time slots");

    if (!teacher || !teacher.name || !teacher.email || !timeSlots) {
      return notFound();
    }

    return (
      <AccountLayout>
        <div className="flex w-full">
          <div className="w-full">
            <h1>Edit Teacher</h1>
            <AccountTeachersForm
              name={teacher.name}
              email={teacher.email}
              timeSlots={timeSlots}
            />
          </div>
        </div>
      </AccountLayout>
    );
  } catch (err) {
    logger.error(err, "Error fetching teacher by email");
    throw err;
  }
};

export default AccountTeachersEditPage;
