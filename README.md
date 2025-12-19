# @tivecs/core

Core utilities and types for TiveCS projects, featuring a type-safe Result pattern for elegant error handling.

## Installation

```bash
# Using npm
npm install @tivecs/core

# Using bun
bun add @tivecs/core

# Using pnpm
pnpm add @tivecs/core

# Using yarn
yarn add @tivecs/core
```

## Features

- 🎯 **Result Pattern**: Type-safe error handling without exceptions (Railway-Oriented Programming)
- 🌐 **HTTP Status Constants**: All standard HTTP status codes with TypeScript support
- ⚠️ **Pre-defined Errors**: Common and authentication error types with consistent structure
- 🔧 **Helper Functions**: Utility functions including Zod integration
- 📦 **Zero Runtime Dependencies**: Only peer dependency on TypeScript

## Why Result Pattern?

The Result pattern helps you write more predictable and maintainable code by:
- ✅ Making error handling explicit and type-safe
- ✅ Avoiding try-catch blocks and exception throwing
- ✅ Forcing you to handle both success and failure cases
- ✅ Providing consistent error structure across your application

## Usage

### Result Pattern (Railway-Oriented Programming)

The Result pattern provides a type-safe way to handle operations that can succeed or fail, without throwing exceptions.

```typescript
import { Result, ok, failure, CommonErrors, AuthErrors } from '@tivecs/core';

// Define a function that returns a Result
function findUser(id: string): Result<User> {
  const user = database.findById(id);

  if (!user) {
    return failure(CommonErrors.ValidationError);
  }

  return ok(user);
}

// Handle the result
const result = findUser('123');

if (result.success) {
  console.log('User found:', result.data);
} else {
  console.log('Error:', result.code, result.description);
  // TypeScript knows result has: code, statusCode, description, fieldErrors
}
```

#### Success Results

```typescript
import { ok, SuccessResult } from '@tivecs/core';

// Success without data
function markAsRead(): Result<void> {
  // ... mark as read logic
  return ok();
}

// Success with data
function getUser(): Result<User> {
  const user = { id: '1', name: 'John' };
  return ok(user);
}
```

#### Failure Results

```typescript
import { failure, CommonErrors, AuthErrors, FailureResult } from '@tivecs/core';

// Using pre-defined errors
function authenticate(token: string): Result<User> {
  if (!token) {
    return failure(AuthErrors.Unauthorized);
  }

  if (isExpired(token)) {
    return failure(AuthErrors.TokenExpired);
  }

  return ok(user);
}

// With field errors
function validateInput(data: FormData): Result<ValidData> {
  const fieldErrors = {
    email: ['Invalid email format'],
    password: ['Password must be at least 8 characters']
  };

  return failure(CommonErrors.ValidationError, fieldErrors);
}
```

#### Validation with Zod

```typescript
import { validationError, Result } from '@tivecs/core';
import { z } from 'zod';

const UserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

function createUser(input: unknown): Result<User> {
  const parsed = UserSchema.safeParse(input);

  if (!parsed.success) {
    // Automatically converts Zod errors to field errors
    return validationError(parsed.error);
  }

  const user = saveUser(parsed.data);
  return ok(user);
}

// Result will have fieldErrors like:
// {
//   email: ['Invalid email'],
//   password: ['String must contain at least 8 character(s)']
// }
```

#### Using in API Routes

```typescript
import { Result, ok, failure, toFailureResponseStruct, HttpStatus } from '@tivecs/core';

// In your API handler
async function handler(req, res) {
  const result = await createUser(req.body);

  if (result.success) {
    return res.status(HttpStatus.Created).json(result.data);
  }

  // Convert failure to response structure (removes 'success' and 'statusCode')
  return res
    .status(result.statusCode)
    .json(toFailureResponseStruct(result));
}
```

### Pre-defined Error Types

#### Common Errors

```typescript
import { CommonErrors } from '@tivecs/core';

CommonErrors.ValidationError      // 422 - Validation errors occurred
CommonErrors.UnhandledError        // 500 - Unhandled error occurred
```

#### Authentication Errors

```typescript
import { AuthErrors } from '@tivecs/core';

AuthErrors.Unauthorized            // 401 - Authentication required
AuthErrors.Forbidden               // 403 - No permission
AuthErrors.CredentialsNotFound     // 404 - Credentials not found
AuthErrors.InvalidCredentials      // 401 - Invalid credentials
AuthErrors.DuplicateCredentials    // 409 - Credentials already exist
AuthErrors.AccountLocked           // 403 - Account locked
AuthErrors.TokenExpired            // 401 - Token expired
AuthErrors.TokenInvalid            // 401 - Token invalid
```

All errors follow a consistent structure:
```typescript
{
  code: string;           // e.g., "auth.unauthorized"
  statusCode: number;     // HTTP status code
  description: string;    // Human-readable message
}
```

### HTTP Status Constants

```typescript
import { HttpStatus } from '@tivecs/core';

// Use in your API responses
response.status(HttpStatus.Ok).json({ data });
response.status(HttpStatus.Created).json({ data });
response.status(HttpStatus.BadRequest).json({ error });
response.status(HttpStatus.Unauthorized).json({ error });
response.status(HttpStatus.NotFound).json({ error });
response.status(HttpStatus.UnprocessableEntity).json({ error });
response.status(HttpStatus.InternalServerError).json({ error });

// All standard HTTP status codes are available:
// 1xx Informational: Continue, SwitchingProtocols, Processing, EarlyHints
// 2xx Success: Ok, Created, Accepted, NoContent, PartialContent, etc.
// 3xx Redirection: MovedPermanently, Found, NotModified, TemporaryRedirect, etc.
// 4xx Client Errors: BadRequest, Unauthorized, Forbidden, NotFound, TooManyRequests, etc.
// 5xx Server Errors: InternalServerError, BadGateway, ServiceUnavailable, etc.
```

### Helper Functions

```typescript
import { isZodError } from '@tivecs/core';
import { ZodError } from 'zod';

// Type guard for Zod errors
try {
  // ...
} catch (error) {
  if (isZodError(error)) {
    // TypeScript knows error is ZodError
    console.log(error.issues);
  }
}
```

## API Reference

### Types

- `Result<T>` - Union type of SuccessResult<T> or FailureResult
- `SuccessResult<T>` - Success result with optional data
- `FailureResult` - Failure result with error information
- `ErrorModel` - Base error model structure
- `CommonError` - Common error type
- `AuthError` - Authentication error type

### Functions

- `ok()` - Create a success result without data
- `ok<T>(data: T)` - Create a success result with data
- `failure(error, fieldErrors?)` - Create a failure result
- `validationError(zodError | fieldErrors)` - Create validation failure from Zod error
- `toFailureResponseStruct(failResult)` - Convert failure to API response format
- `isZodError(error)` - Type guard for Zod errors

### Constants

- `HttpStatus` - All HTTP status codes
- `CommonErrors` - Pre-defined common errors
- `AuthErrors` - Pre-defined authentication errors

## Best Practices

1. **Always handle both cases**: When working with Results, use type narrowing to handle both success and failure
2. **Use pre-defined errors**: Leverage `CommonErrors` and `AuthErrors` for consistency
3. **Validate at boundaries**: Use `validationError()` with Zod at API boundaries
4. **Chain operations**: Return early with `failure()` for cleaner code
5. **Type your Results**: Always specify the success data type `Result<User>`

## Development

```bash
# Install dependencies
bun install

# Build the package
bun run build

# Lint the code
bun run lint

# Fix linting issues
bun run lint:fix
```

## License

MIT

## Author

TiveCS
