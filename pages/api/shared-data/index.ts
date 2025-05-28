import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Get the session to check authentication
  const session = await getServerSession(req, res, authOptions);
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Handle different HTTP methods
  switch (req.method) {
    case 'GET':
      return getSharedData(req, res, session);
    case 'POST':
      return createSharedData(req, res, session);
    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}

// Get shared data records for the current user
async function getSharedData(
  req: NextApiRequest,
  res: NextApiResponse,
  session: any
) {
  try {
    // Get the user's ethereum address from the session or query parameter
    let ethereumAddress = session.user?.ethereumAddress;
    
    // If not in session, try to get from query parameter
    if (!ethereumAddress && req.query.address) {
      ethereumAddress = req.query.address as string;
    }
    
    if (!ethereumAddress) {
      return res.status(400).json({ error: 'No ethereum address associated with this account or provided in the request' });
    }
    
    // Normalize the ethereum address to lowercase for consistency
    const normalizedAddress = ethereumAddress.toLowerCase();
    
    // Query the database for shared data records
    const sharedData = await prisma.sharedMedicalData.findMany({
      where: {
        userId: normalizedAddress,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    return res.status(200).json(sharedData);
  } catch (error) {
    console.error('Error fetching shared data:', error);
    return res.status(500).json({ error: 'Failed to fetch shared data' });
  }
}

// Create a new shared data record
async function createSharedData(
  req: NextApiRequest,
  res: NextApiResponse,
  session: any
) {
  try {
    const { 
      accessId, 
      ipfsCid, 
      expiryTime, 
      hasPassword, 
      dataTypes 
    } = req.body;
    
    // Validate required fields
    if (!accessId || !ipfsCid || !expiryTime) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Get the user's ethereum address from the session
    const ethereumAddress = session.user?.ethereumAddress;
    
    if (!ethereumAddress) {
      return res.status(400).json({ error: 'No ethereum address associated with this account' });
    }
    
    // Create the shared data record
    const sharedData = await prisma.sharedMedicalData.create({
      data: {
        accessId,
        ipfsCid,
        userId: ethereumAddress,
        expiryTime: new Date(expiryTime),
        hasPassword: hasPassword || false,
        dataTypes: Array.isArray(dataTypes) ? dataTypes.join(',') : dataTypes,
        accessCount: 0,
        isActive: true,
      },
    });
    
    return res.status(201).json(sharedData);
  } catch (error) {
    console.error('Error creating shared data:', error);
    return res.status(500).json({ error: 'Failed to create shared data' });
  }
}
