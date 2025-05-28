import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { pinataService } from '@/lib/web3/pinata';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Check if user is authenticated
  const session = await getServerSession(req, res, authOptions);
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Only GET method is allowed
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the user's ethereum address from the session
    const user = await prisma.user.findUnique({
      where: {
        email: session.user?.email as string,
      },
      select: {
        ethereumAddress: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // If user doesn't have an ethereum address, return empty array
    if (!user.ethereumAddress) {
      return res.status(200).json([]);
    }

    // Fetch shared medical data records for this user
    const sharedData = await prisma.sharedMedicalData.findMany({
      where: {
        userId: user.ethereumAddress,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Extract CIDs from the shared data
    const cids = sharedData.map(data => data.ipfsCid);
    
    // If no CIDs, return empty array
    if (cids.length === 0) {
      return res.status(200).json([]);
    }

    // Get access logs from Pinata for these CIDs
    const pinataLogs = await pinataService.getAccessLogs(cids);
    
    // Map Pinata logs to shared data records
    const accessLogs = sharedData.map(data => {
      // Find the Pinata log for this CID
      const pinataLog = pinataLogs.find(log => log.cid === data.ipfsCid) || {
        estimatedAccessCount: 0,
        pinDate: data.createdAt,
        status: 'unknown'
      };
      
      // Parse dataTypes from comma-separated string to array
      const dataTypes = data.dataTypes ? data.dataTypes.split(',') : [];
      
      return {
        id: data.accessId,
        accessedBy: data.userId, // This is actually the owner, in a real blockchain implementation this would be different
        accessedAt: data.createdAt,
        dataTypes: dataTypes,
        ipfsCid: data.ipfsCid,
        status: data.isActive && new Date() < data.expiryTime ? 'active' : 'expired',
        expiryTime: data.expiryTime,
        accessCount: pinataLog.estimatedAccessCount || data.accessCount || 0,
        pinDate: pinataLog.pinDate || data.createdAt,
        pinStatus: pinataLog.status || 'unknown'
      };
    });

    return res.status(200).json(accessLogs);
  } catch (error) {
    console.error('Error fetching Pinata access logs:', error);
    return res.status(500).json({ error: 'Failed to fetch access logs from Pinata' });
  }
}
