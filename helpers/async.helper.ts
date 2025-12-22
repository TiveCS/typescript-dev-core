/**
 * Options for retry function
 */
export type RetryOptions = {
	/** Maximum number of retry attempts (default: 3) */
	maxRetries?: number;
	/** Initial delay in milliseconds (default: 1000) */
	initialDelay?: number;
	/** Maximum delay in milliseconds (default: 30000) */
	maxDelay?: number;
	/** Backoff multiplier (default: 2 for exponential backoff) */
	backoffMultiplier?: number;
	/** Function to determine if error is retryable (default: all errors are retryable) */
	shouldRetry?: (error: unknown) => boolean;
	/** Callback invoked on each retry attempt */
	onRetry?: (error: unknown, attempt: number) => void;
};

/**
 * Retry a function with exponential backoff
 *
 * @param fn - The async function to retry
 * @param options - Retry options
 * @returns Promise that resolves with function result or rejects after all retries exhausted
 *
 * @example
 * const result = await retry(
 *   async () => fetchData(),
 *   { maxRetries: 5, initialDelay: 1000 }
 * );
 *
 * @remarks
 * **Frontend**: Retry failed API calls, image loads, or external resources
 * ```typescript
 * const data = await retry(
 *   () => fetch('/api/data').then(r => r.json()),
 *   {
 *     maxRetries: 3,
 *     initialDelay: 1000,
 *     shouldRetry: (error) => error.status >= 500 // Only retry server errors
 *   }
 * );
 * ```
 *
 * **Backend**: Retry external API calls, database connections, file operations
 * ```typescript
 * const user = await retry(
 *   () => db.users.findOne({ id }),
 *   {
 *     maxRetries: 5,
 *     onRetry: (error, attempt) => logger.warn(`DB retry ${attempt}:`, error)
 *   }
 * );
 * ```
 *
 * **⚠️ Pitfalls & Safety**:
 * - Uses `sleep()` which is non-blocking but pauses the async function
 * - Multiple concurrent retries can accumulate - set reasonable maxRetries
 * - Exponential backoff can lead to VERY long waits: 1s → 2s → 4s → 8s → 16s → 32s
 * - NOT suitable for operations that should fail fast (user login, payment processing)
 * - In serverless (Lambda), watch execution time limits
 *
 * **🔧 Best Practices**:
 * - Use `shouldRetry` to avoid retrying client errors (400s)
 * - Set `maxDelay` to prevent excessive waits
 * - Add `onRetry` callback for logging/monitoring
 * - For production, consider circuit breaker pattern to prevent cascading failures
 */
export async function retry<T>(
	fn: () => Promise<T>,
	options: RetryOptions = {},
): Promise<T> {
	const {
		maxRetries = 3,
		initialDelay = 1000,
		maxDelay = 30000,
		backoffMultiplier = 2,
		shouldRetry = () => true,
		onRetry,
	} = options;

	let lastError: unknown;
	let delay = initialDelay;

	for (let attempt = 0; attempt <= maxRetries; attempt++) {
		try {
			return await fn();
		} catch (error) {
			lastError = error;

			if (attempt === maxRetries || !shouldRetry(error)) {
				throw error;
			}

			if (onRetry) {
				onRetry(error, attempt + 1);
			}

			await sleep(Math.min(delay, maxDelay));
			delay *= backoffMultiplier;
		}
	}

	throw lastError;
}

/**
 * Add a timeout to a promise
 * @param promise - The promise to add timeout to
 * @param ms - Timeout in milliseconds
 * @param errorMessage - Custom error message (optional)
 * @returns Promise that rejects if timeout is reached
 * @example
 * const result = await timeout(fetchData(), 5000);
 */
export async function timeout<T>(
	promise: Promise<T>,
	ms: number,
	errorMessage?: string,
): Promise<T> {
	let timeoutId: ReturnType<typeof setTimeout> | undefined;

	const timeoutPromise = new Promise<never>((_, reject) => {
		timeoutId = setTimeout(() => {
			reject(new Error(errorMessage || `Operation timed out after ${ms}ms`));
		}, ms);
	});

	try {
		return await Promise.race([promise, timeoutPromise]);
	} finally {
		if (timeoutId) {
			clearTimeout(timeoutId);
		}
	}
}

/**
 * Delay execution for specified milliseconds
 * @param ms - Delay in milliseconds
 * @returns Promise that resolves after delay
 * @example
 * await sleep(1000); // Wait 1 second
 */
export function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Delay execution for specified milliseconds (alias for sleep)
 * @param ms - Delay in milliseconds
 * @returns Promise that resolves after delay
 * @example
 * await delay(1000); // Wait 1 second
 */
export const delay = sleep;

/**
 * Debounce an async function
 * @param fn - The async function to debounce
 * @param ms - Debounce delay in milliseconds
 * @returns Debounced function
 * @example
 * const debouncedSearch = debounce(async (query) => {
 *   return await searchAPI(query);
 * }, 300);
 */
export function debounce<
	T extends (...args: Parameters<T>) => Promise<ReturnType<T>>,
>(fn: T, ms: number): (...args: Parameters<T>) => Promise<ReturnType<T>> {
	let timeoutId: ReturnType<typeof setTimeout> | undefined;

	return (...args: Parameters<T>): Promise<ReturnType<T>> => {
		return new Promise((resolve, reject) => {
			if (timeoutId) {
				clearTimeout(timeoutId);
			}

			timeoutId = setTimeout(async () => {
				try {
					const result = await fn(...args);
					resolve(result);
				} catch (error) {
					reject(error);
				}
			}, ms);
		});
	};
}

/**
 * Debounce a synchronous function (useful for React state updates, event handlers)
 * @param fn - The synchronous function to debounce
 * @param ms - Debounce delay in milliseconds
 * @returns Debounced function
 * @example
 * // React example
 * const [text, setText] = useState('');
 * const debouncedSetText = debounceSync(setText, 300);
 * <input onChange={(e) => debouncedSetText(e.target.value)} />
 *
 * @remarks
 * **React Safety**: Safe to use in React components. Wrap in useMemo/useCallback to prevent recreation on each render.
 * **Backend Safety**: Safe for non-critical operations (logging, file writes). For critical operations, consider using job queues.
 */
export function debounceSync<
	T extends (...args: Parameters<T>) => ReturnType<T>,
>(fn: T, ms: number): (...args: Parameters<T>) => void {
	let timeoutId: ReturnType<typeof setTimeout> | undefined;

	return (...args: Parameters<T>): void => {
		if (timeoutId) {
			clearTimeout(timeoutId);
		}

		timeoutId = setTimeout(() => fn(...args), ms);
	};
}

/**
 * Throttle an async function
 * @param fn - The async function to throttle
 * @param ms - Throttle interval in milliseconds
 * @returns Throttled function
 * @example
 * const throttledUpdate = throttle(async (data) => {
 *   return await updateAPI(data);
 * }, 1000);
 */
export function throttle<
	T extends (...args: Parameters<T>) => Promise<ReturnType<T>>,
>(
	fn: T,
	ms: number,
): (...args: Parameters<T>) => Promise<ReturnType<T> | undefined> {
	let isThrottled = false;
	let lastResult: ReturnType<T> | undefined;

	return async (...args: Parameters<T>): Promise<ReturnType<T> | undefined> => {
		if (isThrottled) {
			return lastResult;
		}

		isThrottled = true;
		lastResult = await fn(...args);

		setTimeout(() => {
			isThrottled = false;
		}, ms);

		return lastResult;
	};
}

/**
 * Map an array asynchronously (sequential execution)
 * @param array - The array to map
 * @param mapper - Async mapper function
 * @returns Promise that resolves with mapped array
 * @example
 * const results = await asyncMap([1, 2, 3], async (x) => {
 *   return await fetchData(x);
 * });
 */
export async function asyncMap<T, U>(
	array: T[],
	mapper: (item: T, index: number) => Promise<U>,
): Promise<U[]> {
	const results: U[] = [];
	for (let i = 0; i < array.length; i++) {
		const item = array[i];
		if (item !== undefined) {
			results.push(await mapper(item, i));
		}
	}
	return results;
}

/**
 * Filter an array asynchronously (sequential execution)
 * @param array - The array to filter
 * @param predicate - Async predicate function
 * @returns Promise that resolves with filtered array
 * @example
 * const results = await asyncFilter([1, 2, 3], async (x) => {
 *   return await checkCondition(x);
 * });
 */
export async function asyncFilter<T>(
	array: T[],
	predicate: (item: T, index: number) => Promise<boolean>,
): Promise<T[]> {
	const results: T[] = [];
	for (let i = 0; i < array.length; i++) {
		const item = array[i];
		if (item !== undefined && (await predicate(item, i))) {
			results.push(item);
		}
	}
	return results;
}

/**
 * Execute async functions in parallel with concurrency limit
 * @param tasks - Array of async functions to execute
 * @param concurrency - Maximum number of concurrent executions
 * @returns Promise that resolves with array of results
 * @example
 * const results = await parallelLimit(
 *   [() => fetch(url1), () => fetch(url2), () => fetch(url3)],
 *   2 // Max 2 concurrent requests
 * );
 */
export async function parallelLimit<T>(
	tasks: (() => Promise<T>)[],
	concurrency: number,
): Promise<T[]> {
	const results: T[] = new Array(tasks.length);
	const executing: Set<Promise<void>> = new Set();

	for (let i = 0; i < tasks.length; i++) {
		const index = i;
		const task = tasks[index];

		if (!task) continue;

		const promise = task().then((result) => {
			results[index] = result;
			executing.delete(promise);
		});

		executing.add(promise);

		if (executing.size >= concurrency) {
			await Promise.race(executing);
		}
	}

	await Promise.all(executing);
	return results;
}

/**
 * Execute async functions in chunks/batches
 * @param tasks - Array of async functions to execute
 * @param chunkSize - Number of tasks per chunk
 * @returns Promise that resolves with array of results
 * @example
 * const results = await batchExecute(
 *   [() => fetch(url1), () => fetch(url2), () => fetch(url3)],
 *   2 // Execute in batches of 2
 * );
 */
export async function batchExecute<T>(
	tasks: (() => Promise<T>)[],
	chunkSize: number,
): Promise<T[]> {
	const results: T[] = [];

	for (let i = 0; i < tasks.length; i += chunkSize) {
		const chunk = tasks.slice(i, i + chunkSize);
		const chunkResults = await Promise.all(chunk.map((task) => task()));
		results.push(...chunkResults);
	}

	return results;
}

/**
 * Wait for a condition to be true with timeout and callbacks
 * @param condition - Function that returns a boolean or promise of boolean
 * @param options - Options for polling interval, timeout, and callbacks
 * @returns Promise that resolves when condition is true or rejects on timeout
 * @example
 * await waitFor(
 *   async () => await checkStatus(),
 *   {
 *     interval: 1000,
 *     timeout: 30000,
 *     onFinish: () => console.log('Condition met!'),
 *     onTimeout: () => console.log('Timed out!')
 *   }
 * );
 *
 * @remarks
 * **React Safety**: Generally safe, but be cautious of state updates in React.
 * Use within useEffect and clean up properly to avoid memory leaks.
 *
 * **Backend Safety**: Safe for waiting on external resources (DB, files, services).
 * For production, consider using health checks or event-driven patterns instead of polling.
 */
export async function waitFor(
	condition: () => boolean | Promise<boolean>,
	options: {
		interval?: number;
		timeout?: number;
		onFinish?: () => void;
		onTimeout?: () => void;
	} = {},
): Promise<void> {
	const {
		interval = 100,
		timeout: timeoutMs = 10000,
		onFinish,
		onTimeout,
	} = options;

	const startTime = Date.now();

	while (true) {
		const result = await Promise.resolve(condition());

		if (result) {
			if (onFinish) {
				onFinish();
			}
			return;
		}

		if (Date.now() - startTime >= timeoutMs) {
			if (onTimeout) {
				onTimeout();
			}
			throw new Error(`Condition not met within ${timeoutMs}ms`);
		}

		await sleep(interval);
	}
}

/**
 * Memoize an async function with cache expiration
 * @param fn - The async function to memoize
 * @param options - Options for cache key generation and TTL
 * @returns Memoized function
 * @example
 * const cachedFetch = memoizeAsync(
 *   async (url: string) => await fetch(url),
 *   { ttl: 60000 } // Cache for 1 minute
 * );
 */
export function memoizeAsync<
	T extends (...args: Parameters<T>) => Promise<ReturnType<T>>,
>(
	fn: T,
	options: {
		keyGenerator?: (...args: Parameters<T>) => string;
		ttl?: number;
	} = {},
): T {
	const { keyGenerator = (...args) => JSON.stringify(args), ttl } = options;

	const cache = new Map<string, { value: ReturnType<T>; timestamp: number }>();

	return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
		const key = keyGenerator(...args);
		const cached = cache.get(key);

		if (cached) {
			if (!ttl || Date.now() - cached.timestamp < ttl) {
				return cached.value;
			}
			cache.delete(key);
		}

		const value = await fn(...args);
		cache.set(key, { value, timestamp: Date.now() });

		return value;
	}) as T;
}
