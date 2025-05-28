import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only POST method is allowed
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { accessId } = req.body;
    
    if (!accessId || typeof accessId !== 'string') {
      return res.status(400).json({ error: 'Invalid access ID' });
    }

    // Find the shared data record by accessId
    const sharedData = await prisma.sharedMedicalData.findFirst({
      where: {
        accessId,
      },
    });
    
    if (!sharedData) {
      return res.status(404).json({ error: 'Shared data not found' });
    }
    
    // Check if the data has expired
    const now = new Date();
    if (now > sharedData.expiryTime || !sharedData.isActive) {
      return res.status(403).json({ error: 'Access has expired or is inactive' });
    }
    
    // Increment the access count
    const updatedData = await prisma.sharedMedicalData.update({
      where: {
        id: sharedData.id,
      },
      data: {
        accessCount: {
          increment: 1,
        },
      },
    });
    
    return res.status(200).json({ 
      success: true, 
      accessCount: updatedData.accessCount 
    });
  } catch (error) {
    console.error('Error recording access:', error);
    return res.status(500).json({ error: 'Failed to record access' });
  }
}
