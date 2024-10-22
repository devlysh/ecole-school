import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./lib/jwt";
import { Role, TokenType } from "./lib/types";
import logger from "./lib/logger";

const guestPaths = ["/quiz", "/pricing", "/checkout"];

const studentPaths = [
  "/account",
  "/account/book-classes",
  "/account/my-classes",
];

const teacherPaths = ["/account", "/account/teacher"];

const adminPaths = ["/admin"];

const protectedPaths = [...studentPaths, ...teacherPaths, ...adminPaths];

export const middleware = async (req: NextRequest) => {
  const token = req.cookies.get(TokenType.ACCESS)?.value;

  const isGuestPath = guestPaths.some((path) =>
    req.nextUrl.pathname.startsWith(path)
  );

  const isProtectedPath = protectedPaths.some((path) =>
    req.nextUrl.pathname.startsWith(path)
  );

  if (!token && isGuestPath) {
    return NextResponse.next();
  }

  if (!token && isProtectedPath) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const decoded = await verifyToken(token);
    const { role } = decoded as { email: string; role: string };

    const isAdmin = role === Role.ADMIN;
    const isStudent = role === Role.STUDENT;
    const isTeacher = role === Role.TEACHER;

    if (isAdmin) {
      return NextResponse.next();
    }

    if (isStudent) {
      const isStudentPath = studentPaths.some((path) =>
        req.nextUrl.pathname.startsWith(path)
      );
      if (isStudentPath) {
        return NextResponse.next();
      } else {
        return NextResponse.redirect(new URL("/account", req.url));
      }
    }

    if (isTeacher) {
      const isTeacherPath = teacherPaths.some((path) =>
        req.nextUrl.pathname.startsWith(path)
      );
      if (isTeacherPath) {
        return NextResponse.next();
      } else {
        return NextResponse.redirect(new URL("/account", req.url));
      }
    }

    return NextResponse.redirect(new URL("/login", req.url));
  } catch (error) {
    logger.error({ error }, "Error in middleware");
    return NextResponse.redirect(new URL("/login", req.url));
  }
};

export const config = {
  matcher: [
    "/account/:path*",
    "/account/book-classes",
    "/account/my-classes",
    "/account/teacher",
    "/admin",
    "/quiz",
    "/pricing",
    "/checkout",
  ],
};
