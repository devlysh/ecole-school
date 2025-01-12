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

export default async function AccountTeachersEditPage({
  params,
}: AccountTeachersEditPageProps) {
  const email = decodeURIComponent(params.email);

  try {
    // 1) Find the user (teacher) by email
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        teacher: {
          include: {
            // 2) Also fetch availableSlots for schedule
            availableSlots: true,
            // 3) Fetch vacations for this teacher from DB
            vacations: true,
          },
        },
      },
    });

    if (!user || !user.teacher) {
      return notFound();
    }

    // 4) Convert each available slot to an EventInput
    const timeSlots = user.teacher.availableSlots.map((hour) => ({
      start: hour.startTime,
      end: hour.endTime,
      rrule: hour.rrule || undefined,
      extendedProps: {
        rrule: hour.rrule || undefined,
        dtStart: convertToRruleDate(hour.startTime) || undefined,
        dtEnd: convertToRruleDate(hour.endTime) || undefined,
      },
    }));

    // 5) Convert each vacation into an EventInput for FullCalendar
    const vacations = user.teacher.vacations.map((vac) => ({
      id: vac.id.toString(),
      title: "Vacation",
      start: vac.date,
      end: vac.date,
      allDay: true,
      color: "tomato",
      vacation: true,
    }));

    return (
      <AccountLayout>
        <div className="flex w-full">
          <div className="w-full">
            <h1>Edit Teacher</h1>
            <AccountTeachersForm
              name={user.name ?? ""}
              email={user.email ?? ""}
              timeSlots={timeSlots}
              vacations={vacations}
            />
          </div>
        </div>
      </AccountLayout>
    );
  } catch (err) {
    logger.error(err, "Error fetching teacher by email");
    throw err;
  }
}
