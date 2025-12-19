import type { HttpStatus } from "../constants";

export type ErrorModel = {
  code: `${string}.${string}`;
  description: string;
  statusCode: HttpStatus;
};

export type ErrorModelResult = {
  code: `${string}.${string}`;
  description: string;
  details?: string[];
  fieldErrors?: Record<string, string[]>;
};
