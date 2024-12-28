"use server";

import React from "react";
import AccountLayout from "@/components/Account/layout";
import AccountTeachersForm from "@/components/Account/AccountTeachers/AccountTeachersForm";
import logger from "@/lib/logger";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { convertToRruleDate } from "@/lib/utils";

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
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        teacher: {
          include: {
            availableSlots: true,
          },
        },
      },
    });

    const timeSlots = user?.teacher?.availableSlots.map((hour) => ({
      start: hour.startTime,
      end: hour.endTime,
      rrule: hour.rrule || undefined,
      timezone: hour.timezone,
      extendedProps: {
        rrule: hour.rrule || undefined,
        dtStart: convertToRruleDate(hour.startTime) || undefined,
        dtEnd: convertToRruleDate(hour.endTime) || undefined,
      },
    }));

    if (!user || !user.name || !user.email || !timeSlots) {
      return notFound();
    }

    return (
      <AccountLayout>
        <div className="flex w-full">
          <div className="w-full">
            <h1>Edit Teacher</h1>
            <AccountTeachersForm
              name={user.name}
              email={user.email}
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
