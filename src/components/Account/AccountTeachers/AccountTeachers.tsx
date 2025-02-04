"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import GenericTable from "@/components/GenericTable";
import { Teacher } from "@/lib/types";
import { useRouter } from "next/navigation";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  User,
} from "@nextui-org/react";
import { VerticalDotsIcon } from "@/icons";
import { fetchTeachersRequest } from "@/app/api/v1/teachers/request";
import logger from "@/lib/logger";
import { toast } from "react-toastify";

const AccountTeachers: React.FC = () => {
  const router = useRouter();
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  useEffect(() => {
    const fetchTeachersData = async () => {
      try {
        const teachersData = await fetchTeachersRequest();
        setTeachers(teachersData);
      } catch (err: unknown) {
        toast.error("Error fetching teachers");
        logger.error(err, "Error fetching teachers");
      }
    };
    fetchTeachersData();
  }, []);

  const INITIAL_VISIBLE_COLUMNS = useMemo(
    () => ["name", "email", "language", "actions"],
    []
  );

  const columns = useMemo(
    () => [
      {
        name: "Name",
        uid: "name",
        sortable: true,
        render: (user: Teacher) => (
          <User
            avatarProps={{ radius: "full", src: user.avatar }}
            classNames={{
              description: "text-default-500",
            }}
            name={user.name}
          />
        ),
      },
      {
        name: "Email",
        uid: "email",
        sortable: true,
        render: (user: Teacher) => user.email,
      },
      {
        name: "Language",
        uid: "language",
        sortable: true,
        render: (user: Teacher) =>
          user.languages?.map((l) => l.name).join(", "),
      },
      {
        name: "Actions",
        uid: "actions",
        render: (user: Teacher) => (
          <div className="relative flex justify-end items-center gap-2">
            <Dropdown className="bg-background border-1 border-default-200">
              <DropdownTrigger>
                <Button isIconOnly radius="full" size="sm" variant="light">
                  <VerticalDotsIcon className="text-default-400" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu>
                <DropdownItem
                  onClick={() => {
                    router.push(`/account/teachers/edit/${user.email}`);
                  }}
                >
                  Edit
                </DropdownItem>
                <DropdownItem>Delete</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        ),
      },
    ],
    [router]
  );

  const handleNew = useCallback(() => {
    router.push("/account/teachers/add");
  }, [router]);

  return (
    <GenericTable
      columns={columns}
      list={teachers}
      initialVisibleColumns={INITIAL_VISIBLE_COLUMNS}
      onNew={handleNew}
    />
  );
};

export default AccountTeachers;
