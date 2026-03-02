/**
 * SessionWrapper
 *
 * Provides unified session handling for both NextAuth and wallet-based auth.
 */

import { FC, ReactNode, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { Skeleton } from '@/components/ui/skeleton';

interface SessionWrapperProps {
  children: ReactNode;
}

export const SessionWrapper: FC<SessionWrapperProps> = ({ children }) => {
  const { status } = useSession();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // List of paths that don't require authentication
  const publicPaths = [
    '/login',
    '/register',
    '/test-login',
    '/ipfs',
    '/shared',
  ];

  const isPublicPath = publicPaths.some(path =>
    router.pathname === path || router.pathname.startsWith(`${path}/`)
  );

  // Show loading skeleton while checking auth
  if (!mounted || status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
