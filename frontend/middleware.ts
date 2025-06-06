import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = ['/dashboard'];
const publicRoutes = ['/', '/login', '/signup', '/about'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  const isPublicRoute = publicRoutes.includes(pathname);
  const authToken = request.cookies.get('auth_token')?.value;


  if (isProtectedRoute && !authToken) {

    const loginUrl = new URL('/login', request.url);

    return NextResponse.redirect(loginUrl);
  }

  if (isProtectedRoute && authToken) {

    try {
      const apiBaseUrl = (process.env.API_BASE_URL || 'http://localhost:8000/api/v1').replace(/\/+$/, '');
      const authMeUrl = `${apiBaseUrl}/auth/me`;

      const response = await fetch(authMeUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      if (!response.ok) {
        const responseText = await response.text();
        console.error('[Middleware] Token validation failed:', response.status, responseText);
        throw new Error(`Token validation failed: ${response.status} ${responseText}`);
      }

    } catch (error) {
      console.error('[Middleware] Token validation error:', error);
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  

  if (authToken && (pathname === '/login' || pathname === '/signup')) {

    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};