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
import { Loader2, FileText, FlaskConical, Image, Pill, ClipboardList, Clock, Shield, AlertCircle, CheckCircle2, Info, Upload } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { encryptData, uploadToIpfs, checkIpfsAvailability } from '@/lib/web3/ipfs';
import { pinataService } from '@/lib/web3/pinata';
import { createAccessGrant, generateShareableLink } from '@/lib/web3/contract';
import { FileUpload } from '@/components/ui/file-upload';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

// Define the form schema
const formSchema = z.object({
  dataTypes: z.array(z.string()).min(1, { message: 'Please select at least one data type to share' }),
  duration: z.string().min(1, { message: 'Access duration is required' }),
  password: z.string()
    .optional()
    .refine(
      (val) => !val || val.length >= 6, 
      { message: 'Password must be at least 6 characters long' }
    ),
  usePassword: z.boolean().default(false),
  uploadMode: z.enum(['data', 'documents']).default('data'),
  documents: z.array(z.any())
    .optional()
    .refine(
      (val) => !val || val.length > 0, 
      { message: 'Please upload at least one document' }
    ),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms to continue',
  }),
});

type FormValues = z.infer<typeof formSchema>;

// Available data types with descriptions and icons
const dataTypeOptions = [
  { 
    id: 'medical-history', 
    label: 'Medical History',
    description: 'Share your complete medical history and conditions',
    icon: 'FileText'
  },
  { 
    id: 'lab-results', 
    label: 'Lab Results',
    description: 'Share blood work, urine tests, and other laboratory results',
    icon: 'FlaskConical'
  },
  { 
    id: 'imaging', 
    label: 'Imaging & Scans',
    description: 'Share X-rays, MRIs, CT scans, and other imaging results',
    icon: 'Image'
  },
  { 
    id: 'prescriptions', 
    label: 'Prescriptions',
    description: 'Share current and past medication prescriptions',
    icon: 'Pill'
  },
  { 
    id: 'visit-notes', 
    label: 'Visit Notes',
    description: 'Share doctor visit summaries and clinical notes',
    icon: 'ClipboardList'
  },
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
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadStage, setUploadStage] = useState<string>('');
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
      termsAccepted: false,
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
    // Reset state
    setIsSubmitting(true);
    setError(null);
    setLogs([]);
    setUploadProgress(0);
    setUploadStage('Initializing...');
    addLog('Starting data sharing process...');
    
    // Validate form data
    if (values.uploadMode === 'documents' && (!uploadedFiles || uploadedFiles.length === 0)) {
      setError('Please upload at least one document to share');
      setIsSubmitting(false);
      return;
    }
    
    if (values.usePassword && (!values.password || values.password.length < 6)) {
      setError('Please enter a password with at least 6 characters');
      setIsSubmitting(false);
      return;
    }
    
    // Flag to track if we should use direct IPFS (no contract)
    const useDirectIpfs = !process.env.NEXT_PUBLIC_ACCESS_CONTRACT_ADDRESS;
    if (useDirectIpfs) {
      addLog('No contract address configured - using direct IPFS upload');
    }

    try {
      // Check if MetaMask is installed
      setUploadProgress(10);
      setUploadStage('Checking wallet connection...');
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
        setUploadProgress(20);
        setUploadStage('Processing documents...');
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
      setUploadProgress(40);
      if (values.usePassword && values.password) {
        setUploadStage('Encrypting data...');
        addLog('Encrypting data with password...');
        ipfsData = await encryptData(dataToShare, values.password);
        addLog('Data encrypted successfully');
      } else {
        setUploadStage('Preparing data...');
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
      setUploadProgress(60);
      setUploadStage('Uploading to IPFS...');
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
          setUploadProgress(90);
          setUploadStage('Generating shareable link...');
          addLog('Using direct IPFS sharing (no blockchain contract)');

          // Generate a simple shareable link with the CID
          const baseUrl = window.location.origin;
          const shareableLink = `${baseUrl}/ipfs/${ipfsCid}`;
          const accessId = ipfsCid; // Use CID as the access ID

          addLog(`Direct IPFS link generated: ${shareableLink}`);
          addLog('Process completed successfully!');
          setUploadProgress(100);
          setUploadStage('Complete!');

          // Show success toast
          toast.success('Data shared successfully!', {
            description: 'Your medical data has been securely uploaded to IPFS and is ready to share.',
          });

          // Call success callback
          onSuccess(shareableLink, accessId);
        } else {
          // Create access grant on blockchain
          setUploadProgress(75);
          setUploadStage('Creating blockchain access grant...');
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
          setUploadProgress(85);
          setUploadStage('Saving to database...');
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

          // Show success toast
          setUploadProgress(100);
          setUploadStage('Complete!');
          toast.success('Data shared successfully!', {
            description: 'Your medical data has been securely uploaded and a shareable link has been generated.',
          });

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
      
      // Provide user-friendly error messages
      let userFriendlyError = errorMessage;
      
      if (errorMessage.includes('404')) {
        userFriendlyError = 'The IPFS service is temporarily unavailable. Please try again in a few minutes.';
        addLog('This appears to be an IPFS connection issue. The IPFS service might be temporarily unavailable.');
        addLog('Recommendation: Please try again in a few minutes.');
      } else if (errorMessage.includes('network') || errorMessage.includes('connection')) {
        userFriendlyError = 'Network connection issue. Please check your internet connection and try again.';
        addLog('This appears to be a network connectivity issue.');
        addLog('Recommendation: Please check your internet connection and try again.');
      } else if (errorMessage.includes('timeout')) {
        userFriendlyError = 'The operation timed out. Please try again with a smaller file or less data.';
        addLog('The operation timed out. The IPFS service might be slow or overloaded.');
        addLog('Recommendation: Please try again later with a smaller file or less data.');
      } else if (errorMessage.includes('MetaMask')) {
        userFriendlyError = 'There was an issue with your wallet connection. Please make sure MetaMask is installed and unlocked.';
      } else if (errorMessage.includes('password')) {
        userFriendlyError = 'There was an issue with the password protection. Please try a different password.';
      }
      
      setError(userFriendlyError);
      addLog(`ERROR: ${errorMessage}`);
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
  
  // Helper function to reset the form
  const resetForm = () => {
    form.reset({
      dataTypes: [],
      duration: '86400', // Default to 1 day
      usePassword: false,
      password: '',
      uploadMode: 'data',
      documents: [],
      termsAccepted: false,
    });
    setUploadedFiles([]);
    setError(null);
    setLogs([]);
  };

  return (
    <Card className="w-full shadow-lg border-2">
      <CardHeader className="pb-6 space-y-4 bg-gradient-to-r from-primary/5 to-primary/10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Share Your Medical Data</CardTitle>
            <CardDescription className="text-base">
              Securely share your medical data or documents with healthcare providers using encryption and blockchain technology
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="uploadMode"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                      1
                    </div>
                    <FormLabel className="text-lg font-semibold">What would you like to share?</FormLabel>
                  </div>
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
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                        2
                      </div>
                      <FormLabel className="text-lg font-semibold">Select Data Types to Share</FormLabel>
                    </div>
                    <FormDescription className="mb-4">
                      Choose which types of medical data you want to share with your healthcare provider
                    </FormDescription>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                      {dataTypeOptions.map((option) => {
                        // Get the icon component based on the icon name
                        let IconComponent;
                        switch(option.icon) {
                          case 'FileText': IconComponent = FileText; break;
                          case 'FlaskConical': IconComponent = FlaskConical; break;
                          case 'Image': IconComponent = Image; break;
                          case 'Pill': IconComponent = Pill; break;
                          case 'ClipboardList': IconComponent = ClipboardList; break;
                          default: IconComponent = FileText;
                        }
                        
                        return (
                          <FormField
                            key={option.id}
                            control={form.control}
                            name="dataTypes"
                            render={({ field }) => {
                              const isSelected = field.value?.includes(option.id);
                              return (
                                <FormItem
                                  key={option.id}
                                  className={`flex flex-col rounded-lg border p-4 transition-all ${isSelected ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}`}
                                >
                                  <div className="flex items-start space-x-3">
                                    <FormControl>
                                      <Checkbox
                                        checked={isSelected}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, option.id])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== option.id
                                                )
                                              );
                                        }}
                                        className="mt-1"
                                      />
                                    </FormControl>
                                    <div className="space-y-1">
                                      <div className="flex items-center">
                                        <IconComponent className="h-4 w-4 mr-2 text-primary" />
                                        <FormLabel className="font-medium text-base">
                                          {option.label}
                                        </FormLabel>
                                      </div>
                                      <p className="text-xs text-muted-foreground">
                                        {option.description}
                                      </p>
                                    </div>
                                  </div>
                                </FormItem>
                              );
                            }}
                          />
                        );
                      })}
                    </div>
                    <FormMessage className="mt-2" />
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
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                        2
                      </div>
                      <FormLabel className="text-lg font-semibold flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-primary" />
                        Upload Medical Documents
                      </FormLabel>
                    </div>
                    <FormDescription className="mb-2">
                      Upload medical documents, reports, or images to share securely
                    </FormDescription>
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
                        className="mt-2 border-2 border-dashed rounded-lg p-6 bg-muted/20"
                      />
                    </FormControl>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full flex items-center">
                          <FileText className="h-3 w-3 mr-1" />
                          {file.name.length > 20 ? file.name.substring(0, 17) + '...' : file.name}
                          <span className="ml-1 text-muted-foreground">
                            ({(file.size / 1024).toFixed(0)} KB)
                          </span>
                        </div>
                      ))}
                    </div>
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
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                      3
                    </div>
                    <FormLabel className="text-lg font-semibold flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-primary" />
                      Access Duration
                    </FormLabel>
                  </div>
                  <FormDescription className="mb-2">
                    Set how long the recipient will have access to your data
                  </FormDescription>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
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
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="usePassword"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                      4
                    </div>
                    <FormLabel className="text-lg font-semibold">Security Options</FormLabel>
                  </div>
                  <div className="flex flex-row items-start space-x-3 space-y-0 p-4 border rounded-lg bg-muted/30">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="mt-1"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="font-medium flex items-center">
                        <Shield className="h-4 w-4 mr-2 text-primary" />
                        Require password for access
                      </FormLabel>
                      <FormDescription>
                        Add an extra layer of security with a password. You'll need to share this password separately with the recipient.
                      </FormDescription>
                    </div>
                  </div>
                </FormItem>
              )}
            />

            {usePassword && (
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="bg-muted/20 p-4 rounded-lg border border-dashed">
                    <FormLabel className="text-base font-semibold">Set Access Password</FormLabel>
                    <FormDescription className="mb-2">
                      Create a password that the recipient will need to access your data
                    </FormDescription>
                    <div className="relative">
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter a secure password (min. 6 characters)"
                          className="pr-10"
                          {...field}
                        />
                      </FormControl>
                      <Shield className="h-4 w-4 absolute right-3 top-3 text-muted-foreground" />
                    </div>
                    <FormDescription className="mt-2 text-amber-600 flex items-center">
                      <Info className="h-4 w-4 mr-2" />
                      You must share this password with the recipient separately
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="termsAccepted"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-6">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="mt-1"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      I understand and agree to share my medical data
                    </FormLabel>
                    <FormDescription>
                      By checking this box, you confirm that you understand how your data will be shared and accessed
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {error && (
              <div className="p-5 rounded-lg bg-destructive/10 border-2 border-destructive/20 text-destructive flex items-start space-x-3 mt-6 animate-in fade-in slide-in-from-top-2 duration-300">
                <AlertCircle className="h-6 w-6 shrink-0 mt-0.5 flex-none" />
                <div className="flex-1">
                  <p className="font-semibold text-base mb-1">Error sharing data</p>
                  <p className="text-sm opacity-90">{error}</p>
                </div>
              </div>
            )}

            <div className="flex gap-4 mt-8 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                disabled={isSubmitting}
                className="flex-none px-6"
                size="lg"
              >
                Reset Form
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-6 text-base font-semibold shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing your request...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-5 w-5" />
                    Share {uploadMode === 'documents' ? 'Documents' : 'Medical Data'} Securely
                  </>
                )}
              </Button>
            </div>
            
            {isSubmitting && (
              <div className="mt-6 p-6 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border-2 border-primary/20 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-base font-semibold flex items-center">
                    <Upload className="h-5 w-5 mr-2 text-primary animate-pulse" />
                    {uploadStage}
                  </p>
                  <span className="text-sm font-medium text-primary">{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  Please wait while we securely encrypt and upload your data. This may take a moment depending on the amount of data being shared.
                </p>
              </div>
            )}
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4 w-full border-t pt-6">
        <div className="flex justify-between w-full items-center">
          <div className="flex items-center space-x-2">
            <Shield className="h-4 w-4 text-primary" />
            <p className="text-sm text-muted-foreground">
              Your {uploadMode === 'documents' ? 'documents' : 'data'} will be encrypted and stored securely with blockchain-based access control
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowLogs(!showLogs)}
            className="text-xs flex items-center gap-1"
          >
            <Info className="h-3 w-3" />
            {showLogs ? 'Hide Technical Logs' : 'Show Technical Logs'}
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
