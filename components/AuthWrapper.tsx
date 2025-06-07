import { useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';

interface AuthWrapperProps {
  children: ReactNode;
  publicPaths?: string[];
}

export function AuthWrapper({ children, publicPaths = ['/login'] }: AuthWrapperProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Wait until session status is determined
    if (status === 'loading') return;
    
    const isPublicPath = publicPaths.includes(router.pathname);
    
    if (!session && !isPublicPath) {
      // Not authenticated and trying to access protected route
      console.log('Not authenticated, redirecting to login');
      router.push(`/login?callbackUrl=${encodeURIComponent(router.asPath)}`);
      return;
    } else if (session && isPublicPath) {
      // Authenticated but trying to access login page
      console.log('Already authenticated, redirecting to dashboard');
      router.push('/');
      return;
    } else if (session?.user.role === 'PATIENT' && router.pathname === '/') {
      // If user is a patient and trying to access root path
      // Redirect to patient dashboard
      console.log('Patient user accessing root path, redirecting to patient dashboard');
      router.push('/patient/dashboard');
      return;
    }
    
    // Set loading to false once routing decision is made
    setIsLoading(false);
  }, [router, session, status, publicPaths]);
  
  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          <p className="mt-2">Loading...</p>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
}
