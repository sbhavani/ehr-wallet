# IPFS Helia Migration

## Overview

This document outlines the migration from the deprecated js-IPFS library to Helia, the recommended replacement for IPFS functionality in JavaScript applications. The migration was performed to address the following deprecation warning:

```
npm warn deprecated ipfs-core-utils@0.18.1: js-IPFS has been deprecated in favour of Helia - please see https://github.com/ipfs/js-ipfs/issues/4336 for details
```

## Changes Made

### Dependencies Updated

The following packages were added to replace the deprecated `ipfs-http-client`:

```json
{
  "dependencies": {
    "helia": "^5.4.2",
    "@helia/unixfs": "^1.4.3",
    "@helia/json": "^1.0.3",
    "multiformats": "^12.0.1"
  }
}
```

### Implementation Changes

The IPFS implementation in `/lib/web3/ipfs.ts` was updated to use Helia's API instead of the deprecated js-IPFS API. Key changes include:

1. **Client Creation**: Replaced `ipfs-http-client` with Helia's client creation approach
2. **Data Storage**: Implemented JSON-specific storage using `@helia/json`
3. **CID Handling**: Updated CID handling to use the `multiformats` library
4. **Singleton Pattern**: Implemented a singleton pattern for the Helia instance to improve performance

The migration maintains the same function signatures to ensure compatibility with existing code:

- `uploadToIpfs(data: any): Promise<string>`
- `getFromIpfs(cid: string): Promise<any>`
- `getIpfsGatewayUrl(cid: string): string`
- `encryptData(data: any, password: string): Promise<string>`
- `decryptData(encryptedData: string, password: string): Promise<any>`

## Testing

A dedicated test page was created to verify the Helia implementation:

- **Location**: `/pages/ipfs-test.tsx`
- **URL**: http://localhost:3003/ipfs-test (when running the development server)

### Test Page Features

The test page provides an interactive interface to verify all IPFS functionality:

1. **Basic IPFS Operations**:
   - Upload test data to IPFS using Helia
   - Retrieve data using the generated CID
   - Verify data integrity between original and retrieved data

2. **Encrypted IPFS Operations**:
   - Encrypt data with a password
   - Upload the encrypted data to IPFS
   - Retrieve and decrypt the data
   - Verify data integrity of the decrypted content

3. **Real-time Logs**:
   - The page displays a log of all operations for debugging

### How to Run Tests

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to http://localhost:3003/ipfs-test in your browser

3. Test basic IPFS operations:
   - Click "Upload to IPFS" to test uploading
   - After getting a CID, click "Retrieve Data" to test retrieval
   - Verify that the data integrity check shows "PASSED"

4. Test encrypted IPFS operations:
   - Enter a password (or use the default)
   - Click "Encrypt & Upload" to test encrypted uploading
   - After getting a CID, click "Retrieve & Decrypt" to test retrieval and decryption
   - Verify that the data integrity check shows "PASSED"

## Configuration

The Helia implementation maintains compatibility with the existing environment variables:

- `NEXT_PUBLIC_IPFS_PROJECT_ID`: Project ID for IPFS service (e.g., Infura)
- `NEXT_PUBLIC_IPFS_PROJECT_SECRET`: Project secret for IPFS service
- `NEXT_PUBLIC_IPFS_GATEWAY_URL`: IPFS gateway URL for accessing content (default: 'https://ipfs.io/ipfs')

## Troubleshooting

If you encounter issues with the Helia implementation:

1. **Authentication Issues**: If using Infura or another IPFS provider, ensure your authentication credentials are correctly configured in the environment variables.

2. **CID Format Issues**: Helia uses a different CID format by default. If you're having trouble with existing CIDs, you may need to convert them using the `CID.parse()` function.

3. **Browser Compatibility**: Ensure your target browsers support the Web Crypto API, which is used for encryption/decryption.

## References

- [Helia Documentation](https://github.com/ipfs/helia)
- [Migrating from js-IPFS to Helia](https://github.com/ipfs/helia/wiki/Migrating-from-js-IPFS)
- [Helia JSON API](https://github.com/ipfs/helia-json)
