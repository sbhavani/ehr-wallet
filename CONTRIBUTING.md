# Contributing to Radiant Flow Imaging Hub

Thank you for your interest in contributing to the Radiant Flow Imaging Hub! This document provides guidelines and instructions for contributing to this project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
  - [Setting up the Development Environment](#setting-up-the-development-environment)
  - [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
  - [Branching Strategy](#branching-strategy)
  - [Commit Messages](#commit-messages)
  - [Pull Requests](#pull-requests)
- [Testing](#testing)
- [Documentation](#documentation)
- [Web3 Development Guidelines](#web3-development-guidelines)

## Code of Conduct

By participating in this project, you are expected to uphold our Code of Conduct. Please report unacceptable behavior to [project-admin@example.com].

## Getting Started

### Setting up the Development Environment

1. Fork and clone the repository:
   ```bash
   git clone https://github.com/[your-username]/radiant-flow-imaging-hub.git
   cd radiant-flow-imaging-hub
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your local configuration
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

### Project Structure

- `/app`: Next.js application routes
- `/components`: Reusable React components
- `/lib`: Utility functions and shared code
- `/prisma`: Database schema and migrations
- `/public`: Static assets
- `/styles`: Global CSS and styling utilities
- `/web3`: Smart contracts and blockchain interactions

## Development Workflow

### Branching Strategy

We follow a simplified Git flow:

- `main`: Reflects the production state
- `develop`: Integration branch for features
- Feature branches: `feature/[feature-name]`
- Bug fix branches: `fix/[bug-name]`

### Commit Messages

Please follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

Types include:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style/formatting changes
- `refactor`: Code refactoring
- `test`: Adding or modifying tests
- `chore`: Changes to build process or tools

### Pull Requests

1. Pull requests should target the `develop` branch.
2. Ensure your code passes all tests.
3. Update documentation as needed.
4. Request reviews from maintainers.

## Testing

- Write tests for all new features and bug fixes.
- Run tests locally before submitting a PR:
  ```bash
  npm test
  ```

## Documentation

- Update README.md for user-facing changes.
- Document code with appropriate JSDoc comments.
- Update API documentation for any changes to backend services.

## Web3 Development Guidelines

For Web3 features (patient data sharing, wallet integration, etc.):

1. Smart Contracts:
   - Follow the [Solidity Style Guide](https://docs.soliditylang.org/en/v0.8.15/style-guide.html)
   - Include thorough comments
   - Implement proper access control

2. Wallet Integration:
   - Support MetaMask (primary)
   - Follow security best practices for key management

3. IPFS Storage:
   - Document the IPFS schema for stored data
   - Implement proper encryption for sensitive data

Thank you for helping to improve the Radiant Flow Imaging Hub!
