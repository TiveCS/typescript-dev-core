import { type ZodError, z } from "zod";
import { CommonErrors } from "../errors";
import { isZodError } from "../helpers";
import type { ErrorModel } from "./error.model";

export const successResultSchema = z.object({
	__brand: z.literal("successResult"),
	success: z.literal(true),
	data: z.any().optional(),
});

export const failureResultSchema = z.object({
	__brand: z.literal("failureResult"),
	success: z.literal(false).or(z.undefined()),
	code: z.string(),
	statusCode: z.number(),
	description: z.string(),
	fieldErrors: z.record(z.string(), z.array(z.string())).optional(),
});

export const failureResultResponseSchema = z.object({
	code: z.string(),
	description: z.string(),
	fieldErrors: z.record(z.string(), z.array(z.string())).optional(),
});

export type SuccessResult<T = void> = T extends void
	? {
			__brand: "successResult";
			success: true;
		}
	: {
			__brand: "successResult";
			success: true;
			data: T;
		};

export type FailureResult = {
	__brand: "failureResult";
	success: false | undefined;
	code: ErrorModel["code"];
	statusCode: ErrorModel["statusCode"];
	description: ErrorModel["description"];
	fieldErrors?: Record<string, string[]>;
};

export type FailureResultResponse = {
	code: ErrorModel["code"];
	description: ErrorModel["description"];
	fieldErrors?: Record<string, string[]>;
};

export type Result<T = void> = SuccessResult<T> | FailureResult;

export function ok(): SuccessResult<void>;
export function ok<T>(data: T): SuccessResult<T>;
export function ok<T>(data?: T): SuccessResult<T> | SuccessResult<void> {
	if (data === undefined) {
		return {
			__brand: "successResult",
			success: true,
		} as SuccessResult<void>;
	}
	return {
		__brand: "successResult",
		success: true,
		data,
	} as SuccessResult<T>;
}

export function failure(
	error: ErrorModel,
	fieldErrors?: Record<string, string[]>,
): FailureResult {
	return {
		__brand: "failureResult",
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

export function isFailureResult(result: unknown): result is FailureResult {
	return (
		typeof result === "object" &&
		result !== null &&
		"success" in result &&
		typeof result.success === "boolean" &&
		(result.success === false || result.success === undefined) &&
		"__brand" in result &&
		result.__brand === "failureResult" &&
		"code" in result &&
		result.code !== undefined &&
		typeof result.code === "string" &&
		"statusCode" in result &&
		typeof result.statusCode === "number" &&
		"description" in result &&
		typeof result.description === "string"
	);
}

export function isFailureResponseStruct(
	result: unknown,
): result is FailureResultResponse {
	return (
		typeof result === "object" &&
		result !== null &&
		"code" in result &&
		typeof result.code === "string" &&
		"description" in result &&
		typeof result.description === "string"
	);
}

export function isSuccessResult(result: unknown): result is SuccessResult {
	return (
		typeof result === "object" &&
		result !== null &&
		"success" in result &&
		result.success === true &&
		"__brand" in result &&
		result.__brand === "successResult"
	);
}

/**
 * Converts an error code to a human-readable title
 * @param code - The error code in format "prefix.snake_case"
 * @returns Formatted title with prefix excluded
 * @example getErrorCodeTitle(AuthErrors.CredentialsNotFound) // "auth.credentials_not_found" => "Credentials Not Found"
 */
export function getErrorCodeTitle(code: string): string {
	return code
		.split(".")
		.slice(1)
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
		.join(" ");
}
