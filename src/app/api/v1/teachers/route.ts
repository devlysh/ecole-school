import prisma from "@/lib/prisma";
import logger from "@/lib/logger";
import { verifyAccessToken } from "@/lib/jwt";
import { AccessTokenPayload, Role } from "@/lib/types";

export const GET = async () => {
  try {
    const decodedToken = await verifyAndDecodeToken();
    if (!isAdmin(decodedToken)) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const teachers = await fetchTeachers();
    return Response.json(teachers);
  } catch (err) {
    logger.error({ err }, "Error fetching teachers");
    return Response.json(
      { error: "Failed to fetch teachers" },
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
      settings: true,
      teacher: {
        select: {
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
