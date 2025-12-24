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
		maybeHasNextPage: z.boolean(),
	});

export type CursorPaginationRequest = z.infer<
	typeof cursorPaginationRequestSchema
>;

export type CursorPaginationResponse<T> = {
	nextCursor: string | null;
	items: T[];
	maybeHasNextPage: boolean;
};

export type CreateCursorPaginationResponseArgs<T> = {
	limit: number;
	items: T[];
	nextCursor: string | null;
};

export function createCursorPaginationResponse<T>(
	args: CreateCursorPaginationResponseArgs<T>,
) {
	return {
		...args,
		maybeHasNextPage: args.items.length === args.limit,
	};
}

export const paginationRequestSchema = z.object({
	page: z.coerce.number().int().positive().default(1),
	pageSize: z.coerce.number().int().positive().max(100).default(10),
});

export const paginationResponseSchema = z.object({
	page: z.int().positive(),
	pageSize: z.int().positive(),
	totalItems: z.int().nonnegative(),
	totalPages: z.int().nonnegative(),
	hasNextPage: z.boolean(),
	hasPreviousPage: z.boolean(),
	items: z.array(z.any()),
});

export const paginationResponseSchemaFactory = <TItemType extends z.ZodTypeAny>(
	zodObject: TItemType,
) =>
	paginationResponseSchema.extend({
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
