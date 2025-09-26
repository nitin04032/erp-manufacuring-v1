import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  // Protect dashboard routes
  if (request.nextUrl.pathname.startsWith("/dashboard") && !token) {
    return NextResponse.redirect(new URL("/", request.url)); // redirect to login ("/" है आपका login page)
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
