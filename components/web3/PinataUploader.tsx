'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, Upload, FileText, Image as ImageIcon, Loader2 } from 'lucide-react';
import { pinataService } from '@/lib/web3/pinata';

// Simple inline spinner component
const Spinner = ({ className }: { className?: string }) => (
  <Loader2 className={`animate-spin ${className || ''}`} />
);

interface UploadResult {
  cid: string;
  gatewayUrl: string;
  timestamp: string;
}

export function PinataUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    setError(null);
    setUploadResult(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setIsUploading(true);
    setError(null);
    
    try {
      // Check if Pinata is configured
      if (!pinataService.isConfigured()) {
        throw new Error('Pinata is not configured. Please set up your Pinata API keys in the environment variables.');
      }
      
      // Upload the file to Pinata
      const cid = await pinataService.uploadFile(file);
      
      // Get the gateway URL
      const gatewayUrl = pinataService.getGatewayUrl(cid);
      
      setUploadResult({
        cid,
        gatewayUrl,
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message || 'An error occurred during upload');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClear = () => {
    setFile(null);
    setError(null);
    setUploadResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFileIcon = () => {
    if (!file) return <Upload className="h-8 w-8 text-muted-foreground" />;
    
    const fileType = file.type.split('/')[0];
    switch (fileType) {
      case 'image':
        return <ImageIcon className="h-8 w-8 text-blue-500" />;
      default:
        return <FileText className="h-8 w-8 text-blue-500" />;
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Upload to IPFS via Pinata</CardTitle>
        <CardDescription>
          Select a file to upload to IPFS using Pinata
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-center p-6 border-2 border-dashed rounded-md border-muted-foreground/25 bg-muted/50">
            <div className="flex flex-col items-center space-y-2">
              {getFileIcon()}
              <div className="text-sm text-center text-muted-foreground">
                {file ? file.name : 'No file selected'}
              </div>
              {file && (
                <div className="text-xs text-muted-foreground">
                  {(file.size / 1024).toFixed(2)} KB
                </div>
              )}
            </div>
          </div>
          
          <Input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            className="cursor-pointer"
          />
          
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {uploadResult && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <AlertTitle className="text-green-700">Upload Successful</AlertTitle>
              <AlertDescription className="text-green-600">
                <div className="mt-2 space-y-1">
                  <p><strong>CID:</strong> {uploadResult.cid}</p>
                  <p>
                    <strong>Gateway URL:</strong>{' '}
                    <a 
                      href={uploadResult.gatewayUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline break-all"
                    >
                      {uploadResult.gatewayUrl}
                    </a>
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handleClear} disabled={isUploading}>
          Clear
        </Button>
        <Button onClick={handleUpload} disabled={!file || isUploading}>
          {isUploading ? <Spinner className="mr-2" /> : null}
          {isUploading ? 'Uploading...' : 'Upload to IPFS'}
        </Button>
      </CardFooter>
    </Card>
  );
}
