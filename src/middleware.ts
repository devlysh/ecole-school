import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./lib/jwt";
import { Role, TokenType } from "./lib/types";
import logger from "./lib/logger";
import { hasRole } from "./lib/utils";

const guestPaths = [
  "/quiz",
  "/pricing",
  "/checkout",
  "/login",
  "/set-password",
];

const studentPaths = [
  "/account",
  "/account/book-classes",
  "/account/my-classes",
];

const teacherPaths = ["/account", "/account/teacher"];

export const middleware = async (req: NextRequest) => {
  const accessToken = req.cookies.get(TokenType.ACCESS)?.value;
  const pathname = req.nextUrl.pathname;

  const isGuestPath = guestPaths.some((path) =>
    req.nextUrl.pathname.startsWith(path)
  );

  if (!accessToken && isGuestPath) {
    return NextResponse.next();
  }

  if (!accessToken) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  try {
    const decoded = await verifyToken(accessToken);
    const { roles } = decoded as { email: string; roles: string[] };

    const isAdmin = hasRole(roles, Role.ADMIN);
    const isStudent = hasRole(roles, Role.STUDENT);
    const isTeacher = hasRole(roles, Role.TEACHER);

    if (isAdmin) {
      return NextResponse.next();
    }

    if (isStudent) {
      const isStudentPath = studentPaths.some((path) =>
        pathname.startsWith(path)
      );
      if (isStudentPath) {
        return NextResponse.next();
      } else {
        return NextResponse.redirect(new URL("/account", req.url));
      }
    }

    if (isTeacher) {
      const isTeacherPath = teacherPaths.some((path) =>
        pathname.startsWith(path)
      );
      if (isTeacherPath) {
        return NextResponse.next();
      } else {
        return NextResponse.redirect(new URL("/account", req.url));
      }
    }

    return NextResponse.redirect(new URL("/", req.url));
  } catch (error) {
    logger.error({ error }, "Error in middleware");
    return NextResponse.redirect(new URL("/", req.url));
  }
};

export const config = {
  matcher: [
    "/account/:path*",
    "/admin",
    "/login",
    "/quiz",
    "/pricing",
    "/checkout",
    "/set-password",
  ],
};
