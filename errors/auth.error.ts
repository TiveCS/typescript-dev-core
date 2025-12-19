import { HttpStatus } from "../constants";
import type { ErrorModel } from "../models";

export type AuthError = ErrorModel & {
  code: `auth.${string}`;
};

export const AuthErrors = {
  Unauthorized: {
    code: "auth.unauthorized",
    statusCode: HttpStatus.Unauthorized,
    description: "Authentication is required to access this resource.",
  },
  Forbidden: {
    code: "auth.forbidden",
    statusCode: HttpStatus.Forbidden,
    description: "You do not have permission to access this resource.",
  },
  CredentialsNotFound: {
    code: "auth.credentials_not_found",
    statusCode: HttpStatus.NotFound,
    description: "The provided credentials were not found.",
  },
  InvalidCredentials: {
    code: "auth.invalid_credentials",
    statusCode: HttpStatus.Unauthorized,
    description: "The provided credentials are invalid.",
  },
  DuplicateCredentials: {
    code: "auth.duplicate_credentials",
    statusCode: HttpStatus.Conflict,
    description: "The provided credentials already exist.",
  },
  AccountLocked: {
    code: "auth.account_locked",
    statusCode: HttpStatus.Forbidden,
    description: "The account is locked due to multiple failed login attempts.",
  },
  TokenExpired: {
    code: "auth.token_expired",
    statusCode: HttpStatus.Unauthorized,
    description: "The authentication token has expired.",
  },
  TokenInvalid: {
    code: "auth.token_invalid",
    statusCode: HttpStatus.Unauthorized,
    description: "The authentication token is invalid.",
  },
} satisfies Record<string, AuthError>;
