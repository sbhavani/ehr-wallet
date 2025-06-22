// test-setup.js
// This script runs before Jest tests to set up mocks and environment variables

// Add polyfills for crypto-related functionality needed by Hardhat/ethers
const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Set up crypto polyfills for Node.js environment
if (!global.crypto) {
  const nodeCrypto = require('crypto');
  
  global.crypto = {
    getRandomValues: function(buffer) {
      return nodeCrypto.randomFillSync(buffer);
    },
    subtle: {}
  };
}

// Mock browser environment for ethers.js
global.window = { crypto: global.crypto };
global.Buffer = global.Buffer || require('buffer').Buffer;

// Mock Prisma client to avoid actual database connections in CI
jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    sharedMedicalData: {
      findFirst: jest.fn().mockResolvedValue({
        id: 'mock-id',
        accessId: 'mock-access-id',
        ipfsCid: 'QmTest123',
        isActive: true,
        expiryTime: new Date(Date.now() + 86400000), // 1 day from now
        hasPassword: false,
        accessCount: 0
      }),
      update: jest.fn().mockResolvedValue({
        id: 'mock-id',
        accessCount: 1
      })
    },
    $connect: jest.fn().mockResolvedValue(true),
    $disconnect: jest.fn().mockResolvedValue(true)
  };

  return {
    PrismaClient: jest.fn(() => mockPrismaClient)
  };
});

// Set up environment variables if they're not already set
const requiredEnvVars = [
  'NEXT_PUBLIC_PINATA_API_KEY',
  'NEXT_PUBLIC_PINATA_SECRET_API_KEY',
  'NEXT_PUBLIC_PINATA_JWT',
  'DATABASE_URL',
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET'
];

requiredEnvVars.forEach(envVar => {
  if (!process.env[envVar]) {
    console.log(`Setting mock value for ${envVar}`);
    process.env[envVar] = `mock-${envVar.toLowerCase()}`;
  } else {
    console.log(`${envVar} is already set`);
  }
});

// Mock fetch to avoid actual network requests
global.fetch = jest.fn().mockImplementation((url) => {
  console.log(`Mocked fetch call to: ${url}`);
  return Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({ success: true, message: 'Mocked response' }),
    text: () => Promise.resolve('Mocked text response'),
    headers: {
      get: (header) => {
        if (header.toLowerCase() === 'content-type') return 'application/json';
        return null;
      }
    },
    clone: function() { return this; }
  });
});

// Mock AbortController
global.AbortController = class {
  constructor() {
    this.signal = { aborted: false };
    this.abort = jest.fn(() => {
      this.signal.aborted = true;
    });
  }
};

console.log('Test setup complete - environment and mocks are ready');
