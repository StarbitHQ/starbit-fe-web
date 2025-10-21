import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;

  const protectedPaths = ['/dashboard', '/support'];

  if (protectedPaths.some(path => request.nextUrl.pathname.startsWith(path))) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Optionally, verify the token (e.g., JWT verification)
    // Example: decode JWT and check validity
    // if (!isValidToken(token)) {
    //   return NextResponse.redirect(new URL('/login', request.url));
    // }
  }

  // Proceed to the requested page if authenticated
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/support/:path*',
    '/admin/dashboard/:path*'
],
};