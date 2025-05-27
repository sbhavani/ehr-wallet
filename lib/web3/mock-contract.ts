'use client';

import { v4 as uuidv4 } from 'uuid';

// Mock storage for access grants
interface AccessGrant {
  id: string;
  ipfsCid: string;
  owner: string;
  expiryTime: Date;
  hasPassword: boolean;
  passwordHash?: string;
  createdAt: Date;
}

// Use local storage to persist access grants
const getStoredGrants = (): AccessGrant[] => {
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem('mockAccessGrants');
  if (!stored) return [];
  
  try {
    return JSON.parse(stored);
  } catch (e) {
    console.error('Error parsing stored grants:', e);
    return [];
  }
};

const storeGrants = (grants: AccessGrant[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('mockAccessGrants', JSON.stringify(grants));
};

// Create a new access grant
export const mockCreateAccessGrant = async (
  ipfsCid: string,
  durationInSeconds: number,
  password?: string
): Promise<string> => {
  // Generate a unique ID for the access grant
  const accessId = uuidv4().replace(/-/g, '');
  
  // Calculate expiry time
  const expiryTime = new Date();
  expiryTime.setSeconds(expiryTime.getSeconds() + durationInSeconds);
  
  // Create the access grant
  const grant: AccessGrant = {
    id: accessId,
    ipfsCid,
    owner: 'mock-address-' + Math.random().toString(36).substring(2, 10),
    expiryTime,
    hasPassword: !!password,
    passwordHash: password ? btoa(password) : undefined,
    createdAt: new Date()
  };
  
  // Store the grant
  const grants = getStoredGrants();
  grants.push(grant);
  storeGrants(grants);
  
  // Log for debugging
  console.log('Created mock access grant:', grant);
  
  // Return the access ID
  return accessId;
};

// Verify access to a shared resource
export const mockVerifyAccess = async (
  accessId: string,
  password?: string
): Promise<string> => {
  const grants = getStoredGrants();
  const grant = grants.find(g => g.id === accessId);
  
  if (!grant) {
    throw new Error('Access grant not found');
  }
  
  // Check if expired
  if (grant.expiryTime < new Date()) {
    throw new Error('Access grant has expired');
  }
  
  // Check password if required
  if (grant.hasPassword && grant.passwordHash) {
    if (!password || btoa(password) !== grant.passwordHash) {
      throw new Error('Invalid password');
    }
  }
  
  return grant.ipfsCid;
};

// Get details about an access grant
export const mockGetAccessGrantDetails = async (
  accessId: string
): Promise<{
  owner: string;
  ipfsCid: string;
  expiryTime: Date;
  hasPassword: boolean;
}> => {
  const grants = getStoredGrants();
  const grant = grants.find(g => g.id === accessId);
  
  if (!grant) {
    throw new Error('Access grant not found');
  }
  
  return {
    owner: grant.owner,
    ipfsCid: grant.ipfsCid,
    expiryTime: grant.expiryTime,
    hasPassword: grant.hasPassword
  };
};

// Generate a shareable link for an access grant
export const mockGenerateShareableLink = (accessId: string): string => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/shared/${accessId}`;
};
