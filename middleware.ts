import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;

  const protectedPaths = [
    "/dashboard",
    "/support",
    "/kyc",
    "/deposit",
    "/admin",
    "/withdraw",
    "/p2p",
  ];

  if (
    protectedPaths.some((path) => request.nextUrl.pathname.startsWith(path))
  ) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

  
  }

  // Proceed to the requested page if authenticated
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/support/:path*",
    "/admin/dashboard/:path*",
    "/kyc/:path*",
    "/deposit/:path*",
    "/admin/:path*",
    "/withdraw/:path*",
    "/p2p/:path*",
  ],
};
