import { useState } from 'react';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/router';
import { hybridSignOut } from '@/lib/auth-compatibility';
import { useSession } from 'next-auth/react';
import { getCurrentUser } from '@/lib/offline-auth';

export function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();
  
  // Check if we have either a NextAuth session or localStorage authentication
  const hasOfflineUser = typeof window !== 'undefined' && (
    !!localStorage.getItem('currentUser') || 
    !!localStorage.getItem('patientSession')
  );
  
  const isAuthenticated = !!session?.user || hasOfflineUser;
  
  if (!isAuthenticated) {
    return null;
  }
  
  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await hybridSignOut('/login');
      // The hybridSignOut will handle the redirect
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback manual redirect
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Button 
      variant="destructive"
      onClick={handleLogout}
      disabled={isLoading}
      className="gap-2"
    >
      <LogOut className="h-4 w-4" />
      <span>Logout</span>
    </Button>
  );
}
