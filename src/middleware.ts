import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const authToken = request.cookies.get('authToken')?.value; // Assuming you switch to httpOnly cookies

    const protectedPaths = ['/dashboard', '/profile']; // Add your protected paths
    const { pathname } = request.nextUrl;

    // If trying to access a protected path without a token
    if (protectedPaths.some(path => pathname.startsWith(path)) && !authToken) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // If trying to access login/register while already authenticated
    if ((pathname.startsWith('/login') || pathname.startsWith('/register')) && authToken) {
         return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
        * Match all request paths except for the ones starting with:
        * - api (API routes)
        * - _next/static (static files)
        * - _next/image (image optimization files)
        * - favicon.ico (favicon file)
        */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};