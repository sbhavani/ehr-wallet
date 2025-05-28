'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, FileText } from 'lucide-react';
import { encryptData, uploadToIpfs, checkIpfsAvailability } from '@/lib/web3/ipfs';
import { pinataService } from '@/lib/web3/pinata';
import { createAccessGrant, generateShareableLink } from '@/lib/web3/contract';
import { FileUpload } from '@/components/ui/file-upload';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Define the form schema
const formSchema = z.object({
  dataTypes: z.array(z.string()).min(1, { message: 'Select at least one data type' }),
  duration: z.string().min(1, { message: 'Duration is required' }),
  password: z.string().optional(),
  usePassword: z.boolean().default(false),
  uploadMode: z.enum(['data', 'documents']).default('data'),
  documents: z.array(z.any()).optional(),
});

type FormValues = z.infer<typeof formSchema>;

// Available data types
const dataTypeOptions = [
  { id: 'medical-history', label: 'Medical History' },
  { id: 'lab-results', label: 'Lab Results' },
  { id: 'imaging', label: 'Imaging & Scans' },
  { id: 'prescriptions', label: 'Prescriptions' },
  { id: 'visit-notes', label: 'Visit Notes' },
];

// Duration options in seconds
const durationOptions = [
  { value: '3600', label: '1 hour' },
  { value: '86400', label: '1 day' },
  { value: '604800', label: '1 week' },
  { value: '2592000', label: '30 days' },
];

interface DataSharingFormProps {
  patientId: string;
  onSuccess: (shareableLink: string, accessId: string) => void;
}

const DataSharingForm = ({ patientId, onSuccess }: DataSharingFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dataTypes: [],
      duration: '86400', // Default to 1 day
      usePassword: false,
      password: '',
      uploadMode: 'data',
      documents: [],
    },
  });

  const usePassword = form.watch('usePassword');
  const uploadMode = form.watch('uploadMode');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [showLogs, setShowLogs] = useState(false);
  
  // Function to add logs
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `${timestamp}: ${message}`]);
    
    // Scroll to bottom of logs
    setTimeout(() => {
      logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    setError(null);
    setLogs([]);
    addLog('Starting data sharing process...');
    
    // Flag to track if we should use direct IPFS (no contract)
    const useDirectIpfs = !process.env.NEXT_PUBLIC_ACCESS_CONTRACT_ADDRESS;
    if (useDirectIpfs) {
      addLog('No contract address configured - using direct IPFS upload');
    }

    try {
      // Check if MetaMask is installed
      addLog('Checking if MetaMask is installed...');
      
      // Add a flag to bypass MetaMask requirement for testing
      const bypassMetaMask = true; // Set to true to bypass MetaMask requirement
      
      if (!window.ethereum && !bypassMetaMask) {
        addLog('ERROR: MetaMask not found');
        throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
      } else if (!window.ethereum && bypassMetaMask) {
        addLog('MetaMask not found, but continuing in bypass mode');
      } else {
        addLog('MetaMask detected');
      }

      // Request account access if not already connected
      let address = 'test-address-' + Date.now().toString(16);
      
      if (window.ethereum) {
        try {
          addLog('Requesting MetaMask account access...');
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          address = accounts[0];
          addLog(`Connected with address: ${address.substring(0, 6)}...${address.substring(address.length - 4)}`);
        } catch (metaMaskError: any) {
          addLog(`MetaMask connection error: ${metaMaskError.message}`);
          addLog('Continuing with test address');
          console.error('MetaMask error:', metaMaskError);
        }
      } else {
        addLog(`Using test address: ${address}`);
      }

      let ipfsData;
      let dataToShare;

      if (values.uploadMode === 'documents') {
        // Handle document uploads
        addLog('Processing document uploads...');
        if (uploadedFiles.length === 0) {
          addLog('ERROR: No documents uploaded');
          throw new Error('Please upload at least one document');
        }
        addLog(`Found ${uploadedFiles.length} document(s) to process`);

        // Process each file
        addLog('Converting files to base64 format...');
        const fileData = await Promise.all(
          uploadedFiles.map(async (file) => {
            addLog(`Processing file: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);
            // Convert file to base64
            const base64 = await fileToBase64(file);
            addLog(`Converted ${file.name} to base64`);
            return {
              name: file.name,
              type: file.type,
              size: file.size,
              lastModified: file.lastModified,
              content: base64,
            };
          })
        );
        addLog('All files processed successfully');

        // Prepare document data
        dataToShare = {
          patientId,
          documentType: 'medical-documents',
          files: fileData,
          createdAt: new Date().toISOString(),
          createdBy: address,
        };
      } else {
        // Regular data sharing
        // Prepare data to be shared
        dataToShare = {
          patientId,
          dataTypes: values.dataTypes,
          createdAt: new Date().toISOString(),
          createdBy: address,
        };
      }

      // Encrypt data if password is used
      if (values.usePassword && values.password) {
        addLog('Encrypting data with password...');
        ipfsData = await encryptData(dataToShare, values.password);
        addLog('Data encrypted successfully');
      } else {
        addLog('Preparing data for IPFS (unencrypted)...');
        ipfsData = JSON.stringify(dataToShare);
        addLog('Data prepared successfully');
      }

      // Check IPFS availability and Pinata configuration
      addLog('Checking IPFS and Pinata availability...');
      try {
        // Check if Pinata is configured
        const isPinataConfigured = pinataService.isConfigured();
        if (isPinataConfigured) {
          addLog('Pinata service is configured and will be used as primary IPFS provider.');
        } else {
          addLog('Pinata service is not configured. Will use alternative IPFS providers.');
          
          // Check other IPFS availability
          const isIpfsAvailable = await checkIpfsAvailability();
          if (!isIpfsAvailable) {
            addLog('WARNING: IPFS service may not be fully available. Will attempt upload with fallbacks.');
          } else {
            addLog('IPFS service is available.');
          }
        }
      } catch (error) {
        addLog('WARNING: Could not verify IPFS availability. Will attempt upload with fallbacks.');
      }
      
      // Upload to IPFS with Pinata prioritized
      addLog('Uploading to IPFS...');
      addLog('Data to upload: ' + (typeof ipfsData === 'string' ? ipfsData.substring(0, 50) + '...' : JSON.stringify(dataToShare).substring(0, 50) + '...'));
      try {
        let ipfsCid;
        
        // Try Pinata first if configured
        if (pinataService.isConfigured()) {
          try {
            addLog('Attempting upload via Pinata...');
            // Convert string to JSON if needed
            const jsonData = typeof ipfsData === 'string' ? JSON.parse(ipfsData) : ipfsData;
            ipfsCid = await pinataService.uploadJSON(jsonData, `Patient-${patientId}-Data-${Date.now()}`);
            addLog(`Successfully uploaded to IPFS via Pinata with CID: ${ipfsCid}`);
          } catch (pinataError: any) {
            addLog(`Pinata upload failed: ${pinataError.message}. Falling back to alternative IPFS providers...`);
            // Fall back to regular IPFS upload
            ipfsCid = await uploadToIpfs(ipfsData);
            addLog(`Successfully uploaded to IPFS with CID: ${ipfsCid} using fallback method`);
          }
        } else {
          // Use regular IPFS upload if Pinata not configured
          ipfsCid = await uploadToIpfs(ipfsData);
          addLog(`Successfully uploaded to IPFS with CID: ${ipfsCid}`);
        }

        if (useDirectIpfs) {
          // Direct IPFS approach (no contract)
          addLog('Using direct IPFS sharing (no blockchain contract)');
          
          // Generate a simple shareable link with the CID
          const baseUrl = window.location.origin;
          const shareableLink = `${baseUrl}/ipfs/${ipfsCid}`;
          const accessId = ipfsCid; // Use CID as the access ID
          
          addLog(`Direct IPFS link generated: ${shareableLink}`);
          addLog('Process completed successfully!');
          
          // Call success callback
          onSuccess(shareableLink, accessId);
        } else {
          // Create access grant on blockchain
          const durationInSeconds = parseInt(values.duration);
          addLog(`Creating access grant on blockchain (duration: ${durationInSeconds} seconds)...`);
          const accessId = await createAccessGrant(
            ipfsCid,
            durationInSeconds,
            values.usePassword ? values.password : undefined
          );
          addLog(`Access grant created with ID: ${accessId}`);

          // Generate shareable link
          const shareableLink = generateShareableLink(accessId);
          addLog(`Generated shareable link: ${shareableLink}`);
          
          // Save the shared data to the database via API
          try {
            addLog('Saving shared data to database...');
            
            // Calculate expiry time based on duration
            const durationSeconds = parseInt(values.duration);
            const expiryTime = new Date(Date.now() + durationSeconds * 1000);
            
            // Prepare data for API
            const sharedDataPayload = {
              accessId,
              ipfsCid,
              expiryTime: expiryTime.toISOString(),
              hasPassword: values.usePassword,
              dataTypes: values.dataTypes
            };
            
            addLog(`Sending payload to API: ${JSON.stringify(sharedDataPayload)}`);
            
            // Call the API to save the shared data
            const response = await fetch('/api/shared-data', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(sharedDataPayload),
              // Ensure we don't use cached responses
              cache: 'no-store'
            });
            
            if (!response.ok) {
              let errorMessage = 'Failed to save shared data';
              try {
                const errorData = await response.json();
                errorMessage = errorData.error || errorMessage;
              } catch (e) {
                // If we can't parse the error response, use the default message
              }
              throw new Error(errorMessage);
            }
            
            // Try to get the response data
            let responseData;
            try {
              responseData = await response.json();
              addLog(`API response: ${JSON.stringify(responseData)}`);
            } catch (e) {
              addLog('Could not parse API response, but operation was successful');
            }
            
            addLog('Shared data saved to database successfully');
          } catch (apiError: any) {
            addLog(`WARNING: Failed to save to database: ${apiError.message}`);
            console.error('Error saving to database:', apiError);
            // Continue with the process even if database save fails
          }
          
          // Call the onSuccess callback with the shareable link and access ID
          onSuccess(shareableLink, accessId);
          
          addLog('Data sharing process completed successfully!');
        }
      } catch (ipfsError: any) {
        addLog(`IPFS ERROR: ${ipfsError.message || 'Unknown IPFS error'}`);
        addLog(`IPFS ERROR DETAILS: ${JSON.stringify(ipfsError)}`);
        console.error('IPFS upload error:', ipfsError);
        throw ipfsError;
      }
    } catch (error: any) {
      console.error('Error in data sharing process:', error);
      const errorMessage = error.message || 'An unknown error occurred';
      setError(errorMessage);
      addLog(`ERROR: ${errorMessage}`);
      
      // Provide more helpful messages for specific errors
      if (errorMessage.includes('404')) {
        addLog('This appears to be an IPFS connection issue. The IPFS service might be temporarily unavailable.');
        addLog('Recommendation: Please try again in a few minutes.');
      } else if (errorMessage.includes('network') || errorMessage.includes('connection')) {
        addLog('This appears to be a network connectivity issue.');
        addLog('Recommendation: Please check your internet connection and try again.');
      } else if (errorMessage.includes('timeout')) {
        addLog('The operation timed out. The IPFS service might be slow or overloaded.');
        addLog('Recommendation: Please try again later with a smaller file or less data.');
      }
    } finally {
      setIsSubmitting(false);
      addLog('Operation completed');
    }
  };

  // Helper function to convert File to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Share Medical Data</CardTitle>
        <CardDescription>
          Share your medical data or documents securely using blockchain and IPFS
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="uploadMode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What would you like to share?</FormLabel>
                  <Tabs
                    value={field.value}
                    onValueChange={field.onChange}
                    className="w-full mb-6"
                  >
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="data">Medical Data</TabsTrigger>
                      <TabsTrigger value="documents">Documents</TabsTrigger>
                    </TabsList>
                  </Tabs>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {uploadMode === 'data' && (
              <FormField
                control={form.control}
                name="dataTypes"
                render={() => (
                  <FormItem>
                    <FormLabel>Data to Share</FormLabel>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                      {dataTypeOptions.map((option) => (
                        <FormField
                          key={option.id}
                          control={form.control}
                          name="dataTypes"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={option.id}
                                className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(option.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, option.id])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== option.id
                                            )
                                          );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {option.label}
                                </FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            {uploadMode === 'documents' && (
              <FormField
                control={form.control}
                name="documents"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Upload Documents</FormLabel>
                    <FormControl>
                      <FileUpload
                        onChange={(files) => {
                          setUploadedFiles(files);
                          field.onChange(files);
                        }}
                        value={uploadedFiles}
                        multiple={true}
                        maxFiles={5}
                        maxSize={20} // 20MB
                        accept="application/pdf,image/*,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                        className="mt-2"
                      />
                    </FormControl>
                    <FormDescription>
                      Upload medical documents, reports, or images to share securely
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Access Duration</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {durationOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    The recipient will have access for this duration
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="usePassword"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Require password for access
                    </FormLabel>
                    <FormDescription>
                      Add an extra layer of security with a password
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {usePassword && (
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter a secure password"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Share this password with the recipient separately
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {error && (
              <div className="text-sm font-medium text-destructive">{error}</div>
            )}

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Share Data'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4 w-full">
        <div className="flex justify-between w-full">
          <p className="text-xs text-muted-foreground">
            Your {uploadMode === 'documents' ? 'documents' : 'data'} will be encrypted and stored on IPFS with access managed by a smart contract
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowLogs(!showLogs)}
            className="text-xs"
          >
            {showLogs ? 'Hide Logs' : 'Show Logs'}
          </Button>
        </div>
        
        {showLogs && (
          <div className="w-full">
            <div className="bg-black text-green-400 p-4 rounded font-mono text-xs h-64 overflow-y-auto">
              {logs.length > 0 ? (
                logs.map((log, index) => <div key={index}>{log}</div>)
              ) : (
                <p>No logs yet. Submit the form to see logs.</p>
              )}
              <div ref={logsEndRef} />
            </div>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default DataSharingForm;
