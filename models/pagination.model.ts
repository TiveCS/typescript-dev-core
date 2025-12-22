import z, { type ZodNumber, type ZodObject, type ZodString } from "zod";

export const cursorPaginationRequestSchema = z.object({
	limit: z.int().positive().max(100).default(10),
	cursor: z.string().optional(),
});

export const cursorPaginationResponseSchema = (
	zodObject: ZodObject | ZodString | ZodNumber,
) =>
	z.object({
		nextCursor: z.string().nullable(),
		items: z.array(zodObject),
	});

export const paginationRequestSchema = z.object({
	page: z.int().positive().default(1),
	pageSize: z.int().positive().max(100).default(10),
});

export const paginationResponseSchema = (
	zodObject: ZodObject | ZodString | ZodNumber,
) =>
	z.object({
		page: z.int().positive(),
		pageSize: z.int().positive(),
		totalItems: z.int().nonnegative(),
		totalPages: z.int().positive(),
		hasNextPage: z.boolean(),
		hasPreviousPage: z.boolean(),
		items: z.array(zodObject),
	});

export type PaginationRequest = z.infer<typeof paginationRequestSchema>;

export type PaginationResponse<T> = {
	page: number;
	pageSize: number;
	totalItems: number;
	totalPages: number;
	hasNextPage: boolean;
	hasPreviousPage: boolean;
	items: T[];
};

export type CreatePaginationResponseArgs<T> = {
	page: number;
	pageSize: number;
	totalItems: number;
	items: T[];
};

export function createPaginationResponse<T>(
	args: CreatePaginationResponseArgs<T>,
) {
	const totalPages = Math.ceil(args.totalItems / args.pageSize);

	return {
		...args,
		totalPages,
		hasNextPage: args.page < totalPages,
		hasPreviousPage: args.page > 1,
	};
}
