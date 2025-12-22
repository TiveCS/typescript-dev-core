import { type ZodError, z } from "zod";
import { CommonErrors } from "../errors";
import { isZodError } from "../helpers";
import type { ErrorModel } from "./error.model";

export const successResultSchema = z.object({
	success: z.literal(true),
	data: z.any().optional(),
});

export const failureResultSchema = z.object({
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
			success: true;
		}
	: {
			success: true;
			data: T;
		};

export type FailureResult = {
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
			success: true,
		} as SuccessResult<void>;
	}
	return {
		success: true,
		data,
	} as SuccessResult<T>;
}

export function failure(
	error: ErrorModel,
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

export function isFailureResult<T>(result: Result<T>): result is FailureResult {
	return (
		result.success === false ||
		(result.success === undefined &&
			"code" in result &&
			"description" in result &&
			"statusCode" in result)
	);
}

export function isSuccessResult<T>(
	result: Result<T>,
): result is SuccessResult<T> {
	return result.success === true;
}
