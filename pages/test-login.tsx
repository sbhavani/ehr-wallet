import { useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { hybridWalletLogin, hybridSignIn, hybridSignOut } from '@/lib/auth-compatibility';
import { toast } from '@/components/ui/use-toast';
import { useMetaMask } from '@/components/web3/MetaMaskProvider';
import { LogOut, Key, Wallet } from 'lucide-react';
import Head from 'next/head';

export default function TestLoginPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { connectWallet } = useMetaMask();
  const [isLoading, setIsLoading] = useState(false);
  const [walletLoading, setWalletLoading] = useState(false);
  
  // Get offline user from localStorage if applicable
  const [offlineUser, setOfflineUser] = useState<any>(null);
  
  // Check for user in localStorage on mount
  useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('currentUser');
        if (stored) {
          setOfflineUser(JSON.parse(stored));
        }
      } catch (e) {
        console.error('Error reading from localStorage', e);
      }
    }
  });
  
  // Handle standard login
  const handleStandardLogin = async () => {
    setIsLoading(true);
    try {
      // Use test account for quick login
      const result = await hybridSignIn('test@example.com', 'password123', {
        redirect: false
      });
      
      if (result.success) {
        toast({
          title: "Login successful",
          description: result.nextAuth ? 
            "Authenticated with NextAuth" : 
            "Authenticated with localStorage fallback"
        });
        
        // Manual redirect to dashboard after a delay
        setTimeout(() => {
          router.push('/patient/dashboard');
        }, 1000);
      } else {
        toast({
          title: "Login failed",
          description: "Please check your credentials",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Login error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle MetaMask login
  const handleWalletLogin = async () => {
    setWalletLoading(true);
    try {
      const account = await connectWallet();
      if (account) {
        const result = await hybridWalletLogin(account, {
          redirect: false
        });
        
        if (result.success) {
          toast({
            title: "Wallet connected",
            description: `Connected with ${account.substring(0, 6)}...${account.substring(account.length - 4)}`
          });
          
          // Manual redirect to dashboard after a delay
          setTimeout(() => {
            router.push('/patient/dashboard');
          }, 1000);
        }
      }
    } catch (error) {
      toast({
        title: "Wallet connection failed",
        description: "Could not connect to MetaMask",
        variant: "destructive"
      });
    } finally {
      setWalletLoading(false);
    }
  };
  
  // Handle logout
  const handleLogout = async () => {
    await hybridSignOut();
    toast({
      title: "Logged out",
      description: "You have been logged out successfully"
    });
    router.push('/login');
  };

  return (
    <>
      <Head>
        <title>Authentication Test Page</title>
      </Head>
      <div className="container mx-auto max-w-md mt-16 p-4">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Test</CardTitle>
            <CardDescription>Test authentication flows during Vite to Next.js migration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {session && (
              <div className="p-4 bg-green-50 text-green-800 rounded-md">
                <h3 className="font-bold">NextAuth Session</h3>
                <pre className="text-xs mt-2 overflow-auto max-h-32">
                  {JSON.stringify(session, null, 2)}
                </pre>
              </div>
            )}
            
            {offlineUser && (
              <div className="p-4 bg-blue-50 text-blue-800 rounded-md">
                <h3 className="font-bold">Offline User (localStorage)</h3>
                <pre className="text-xs mt-2 overflow-auto max-h-32">
                  {JSON.stringify(offlineUser, null, 2)}
                </pre>
              </div>
            )}
            
            <div className="grid gap-4">
              <Button 
                onClick={handleStandardLogin} 
                disabled={isLoading}
                className="w-full"
              >
                <Key className="mr-2 h-4 w-4" />
                Test Standard Login
              </Button>
              
              <Button 
                onClick={handleWalletLogin} 
                disabled={walletLoading}
                variant="outline"
                className="w-full"
              >
                <Wallet className="mr-2 h-4 w-4" />
                Test MetaMask Login
              </Button>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleLogout} 
              variant="destructive"
              className="w-full"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
