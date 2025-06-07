import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = ['/dashboard'];
const publicRoutes = ['/', '/login', '/signup', '/about'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  const isPublicRoute = publicRoutes.includes(pathname);
  const authToken = request.cookies.get('auth_token')?.value;

  console.log('[Middleware] Pathname:', pathname, 'Auth Token:', authToken ? 'Present' : 'Missing');

  if (isProtectedRoute && !authToken) {
    console.log('[Middleware] No token, redirecting to login');
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isProtectedRoute && authToken) {
    try {
      const apiBaseUrl = (process.env.API_BASE_URL || 'http://localhost:8000/api/v1').replace(/\/+$/, '');
      const authMeUrl = `${apiBaseUrl}/auth/me`;
      console.log('[Middleware] Validating token at:', authMeUrl);

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
        if (response.status === 401) {
          console.log('[Middleware] Invalid token, clearing cookie and redirecting to login');
          const redirectResponse = NextResponse.redirect(new URL('/login', request.url));
          redirectResponse.cookies.delete('auth_token');
          return redirectResponse;
        }
        throw new Error(`Token validation failed: ${response.status} ${responseText}`);
      }

      console.log('[Middleware] Token validated successfully');
    } catch (error) {
      console.error('[Middleware] Token validation error:', error);
      const redirectResponse = NextResponse.redirect(new URL('/login', request.url));
      redirectResponse.cookies.delete('auth_token');
      return redirectResponse;
    }
  }

  if (authToken && (pathname === '/login' || pathname === '/signup')) {
    console.log('[Middleware] Authenticated user, redirecting to dashboard');
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};