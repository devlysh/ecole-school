"use client";

import { useCallback, useMemo } from "react";
import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  User,
} from "@nextui-org/react";
import { VerticalDotsIcon } from "@/icons";
import UsersList from "@/components/UsersList";
import { Teacher } from "@/lib/types";
import { useRouter } from "next/navigation";

interface AccountTeachersProps {
  teachers: Teacher[];
}

const AccountTeachers: React.FC<AccountTeachersProps> = ({ teachers }) => {
  const router = useRouter();

  const INITIAL_VISIBLE_COLUMNS = useMemo(
    () => [
      "name",
      "email",
      "language",
      "role",
      "classHistory",
      "comments",
      "actions",
    ],
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
            description={user.roles.map((r) => r.name).join(", ")}
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
        name: "Class History",
        uid: "classHistory",
        sortable: true,
        render: () => <a>View</a>,
      },
      {
        name: "Comments",
        uid: "comments",
        sortable: true,
        render: () => <a>View</a>,
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
    []
  );

  const handleNew = useCallback(() => {
    router.push("/account/teachers/add");
    return teachers;
  }, [router, teachers]);

  return (
    <UsersList
      columns={columns}
      list={teachers}
      initialVisibleColumns={INITIAL_VISIBLE_COLUMNS}
      onNew={handleNew}
    />
  );
};

export default AccountTeachers;
