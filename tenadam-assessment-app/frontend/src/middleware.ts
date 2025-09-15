import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Check for admin session token in cookies
    const sessionToken = request.cookies.get('tenadam_session_token')?.value;

    if (!sessionToken) {
      // Redirect to auth page if no session token found
      return NextResponse.redirect(new URL('/auth', request.url));
    }

    // In production, you would validate the token with the backend here
    // For now, we'll assume the token is valid if it exists
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
