import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./lib/jwt";
import { RoleName, TokenType } from "./lib/types";
import logger from "./lib/logger";

const rolePaths: Record<RoleName, RegExp[]> = {
  [RoleName.ADMIN]: [
    /^\/account$/,
    /^\/account\/teachers$/,
    /^\/account\/teachers\/.+$/,
    /^\/admin$/,
  ],
  [RoleName.STUDENT]: [
    /^\/account$/,
    /^\/account\/book-classes$/,
    /^\/account\/my-classes$/,
    /^\/account\/settings$/,
  ],
  [RoleName.TEACHER]: [
    /^\/account$/,
    /^\/account\/teacher$/,
    /^\/account\/my-classes$/,
  ],
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
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const decoded = await verifyToken(accessToken);
    const { roles } = decoded as { email: string; roles: RoleName[] };

    const hasAccess = roles.some((role) => {
      const allowedPaths = rolePaths[role] || [];
      return allowedPaths.some((regex) => regex.test(pathname));
    });

    if (hasAccess) {
      return NextResponse.next();
    }

    return NextResponse.redirect(new URL("/account", req.url));
  } catch (err: unknown) {
    logger.error(err, "Error in middleware");
    return NextResponse.redirect(new URL("/login", req.url));
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
