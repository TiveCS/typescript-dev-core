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

This project uses GitHub Actions to automatically publish to npm when changes are pushed to the main branch.

### Initial Setup

To enable automatic publishing, configure an NPM_TOKEN secret in your GitHub repository:

1. **Generate an npm access token**:
   - Log in to [npmjs.com](https://www.npmjs.com/)
   - Go to your profile settings → Access Tokens
   - Click "Generate New Token" → "Classic Token"
   - Select "Automation" type
   - Copy the generated token

2. **Add the token to GitHub**:
   - Go to your GitHub repository → Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `NPM_TOKEN`
   - Value: Paste your npm token
   - Click "Add secret"

### Publish Workflow

The publish workflow (`.github/workflows/publish.yml`) automatically:

1. Triggers on every push to the `main` branch
2. Runs linting checks
3. Builds the package
4. Checks if the current version already exists on npm
5. Publishes to npm (only if the version is new)

**Important**: Remember to bump the version in `package.json` before merging to main if you want to publish a new version.

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
