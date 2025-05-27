import { useState, useEffect } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ChevronDown, ChevronUp } from 'lucide-react';

// Define the form schemas
const staffFormSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

const patientFormSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

type StaffFormData = z.infer<typeof staffFormSchema>;
type PatientFormData = z.infer<typeof patientFormSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [dbInitializing, setDbInitializing] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);
  const [isMetaMaskLoading, setIsMetaMaskLoading] = useState(false);
  const [showEmailPasswordLogin, setShowEmailPasswordLogin] = useState(false);
  
  // Get MetaMask context for wallet integration
  const { isMetaMaskInstalled, currentAccount, connectWallet, isConnected, error: metaMaskError } = useMetaMask();
  
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

  // Initialize the staff form
  const staffForm = useForm<StaffFormData>({
    resolver: zodResolver(staffFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Initialize the patient form
  const patientForm = useForm<PatientFormData>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onStaffSubmit(data: StaffFormData) {
    setIsLoading(true);
    
    try {
      // Use offline authentication with Dexie
      const user = await authenticateOffline(data.email, data.password);
      
      if (user) {
        // Store auth state for persistent sessions
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        // Get the callback URL from the query parameters or default to '/'
        const callbackUrl = Array.isArray(router.query.callbackUrl)
          ? router.query.callbackUrl[0]
          : router.query.callbackUrl || '/';
          
        console.log('Authentication successful, redirecting to:', callbackUrl);
        
        // Add a small delay before redirecting to ensure state is properly set
        setTimeout(() => {
          // Force a hard navigation instead of client-side routing
          window.location.href = callbackUrl;
        }, 100);
        
        return; // Early return to prevent setting isLoading to false
      } else {
        toast.error('Invalid email or password');
        setIsLoading(false);
      }
    } catch (error) {
      toast.error('An error occurred during login');
      console.error('Login error:', error);
      setIsLoading(false);
    }
  }

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
        // Store wallet address and create a patient session in localStorage
        const patientSession = {
          user: {
            name: `Patient (${account.substring(0, 6)}...${account.substring(account.length - 4)})`,
            ethereumAddress: account,
            role: 'patient'
          },
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
        };
        
        localStorage.setItem('patientWalletAddress', account);
        localStorage.setItem('patientSession', JSON.stringify(patientSession));
        localStorage.setItem('currentUser', JSON.stringify({
          id: `eth-${account}`,
          name: `Patient (${account.substring(0, 6)}...${account.substring(account.length - 4)})`,
          email: null,
          role: 'patient',
          ethereumAddress: account
        }));
        
        // Show success message
        toast.success('Successfully connected with MetaMask');
        
        // Always redirect to patient dashboard for MetaMask users
        setTimeout(() => {
          window.location.href = '/patient/dashboard';
        }, 100);
        
        return;
      } else {
        toast.error('Failed to connect with MetaMask');
      }
    } catch (error) {
      console.error('MetaMask login error:', error);
      toast.error('An error occurred during MetaMask login');
    }
    setIsMetaMaskLoading(false);
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
          <Tabs defaultValue="patient" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="patient">Patient Login</TabsTrigger>
              <TabsTrigger value="staff">Staff Login</TabsTrigger>
            </TabsList>
            
            {/* Staff Login Tab */}
            <TabsContent value="staff" className="mt-4">
              <Form {...staffForm}>
                <form onSubmit={staffForm.handleSubmit(onStaffSubmit)} className="space-y-4">
                  <FormField
                    control={staffForm.control}
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
                    control={staffForm.control}
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
              
              <div className="mt-4 text-center text-xs text-muted-foreground bg-muted p-2 rounded">
                <p>For demo: use the following credentials</p>
                <div className="mt-1">
                  <p><strong>Admin:</strong> admin@example.com / password</p>
                  <p><strong>Doctor:</strong> doctor@example.com / password</p>
                  <p><strong>Staff:</strong> staff@example.com / password</p>
                </div>
              </div>
            </TabsContent>
            
            {/* Patient Login Tab */}
            <TabsContent value="patient" className="mt-4">
              <div className="space-y-4">
                {/* Patient Login Options */}
                <div className="text-center mb-4">
                  <p className="text-sm text-muted-foreground mb-2">Sign in to access your medical records</p>
                </div>

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
                        // Use offline authentication with Dexie
                        const user = await authenticateOffline(data.email, data.password, 'PATIENT');
                        
                        if (user) {
                          // Store auth state for persistent sessions
                          localStorage.setItem('currentUser', JSON.stringify(user));
                          
                          // Get the callback URL from the query parameters or default to patient dashboard
                          const callbackUrl = Array.isArray(router.query.callbackUrl)
                            ? router.query.callbackUrl[0]
                            : router.query.callbackUrl || '/patient/dashboard';
                            
                          console.log('Patient authentication successful, redirecting to:', callbackUrl);
                          
                          // Add a small delay before redirecting to ensure state is properly set
                          setTimeout(() => {
                            // Force a hard navigation instead of client-side routing
                            window.location.href = callbackUrl;
                          }, 100);
                          
                          return; // Early return to prevent setting isLoading to false
                        } else {
                          toast.error('Invalid email or password');
                          setIsLoading(false);
                        }
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
            </TabsContent>
          </Tabs>
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
