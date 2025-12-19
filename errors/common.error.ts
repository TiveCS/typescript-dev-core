import { HttpStatus } from "../constants";
import type { ErrorModel } from "../models";

export type CommonError = ErrorModel & {
  code: `common.${string}`;
};

export const CommonErrors = {
  ValidationError: {
    code: "common.validation_error",
    statusCode: HttpStatus.UnprocessableEntity,
    description: "One or more validation errors occurred.",
  },
  UnhandledError: {
    code: "common.unhandled_error",
    statusCode: HttpStatus.InternalServerError,
    description: "An unhandled error occurred.",
  },
} satisfies Record<string, CommonError>;
