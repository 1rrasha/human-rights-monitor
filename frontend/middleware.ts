import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = ['/dashboard'];
const publicRoutes = ['/', '/login', '/signup', '/about'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log('[Middleware] Processing request for:', pathname);
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  const isPublicRoute = publicRoutes.includes(pathname);
  const authToken = request.cookies.get('auth_token')?.value;
  console.log('[Middleware] auth_token present:', !!authToken);
  console.log('[Middleware] auth_token (first 10 chars):', authToken?.substring(0, 10) || 'none');

  if (isProtectedRoute && !authToken) {
    console.log('[Middleware] No token for protected route, redirecting to /login');
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isProtectedRoute && authToken) {
    console.log('[Middleware] Validating token for protected route');
    try {
      const apiBaseUrl = (process.env.API_BASE_URL || 'http://localhost:8000/api/v1').replace(/\/+$/, '');
      const authMeUrl = `${apiBaseUrl}/auth/me`;
      console.log('[Middleware] Calling /auth/me at:', authMeUrl);
      console.log('[Middleware] Authorization header:', `Bearer ${authToken.substring(0, 10)}...`);
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
      console.log('[Middleware] Token validated successfully');
    } catch (error) {
      console.error('[Middleware] Token validation error:', error);
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  

  if (authToken && (pathname === '/login' || pathname === '/signup')) {
    console.log('[Middleware] Authenticated user accessing /login or /signup, redirecting to /dashboard');
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  console.log('[Middleware] Allowing request to proceed');
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};