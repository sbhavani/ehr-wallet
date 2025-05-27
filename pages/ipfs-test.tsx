'use client';

import { useState } from 'react';
import { uploadToIpfs, getFromIpfs, encryptData, decryptData } from '@/lib/web3/ipfs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function IpfsTestPage() {
  const [testData, setTestData] = useState({ message: 'Hello from Helia!', timestamp: new Date().toISOString(), testNumber: 42 });
  const [cid, setCid] = useState('');
  const [retrievedData, setRetrievedData] = useState<any>(null);
  const [encryptedCid, setEncryptedCid] = useState('');
  const [password, setPassword] = useState('test-password-123');
  const [decryptedData, setDecryptedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const handleUpload = async () => {
    setLoading(true);
    setError('');
    try {
      addLog('Uploading to IPFS...');
      const result = await uploadToIpfs(testData);
      setCid(result);
      addLog(`Upload successful! CID: ${result}`);
    } catch (err: any) {
      setError(`Upload error: ${err.message}`);
      addLog(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRetrieve = async () => {
    if (!cid) {
      setError('No CID available. Please upload data first.');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      addLog(`Retrieving data from CID: ${cid}`);
      const data = await getFromIpfs(cid);
      setRetrievedData(data);
      addLog('Data retrieved successfully!');
    } catch (err: any) {
      setError(`Retrieval error: ${err.message}`);
      addLog(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEncryptedUpload = async () => {
    setLoading(true);
    setError('');
    try {
      addLog(`Encrypting data with password: ${password}`);
      const encrypted = await encryptData(testData, password);
      addLog('Data encrypted, uploading to IPFS...');
      const result = await uploadToIpfs(encrypted);
      setEncryptedCid(result);
      addLog(`Encrypted upload successful! CID: ${result}`);
    } catch (err: any) {
      setError(`Encrypted upload error: ${err.message}`);
      addLog(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDecryptedRetrieve = async () => {
    if (!encryptedCid) {
      setError('No encrypted CID available. Please upload encrypted data first.');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      addLog(`Retrieving encrypted data from CID: ${encryptedCid}`);
      const encryptedData = await getFromIpfs(encryptedCid);
      addLog('Encrypted data retrieved, decrypting...');
      const decrypted = await decryptData(encryptedData, password);
      setDecryptedData(decrypted);
      addLog('Data decrypted successfully!');
    } catch (err: any) {
      setError(`Decryption error: ${err.message}`);
      addLog(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">IPFS Helia Test Page</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Test Data</CardTitle>
            <CardDescription>Data to be uploaded to IPFS</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded">{JSON.stringify(testData, null, 2)}</pre>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button onClick={handleUpload} disabled={loading}>
              {loading ? 'Uploading...' : 'Upload to IPFS'}
            </Button>
            <Button variant="outline" onClick={handleRetrieve} disabled={!cid || loading}>
              {loading ? 'Retrieving...' : 'Retrieve Data'}
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Retrieved Data</CardTitle>
            <CardDescription>CID: {cid || 'Not uploaded yet'}</CardDescription>
          </CardHeader>
          <CardContent>
            {retrievedData ? (
              <pre className="bg-gray-100 p-4 rounded">{JSON.stringify(retrievedData, null, 2)}</pre>
            ) : (
              <p>No data retrieved yet</p>
            )}
          </CardContent>
          <CardFooter>
            {retrievedData && (
              <div className="w-full">
                <p className="text-sm">
                  Data integrity check: 
                  <span className={JSON.stringify(testData) === JSON.stringify(retrievedData) ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                    {JSON.stringify(testData) === JSON.stringify(retrievedData) ? ' PASSED ✅' : ' FAILED ❌'}
                  </span>
                </p>
              </div>
            )}
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Encrypted Upload</CardTitle>
            <CardDescription>Encrypt data before uploading</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Encryption Password</Label>
                <Input 
                  id="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="Enter password for encryption"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button onClick={handleEncryptedUpload} disabled={loading}>
              {loading ? 'Processing...' : 'Encrypt & Upload'}
            </Button>
            <Button variant="outline" onClick={handleDecryptedRetrieve} disabled={!encryptedCid || loading}>
              {loading ? 'Processing...' : 'Retrieve & Decrypt'}
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Decrypted Data</CardTitle>
            <CardDescription>CID: {encryptedCid || 'Not uploaded yet'}</CardDescription>
          </CardHeader>
          <CardContent>
            {decryptedData ? (
              <pre className="bg-gray-100 p-4 rounded">{JSON.stringify(decryptedData, null, 2)}</pre>
            ) : (
              <p>No decrypted data yet</p>
            )}
          </CardContent>
          <CardFooter>
            {decryptedData && (
              <div className="w-full">
                <p className="text-sm">
                  Data integrity check: 
                  <span className={JSON.stringify(testData) === JSON.stringify(decryptedData) ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                    {JSON.stringify(testData) === JSON.stringify(decryptedData) ? ' PASSED ✅' : ' FAILED ❌'}
                  </span>
                </p>
              </div>
            )}
          </CardFooter>
        </Card>
      </div>
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Test Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-black text-green-400 p-4 rounded font-mono text-sm h-64 overflow-y-auto">
            {logs.length > 0 ? (
              logs.map((log, index) => <div key={index}>{log}</div>)
            ) : (
              <p>No logs yet. Run tests to see logs.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
