import { NextApiRequest, NextApiResponse } from 'next';
import handler from './index';

// Mock fetch
global.fetch = jest.fn();
const mockFetch = global.fetch as jest.Mock;

// Mock AbortController
global.AbortController = jest.fn().mockImplementation(() => ({
  signal: {},
  abort: jest.fn(),
}));

// Mock environment variables
const originalEnv = process.env;

describe('IPFS Pinata Diagnostic API Handler', () => {
  let req: Partial<NextApiRequest>;
  let res: Partial<NextApiResponse>;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset and create fresh mocks for each test
    req = {
      method: 'GET',
      query: {},
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Reset the fetch mock
    mockFetch.mockReset();
    
    // Setup environment variables for tests
    // Use GitHub Actions secrets if available, otherwise use test values
    process.env = { 
      ...originalEnv,
      NEXT_PUBLIC_PINATA_JWT: process.env.NEXT_PUBLIC_PINATA_JWT || 'test-jwt-token',
      NEXT_PUBLIC_PINATA_API_KEY: process.env.NEXT_PUBLIC_PINATA_API_KEY || 'test-api-key',
      NEXT_PUBLIC_PINATA_SECRET_API_KEY: process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY || 'test-secret-key'
    };
  });

  afterEach(() => {
    // Restore original env
    process.env = originalEnv;
  });

  it('should return 405 for non-GET requests', async () => {
    req.method = 'POST';
    
    await handler(req as NextApiRequest, res as NextApiResponse);
    
    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.json).toHaveBeenCalledWith({ error: 'Method not allowed' });
  });

  it('should return 400 if no CID is provided', async () => {
    req.query = {};
    
    await handler(req as NextApiRequest, res as NextApiResponse);
    
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Missing IPFS CID parameter' });
  });

  it('should check Pinata status with JWT token when available', async () => {
    // Mock successful pinata pin jobs response
    const mockPinJobsResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({
        rows: [{
          id: '123',
          pin_hash: 'QmTest123',
          status: 'pinned',
          created_at: '2023-01-01T00:00:00Z'
        }]
      }),
      text: jest.fn().mockResolvedValue('')
    };
    mockFetch.mockResolvedValueOnce(mockPinJobsResponse);
    
    // Mock successful gateway responses
    const mockGatewayResponse = {
      ok: true,
      status: 200,
      headers: {
        get: jest.fn().mockImplementation(name => {
          if (name.toLowerCase() === 'content-type') return 'text/plain';
          if (name.toLowerCase() === 'content-length') return '100';
          return null;
        })
      }
    };
    
    // Mock 4 successful gateway responses
    mockFetch.mockResolvedValueOnce(mockGatewayResponse);
    mockFetch.mockResolvedValueOnce(mockGatewayResponse);
    mockFetch.mockResolvedValueOnce(mockGatewayResponse);
    mockFetch.mockResolvedValueOnce(mockGatewayResponse);
    
    req.query = { cid: 'QmTest123' };
    
    await handler(req as NextApiRequest, res as NextApiResponse);
    
    // Should check Pinata status with JWT
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.pinata.cloud/pinning/pinJobs?ipfs_pin_hash=QmTest123',
      expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': 'Bearer test-jwt-token'
        })
      })
    );
    
    // Should return success status
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'success',
        cid: 'QmTest123',
        pinata: expect.objectContaining({
          status: 'pinned'
        }),
        ipfs: expect.objectContaining({
          status: 'available'
        })
      })
    );
  });

  it('should check Pinata status with API key when JWT is not available', async () => {
    // Remove JWT from env
    process.env.NEXT_PUBLIC_PINATA_JWT = '';
    
    // Mock successful pinata pin jobs response
    const mockPinJobsResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({
        rows: []
      }),
      text: jest.fn().mockResolvedValue('')
    };
    mockFetch.mockResolvedValueOnce(mockPinJobsResponse);
    
    // Mock successful pinata pin list response
    const mockPinListResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({
        rows: [{
          id: '123',
          ipfs_pin_hash: 'QmTest123',
          status: 'pinned',
          date_pinned: '2023-01-01T00:00:00Z'
        }]
      }),
      text: jest.fn().mockResolvedValue('')
    };
    mockFetch.mockResolvedValueOnce(mockPinListResponse);
    
    // Mock gateway responses (all failed)
    const mockFailedGatewayResponse = {
      ok: false,
      status: 404
    };
    mockFetch.mockResolvedValueOnce(mockFailedGatewayResponse);
    mockFetch.mockResolvedValueOnce(mockFailedGatewayResponse);
    mockFetch.mockResolvedValueOnce(mockFailedGatewayResponse);
    mockFetch.mockResolvedValueOnce(mockFailedGatewayResponse);
    
    req.query = { cid: 'QmTest123' };
    
    await handler(req as NextApiRequest, res as NextApiResponse);
    
    // Should check Pinata status with API keys
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.pinata.cloud/pinning/pinJobs?ipfs_pin_hash=QmTest123',
      expect.objectContaining({
        headers: expect.objectContaining({
          'pinata_api_key': 'test-api-key',
          'pinata_secret_api_key': 'test-secret-key'
        })
      })
    );
    
    // Should return success with pinned status but IPFS not found
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'success',
        cid: 'QmTest123',
        pinata: expect.objectContaining({
          status: 'pinned'
        }),
        ipfs: expect.objectContaining({
          status: 'not_found'
        })
      })
    );
  });

  it('should handle when Pinata credentials are not available', async () => {
    // Remove all Pinata credentials
    process.env.NEXT_PUBLIC_PINATA_JWT = '';
    process.env.NEXT_PUBLIC_PINATA_API_KEY = '';
    process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY = '';
    
    // Mock gateway responses
    const mockGatewayResponse = {
      ok: true,
      status: 200,
      headers: {
        get: jest.fn().mockImplementation(name => {
          if (name.toLowerCase() === 'content-type') return 'text/plain';
          if (name.toLowerCase() === 'content-length') return '100';
          return null;
        })
      }
    };
    mockFetch.mockResolvedValueOnce(mockGatewayResponse);
    mockFetch.mockResolvedValueOnce(mockGatewayResponse);
    mockFetch.mockResolvedValueOnce(mockGatewayResponse);
    mockFetch.mockResolvedValueOnce(mockGatewayResponse);
    
    req.query = { cid: 'QmTest123' };
    
    await handler(req as NextApiRequest, res as NextApiResponse);
    
    // Should not attempt to check Pinata status
    expect(mockFetch).not.toHaveBeenCalledWith(
      expect.stringContaining('api.pinata.cloud'),
      expect.anything(),
      expect.anything()
    );
    
    // Should return success with no_credentials for Pinata
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'success',
        cid: 'QmTest123',
        pinata: expect.objectContaining({
          status: 'no_credentials'
        }),
        ipfs: expect.objectContaining({
          status: 'available'
        })
      })
    );
  });

  it('should handle errors from Pinata API', async () => {
    // Mock failed pinata pin jobs response
    const mockPinJobsResponse = {
      ok: false,
      status: 500,
      text: jest.fn().mockResolvedValue('Internal server error')
    };
    mockFetch.mockResolvedValueOnce(mockPinJobsResponse);
    
    // Mock gateway responses
    const mockGatewayResponse = {
      ok: true,
      status: 200,
      headers: {
        get: jest.fn().mockImplementation(name => {
          if (name.toLowerCase() === 'content-type') return 'text/plain';
          if (name.toLowerCase() === 'content-length') return '100';
          return null;
        })
      }
    };
    mockFetch.mockResolvedValueOnce(mockGatewayResponse);
    mockFetch.mockResolvedValueOnce(mockGatewayResponse);
    mockFetch.mockResolvedValueOnce(mockGatewayResponse);
    mockFetch.mockResolvedValueOnce(mockGatewayResponse);
    
    req.query = { cid: 'QmTest123' };
    
    await handler(req as NextApiRequest, res as NextApiResponse);
    
    // Should return success with error for Pinata
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'success',
        cid: 'QmTest123',
        pinata: expect.objectContaining({
          status: 'error'
        }),
        ipfs: expect.objectContaining({
          status: 'available'
        })
      })
    );
  });

  it('should handle mixed gateway responses', async () => {
    // Mock successful pinata pin jobs response
    const mockPinJobsResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({
        rows: []
      }),
      text: jest.fn().mockResolvedValue('')
    };
    mockFetch.mockResolvedValueOnce(mockPinJobsResponse);
    
    // Mock failed pinata pin list response
    const mockPinListResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({
        rows: []
      }),
      text: jest.fn().mockResolvedValue('')
    };
    mockFetch.mockResolvedValueOnce(mockPinListResponse);
    
    // Mock mixed gateway responses
    const mockSuccessGatewayResponse = {
      ok: true,
      status: 200,
      headers: {
        get: jest.fn().mockImplementation(name => {
          if (name.toLowerCase() === 'content-type') return 'text/plain';
          if (name.toLowerCase() === 'content-length') return '100';
          return null;
        })
      }
    };
    const mockFailedGatewayResponse = {
      ok: false,
      status: 404
    };
    
    mockFetch.mockResolvedValueOnce(mockFailedGatewayResponse);  // ipfs.io fails
    mockFetch.mockResolvedValueOnce(mockSuccessGatewayResponse); // dweb.link succeeds
    mockFetch.mockResolvedValueOnce(mockFailedGatewayResponse);  // cloudflare fails
    mockFetch.mockResolvedValueOnce(mockSuccessGatewayResponse); // pinata gateway succeeds
    
    req.query = { cid: 'QmTest123' };
    
    await handler(req as NextApiRequest, res as NextApiResponse);
    
    // Should return success with not_pinned for Pinata and available for IPFS
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'success',
        cid: 'QmTest123',
        pinata: expect.objectContaining({
          status: 'not_pinned'
        }),
        ipfs: expect.objectContaining({
          status: 'available',
          gateways: expect.objectContaining({
            'ipfs.io': expect.objectContaining({ status: 'error' }),
            'dweb.link': expect.objectContaining({ status: 'available' }),
            'cloudflare-ipfs.com': expect.objectContaining({ status: 'error' }),
            'gateway.pinata.cloud': expect.objectContaining({ status: 'available' })
          })
        })
      })
    );
  });

  it('should handle network errors when checking gateways', async () => {
    // Mock successful pinata pin jobs response
    const mockPinJobsResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({
        rows: []
      }),
      text: jest.fn().mockResolvedValue('')
    };
    mockFetch.mockResolvedValueOnce(mockPinJobsResponse);
    
    // Mock failed pinata pin list response
    const mockPinListResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({
        rows: []
      }),
      text: jest.fn().mockResolvedValue('')
    };
    mockFetch.mockResolvedValueOnce(mockPinListResponse);
    
    // Mock network errors for gateways
    mockFetch.mockRejectedValueOnce(new Error('Network error'));
    mockFetch.mockRejectedValueOnce(new Error('Timeout'));
    mockFetch.mockRejectedValueOnce(new Error('Connection refused'));
    mockFetch.mockRejectedValueOnce(new Error('DNS resolution failed'));
    
    req.query = { cid: 'QmTest123' };
    
    await handler(req as NextApiRequest, res as NextApiResponse);
    
    // Should return success with not_pinned for Pinata and not_found for IPFS
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'success',
        cid: 'QmTest123',
        pinata: expect.objectContaining({
          status: 'not_pinned'
        }),
        ipfs: expect.objectContaining({
          status: 'not_found',
          gateways: expect.objectContaining({
            'ipfs.io': expect.objectContaining({ status: 'error' }),
            'dweb.link': expect.objectContaining({ status: 'error' }),
            'cloudflare-ipfs.com': expect.objectContaining({ status: 'error' }),
            'gateway.pinata.cloud': expect.objectContaining({ status: 'error' })
          })
        })
      })
    );
  });

  it('should handle unexpected errors during processing', async () => {
    // Force an error by making fetch throw
    mockFetch.mockImplementationOnce(() => {
      throw new Error('Unexpected error');
    });
    
    req.query = { cid: 'QmTest123' };
    
    await handler(req as NextApiRequest, res as NextApiResponse);
    
    // Should return success status with error details
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'success',
        cid: 'QmTest123',
        pinata: expect.objectContaining({
          status: 'error',
          details: expect.objectContaining({
            error: expect.stringContaining('Unexpected error')
          })
        })
      })
    );
  });
});
