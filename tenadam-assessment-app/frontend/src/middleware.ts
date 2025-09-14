import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // In a real app, you'd get the user ID from the session
    // For now, we'll just check if there's any admin user in the DB
    // This is NOT secure and only for development purposes
    const adminUser = await prisma.user.findFirst({
      where: { isAdmin: true },
    });

    if (!adminUser) {
      return new NextResponse('You are not authorized to view this page', { status: 403 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};
