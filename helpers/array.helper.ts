/**
 * Split an array into chunks of a specified size
 * @param array - The array to chunk
 * @param size - The size of each chunk
 * @returns Array of chunks
 * @example chunk([1, 2, 3, 4, 5], 2) // [[1, 2], [3, 4], [5]]
 */
export function chunk<T>(array: T[], size: number): T[][] {
	if (size <= 0) return [];

	const chunks: T[][] = [];
	for (let i = 0; i < array.length; i += size) {
		chunks.push(array.slice(i, i + size));
	}
	return chunks;
}

/**
 * Remove duplicate values from an array
 * @param array - The array to process
 * @returns Array with unique values
 * @example unique([1, 2, 2, 3, 3]) // [1, 2, 3]
 */
export function unique<T>(array: T[]): T[] {
	return [...new Set(array)];
}

/**
 * Remove duplicate values from an array based on a key selector
 * @param array - The array to process
 * @param keySelector - Function to select the comparison key
 * @returns Array with unique values
 * @example uniqueBy([{id: 1}, {id: 2}, {id: 1}], x => x.id) // [{id: 1}, {id: 2}]
 */
export function uniqueBy<T, K>(array: T[], keySelector: (item: T) => K): T[] {
	const seen = new Set<K>();
	return array.filter((item) => {
		const key = keySelector(item);
		if (seen.has(key)) return false;
		seen.add(key);
		return true;
	});
}

/**
 * Group array items by a key selector
 * @param array - The array to group
 * @param keySelector - Function to select the grouping key
 * @returns Object with grouped items
 * @example groupBy([{type: 'a', val: 1}, {type: 'b', val: 2}, {type: 'a', val: 3}], x => x.type)
 * // { a: [{type: 'a', val: 1}, {type: 'a', val: 3}], b: [{type: 'b', val: 2}] }
 */
export function groupBy<T, K extends string | number | symbol>(
	array: T[],
	keySelector: (item: T) => K,
): Record<K, T[]> {
	return array.reduce(
		(groups, item) => {
			const key = keySelector(item);
			if (!groups[key]) {
				groups[key] = [];
			}
			groups[key].push(item);
			return groups;
		},
		{} as Record<K, T[]>,
	);
}

/**
 * Split an array into two arrays based on a predicate
 * @param array - The array to partition
 * @param predicate - Function to test each element
 * @returns Tuple of [matching, non-matching] items
 * @example partition([1, 2, 3, 4, 5], x => x % 2 === 0) // [[2, 4], [1, 3, 5]]
 */
export function partition<T>(
	array: T[],
	predicate: (item: T) => boolean,
): [T[], T[]] {
	const truthy: T[] = [];
	const falsy: T[] = [];

	for (const item of array) {
		if (predicate(item)) {
			truthy.push(item);
		} else {
			falsy.push(item);
		}
	}

	return [truthy, falsy];
}

/**
 * Randomly shuffle an array (Fisher-Yates algorithm)
 * @param array - The array to shuffle
 * @returns New shuffled array
 * @example shuffle([1, 2, 3, 4, 5]) // [3, 1, 5, 2, 4] (random)
 */
export function shuffle<T>(array: T[]): T[] {
	const result = [...array];
	for (let i = result.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		const temp = result[i];
		const itemJ = result[j];
		if (temp !== undefined && itemJ !== undefined) {
			result[i] = itemJ;
			result[j] = temp;
		}
	}
	return result;
}

/**
 * Remove all falsy values from an array
 * @param array - The array to compact
 * @returns Array without falsy values
 * @example compact([0, 1, false, 2, '', 3, null, undefined, NaN]) // [1, 2, 3]
 */
export function compact<T>(array: T[]): NonNullable<T>[] {
	return array.filter((item): item is NonNullable<T> => Boolean(item));
}

/**
 * Get the intersection of two arrays (common elements)
 * @param array1 - First array
 * @param array2 - Second array
 * @returns Array of common elements
 * @example intersection([1, 2, 3], [2, 3, 4]) // [2, 3]
 */
export function intersection<T>(array1: T[], array2: T[]): T[] {
	const set2 = new Set(array2);
	return unique(array1.filter((item) => set2.has(item)));
}

/**
 * Get the difference between two arrays (elements in first but not in second)
 * @param array1 - First array
 * @param array2 - Second array
 * @returns Array of different elements
 * @example difference([1, 2, 3], [2, 3, 4]) // [1]
 */
export function difference<T>(array1: T[], array2: T[]): T[] {
	const set2 = new Set(array2);
	return array1.filter((item) => !set2.has(item));
}

/**
 * Flatten a nested array by one level
 * @param array - The array to flatten
 * @returns Flattened array
 * @example flatten([[1, 2], [3, 4], [5]]) // [1, 2, 3, 4, 5]
 */
export function flatten<T>(array: (T | T[])[]): T[] {
	return array.flat() as T[];
}

/**
 * Flatten a deeply nested array
 * @param array - The array to flatten
 * @returns Deeply flattened array
 * @example flattenDeep([[1, [2]], [[[3]]], 4]) // [1, 2, 3, 4]
 */
export function flattenDeep<T>(array: unknown[]): T[] {
	return array.flat(Number.POSITIVE_INFINITY) as T[];
}

/**
 * Get the sum of numbers in an array
 * @param array - Array of numbers
 * @returns Sum of all numbers
 * @example sum([1, 2, 3, 4, 5]) // 15
 */
export function sum(array: number[]): number {
	return array.reduce((acc, val) => acc + val, 0);
}

/**
 * Get the sum of array items based on a value selector
 * @param array - The array to sum
 * @param valueSelector - Function to select the value to sum
 * @returns Sum of selected values
 * @example sumBy([{val: 1}, {val: 2}, {val: 3}], x => x.val) // 6
 */
export function sumBy<T>(
	array: T[],
	valueSelector: (item: T) => number,
): number {
	return array.reduce((acc, item) => acc + valueSelector(item), 0);
}

/**
 * Get the minimum value from an array
 * @param array - Array of numbers
 * @returns Minimum value or undefined if empty
 * @example min([3, 1, 4, 1, 5]) // 1
 */
export function min(array: number[]): number | undefined {
	if (array.length === 0) return undefined;
	return Math.min(...array);
}

/**
 * Get the maximum value from an array
 * @param array - Array of numbers
 * @returns Maximum value or undefined if empty
 * @example max([3, 1, 4, 1, 5]) // 5
 */
export function max(array: number[]): number | undefined {
	if (array.length === 0) return undefined;
	return Math.max(...array);
}

/**
 * Get the minimum item from an array based on a value selector
 * @param array - The array to search
 * @param valueSelector - Function to select the comparison value
 * @returns Item with minimum value or undefined if empty
 * @example minBy([{val: 3}, {val: 1}, {val: 2}], x => x.val) // {val: 1}
 */
export function minBy<T>(
	array: T[],
	valueSelector: (item: T) => number,
): T | undefined {
	if (array.length === 0) return undefined;

	let min = array[0];
	if (!min) return undefined;

	for (let i = 1; i < array.length; i++) {
		const item = array[i];
		if (item && valueSelector(item) < valueSelector(min)) {
			min = item;
		}
	}
	return min;
}

/**
 * Get the maximum item from an array based on a value selector
 * @param array - The array to search
 * @param valueSelector - Function to select the comparison value
 * @returns Item with maximum value or undefined if empty
 * @example maxBy([{val: 3}, {val: 1}, {val: 2}], x => x.val) // {val: 3}
 */
export function maxBy<T>(
	array: T[],
	valueSelector: (item: T) => number,
): T | undefined {
	if (array.length === 0) return undefined;

	let max = array[0];
	if (!max) return undefined;

	for (let i = 1; i < array.length; i++) {
		const item = array[i];
		if (item && valueSelector(item) > valueSelector(max)) {
			max = item;
		}
	}
	return max;
}

/**
 * Get the first n items from an array
 * @param array - The array to take from
 * @param count - Number of items to take
 * @returns Array of first n items
 * @example take([1, 2, 3, 4, 5], 3) // [1, 2, 3]
 */
export function take<T>(array: T[], count: number): T[] {
	return array.slice(0, Math.max(0, count));
}

/**
 * Get the last n items from an array
 * @param array - The array to take from
 * @param count - Number of items to take
 * @returns Array of last n items
 * @example takeLast([1, 2, 3, 4, 5], 3) // [3, 4, 5]
 */
export function takeLast<T>(array: T[], count: number): T[] {
	return array.slice(Math.max(0, array.length - count));
}

/**
 * Check if an array is empty
 * @param array - The array to check
 * @returns True if array is empty
 * @example isEmpty([]) // true
 */
export function isEmpty<T>(array: T[]): boolean {
	return array.length === 0;
}

/**
 * Check if an array is not empty
 * @param array - The array to check
 * @returns True if array is not empty
 * @example isNotEmpty([1, 2]) // true
 */
export function isNotEmpty<T>(array: T[]): boolean {
	return array.length > 0;
}
