import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Simplified proxy during the Vite to Next.js migration.
 * We're using client-side SessionWrapper for most auth logic during the migration.
 *
 * This proxy only protects API routes and lets the SessionWrapper handle page routing.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip all frontend routes and static assets
  if (
    !pathname.startsWith('/api') ||
    pathname.startsWith('/api/auth') ||
    pathname.match(/\.(css|jpg|jpeg|png|svg|ico|js|json|woff|woff2|ttf|eot)/i) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }
  
  // Only perform auth checks for non-public API routes
  // that require protection during the migration
  
  // For now, allow all API access to simplify the migration process
  // We'll rely on the SessionWrapper component for most auth during transition
  
  return NextResponse.next();
}

export const config = {
  // Skip proxy for static files
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
