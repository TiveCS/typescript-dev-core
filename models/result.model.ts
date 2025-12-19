import { type ZodError, z } from "zod";
import { type CommonError, CommonErrors } from "../errors";
import { isZodError } from "../helpers";

export type SuccessResult<T = void> = T extends void
  ? {
      success: true;
    }
  : {
      success: true;
      data: T;
    };

export type FailureResult = {
  success: false | undefined;
  code: CommonError["code"];
  statusCode: CommonError["statusCode"];
  description: CommonError["description"];
  fieldErrors?: Record<string, string[]>;
};

export type FailureResultResponse = {
  code: CommonError["code"];
  description: CommonError["description"];
  fieldErrors?: Record<string, string[]>;
};

export type Result<T = void> = SuccessResult<T> | FailureResult;

export function ok(): SuccessResult<void>;
export function ok<T>(data: T): SuccessResult<T>;
export function ok<T>(data?: T): SuccessResult<T> | SuccessResult<void> {
  if (data === undefined) {
    return {
      success: true,
    } as SuccessResult<void>;
  }
  return {
    success: true,
    data,
  } as SuccessResult<T>;
}

export function failure(
  error: CommonError,
  fieldErrors?: Record<string, string[]>,
): FailureResult {
  return {
    success: false,
    code: error.code,
    statusCode: error.statusCode,
    description: error.description,
    fieldErrors,
  };
}

export function validationError(
  error: ZodError | Record<string, string[]>,
): FailureResult {
  if (isZodError(error)) {
    const fieldErrors = z.flattenError(error).fieldErrors;
    return failure(CommonErrors.ValidationError, fieldErrors);
  }

  return failure(CommonErrors.ValidationError, error);
}

export function toFailureResponseStruct(
  failResult: FailureResult,
): FailureResultResponse {
  return {
    code: failResult.code,
    description: failResult.description,
    fieldErrors: failResult.fieldErrors,
  };
}
