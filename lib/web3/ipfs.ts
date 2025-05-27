'use client';

import { createHelia } from 'helia';
import { unixfs } from '@helia/unixfs';
import { CID } from 'multiformats/cid';
import { base58btc } from 'multiformats/bases/base58';
import { json } from '@helia/json';

// Create a Helia instance
let heliaInstance: any = null;

const createHeliaClient = async () => {
  if (heliaInstance) {
    return heliaInstance;
  }

  const projectId = process.env.NEXT_PUBLIC_IPFS_PROJECT_ID;
  const projectSecret = process.env.NEXT_PUBLIC_IPFS_PROJECT_SECRET;
  
  // Configure Helia with authentication if credentials are available
  const options: any = {};
  
  if (projectId && projectSecret) {
    // Note: Helia has a different configuration approach
    // This is a simplified example - you may need to adjust based on your IPFS provider
    options.headers = {
      authorization: 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64')
    };
  }
  
  try {
    heliaInstance = await createHelia(options);
    return heliaInstance;
  } catch (error) {
    console.error('Error creating Helia instance:', error);
    throw new Error('Failed to initialize Helia');
  }
};

// Upload data to IPFS using Helia
export const uploadToIpfs = async (data: any): Promise<string> => {
  try {
    const helia = await createHeliaClient();
    const jsonStorage = json(helia);
    
    // Add content to IPFS
    const cid = await jsonStorage.add(data);
    
    // Return the CID (Content Identifier) as a string
    return cid.toString();
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    throw error;
  }
};

// Retrieve data from IPFS using Helia
export const getFromIpfs = async (cidString: string): Promise<any> => {
  try {
    const helia = await createHeliaClient();
    const jsonStorage = json(helia);
    
    // Parse the CID string
    const cid = CID.parse(cidString);
    
    // Get content from IPFS
    const content = await jsonStorage.get(cid);
    return content;
  } catch (error) {
    console.error('Error retrieving from IPFS:', error);
    throw error;
  }
};

// Get IPFS gateway URL for a CID
export const getIpfsGatewayUrl = (cid: string): string => {
  const gatewayUrl = process.env.NEXT_PUBLIC_IPFS_GATEWAY_URL || 'https://ipfs.io/ipfs';
  return `${gatewayUrl}/${cid}`;
};

// Encrypt data before uploading to IPFS
export const encryptData = async (data: any, password: string): Promise<string> => {
  // This is a simple encryption for demo purposes
  // In production, use a proper encryption library
  
  // Convert data to JSON string
  const jsonData = typeof data === 'object' ? JSON.stringify(data) : data;
  
  // Convert password to key using subtle crypto
  const encoder = new TextEncoder();
  const keyData = await crypto.subtle.digest(
    'SHA-256',
    encoder.encode(password)
  );
  
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  );
  
  // Create initialization vector
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  // Encrypt the data
  const encryptedData = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv
    },
    key,
    encoder.encode(jsonData)
  );
  
  // Combine IV and encrypted data
  const encryptedArray = new Uint8Array(iv.length + encryptedData.byteLength);
  encryptedArray.set(iv, 0);
  encryptedArray.set(new Uint8Array(encryptedData), iv.length);
  
  // Convert to base64 for storage
  return btoa(String.fromCharCode(...encryptedArray));
};

// Decrypt data retrieved from IPFS
export const decryptData = async (encryptedData: string, password: string): Promise<any> => {
  // Convert from base64
  const encryptedArray = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
  
  // Extract IV and data
  const iv = encryptedArray.slice(0, 12);
  const data = encryptedArray.slice(12);
  
  // Convert password to key
  const encoder = new TextEncoder();
  const keyData = await crypto.subtle.digest(
    'SHA-256',
    encoder.encode(password)
  );
  
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'AES-GCM' },
    false,
    ['decrypt']
  );
  
  // Decrypt the data
  const decryptedData = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv
    },
    key,
    data
  );
  
  // Convert to string
  const decryptedString = new TextDecoder().decode(decryptedData);
  
  // Try to parse as JSON, return as string if not valid JSON
  try {
    return JSON.parse(decryptedString);
  } catch {
    return decryptedString;
  }
};
