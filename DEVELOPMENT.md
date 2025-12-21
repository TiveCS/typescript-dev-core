# Development Guide

This document contains information for maintainers and contributors to the `@tivecs/core` package.

## Prerequisites

- [Bun](https://bun.sh/) (latest version)
- [Node.js](https://nodejs.org/) 20+ (for npm publishing)
- npm account with publish access to `@tivecs` scope

## Setup

```bash
# Clone the repository
git clone https://github.com/TiveCS/typescript-dev-core.git
cd typescript-dev-core

# Install dependencies
bun install
```

## Development Commands

```bash
# Build the package
bun run build

# Lint the code
bun run lint

# Fix linting issues
bun run lint:fix
```

## Building

The build process uses Bun for bundling and TypeScript for generating declaration files:

```bash
bun run build
```

This runs:
1. `bun build ./index.ts --outdir ./dist --target node --format esm` - Bundles the code
2. `tsc --emitDeclarationOnly --outDir ./dist` - Generates TypeScript declaration files

The `prepublishOnly` script automatically runs the build before publishing.

## Version Management

Before publishing a new version, bump the version in `package.json`:

```bash
# Bump patch version (1.1.0 -> 1.1.1)
npm version patch

# Bump minor version (1.1.0 -> 1.2.0)
npm version minor

# Bump major version (1.1.0 -> 2.0.0)
npm version major
```

Commit the version bump:
```bash
git add package.json
git commit -m "Bump version to X.Y.Z"
git push
```

## CI/CD

This project uses GitHub Actions with **npm Trusted Publishers (OIDC)** to automatically publish to npm when changes are pushed to the main branch. This is more secure than using long-lived tokens.

### Initial Setup

**For first-time publishing**, you need to publish the package manually first, then configure Trusted Publishers for automatic future releases.

#### Step 1: First-time Manual Publish

1. **Generate a temporary Automation token**:
   - Log in to [npmjs.com](https://www.npmjs.com/)
   - Go to Profile → Access Tokens
   - Generate New Token → Classic Token → **Automation** type
   - Copy the token

2. **Publish manually from your local machine**:
   ```bash
   # Login with the token
   npm login
   # When prompted, use the token as your password

   # Publish the package
   npm publish --access public
   ```

3. **Delete the temporary token** after successful publish (for security)

#### Step 2: Configure Trusted Publisher for Future Releases

After the package exists on npm:

1. **Configure Trusted Publisher on npm**:
   - Go to your package page: [npmjs.com/package/@tivecs/core](https://www.npmjs.com/package/@tivecs/core)
   - Navigate to Settings → Publishing access → Trusted Publishers
   - Click "Add Trusted Publisher" → Select "GitHub Actions"
   - Fill in the details:
     - **Organization/User**: `TiveCS`
     - **Repository**: `typescript-dev-core`
     - **Workflow**: `publish.yml`
     - **Environment**: Leave blank
   - Click "Save changes"

2. **Verify workflow permissions**:
   - The workflow already has `id-token: write` permission configured
   - No secrets or tokens need to be configured in GitHub
   - npm CLI automatically detects OIDC and uses it for authentication

#### Step 3: Test Automatic Publishing

1. Bump the version: `npm version patch`
2. Commit and push to main
3. GitHub Actions will automatically publish the new version using OIDC

### Publish Workflow

The publish workflow (`.github/workflows/publish.yml`) automatically:

1. Triggers on every push to the `main` branch
2. Runs linting checks
3. Builds the package
4. Checks if the current version already exists on npm
5. Publishes to npm (only if the version is new)

**Important**: Remember to bump the version in `package.json` before merging to main if you want to publish a new version.

### Troubleshooting CI/CD

**Error: `EOTP - This operation requires a one-time password`**

This means Trusted Publishing is not configured. To fix:
1. Go to your package on [npmjs.com](https://www.npmjs.com/)
2. Navigate to Settings → Publishing access → Trusted Publishers
3. Add GitHub Actions as a trusted publisher with your repository details
4. Re-run the failed workflow

**Error: `E403 - You do not have permission to publish`**

Make sure:
- You have publish access to the `@tivecs` scope on npm
- The Trusted Publisher is configured correctly with the exact repository name
- The workflow file name matches what you configured (publish.yml)

**Error: `ENOTFOUND - Package not found`**

For first-time publishing:
1. You may need to create the package on npm first
2. Or publish manually once with an automation token, then configure Trusted Publishing for future releases

### Manual Publishing

If you need to publish manually:

```bash
# Build the package
bun run build

# Publish to npm
npm publish --access public
```

## Release Process

1. Make your changes and commit them
2. Update the version in `package.json` using `npm version`
3. Commit the version bump
4. Push to main: `git push`
5. GitHub Actions will automatically publish to npm
6. Verify the publish on [npmjs.com](https://www.npmjs.com/package/@tivecs/core)

## Project Structure

```
.
├── .github/
│   └── workflows/
│       └── publish.yml      # CI/CD workflow
├── models/                  # Model definitions
│   ├── error.model.ts       # Error types and constants
│   ├── pagination.model.ts  # Pagination utilities
│   ├── result.model.ts      # Result pattern implementation
│   └── index.ts             # Model exports
├── index.ts                 # Main entry point
├── package.json
├── tsconfig.json
└── README.md                # Public documentation
```

## Contributing

When contributing to this project:

1. Follow the existing code style
2. Run `bun run lint` before committing
3. Update README.md if adding new public APIs
4. Update this DEVELOPMENT.md if changing build/deploy processes
5. Bump the version appropriately (semantic versioning)
