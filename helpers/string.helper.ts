/**
 * Convert a string to a URL-friendly slug
 *
 * @param str - The string to slugify
 * @returns A slugified string
 *
 * @example
 * slugify("Hello World!") // "hello-world"
 * slugify("React.js & TypeScript") // "reactjs-typescript"
 *
 * @remarks
 * **Frontend**: Perfect for generating URL-friendly identifiers from user input (blog post titles, product names)
 * ```typescript
 * const title = "10 Tips for React Developers!";
 * const url = `/blog/${slugify(title)}`; // "/blog/10-tips-for-react-developers"
 * ```
 *
 * **Backend**: Use for creating clean API endpoints, file names, or database identifiers
 * ```typescript
 * const filename = `${slugify(productName)}.json`; // "macbook-pro-16.json"
 * ```
 *
 * **⚠️ Pitfalls**:
 * - Removes ALL non-alphanumeric characters except hyphens (accents, emojis, special chars are lost)
 * - Empty strings or strings with only special chars will return ""
 * - Not reversible - don't use for data that needs to be restored
 * - Different strings may produce same slug: "Hello!" and "Hello?" both become "hello"
 */
export function slugify(str: string): string {
	return str
		.toLowerCase()
		.trim()
		.replace(/[^\w\s-]/g, "")
		.replace(/[\s_-]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

/**
 * Truncate a string to a specified length with ellipsis
 *
 * @param str - The string to truncate
 * @param maxLength - Maximum length including ellipsis
 * @param ellipsis - The ellipsis string (default: "...")
 * @returns Truncated string
 *
 * @example
 * truncate("Hello World", 8) // "Hello..."
 * truncate("Short", 10) // "Short"
 * truncate("Hello World", 8, "…") // "Hello W…"
 *
 * @remarks
 * **Frontend**: Great for previews, cards, lists where space is limited
 * ```typescript
 * <p>{truncate(article.content, 150)}</p>
 * <h3>{truncate(product.name, 30)}</h3>
 * ```
 *
 * **Backend**: Use for email previews, notifications, or log messages
 * ```typescript
 * logger.info(truncate(errorMessage, 100)); // Keep logs concise
 * ```
 *
 * **⚠️ Pitfalls**:
 * - May cut words in the middle: "Hello World" → "Hello..." (not "Hello W...")
 * - Doesn't account for word boundaries - use a more sophisticated algorithm if needed
 * - Ellipsis counts toward maxLength - be aware when setting limits
 * - Empty ellipsis ("") is valid but may be confusing
 */
export function truncate(
	str: string,
	maxLength: number,
	ellipsis = "...",
): string {
	if (str.length <= maxLength) return str;
	return str.slice(0, maxLength - ellipsis.length) + ellipsis;
}

/**
 * Capitalize the first letter of a string
 *
 * @param str - The string to capitalize
 * @returns Capitalized string
 *
 * @example
 * capitalize("hello") // "Hello"
 * capitalize("HELLO") // "HELLO" (only first char affected)
 *
 * @remarks
 * **Frontend**: Use for proper names, sentence starts, UI labels
 * ```typescript
 * <h1>Welcome, {capitalize(user.firstName)}!</h1>
 * ```
 *
 * **Backend**: Format names in emails, reports, or exports
 * ```typescript
 * const greeting = `Dear ${capitalize(firstName)},`;
 * ```
 *
 * **⚠️ Pitfalls**:
 * - Only affects the FIRST character, rest of string unchanged
 * - Empty string returns empty string (no error)
 * - Doesn't lowercase the rest: capitalize("hELLO") → "hELLO", not "Hello"
 */
export function capitalize(str: string): string {
	if (!str) return str;
	return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Convert a string to Title Case (Each Word Capitalized)
 *
 * @param str - The string to convert
 * @returns Title cased string
 *
 * @example
 * titleCase("hello world") // "Hello World"
 * titleCase("THE QUICK BROWN FOX") // "The Quick Brown Fox"
 *
 * @remarks
 * **Frontend**: Use for headings, titles, labels
 * ```typescript
 * <h1>{titleCase(article.title)}</h1>
 * ```
 *
 * **Backend**: Format display names, report headers
 * ```typescript
 * const header = titleCase(reportName); // "Monthly Sales Report"
 * ```
 *
 * **⚠️ Pitfalls**:
 * - Simple implementation - doesn't follow English title case rules
 * - Articles like "the", "a", "an" are capitalized (not grammatically correct)
 * - Split only on spaces, not hyphens or other separators
 * - "don't" becomes "Don't" (works) but "it's" becomes "It's" (may want "It's")
 */
export function titleCase(str: string): string {
	return str
		.toLowerCase()
		.split(" ")
		.map((word) => capitalize(word))
		.join(" ");
}

/**
 * Convert a string to camelCase
 *
 * @param str - The string to convert
 * @returns camelCase string
 *
 * @example
 * camelCase("hello-world") // "helloWorld"
 * camelCase("Hello World") // "helloWorld"
 * camelCase("user_name") // "userName"
 *
 * @remarks
 * **Frontend**: Convert API responses to JS naming conventions
 * ```typescript
 * const apiData = { "user-name": "John", "is-active": true };
 * const jsData = Object.fromEntries(
 *   Object.entries(apiData).map(([k, v]) => [camelCase(k), v])
 * );
 * // { userName: "John", isActive: true }
 * ```
 *
 * **Backend**: Convert database column names or config keys
 * ```typescript
 * const dbColumn = "user_email_address";
 * const jsField = camelCase(dbColumn); // "userEmailAddress"
 * ```
 *
 * **⚠️ Pitfalls**:
 * - Removes ALL non-alphanumeric characters
 * - Numbers stay in place: camelCase("test123name") → "test123name"
 * - Empty result possible: camelCase("---") → ""
 * - Not reversible - can't convert back reliably
 */
export function camelCase(str: string): string {
	return str
		.toLowerCase()
		.replace(/[^a-zA-Z0-9]+(.)/g, (_, char) => char.toUpperCase());
}

/**
 * Convert a string to snake_case
 *
 * @param str - The string to convert
 * @returns snake_case string
 *
 * @example
 * snakeCase("helloWorld") // "hello_world"
 * snakeCase("Hello World") // "hello_world"
 * snakeCase("user-name") // "user_name"
 *
 * @remarks
 * **Frontend**: Convert JS objects for backend APIs (Python, Ruby)
 * ```typescript
 * const jsData = { firstName: "John", isActive: true };
 * const apiData = Object.fromEntries(
 *   Object.entries(jsData).map(([k, v]) => [snakeCase(k), v])
 * );
 * // { first_name: "John", is_active: true }
 * ```
 *
 * **Backend**: Format for database columns, env vars, file names
 * ```typescript
 * const dbColumn = snakeCase("UserEmailAddress"); // "user_email_address"
 * const envVar = snakeCase("apiKey").toUpperCase(); // "API_KEY"
 * ```
 *
 * **⚠️ Pitfalls**:
 * - Consecutive capitals: snakeCase("XMLParser") → "x_m_l_parser" (maybe want "xml_parser")
 * - Leading/trailing underscores removed
 * - Multiple separators collapsed: "hello___world" → "hello_world"
 */
export function snakeCase(str: string): string {
	return str
		.replace(/([A-Z])/g, "_$1")
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "_")
		.replace(/^_+|_+$/g, "");
}

/**
 * Convert a string to kebab-case
 *
 * @param str - The string to convert
 * @returns kebab-case string
 *
 * @example
 * kebabCase("helloWorld") // "hello-world"
 * kebabCase("Hello World") // "hello-world"
 * kebabCase("user_name") // "user-name"
 *
 * @remarks
 * **Frontend**: Perfect for CSS class names, HTML attributes, URLs
 * ```typescript
 * const className = kebabCase("primaryButton"); // "primary-button"
 * <div className={kebabCase(componentName)} />
 * ```
 *
 * **Backend**: Use for file names, route paths, slugs
 * ```typescript
 * const route = `/api/${kebabCase(resourceName)}`; // "/api/user-profile"
 * const filename = `${kebabCase(title)}.md`; // "my-blog-post.md"
 * ```
 *
 * **⚠️ Pitfalls**:
 * - Same issues as snakeCase but with hyphens
 * - Consecutive capitals: kebabCase("XMLParser") → "x-m-l-parser"
 * - Very similar to slugify but keeps numbers: kebabCase("user123") → "user123"
 */
export function kebabCase(str: string): string {
	return str
		.replace(/([A-Z])/g, "-$1")
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

/**
 * Escape HTML special characters to prevent XSS attacks
 *
 * @param str - The string to escape
 * @returns Escaped string safe for HTML insertion
 *
 * @example
 * escapeHtml("<div>Hello</div>") // "&lt;div&gt;Hello&lt;/div&gt;"
 * escapeHtml("Tom & Jerry") // "Tom &amp; Jerry"
 *
 * @remarks
 * **Frontend**: CRITICAL for displaying user input in HTML to prevent XSS
 * ```typescript
 * // ⚠️ DANGEROUS - XSS vulnerability
 * <div dangerouslySetInnerHTML={{ __html: userInput }} />
 *
 * // ✅ SAFE - escaped HTML
 * <div dangerouslySetInnerHTML={{ __html: escapeHtml(userInput) }} />
 *
 * // 🎯 BETTER - Just use React's default escaping
 * <div>{userInput}</div> // React escapes by default
 * ```
 *
 * **Backend**: Escape user content before inserting into HTML emails, PDFs
 * ```typescript
 * const emailHtml = `<p>Comment: ${escapeHtml(userComment)}</p>`;
 * ```
 *
 * **⚠️ Pitfalls & Security**:
 * - Only escapes 5 basic characters: & < > " '
 * - NOT a complete XSS prevention solution - use proper sanitization libraries (DOMPurify)
 * - In React, you rarely need this - React escapes by default
 * - Double-escaping can occur if applied multiple times
 * - Doesn't handle all edge cases (unicode, exotic encodings)
 *
 * **🔒 Security Best Practices**:
 * - Frontend: Use React/Vue's built-in escaping (don't use dangerouslySetInnerHTML)
 * - Backend: Use template engines with auto-escaping (Handlebars, EJS)
 * - For rich text: Use dedicated libraries (DOMPurify, sanitize-html)
 */
export function escapeHtml(str: string): string {
	const htmlEscapes: Record<string, string> = {
		"&": "&amp;",
		"<": "&lt;",
		">": "&gt;",
		'"': "&quot;",
		"'": "&#39;",
	};

	return str.replace(/[&<>"']/g, (char) => htmlEscapes[char] || char);
}

/**
 * Remove HTML tags from a string (basic sanitization)
 *
 * @param str - The string to strip
 * @returns String without HTML tags
 *
 * @example
 * stripHtml("<p>Hello <b>World</b></p>") // "Hello World"
 * stripHtml("<script>alert('xss')</script>") // "alert('xss')"
 *
 * @remarks
 * **Frontend**: Extract text content for previews, search indexing
 * ```typescript
 * const preview = truncate(stripHtml(article.htmlContent), 150);
 * ```
 *
 * **Backend**: Clean HTML from user input for plain text storage
 * ```typescript
 * const plainText = stripHtml(userComment);
 * await sendEmail({ subject: plainText });
 * ```
 *
 * **⚠️ CRITICAL SECURITY WARNING**:
 * - This is NOT safe for XSS prevention - just removes tags, not malicious code
 * - Script content remains: stripHtml("<script>alert(1)</script>") → "alert(1)"
 * - Attributes with JS remain if tags are malformed
 * - NEVER use for sanitization - use DOMPurify or sanitize-html instead
 *
 * **⚠️ Pitfalls**:
 * - Very naive regex - can be fooled by malformed HTML
 * - Removes ALL tags, including safe ones
 * - No handling of entities: "&lt;div&gt;" stays as is (not converted)
 * - May break on nested or complex HTML
 *
 * **✅ Use Cases (Safe)**:
 * - Extracting text for search indexing
 * - Creating plain text previews
 * - Generating meta descriptions
 *
 * **❌ Don't Use For**:
 * - XSS sanitization (use DOMPurify)
 * - Validating safe HTML (use proper sanitizer)
 */
export function stripHtml(str: string): string {
	return str.replace(/<[^>]*>/g, "");
}

/**
 * Check if a string is empty or contains only whitespace
 *
 * @param str - The string to check
 * @returns True if empty or whitespace only
 *
 * @example
 * isBlank("") // true
 * isBlank("   ") // true
 * isBlank("hello") // false
 * isBlank(" hello ") // false
 *
 * @remarks
 * **Frontend**: Validate form inputs, check required fields
 * ```typescript
 * if (isBlank(username)) {
 *   setError("Username is required");
 * }
 * ```
 *
 * **Backend**: Validate request payloads before processing
 * ```typescript
 * if (isBlank(req.body.email)) {
 *   return res.status(400).json({ error: "Email required" });
 * }
 * ```
 *
 * **⚠️ Pitfalls**:
 * - Considers tabs, newlines, spaces as blank
 * - Different from falsy check: isBlank("0") → false (valid string)
 * - null/undefined will throw error - use optional chaining: isBlank(val ?? "")
 */
export function isBlank(str: string): boolean {
	return !str || str.trim().length === 0;
}

/**
 * Reverse a string character by character
 *
 * @param str - The string to reverse
 * @returns Reversed string
 *
 * @example
 * reverse("hello") // "olleh"
 * reverse("React") // "tcaeR"
 *
 * @remarks
 * **Frontend**: Rarely used directly, but useful for animations, puzzles, games
 * ```typescript
 * const revealed = userGuessed ? original : reverse(original);
 * ```
 *
 * **Backend**: Algorithms, data processing, encoding schemes
 * ```typescript
 * const palindrome = str === reverse(str);
 * ```
 *
 * **⚠️ Pitfalls**:
 * - Unicode issues with emojis and combining characters
 * - reverse("👨‍👩‍👧") may break emoji families
 * - Doesn't reverse word order: reverse("hello world") → "dlrow olleh"
 * - For word reversal, split by spaces first
 */
export function reverse(str: string): string {
	return str.split("").reverse().join("");
}

/**
 * Count occurrences of a substring in a string
 *
 * @param str - The string to search in
 * @param search - The substring to search for
 * @param caseSensitive - Whether the search is case sensitive (default: true)
 * @returns Number of occurrences
 *
 * @example
 * countOccurrences("hello world", "l") // 3
 * countOccurrences("Hello World", "o", false) // 2
 * countOccurrences("React React", "React") // 2
 *
 * @remarks
 * **Frontend**: Text analysis, validation, character limits
 * ```typescript
 * const hashtagCount = countOccurrences(tweet, "#");
 * if (hashtagCount > 10) showWarning();
 * ```
 *
 * **Backend**: Content validation, analytics, pattern detection
 * ```typescript
 * const spamScore = countOccurrences(comment, "buy now");
 * ```
 *
 * **⚠️ Pitfalls**:
 * - Overlapping matches NOT counted: countOccurrences("aaa", "aa") → 1 (not 2)
 * - Empty search string returns 0
 * - Special regex chars are escaped automatically - safe for all inputs
 * - Case-insensitive compares lowercased versions - may miss some edge cases
 */
export function countOccurrences(
	str: string,
	search: string,
	caseSensitive = true,
): number {
	if (!search) return 0;

	const text = caseSensitive ? str : str.toLowerCase();
	const pattern = caseSensitive ? search : search.toLowerCase();
	const escapedPattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

	return (text.match(new RegExp(escapedPattern, "g")) || []).length;
}

/**
 * Remove all whitespace from a string (spaces, tabs, newlines)
 *
 * @param str - The string to process
 * @returns String without any whitespace
 *
 * @example
 * removeWhitespace("hello world") // "helloworld"
 * removeWhitespace("  a  b  c  ") // "abc"
 *
 * @remarks
 * **Frontend**: Clean user input for comparison, validation
 * ```typescript
 * const cleanPhone = removeWhitespace(phoneInput); // "(555) 123-4567" → "(555)123-4567"
 * ```
 *
 * **Backend**: Parse formatted data, clean tokens
 * ```typescript
 * const token = removeWhitespace(rawToken); // Remove accidental spaces
 * ```
 *
 * **⚠️ Pitfalls**:
 * - VERY aggressive - removes ALL whitespace including intentional spacing
 * - May break readability: removeWhitespace("Hello World") → "HelloWorld"
 * - Consider str.trim() or str.replace(/\s+/g, " ") for more conservative approach
 * - Useful for validation, less so for display
 */
export function removeWhitespace(str: string): string {
	return str.replace(/\s+/g, "");
}

/**
 * Pad a string to a certain length with another string
 *
 * @param str - The string to pad
 * @param targetLength - The target length
 * @param padString - The string to pad with (default: " ")
 * @param padStart - Whether to pad at the start (true) or end (false) (default: true)
 * @returns Padded string
 *
 * @example
 * pad("5", 3, "0") // "005"
 * pad("5", 3, "0", false) // "500"
 * pad("hello", 10, "-") // "-----hello"
 *
 * @remarks
 * **Frontend**: Format display values, align text, add leading zeros
 * ```typescript
 * const day = pad(String(date.getDate()), 2, "0"); // "05"
 * const time = `${pad(hours, 2, "0")}:${pad(minutes, 2, "0")}`; // "09:05"
 * ```
 *
 * **Backend**: Format IDs, invoice numbers, file names
 * ```typescript
 * const invoiceNum = `INV-${pad(String(id), 6, "0")}`; // "INV-000123"
 * ```
 *
 * **⚠️ Pitfalls**:
 * - If str.length >= targetLength, returns original (no truncation)
 * - Multi-char padString may not fit evenly: pad("5", 5, "ab") → "abab5" (4 chars added)
 * - Empty padString causes infinite loop (avoid)
 * - Consider native String.prototype.padStart() / padEnd() for simple cases
 */
export function pad(
	str: string,
	targetLength: number,
	padString = " ",
	padStart = true,
): string {
	if (str.length >= targetLength) return str;

	const padLength = targetLength - str.length;
	const padding = padString.repeat(Math.ceil(padLength / padString.length));

	if (padStart) {
		return (padding + str).slice(-targetLength);
	}
	return (str + padding).slice(0, targetLength);
}
