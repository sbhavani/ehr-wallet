# Testing Guide

## Running Tests Locally

To run the tests locally:

```bash
# Run all tests
npm test

# Run specific test files
npm test -- pages/api/ipfs/index.test.ts
npm test -- pages/api/ipfs/pinata-diagnostic/index.test.ts
```

## Environment Variables

The IPFS and Pinata tests require the following environment variables:

- `NEXT_PUBLIC_PINATA_API_KEY`: Your Pinata API key
- `NEXT_PUBLIC_PINATA_SECRET_API_KEY`: Your Pinata secret API key
- `NEXT_PUBLIC_PINATA_JWT`: Your Pinata JWT token

For local development, you can set these in a `.env.local` file:

```
NEXT_PUBLIC_PINATA_API_KEY=your_api_key
NEXT_PUBLIC_PINATA_SECRET_API_KEY=your_secret_key
NEXT_PUBLIC_PINATA_JWT=your_jwt_token
```

## GitHub Actions Setup

The repository includes a GitHub Actions workflow that runs tests automatically on push to main/master branches and on pull requests.

### Setting up GitHub Secrets

To run the tests in GitHub Actions without exposing your API keys, you need to add them as repository secrets:

1. Go to your GitHub repository
2. Click on "Settings" > "Secrets and variables" > "Actions"
3. Click "New repository secret"
4. Add each of your API keys as separate secrets:
   - `NEXT_PUBLIC_PINATA_API_KEY`
   - `NEXT_PUBLIC_PINATA_SECRET_API_KEY`
   - `NEXT_PUBLIC_PINATA_JWT`

The workflow in `.github/workflows/tests.yml` will automatically use these secrets when running tests.

## Test Structure

### IPFS API Tests (`/pages/api/ipfs/index.test.ts`)

Tests for the main IPFS API endpoint that handles:
- Method validation
- CID and accessId parameter handling
- Database lookups for shared medical data
- Content fetching from IPFS gateways
- Error scenarios
- Response format variations

### Pinata Diagnostic Tests (`/pages/api/ipfs/pinata-diagnostic/index.test.ts`)

Tests for the IPFS Pinata diagnostic API endpoint that handles:
- HTTP method validation
- CID parameter validation
- Pinata API calls using JWT and API keys
- IPFS gateway HEAD checks
- Success and failure response handling
- Network errors and exceptions

## Mocking Strategy

Both test files use similar mocking strategies:

1. **External API Calls**: All `fetch` calls are mocked to prevent actual network requests
2. **AbortController**: Mocked to handle timeout functionality
3. **Environment Variables**: Set to test values during tests
4. **Prisma Client**: Database operations are mocked
5. **Response Objects**: Custom `MockResponse` class with headers and clone method

This approach ensures tests are isolated, repeatable, and don't depend on external services.
