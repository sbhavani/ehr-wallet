import { useState } from 'react';
import { PinataUploader } from '@/components/web3/PinataUploader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, Search, Loader2 } from 'lucide-react';
import Head from 'next/head';

// Simple inline spinner component since we don't have access to the UI spinner
const Spinner = ({ className }: { className?: string }) => (
  <Loader2 className={`animate-spin ${className || ''}`} />
);

export default function IpfsTestPage() {
  const [cid, setCid] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDiagnostic = async () => {
    if (!cid.trim()) {
      setError('Please enter a CID to check');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      // Call the diagnostic endpoint
      const response = await fetch(`/api/ipfs/pinata-diagnostic?cid=${encodeURIComponent(cid.trim())}`);
      const data = await response.json();
      
      setResult(data);
      
      if (data.status === 'error') {
        setError(data.message || 'An error occurred during the diagnostic check');
      }
    } catch (err: any) {
      console.error('Diagnostic error:', err);
      setError(err.message || 'An error occurred during the diagnostic check');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContentFetch = async () => {
    if (!cid.trim()) {
      setError('Please enter a CID to fetch');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      // Call the IPFS API endpoint
      const response = await fetch(`/api/ipfs?cid=${encodeURIComponent(cid.trim())}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Try to parse as JSON first
      try {
        const jsonData = await response.json();
        setResult({
          status: 'success',
          message: 'Content retrieved successfully',
          data: jsonData,
          contentType: 'application/json'
        });
      } catch (jsonError) {
        // If not JSON, get as text
        const textData = await response.text();
        setResult({
          status: 'success',
          message: 'Content retrieved successfully (not JSON)',
          data: textData,
          contentType: 'text/plain'
        });
      }
    } catch (err: any) {
      console.error('Content fetch error:', err);
      setError(err.message || 'An error occurred while fetching the content');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>IPFS with Pinata Test Page - GlobalRad</title>
        <meta name="description" content="Test IPFS and Pinata integration" />
        <meta name="mobile-web-app-capable" content="yes" />
      </Head>
      
      <div className="container mx-auto py-8 space-y-8">
        <h1 className="text-3xl font-bold">IPFS with Pinata Test Page</h1>
        <p className="text-muted-foreground">
          Use this page to test the Pinata integration with IPFS. You can upload files, 
          retrieve content, and run diagnostics on CIDs.
        </p>

        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="retrieve">Retrieve Content</TabsTrigger>
            <TabsTrigger value="diagnostic">Diagnostic</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="mt-4">
            <PinataUploader />
          </TabsContent>
          
          <TabsContent value="retrieve" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Retrieve Content from IPFS</CardTitle>
                <CardDescription>
                  Enter a CID to retrieve content from IPFS
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex space-x-2">
                    <Input 
                      placeholder="Enter CID" 
                      value={cid}
                      onChange={(e) => setCid(e.target.value)}
                    />
                    <Button onClick={handleContentFetch} disabled={isLoading}>
                      {isLoading ? <Spinner className="mr-2" /> : <Search className="h-4 w-4 mr-2" />}
                      Fetch
                    </Button>
                  </div>
                  
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  {result && result.status === 'success' && (
                    <Alert className="bg-green-50 border-green-200">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <AlertTitle className="text-green-700">Content Retrieved</AlertTitle>
                      <AlertDescription className="text-green-600">
                        <div className="mt-2">
                          <p><strong>Content Type:</strong> {result.contentType}</p>
                          <div className="mt-2 p-4 bg-gray-100 rounded-md overflow-auto max-h-96">
                            <pre className="text-xs">
                              {typeof result.data === 'object' 
                                ? JSON.stringify(result.data, null, 2) 
                                : result.data}
                            </pre>
                          </div>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="diagnostic" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>IPFS Diagnostic</CardTitle>
                <CardDescription>
                  Check the status of a CID on Pinata and IPFS
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex space-x-2">
                    <Input 
                      placeholder="Enter CID" 
                      value={cid}
                      onChange={(e) => setCid(e.target.value)}
                    />
                    <Button onClick={handleDiagnostic} disabled={isLoading}>
                      {isLoading ? <Spinner className="mr-2" /> : <Search className="h-4 w-4 mr-2" />}
                      Check
                    </Button>
                  </div>
                  
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  {result && (
                    <div className="mt-4 p-4 bg-gray-100 rounded-md overflow-auto max-h-96">
                      <pre className="text-xs">
                        {JSON.stringify(result, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
