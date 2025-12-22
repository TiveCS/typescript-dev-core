/**
 * Generate all possible dot notation paths from an object type
 * @example Path<{ a: { b: { c: number } } }> = "a" | "a.b" | "a.b.c"
 */
export type Path<T> = T extends object
	? {
			[K in keyof T & (string | number)]: K extends string | number
				? T[K] extends object
					?
							| `${K}`
							| (Path<T[K]> extends infer P
									? P extends string | number
										? `${K}.${P}`
										: never
									: never)
					: `${K}`
				: never;
		}[keyof T & (string | number)]
	: never;

/**
 * Get the type at a specific path in an object
 * @example PathValue<{ a: { b: { c: number } } }, "a.b.c"> = number
 */
export type PathValue<
	T,
	P extends string,
> = P extends `${infer K}.${infer Rest}`
	? K extends keyof T
		? Rest extends Path<T[K]>
			? PathValue<T[K], Rest>
			: never
		: never
	: P extends keyof T
		? T[P]
		: never;

/**
 * Pick specified properties from an object
 * @param obj - The source object
 * @param keys - Array of keys to pick
 * @returns New object with only picked properties
 * @example pick({ a: 1, b: 2, c: 3 }, ['a', 'c']) // { a: 1, c: 3 }
 */
export function pick<T extends object, K extends keyof T>(
	obj: T,
	keys: K[],
): Pick<T, K> {
	const result = {} as Pick<T, K>;
	for (const key of keys) {
		if (key in obj) {
			result[key] = obj[key];
		}
	}
	return result;
}

/**
 * Omit specified properties from an object
 * @param obj - The source object
 * @param keys - Array of keys to omit
 * @returns New object without omitted properties
 * @example omit({ a: 1, b: 2, c: 3 }, ['b']) // { a: 1, c: 3 }
 */
export function omit<T extends object, K extends keyof T>(
	obj: T,
	keys: K[],
): Omit<T, K> {
	const result = { ...obj };
	for (const key of keys) {
		delete result[key];
	}
	return result as Omit<T, K>;
}

/**
 * Deep clone an object
 * @param obj - The object to clone
 * @returns Deep cloned object
 * @example deepClone({ a: { b: { c: 1 } } }) // New object with same structure
 */
export function deepClone<T>(obj: T): T {
	if (obj === null || typeof obj !== "object") {
		return obj;
	}

	if (obj instanceof Date) {
		return new Date(obj.getTime()) as T;
	}

	if (Array.isArray(obj)) {
		return obj.map((item) => deepClone(item)) as T;
	}

	if (obj instanceof Set) {
		return new Set([...obj].map((item) => deepClone(item))) as T;
	}

	if (obj instanceof Map) {
		return new Map(
			[...obj.entries()].map(([key, value]) => [key, deepClone(value)]),
		) as T;
	}

	if (obj instanceof RegExp) {
		return new RegExp(obj.source, obj.flags) as T;
	}

	if (typeof obj === "object") {
		const cloned = {} as T;
		for (const key in obj) {
			if (Object.hasOwn(obj, key)) {
				cloned[key] = deepClone(obj[key]);
			}
		}
		return cloned;
	}

	return obj;
}

/**
 * Deep merge two or more objects
 * @param target - The target object
 * @param sources - Source objects to merge
 * @returns Merged object
 * @example deepMerge({ a: 1, b: { c: 2 } }, { b: { d: 3 } }) // { a: 1, b: { c: 2, d: 3 } }
 */
export function deepMerge<T extends object>(
	target: T,
	...sources: Partial<T>[]
): T {
	if (!sources.length) return target;

	const result = deepClone(target);

	for (const source of sources) {
		if (!source || typeof source !== "object") continue;

		for (const key in source) {
			if (!Object.hasOwn(source, key)) continue;

			const sourceValue = source[key];
			const targetValue = result[key];

			if (
				sourceValue &&
				typeof sourceValue === "object" &&
				!Array.isArray(sourceValue) &&
				!(sourceValue instanceof Date) &&
				!(sourceValue instanceof RegExp)
			) {
				if (
					targetValue &&
					typeof targetValue === "object" &&
					!Array.isArray(targetValue)
				) {
					result[key] = deepMerge(
						targetValue as object,
						sourceValue as object,
					) as T[Extract<keyof T, string>];
				} else {
					result[key] = deepClone(sourceValue) as T[Extract<keyof T, string>];
				}
			} else {
				result[key] = deepClone(sourceValue) as T[Extract<keyof T, string>];
			}
		}
	}

	return result;
}

/**
 * Flatten a nested object into a single level with dot notation keys
 * @param obj - The object to flatten
 * @param prefix - Prefix for keys (used internally for recursion)
 * @returns Flattened object
 * @example flattenObject({ a: { b: { c: 1 } } }) // { 'a.b.c': 1 }
 */
export function flattenObject(
	obj: Record<string, unknown>,
	prefix = "",
): Record<string, unknown> {
	const result: Record<string, unknown> = {};

	for (const key in obj) {
		if (!Object.hasOwn(obj, key)) continue;

		const value = obj[key];
		const newKey = prefix ? `${prefix}.${key}` : key;

		if (
			value &&
			typeof value === "object" &&
			!Array.isArray(value) &&
			!(value instanceof Date) &&
			!(value instanceof RegExp)
		) {
			Object.assign(
				result,
				flattenObject(value as Record<string, unknown>, newKey),
			);
		} else {
			result[newKey] = value;
		}
	}

	return result;
}

/**
 * Unflatten an object with dot notation keys into a nested object
 * @param obj - The flattened object
 * @returns Nested object
 * @example unflattenObject({ 'a.b.c': 1 }) // { a: { b: { c: 1 } } }
 */
export function unflattenObject(
	obj: Record<string, unknown>,
): Record<string, unknown> {
	const result: Record<string, unknown> = {};

	for (const key in obj) {
		if (!Object.hasOwn(obj, key)) continue;

		const keys = key.split(".");
		let current = result;

		for (let i = 0; i < keys.length - 1; i++) {
			const k = keys[i];
			if (!k) continue;

			if (!(k in current)) {
				current[k] = {};
			}
			current = current[k] as Record<string, unknown>;
		}

		const lastKey = keys[keys.length - 1];
		if (lastKey) {
			current[lastKey] = obj[key];
		}
	}

	return result;
}

/**
 * Map over object keys
 * @param obj - The source object
 * @param mapper - Function to transform keys
 * @returns New object with transformed keys
 * @example mapKeys({ a: 1, b: 2 }, k => k.toUpperCase()) // { A: 1, B: 2 }
 */
export function mapKeys<T extends Record<string, unknown>>(
	obj: T,
	mapper: (key: string, value: unknown) => string,
): Record<string, unknown> {
	const result: Record<string, unknown> = {};

	for (const key in obj) {
		if (Object.hasOwn(obj, key)) {
			const newKey = mapper(key, obj[key]);
			result[newKey] = obj[key];
		}
	}

	return result;
}

/**
 * Map over object values
 * @param obj - The source object
 * @param mapper - Function to transform values
 * @returns New object with transformed values
 * @example mapValues({ a: 1, b: 2 }, v => v * 2) // { a: 2, b: 4 }
 */
export function mapValues<T extends Record<string, unknown>, U>(
	obj: T,
	mapper: (value: T[keyof T], key: string) => U,
): Record<keyof T, U> {
	const result = {} as Record<keyof T, U>;

	for (const key in obj) {
		if (Object.hasOwn(obj, key)) {
			result[key] = mapper(obj[key], key);
		}
	}

	return result;
}

/**
 * Get a nested property value using dot notation path with type-safe autocomplete
 * @param obj - The source object
 * @param path - Dot notation path (e.g., 'a.b.c') - autocompletes based on object structure
 * @param defaultValue - Default value if path doesn't exist
 * @returns The value at path or default value
 * @example getPath({ a: { b: { c: 1 } } }, 'a.b.c') // 1 (typed as number)
 */
export function getPath<T extends object, P extends Path<T>>(
	obj: T,
	path: P,
): PathValue<T, P> | undefined;
export function getPath<T extends object, P extends Path<T>, D>(
	obj: T,
	path: P,
	defaultValue: D,
): PathValue<T, P> | D;
export function getPath<T extends object, P extends Path<T>, D>(
	obj: T,
	path: P,
	defaultValue?: D,
): PathValue<T, P> | D | undefined {
	const keys = (path as string).split(".");
	let result: unknown = obj;

	for (const key of keys) {
		if (result && typeof result === "object" && key in result) {
			result = (result as Record<string, unknown>)[key];
		} else {
			return defaultValue;
		}
	}

	return result as PathValue<T, P>;
}

/**
 * Set a nested property value using dot notation path with type-safe autocomplete
 * @param obj - The target object
 * @param path - Dot notation path (e.g., 'a.b.c') - autocompletes based on object structure
 * @param value - Value to set
 * @returns The modified object
 * @example setPath({}, 'a.b.c', 1) // { a: { b: { c: 1 } } }
 */
export function setPath<T extends Record<string, unknown>, P extends Path<T>>(
	obj: T,
	path: P,
	value: PathValue<T, P>,
): T;
export function setPath<T extends Record<string, unknown>>(
	obj: T,
	path: string,
	value: unknown,
): T;
export function setPath<T extends Record<string, unknown>>(
	obj: T,
	path: string,
	value: unknown,
): T {
	const keys = path.split(".");
	let current: Record<string, unknown> = obj;

	for (let i = 0; i < keys.length - 1; i++) {
		const key = keys[i];
		if (!key) continue;

		if (!(key in current) || typeof current[key] !== "object") {
			current[key] = {};
		}
		current = current[key] as Record<string, unknown>;
	}

	const lastKey = keys[keys.length - 1];
	if (lastKey) {
		current[lastKey] = value;
	}
	return obj;
}

/**
 * Check if an object has a nested property using dot notation path with type-safe autocomplete
 * @param obj - The source object
 * @param path - Dot notation path (e.g., 'a.b.c') - autocompletes based on object structure
 * @returns True if path exists
 * @example hasPath({ a: { b: { c: 1 } } }, 'a.b.c') // true
 */
export function hasPath<T extends object, P extends Path<T>>(
	obj: T,
	path: P,
): boolean;
export function hasPath(obj: unknown, path: string): boolean;
export function hasPath(obj: unknown, path: string): boolean {
	const keys = path.split(".");
	let current: unknown = obj;

	for (const key of keys) {
		if (current && typeof current === "object" && key in current) {
			current = (current as Record<string, unknown>)[key];
		} else {
			return false;
		}
	}

	return true;
}

/**
 * Check if object is empty (has no own properties)
 * @param obj - The object to check
 * @returns True if object is empty
 * @example isEmptyObject({}) // true
 */
export function isEmptyObject(obj: object): boolean {
	return Object.keys(obj).length === 0;
}

/**
 * Check if object is not empty (has own properties)
 * @param obj - The object to check
 * @returns True if object is not empty
 * @example isNotEmptyObject({ a: 1 }) // true
 */
export function isNotEmptyObject(obj: object): boolean {
	return Object.keys(obj).length > 0;
}

/**
 * Invert object keys and values
 * @param obj - The object to invert
 * @returns Inverted object
 * @example invert({ a: '1', b: '2' }) // { '1': 'a', '2': 'b' }
 */
export function invert<T extends Record<string, string | number>>(
	obj: T,
): Record<string, string> {
	const result: Record<string, string> = {};

	for (const key in obj) {
		if (Object.hasOwn(obj, key)) {
			result[String(obj[key])] = key;
		}
	}

	return result;
}

/**
 * Get all keys from an object (typed)
 * @param obj - The source object
 * @returns Array of keys
 * @example keys({ a: 1, b: 2 }) // ['a', 'b']
 */
export function keys<T extends object>(obj: T): (keyof T)[] {
	return Object.keys(obj) as (keyof T)[];
}

/**
 * Get all values from an object (typed)
 * @param obj - The source object
 * @returns Array of values
 * @example values({ a: 1, b: 2 }) // [1, 2]
 */
export function values<T extends object>(obj: T): T[keyof T][] {
	return Object.values(obj) as T[keyof T][];
}

/**
 * Get all entries from an object (typed)
 * @param obj - The source object
 * @returns Array of [key, value] tuples
 * @example entries({ a: 1, b: 2 }) // [['a', 1], ['b', 2]]
 */
export function entries<T extends object>(obj: T): [keyof T, T[keyof T]][] {
	return Object.entries(obj) as [keyof T, T[keyof T]][];
}

/**
 * Create an object from entries
 * @param entries - Array of [key, value] tuples
 * @returns Object created from entries
 * @example fromEntries([['a', 1], ['b', 2]]) // { a: 1, b: 2 }
 */
export function fromEntries<K extends string | number | symbol, V>(
	entries: [K, V][],
): Record<K, V> {
	return Object.fromEntries(entries) as Record<K, V>;
}
