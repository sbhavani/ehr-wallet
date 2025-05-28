'use client';

import axios from 'axios';
import FormData from 'form-data';

/**
 * Pinata IPFS service for uploading, pinning, and retrieving content
 */
export class PinataService {
  private apiKey: string | null;
  private secretApiKey: string | null;
  private jwt: string | null;
  private apiUrl: string;
  private gatewayUrl: string;

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_PINATA_API_KEY || null;
    this.secretApiKey = process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY || null;
    this.jwt = process.env.NEXT_PUBLIC_PINATA_JWT || null;
    this.apiUrl = 'https://api.pinata.cloud';
    this.gatewayUrl = process.env.NEXT_PUBLIC_PINATA_GATEWAY_URL || 'https://gateway.pinata.cloud/ipfs';
  }

  /**
   * Check if Pinata credentials are configured
   */
  public isConfigured(): boolean {
    return (this.apiKey !== null && this.secretApiKey !== null) || this.jwt !== null;
  }

  /**
   * Get authorization headers for Pinata API requests
   */
  private getAuthHeaders() {
    if (this.jwt) {
      return {
        Authorization: `Bearer ${this.jwt}`
      };
    }
    
    return {
      pinata_api_key: this.apiKey,
      pinata_secret_api_key: this.secretApiKey
    };
  }

  /**
   * Upload JSON data to IPFS via Pinata
   * @param jsonData - The JSON data to upload
   * @param name - Optional name for the file
   * @returns The CID of the uploaded content
   */
  public async uploadJSON(jsonData: any, name?: string): Promise<string> {
    try {
      if (!this.isConfigured()) {
        throw new Error('Pinata credentials not configured');
      }

      const data = JSON.stringify({
        pinataOptions: {
          cidVersion: 1
        },
        pinataMetadata: {
          name: name || `Upload-${Date.now()}`,
          keyvalues: {
            timestamp: Date.now().toString(),
            type: 'json'
          }
        },
        pinataContent: jsonData
      });

      const config = {
        method: 'post',
        url: 'https://api.pinata.cloud/pinning/pinJSONToIPFS',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders()
        },
        data: data
      };

      const response = await axios(config);
      return response.data.IpfsHash;
    } catch (error) {
      console.error('Error uploading JSON to Pinata:', error);
      throw new Error(`Failed to upload to Pinata: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Upload a file to IPFS via Pinata
   * @param file - The file to upload
   * @param name - Optional name for the file
   * @returns The CID of the uploaded content
   */
  public async uploadFile(file: File, name?: string): Promise<string> {
    try {
      if (!this.isConfigured()) {
        throw new Error('Pinata credentials not configured');
      }

      const formData = new FormData();
      
      // Append the file to the form data
      formData.append('file', file);
      
      // Add pinata metadata
      const metadata = JSON.stringify({
        name: name || file.name,
        keyvalues: {
          timestamp: Date.now().toString(),
          type: file.type,
          size: file.size.toString()
        }
      });
      formData.append('pinataMetadata', metadata);
      
      // Add pinata options
      const options = JSON.stringify({
        cidVersion: 1
      });
      formData.append('pinataOptions', options);

      const config = {
        method: 'post',
        url: 'https://api.pinata.cloud/pinning/pinFileToIPFS',
        headers: {
          ...this.getAuthHeaders(),
          'Content-Type': `multipart/form-data; boundary=${(formData as any)._boundary}`
        },
        data: formData
      };

      const response = await axios(config);
      return response.data.IpfsHash;
    } catch (error) {
      console.error('Error uploading file to Pinata:', error);
      throw new Error(`Failed to upload to Pinata: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Get content from IPFS via Pinata gateway
   * @param cid - The CID of the content to retrieve
   * @returns The content
   */
  public async getContent(cid: string): Promise<any> {
    try {
      // First try to get directly from Pinata gateway
      const response = await axios.get(`${this.gatewayUrl}/${cid}`);
      return response.data;
    } catch (error) {
      console.warn('Error retrieving from Pinata gateway, trying API:', error);
      
      // If direct gateway access fails, try the API
      try {
        if (!this.isConfigured()) {
          throw new Error('Pinata credentials not configured');
        }
        
        const config = {
          method: 'get',
          url: `https://api.pinata.cloud/pinning/pinJobs?ipfs_pin_hash=${cid}`,
          headers: this.getAuthHeaders()
        };
        
        const pinStatusResponse = await axios(config);
        
        // If we can confirm it's pinned, try the gateway again with a different approach
        if (pinStatusResponse.data.rows && pinStatusResponse.data.rows.length > 0) {
          try {
            // Try with dag-json format for CIDv1
            const dagResponse = await axios.get(`${this.gatewayUrl}/${cid}?format=dag-json`);
            return dagResponse.data;
          } catch (formatError) {
            console.warn('Error retrieving with dag-json format:', formatError);
            
            // Try with raw format
            const rawResponse = await axios.get(`${this.gatewayUrl}/${cid}?format=raw`);
            return rawResponse.data;
          }
        }
        
        throw new Error(`Content with CID ${cid} not found in Pinata`);
      } catch (apiError) {
        console.error('Error retrieving from Pinata API:', apiError);
        throw new Error(`Failed to retrieve content from Pinata: ${apiError instanceof Error ? apiError.message : String(apiError)}`);
      }
    }
  }

  /**
   * Check if a CID is pinned on Pinata
   * @param cid - The CID to check
   * @returns Whether the CID is pinned
   */
  public async isPinned(cid: string): Promise<boolean> {
    try {
      if (!this.isConfigured()) {
        throw new Error('Pinata credentials not configured');
      }
      
      const config = {
        method: 'get',
        url: `https://api.pinata.cloud/pinning/pinJobs?ipfs_pin_hash=${cid}`,
        headers: this.getAuthHeaders()
      };
      
      const response = await axios(config);
      return response.data.rows && response.data.rows.length > 0;
    } catch (error) {
      console.error('Error checking pin status:', error);
      return false;
    }
  }

  /**
   * Unpin content from Pinata
   * @param cid - The CID to unpin
   * @returns Whether the operation was successful
   */
  public async unpin(cid: string): Promise<boolean> {
    try {
      if (!this.isConfigured()) {
        throw new Error('Pinata credentials not configured');
      }
      
      const config = {
        method: 'delete',
        url: `https://api.pinata.cloud/pinning/unpin/${cid}`,
        headers: this.getAuthHeaders()
      };
      
      await axios(config);
      return true;
    } catch (error) {
      console.error('Error unpinning content:', error);
      return false;
    }
  }

  /**
   * Get the gateway URL for a CID
   * @param cid - The CID
   * @returns The gateway URL
   */
  public getGatewayUrl(cid: string): string {
    return `${this.gatewayUrl}/${cid}`;
  }
}

// Create a singleton instance
export const pinataService = new PinataService();
