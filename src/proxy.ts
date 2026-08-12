import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = getSessionCookie(request);
  const isAuthPage = pathname === "/sign-in" || pathname === "/sign-up";

  if (!sessionCookie && !isAuthPage) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  if (sessionCookie && isAuthPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
