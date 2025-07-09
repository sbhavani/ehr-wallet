# Access Logs for Patient Data Sharing

This document explains how access logs work in the EHR Wallet application, including the implementation details, data flow, and technical architecture.

## 1. Overview

Access logs provide a transparent record of who has accessed a patient's shared medical data, when it was accessed, and what types of data were viewed. This feature is crucial for:

- Maintaining patient privacy and trust
- Complying with healthcare data regulations
- Providing an audit trail for data access
- Empowering patients with visibility into their data usage

The access logs system integrates with our Web3-based patient data sharing implementation, which uses Ethereum and IPFS for secure data storage and access control.

## 2. Technical Implementation

### 2.1. Data Model

Access logs are stored in the `SharedMedicalData` table in the database with the following key fields:

```prisma
model SharedMedicalData {
  id              String    @id @default(cuid())
  accessId        String    @unique // The blockchain access ID or hash
  ipfsCid         String    // IPFS Content Identifier
  userId          String    // Owner's user ID or ethereum address
  createdAt       DateTime  @default(now())
  expiryTime      DateTime  // When the access expires
  hasPassword     Boolean   @default(false)
  accessCount     Int       @default(0)
  dataTypes       String?   // Comma-separated list of data types shared
  isActive        Boolean   @default(true)
}
```

Key fields for access tracking:
- `accessCount`: Tracks how many times the shared data has been accessed
- `accessId`: Unique identifier used in shareable links
- `ipfsCid`: IPFS Content Identifier pointing to the actual data
- `dataTypes`: Types of medical data that were shared
- `isActive`: Whether access is currently active or has been revoked

### 2.2. Access Recording Flow

When shared data is accessed, the following process occurs:

1. A user accesses the shared data via a unique URL (e.g., `/shared/[accessId]`)
2. The system verifies access permissions (checking expiry time and active status)
3. If access is granted, the data is fetched from IPFS using the stored CID
4. The system records this access by incrementing the `accessCount` in the database
5. The access is displayed in the patient's access logs dashboard

### 2.3. API Endpoints

The system uses several API endpoints to manage access logs:

#### Shared Data Access API

```typescript
// /api/shared-data/[id].ts
// Gets a specific shared data record and increments access count
async function getSharedDataById(req, res, id) {
  // Find the shared data record
  const sharedData = await prisma.sharedMedicalData.findUnique({
    where: { id },
  });
  
  // Check if expired
  if (now > sharedData.expiryTime) {
    return res.status(403).json({ error: 'Access has expired' });
  }
  
  // Increment the access count
  await prisma.sharedMedicalData.update({
    where: { id },
    data: { accessCount: { increment: 1 } },
  });
  
  return res.status(200).json(sharedData);
}
```

#### Record Access API

```typescript
// /api/shared-data/record-access.ts
// Dedicated endpoint for recording access events
export default async function handler(req, res) {
  const { accessId } = req.body;
  
  // Find the shared data record by accessId
  const sharedData = await prisma.sharedMedicalData.findFirst({
    where: { accessId },
  });
  
  // Check if expired or inactive
  if (now > sharedData.expiryTime || !sharedData.isActive) {
    return res.status(403).json({ error: 'Access has expired or is inactive' });
  }
  
  // Increment the access count
  const updatedData = await prisma.sharedMedicalData.update({
    where: { id: sharedData.id },
    data: { accessCount: { increment: 1 } },
  });
  
  return res.status(200).json({ 
    success: true, 
    accessCount: updatedData.accessCount 
  });
}
```

#### Access Logs API

```typescript
// /api/access-logs/index.ts
// Retrieves access logs for the current user
export default async function handler(req, res) {
  // Get the user's ethereum address from the session
  const user = await prisma.user.findUnique({
    where: { email: session.user?.email },
    select: { ethereumAddress: true },
  });
  
  // Fetch shared medical data records for this user
  const sharedData = await prisma.sharedMedicalData.findMany({
    where: { userId: user.ethereumAddress },
    orderBy: { createdAt: 'desc' },
  });
  
  // Transform the data to match the expected format
  const accessLogs = sharedData.map(data => ({
    id: data.accessId,
    accessedBy: data.userId,
    accessedAt: data.createdAt,
    dataTypes: data.dataTypes ? data.dataTypes.split(',') : [],
    ipfsCid: data.ipfsCid,
    status: data.isActive && new Date() < data.expiryTime ? 'active' : 'expired',
    accessCount: data.accessCount || 0,
    pinStatus: 'pinned'
  }));
  
  return res.status(200).json(accessLogs);
}
```

### 2.4. Pinata Integration

For enhanced access tracking, the system can optionally use Pinata's IPFS service to get additional metadata about file access:

```typescript
// lib/web3/pinata.ts
public async getCidStats(cid: string): Promise<any> {
  // Get pin details from Pinata
  const pinList = await this.getPinList(cid);
  
  // Extract metadata
  const pin = pinList.rows.find((row: any) => row.ipfs_pin_hash === cid);
  
  // Return statistics including estimated access count
  return {
    cid,
    name: pin.metadata?.name || 'Unknown',
    pinSize: pin.size || 0,
    pinDate: pin.date_pinned,
    status: pin.status,
    estimatedAccessCount: /* calculation based on pin data */
  };
}
```

## 3. Frontend Implementation

The access logs are displayed in a dedicated page at `/patient/access-logs`, which shows:

- Who accessed the data (Ethereum address)
- When it was accessed
- What types of data were accessed
- Whether access is still active or has expired
- How many times the data has been viewed

```tsx
// pages/patient/access-logs/index.tsx
export default function AccessLogsPage() {
  const [accessLogs, setAccessLogs] = useState<any[]>([]);
  
  // Load access logs from API
  useEffect(() => {
    const fetchAccessLogs = async () => {
      // Fetch data from shared-data API with all=true parameter
      const response = await fetch('/api/shared-data?all=true');
      const sharedData = await response.json();
      
      // Transform the shared data into access logs format
      const logs = sharedData.map((data: any) => {
        const dataTypes = data.dataTypes ? data.dataTypes.split(',') : [];
        return {
          id: data.accessId,
          accessedBy: data.userId,
          accessedAt: new Date(data.createdAt),
          dataTypes: dataTypes,
          ipfsCid: data.ipfsCid,
          status: data.isActive && new Date() < new Date(data.expiryTime) ? 'active' : 'expired',
          accessCount: data.accessCount || 0,
          pinStatus: 'pinned'
        };
      });
      
      setAccessLogs(logs);
    };

    fetchAccessLogs();
  }, []);
  
  // Render access logs table
  // ...
}
```

## 4. Revoking Access

Patients can revoke access to their shared data from the access logs page:

```typescript
// components/web3/SharedDataDashboard.tsx
const handleRevokeAccess = async (recordId: string) => {
  try {
    // First check if the record exists
    const checkResponse = await fetch(`/api/shared-data/${recordId}`, {
      method: 'GET',
    });
    
    // Update the record to revoke access
    const response = await fetch(`/api/shared-data/${recordId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: false }),
    });
    
    // Update the UI
    setSharedRecords(prevRecords => 
      prevRecords.map(record => 
        record.id === recordId ? { ...record, isActive: false } : record
      )
    );
  } catch (error) {
    console.error('Error revoking access:', error);
  }
};
```

## 5. Security Considerations

- **Privacy**: Access logs only show the Ethereum address that accessed the data, not personal information
- **Immutability**: Once recorded, access logs cannot be modified or deleted
- **Encryption**: The actual medical data remains encrypted on IPFS
- **Revocation**: Access can be revoked at any time, preventing further access
- **Expiry**: Access automatically expires after the specified duration

## 6. Future Enhancements

- **Real-time notifications**: Alert patients when their data is accessed
- **Detailed analytics**: Provide more detailed information about access patterns
- **Blockchain integration**: Store access logs directly on the blockchain for immutability
- **Consent management**: Allow patients to pre-approve specific providers
- **Access request workflow**: Enable providers to request access to specific data

## 7. Conclusion

The access logs system provides transparency and control over patient data sharing, enhancing privacy and trust in the Radiant Flow Imaging Hub. By leveraging our Web3 infrastructure with Ethereum and IPFS, we ensure that access to sensitive medical data is properly tracked, recorded, and can be audited when necessary.
