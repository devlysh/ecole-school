import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./lib/jwt";
import { Role, TokenType } from "./lib/types";
import logger from "./lib/logger";

const rolePaths: Record<Role, string[]> = {
  [Role.ADMIN]: ["/account", "/account/teachers", "/admin"],
  [Role.STUDENT]: ["/account", "/account/book-classes", "/account/my-classes"],
  [Role.TEACHER]: ["/account", "/account/teacher"],
};

const guestPaths = [
  "/quiz",
  "/pricing",
  "/checkout",
  "/login",
  "/set-password",
];

export const middleware = async (req: NextRequest) => {
  const accessToken = req.cookies.get(TokenType.ACCESS)?.value;
  const pathname = req.nextUrl.pathname;

  if (!accessToken) {
    const isGuestPath = guestPaths.some((path) => pathname.startsWith(path));
    if (isGuestPath) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/", req.url));
  }

  try {
    const decoded = await verifyToken(accessToken);
    const { roles } = decoded as { email: string; roles: Role[] };

    const hasAccess = roles.some((role) => {
      const allowedPaths = rolePaths[role] || [];
      return allowedPaths.some((path) => pathname === path);
    });

    if (hasAccess) {
      return NextResponse.next();
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
