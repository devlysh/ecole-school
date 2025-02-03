"use client";

import React, {
  useState,
  FC,
  useRef,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import { Button, Input, Select, SelectItem } from "@nextui-org/react";
import logger from "@/lib/logger";
import { EventInput } from "@fullcalendar/core";
import { useFormik } from "formik";
import ScheduleCalendar from "./ScheduleCalendar";
import { addTeacherRequest } from "@/app/api/v1/teachers/request";
import { useRouter } from "next/navigation";
import { checkEmailRequest } from "@/app/api/v1/email/[email]/request";
import { AddUpdateTeacherRequest, TeacherFormValues } from "@/lib/types";
import { updateTeacherRequest } from "@/app/api/v1/teachers/[email]/request";
import { fetchTeacherByEmailRequest } from "@/app/api/v1/teachers/[email]/request";
import {
  AvailableSlot,
  Language,
  Teacher,
  User,
  Vacation,
} from "@prisma/client";
import { convertToRruleDate } from "@/lib/utils";
import { toast } from "react-toastify";

interface AccountTeachersFormProps {
  languages: Language[];
  email?: string;
}

const AccountTeachersForm: FC<AccountTeachersFormProps> = ({
  email,
  languages,
}) => {
  const router = useRouter();
  const [timeSlots, setTimeSlots] = useState<EventInput[]>([]);
  const [vacations, setVacations] = useState<EventInput[]>([]);
  const [name, setName] = useState<string>("");
  const [teacherLanguages, setTeacherLanguages] = useState<Language[]>([]);
  const emailInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchTeacher = async () => {
      if (!email) return;

      try {
        const user: User & {
          teacher: Teacher & {
            availableSlots: AvailableSlot[];
            vacations: Vacation[];
            languages?: { language: Language }[];
          };
        } = await fetchTeacherByEmailRequest(email);

        if (!user || !user.name || !user.teacher) return;

        setName(user.name);
        setTeacherLanguages(
          user.teacher.languages?.map((l) => l.language) || []
        );

        setTimeSlots(
          shapeTimeSlots(
            user.teacher.availableSlots.map((slot: AvailableSlot) => ({
              start: slot.startTime,
              end: slot.endTime,
              rrule: slot.rrule || undefined,
              extendedProps: {
                rrule: slot.rrule || undefined,
                dtStart:
                  convertToRruleDate(new Date(slot.startTime)) || undefined,
                dtEnd: convertToRruleDate(new Date(slot.endTime)) || undefined,
              },
            }))
          )
        );

        setVacations(
          user.teacher.vacations.map((vac: Vacation) => ({
            id: vac.id.toString(),
            title: "Vacation",
            start: vac.date,
            end: vac.date,
            allDay: true,
            color: "tomato",
            vacation: true,
          }))
        );
      } catch (err: unknown) {
        toast.error("Error fetching teacher data");
        logger.error(err, "Error fetching teacher data");
      }
    };
    fetchTeacher();
  }, [email]);

  const handleSubmit = useCallback(
    async (values: TeacherFormValues) => {
      try {
        const { isTaken } = await checkEmailRequest(values.email);
        const teacher: AddUpdateTeacherRequest = {
          name: values.name,
          email: values.email,
          password: values.password,
          timezone: values.timezone,
          languages: values.languages,
          timeSlots,
          vacations: vacations.map((vacation) => ({
            start: new Date(vacation.start as string).toISOString(),
          })),
        };

        if (isTaken) {
          const result = await updateTeacherRequest(teacher);
          logger.info({ result, teacher }, "Teacher updated successfully");
        } else {
          const result = await addTeacherRequest(teacher);
          logger.info({ result, teacher }, "Teacher added successfully");
        }

        router.push("/account/teachers");
      } catch (err: unknown) {
        toast.error("Error adding/updating teacher");
        logger.error(err, "Error adding/updating teacher");
      }
    },
    [router, timeSlots, vacations]
  );

  const formik = useFormik<TeacherFormValues>({
    initialValues: {
      name: name ?? "",
      email: email ?? "",
      password: email ? "********" : "",
      timezone: "utc",
      languages: teacherLanguages,
    },
    enableReinitialize: true,
    onSubmit: handleSubmit,
  });

  const selectedLanguageKeys = useMemo(() => {
    return new Set(
      formik.values.languages.map((lang) => {
        return lang.code;
      })
    );
  }, [formik.values.languages]);

  const handleLanguagesChange = (selected: string[]) => {
    const selectedLanguages = languages.filter((lang) => {
      return selected.includes(lang.code);
    });
    formik.setFieldValue("languages", selectedLanguages);
  };

  return (
    <div className="w-full">
      <form onSubmit={formik.handleSubmit} className="flex flex-wrap w-full">
        <div className="w-1/2 p-2">
          <Input
            name="name"
            label="Name"
            className="w-full"
            onChange={formik.handleChange}
            value={formik.values.name}
            required
          />
        </div>
        <div className="w-1/2 p-2">
          <Input
            ref={emailInputRef}
            name="email"
            label="Email"
            className="w-full"
            onChange={formik.handleChange}
            value={formik.values.email}
            required
            isDisabled={!!email}
          />
        </div>
        <div className="w-1/2 p-2">
          <Input
            name="password"
            label="Password"
            type="password"
            className="w-full"
            onChange={formik.handleChange}
            value={formik.values.password}
            required={!email}
          />
        </div>
        <div className="w-1/2 p-2">
          <Select
            placeholder="Select Timezone"
            value={formik.values.timezone}
            onChange={formik.handleChange}
            label="Timezone"
            required
            isDisabled
            defaultSelectedKeys={[formik.values.timezone]}
          >
            <SelectItem key="utc">UTC</SelectItem>
          </Select>
        </div>
        <div className="w-1/2 p-2">
          <Select
            placeholder="Select Languages"
            selectedKeys={selectedLanguageKeys}
            onSelectionChange={(keys) => {
              const selected = Array.from(keys as Set<string>);
              handleLanguagesChange(selected);
            }}
            selectionMode="multiple"
            label="Languages"
            required
          >
            {languages.map((language) => (
              <SelectItem key={language.code} value={language.code}>
                {language.name}
              </SelectItem>
            ))}
          </Select>
        </div>
        <div className="w-full mt-4">
          <ScheduleCalendar
            email={email ?? ""}
            timeSlots={timeSlots}
            vacations={vacations}
            setTimeSlots={setTimeSlots}
            setVacations={setVacations}
          />
        </div>
        <div className="w-full p-2">
          <Button type="submit">Save</Button>
        </div>
      </form>
    </div>
  );
};

export default AccountTeachersForm;

const shapeTimeSlots = (timeSlots: EventInput[]): EventInput[] => {
  return timeSlots.map((slot, index) => {
    const start = new Date(slot.start as Date);
    const end = new Date(slot.end as Date);
    const duration = {
      hours: (end.getTime() - start.getTime()) / (1000 * 60 * 60),
    };

    return {
      ...slot,
      id: index.toString(),
      title: slot.rrule ? "Recurring Event" : "Single Event",
      color: "gray",
      start: start.toISOString(),
      end: end.toISOString(),
      duration,
    };
  });
};
