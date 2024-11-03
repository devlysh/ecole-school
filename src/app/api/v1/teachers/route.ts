import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import logger from "@/lib/logger";
import { verifyAccessToken } from "@/lib/jwt";
import { AccessTokenPayload, Role } from "@/lib/types";

export const GET = async () => {
  try {
    const decodedToken = await verifyAndDecodeToken();
    if (!isAdmin(decodedToken)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const teachers = await fetchTeachers();
    return NextResponse.json(teachers);
  } catch (error) {
    logger.error({ error }, "Error processing GET request");
    return NextResponse.json(
      { error: "Failed to fetch teachers" },
      { status: 500 }
    );
  }
};

export const POST = async (request: Request) => {
  try {
    const decodedToken = await verifyAndDecodeToken();
    if (!isAdmin(decodedToken)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const user = await upsertUser(body);
    await ensureTeacherRole(user.id);

    const updatedUser = await fetchUpdatedUser(user.id);
    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    logger.error({ error }, "Error processing POST request");
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
};

const verifyAndDecodeToken = async (): Promise<AccessTokenPayload> => {
  try {
    return (await verifyAccessToken()) as AccessTokenPayload;
  } catch (err) {
    logger.error(err, "Error verifying access token");
    throw new Error("Unauthorized");
  }
};

const isAdmin = (decodedToken: AccessTokenPayload): boolean => {
  return decodedToken.roles.includes(Role.ADMIN);
};

const fetchTeachers = async () => {
  return await prisma.user.findMany({
    where: {
      roles: {
        some: {
          role: {
            name: Role.TEACHER,
          },
        },
      },
      teacher: {
        isNot: null,
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
      teacher: {
        select: {
          settings: true,
          languages: {
            select: {
              language: {
                select: {
                  name: true,
                  code: true,
                },
              },
            },
          },
        },
      },
      roles: {
        select: {
          role: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });
};

interface UserBody {
  name: string;
  email: string;
  password: string;
  subject: string;
  languages: string[];
}

const upsertUser = async (body: UserBody) => {
  const { name, email, password, subject, languages } = body;
  return await prisma.user.upsert({
    where: { email },
    update: {
      name,
      passwordHash: password,
      teacher: {
        upsert: {
          create: createTeacherData(subject, languages),
          update: updateTeacherData(subject, languages),
        },
      },
    },
    create: {
      name,
      email,
      passwordHash: password,
      teacher: {
        create: createTeacherData(subject, languages),
      },
    },
    include: {
      teacher: {
        include: {
          languages: {
            include: {
              language: true,
            },
          },
        },
      },
      roles: {
        include: {
          role: true,
        },
      },
    },
  });
};

const createTeacherData = (subject: string, languages: string[]) => {
  return {
    settings: { subject },
    languages: {
      create: languages.map((code) => ({
        language: {
          connectOrCreate: {
            where: { code },
            create: { code, name: code.toUpperCase() },
          },
        },
      })),
    },
  };
};

const updateTeacherData = (subject: string, languages: string[]) => {
  return {
    settings: { subject },
    languages: {
      deleteMany: {},
      create: languages.map((code) => ({
        language: {
          connectOrCreate: {
            where: { code },
            create: { code, name: code.toUpperCase() },
          },
        },
      })),
    },
  };
};

const ensureTeacherRole = async (userId: number) => {
  const teacherRole = await prisma.role.findUnique({
    where: { name: Role.TEACHER },
  });
  if (!teacherRole) {
    throw new Error("Teacher role not found");
  }

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId,
        roleId: teacherRole.id,
      },
    },
    create: {
      userId,
      roleId: teacherRole.id,
    },
    update: {},
  });
};

const fetchUpdatedUser = async (userId: number) => {
  return await prisma.user.findUnique({
    where: { id: userId },
    include: {
      teacher: {
        include: {
          languages: {
            include: {
              language: true,
            },
          },
        },
      },
      roles: {
        include: {
          role: true,
        },
      },
    },
  });
};
