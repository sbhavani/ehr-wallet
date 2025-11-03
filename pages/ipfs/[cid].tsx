'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getFromIpfs, decryptData } from '@/lib/web3/ipfs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, FileText, Download, Lock, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Force dynamic rendering to avoid build-time IPFS module loading
export const dynamic = 'force-dynamic';

export default function IpfsViewerPage() {
  const router = useRouter();
  const { cid } = router.query;
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [isEncrypted, setIsEncrypted] = useState(false);
  const [decryptError, setDecryptError] = useState<string | null>(null);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);

  useEffect(() => {
    if (!cid || typeof cid !== 'string') return;
    
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const fetchedData = await getFromIpfs(cid);
        
        // Check if the data is encrypted
        if (typeof fetchedData === 'string' && fetchedData.startsWith('eyJ')) {
          setIsEncrypted(true);
          setShowPasswordDialog(true);
        } else {
          setData(fetchedData);
        }
      } catch (err: any) {
        console.error('Error fetching IPFS data:', err);
        setError(err.message || 'Failed to fetch data from IPFS');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [cid]);

  const handleDecrypt = async () => {
    if (!cid || typeof cid !== 'string') return;
    setDecryptError(null);
    
    try {
      const encryptedData = await getFromIpfs(cid);
      const decrypted = await decryptData(encryptedData, password);
      setData(decrypted);
      setShowPasswordDialog(false);
    } catch (err: any) {
      console.error('Error decrypting data:', err);
      setDecryptError(err.message || 'Failed to decrypt data');
    }
  };

  const renderDocumentPreview = (file: any) => {
    if (!file) return null;
    
    const isImage = file.type?.startsWith('image/');
    const isPdf = file.type === 'application/pdf';
    
    if (isImage) {
      return (
        <div className="flex flex-col items-center">
          <img 
            src={file.content} 
            alt={file.name} 
            className="max-w-full max-h-96 object-contain rounded-md mb-2" 
          />
          <p className="text-sm text-muted-foreground">{file.name}</p>
        </div>
      );
    }
    
    if (isPdf) {
      return (
        <div className="flex flex-col items-center">
          <div className="bg-muted p-8 rounded-md mb-2 flex flex-col items-center">
            <FileText className="h-16 w-16 text-red-500 mb-2" />
            <p className="text-sm font-medium">{file.name}</p>
            <p className="text-xs text-muted-foreground">PDF Document</p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => window.open(file.content, '_blank')}
            className="mt-2"
          >
            <Eye className="h-4 w-4 mr-2" />
            View PDF
          </Button>
        </div>
      );
    }
    
    return (
      <div className="flex flex-col items-center">
        <div className="bg-muted p-8 rounded-md mb-2 flex flex-col items-center">
          <FileText className="h-16 w-16 text-blue-500 mb-2" />
          <p className="text-sm font-medium">{file.name}</p>
          <p className="text-xs text-muted-foreground">{file.type || 'Document'}</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => {
            // Create a download link for the file
            const link = document.createElement('a');
            link.href = file.content;
            link.download = file.name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }}
          className="mt-2"
        >
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
      </div>
    );
  };

  const renderContent = () => {
    if (!data) return null;
    
    // Check if this is document data
    if (data.files && Array.isArray(data.files)) {
      return (
        <div className="space-y-6">
          <div className="bg-muted p-4 rounded-md">
            <h3 className="text-sm font-medium mb-2">Shared by</h3>
            <p className="text-xs text-muted-foreground">{data.createdBy || 'Unknown'}</p>
            <p className="text-xs text-muted-foreground">Shared on {new Date(data.createdAt).toLocaleString()}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.files.map((file: any, index: number) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  {renderDocumentPreview(file)}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      );
    }
    
    // Regular data
    return (
      <div className="space-y-4">
        <div className="bg-muted p-4 rounded-md">
          <h3 className="text-sm font-medium mb-2">Shared Data</h3>
          <pre className="text-xs overflow-auto p-2 bg-background rounded">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      </div>
    );
  };

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Shared Medical Data</h1>
      
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin mb-4" />
            <p>Loading data from IPFS...</p>
          </div>
        </div>
      ) : error ? (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-6">
          {renderContent()}
        </div>
      )}
      
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Password Protected Data</DialogTitle>
            <DialogDescription>
              This data is password protected. Enter the password to view it.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            {decryptError && (
              <p className="text-sm text-destructive">{decryptError}</p>
            )}
          </div>
          
          <DialogFooter>
            <Button onClick={handleDecrypt} disabled={!password}>
              <Lock className="h-4 w-4 mr-2" />
              Decrypt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
