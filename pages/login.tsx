import { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { hybridSignIn, hybridWalletLogin } from '@/lib/auth-compatibility';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Image from 'next/image';
import Link from 'next/link';
import { authenticateOffline } from '@/lib/offline-auth';
import { initDatabase } from '@/lib/db';
import { seedOfflineDatabase } from '@/lib/seed-offline-db';
import { useMetaMask } from '@/components/web3/MetaMaskProvider';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';
import { ChevronDown, ChevronUp } from 'lucide-react';

// Define the form schema
const patientFormSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

type PatientFormData = z.infer<typeof patientFormSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [dbInitializing, setDbInitializing] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);
  const [isMetaMaskLoading, setIsMetaMaskLoading] = useState(false);
  const [showEmailPasswordLogin, setShowEmailPasswordLogin] = useState(false);
  
  // Get MetaMask context for wallet integration
  const { isMetaMaskInstalled, currentAccount, connectWallet, isConnected, error: metaMaskError } = useMetaMask();
  
  // Redirect if user is already authenticated
  useEffect(() => {
    if (session) {
      const callbackUrl = Array.isArray(router.query.callbackUrl)
        ? router.query.callbackUrl[0]
        : router.query.callbackUrl || '/';
      
      router.push(callbackUrl);
    }
  }, [session, router]);
  
  // Initialize the database and seed if needed
  useEffect(() => {
    async function initialize() {
      try {
        await initDatabase();
        await seedOfflineDatabase();
        setDbInitializing(false);
      } catch (error) {
        console.error('Failed to initialize database:', error);
        setInitError('Failed to initialize the offline database. Please reload the page.');
        setDbInitializing(false);
      }
    }
    
    initialize();
  }, []);

  // Initialize the patient form
  const patientForm = useForm<PatientFormData>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });



  // Show loading state while database is initializing
  if (dbInitializing) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mb-4"></div>
          <p>Initializing offline database...</p>
        </div>
      </div>
    );
  }
  
  // Handle MetaMask login
  const handleMetaMaskLogin = async () => {
    setIsMetaMaskLoading(true);
    try {
      const account = await connectWallet();
      if (account) {
        // Use our hybrid login system to authenticate with both systems
        const callbackUrl = Array.isArray(router.query.callbackUrl)
          ? router.query.callbackUrl[0]
          : router.query.callbackUrl || '/patient/dashboard';
        
        const result = await hybridWalletLogin(account, {
          redirect: true,
          callbackUrl
        });
        
        if (result.success) {
          toast.success('Successfully connected with MetaMask');
          // The hybridWalletLogin will handle redirection
        } else {
          toast.error('Failed to authenticate with MetaMask');
        }
      } else {
        toast.error('Failed to connect with MetaMask');
      }
    } catch (error) {
      console.error('MetaMask login error:', error);
      toast.error('An error occurred during MetaMask login');
    } finally {
      setIsMetaMaskLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen w-full items-center justify-center bg-background">
      <Card className="w-full max-w-md mb-auto mt-auto">
        <CardHeader className="space-y-1 text-center">
          {/* <div className="flex justify-center mb-4">
            <Image 
              src="/default-monochrome.svg" 
              alt="GlobalRad Logo" 
              width={32} 
              height={32} 
              className="h-6 w-auto" 
            />
          </div> */}
          <CardTitle className="text-2xl font-semibold">Login</CardTitle>
          {initError && <p className="text-red-500 text-sm">{initError}</p>}
        </CardHeader>
        <CardContent>
          <div className="w-full">
            <div className="text-center mb-4">
              <h2 className="text-lg font-semibold">Patient Login</h2>
              <p className="text-sm text-muted-foreground">Sign in to access your medical records</p>
            </div>
            
            {/* Patient Login Content */}
              <div className="space-y-4">

                {/* Web3 Wallet Login - First */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-3">Web3 Wallet Login</h3>
                  <p className="text-xs text-muted-foreground mb-4">Connect with your Ethereum wallet to access your medical records</p>
                  
                  {/* MetaMask Login Button */}
                  <Button 
                    onClick={handleMetaMaskLogin} 
                    className="w-full flex items-center justify-center gap-2" 
                    disabled={!isMetaMaskInstalled || isMetaMaskLoading}
                    variant="outline"
                  >
                    {isMetaMaskLoading ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                        <span>Connecting...</span>
                      </>
                    ) : (
                      <>
                        <Image src="/metamask-fox.svg" alt="MetaMask" width={24} height={24} />
                        <span>Connect with MetaMask</span>
                      </>
                    )}
                  </Button>
                  
                  {/* Display current account if connected */}
                  {currentAccount && (
                    <div className="mt-2 text-center text-sm">
                      <p className="text-muted-foreground">Connected account:</p>
                      <p className="font-mono text-xs break-all">{currentAccount}</p>
                    </div>
                  )}
                  
                  {/* MetaMask not installed warning */}
                  {!isMetaMaskInstalled && (
                    <div className="mt-2 text-center text-sm text-amber-500">
                      <p>MetaMask extension is not installed. Please install it to continue.</p>
                      <a 
                        href="https://metamask.io/download/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline mt-1 inline-block"
                      >
                        Download MetaMask
                      </a>
                    </div>
                  )}
                  
                  {/* Display MetaMask error if any */}
                  {metaMaskError && (
                    <div className="mt-2 text-center text-sm text-red-500">
                      <p>{metaMaskError}</p>
                    </div>
                  )}
                  
                  <div className="mt-2 text-center text-xs text-muted-foreground bg-muted p-2 rounded">
                    <p>For demo: use MetaMask with the Ethereum Sepolia testnet</p>
                    <p className="mt-1">You can get test ETH from the <a href="https://sepoliafaucet.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Sepolia Faucet</a></p>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                {/* Email/Password Login Form - Collapsible */}
                <div className="mb-2">
                  <button 
                    onClick={() => setShowEmailPasswordLogin(!showEmailPasswordLogin)}
                    className="flex items-center justify-between w-full text-sm font-medium mb-3 p-2 rounded hover:bg-muted transition-colors"
                    type="button"
                  >
                    <span>Email & Password Login</span>
                    {showEmailPasswordLogin ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  
                  {showEmailPasswordLogin && (
                  <div className="mt-2 animate-in fade-in-50 slide-in-from-top-5 duration-300">
                    <Form {...patientForm}>
                    <form onSubmit={patientForm.handleSubmit(async (data) => {
                      setIsLoading(true);
                      
                      try {
                        // Use hybrid authentication that tries NextAuth first, then falls back to offline auth
                        const callbackUrl = Array.isArray(router.query.callbackUrl)
                          ? router.query.callbackUrl[0]
                          : router.query.callbackUrl || '/patient/dashboard';
                          
                        const result = await hybridSignIn(data.email, data.password, {
                          redirect: true,
                          callbackUrl,
                          role: 'PATIENT'
                        });
                        
                        if (!result.success) {
                          toast.error('Invalid email or password');
                          setIsLoading(false);
                        }
                        // The hybridSignIn handles redirection internally
                      } catch (error) {
                        toast.error('An error occurred during login');
                        console.error('Login error:', error);
                        setIsLoading(false);
                      }
                    })} className="space-y-4">
                      <FormField
                        control={patientForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input 
                                type="email" 
                                placeholder="name@example.com" 
                                {...field} 
                                disabled={isLoading}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={patientForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input 
                                type="password" 
                                placeholder="••••••••" 
                                {...field} 
                                disabled={isLoading}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? 'Logging in...' : 'Login'}
                      </Button>
                    </form>
                  </Form>
                  
                  <div className="mt-2 text-center text-xs text-muted-foreground">
                    <p>For demo: use patient@example.com / password</p>
                  </div>
                  </div>
                  )}
                </div>
                

              </div>
          </div>
        </CardContent>
        {/* <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-center text-muted-foreground">
            Don&apos;t have an account? Contact your administrator.
          </div>
        </CardFooter> */}
      </Card>
      
      {/* Footer */}
      <footer className="w-full py-2 px-4 mt-4 border-t border-border bg-background flex justify-between items-center text-xs text-muted-foreground">
        <div>
          © {new Date().getFullYear()} TMC AI, LLC. All rights reserved.
        </div>
        <div className="flex gap-4">
          <Link href="/hipaa" className="hover:text-foreground transition-colors">
            HIPAA Compliance
          </Link>
          <Link href="/privacy" className="hover:text-foreground transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-foreground transition-colors">
            Terms of Service
          </Link>
        </div>
      </footer>
    </div>
  );
}
