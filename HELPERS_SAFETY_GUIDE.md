# Helper Functions - Safety Guide & Best Practices

This document provides comprehensive guidance on using the helper functions in frontend (React) and backend (Node.js) environments, including common pitfalls and safety concerns.

---

## 📚 Table of Contents

- [String Helpers](#string-helpers)
- [Array Helpers](#array-helpers)
- [Async Helpers](#async-helpers)
- [Object Helpers](#object-helpers)

---

## String Helpers

### General Frontend/Backend Safety

✅ **Safe in both**: All string helpers are synchronous and safe to use in both frontend and backend.
⚠️ **Memory concerns**: Processing very large strings (>10MB) may cause performance issues.

### Security Considerations

#### `escapeHtml()` - XSS Prevention
```typescript
// ❌ DANGEROUS - Not sufficient for XSS prevention
<div dangerouslySetInnerHTML={{ __html: escapeHtml(userInput) }} />

// ✅ SAFE - Use React's built-in escaping
<div>{userInput}</div>

// 🎯 For rich text, use proper libraries
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userHtml) }} />
```

**Key Points**:
- `escapeHtml()` only escapes 5 characters: `& < > " '`
- NOT a complete XSS solution
- React escapes by default - you rarely need this
- For backends: use template engines with auto-escaping

#### `stripHtml()` - NOT for Sanitization
```typescript
// ❌ NEVER use for security
const clean = stripHtml(userInput); // Still contains malicious code!

// ✅ Use proper sanitization
import sanitizeHtml from 'sanitize-html';
const clean = sanitizeHtml(userInput);
```

**Why it's unsafe**:
- Only removes tags, not malicious content
- `stripHtml("<script>alert(1)</script>")` → `"alert(1)"` (code remains!)
- Use for text extraction only, never for sanitization

### Common Pitfalls

#### Case Conversion Functions

```typescript
// ⚠️ Consecutive capitals
snakeCase("XMLParser") // "x_m_l_parser" (not "xml_parser")
kebabCase("HTMLElement") // "h-t-m-l-element" (not "html-element")

// ⚠️ Irreversible
const snake = snakeCase("firstName"); // "first_name"
const camel = camelCase(snake); // "firstName" ✅ (works by luck)
// But not guaranteed for all cases!
```

#### `slugify()` - Data Loss
```typescript
// ⚠️ Removes special characters - NOT reversible
slugify("Café & Restaurant") // "caf-restaurant" (accent and & lost!)
slugify("Hello!") === slugify("Hello?") // true (both become "hello")

// Don't use for data that needs restoration
```

#### `truncate()` - Word Boundaries
```typescript
// ⚠️ May cut mid-word
truncate("Hello World", 8) // "Hello..."
truncate("Supercalifragilisticexpialidocious", 10) // "Superca..."

// ✅ For word-aware truncation, implement custom logic
function truncateWords(str, maxChars) {
  if (str.length <= maxChars) return str;
  const cut = str.slice(0, maxChars);
  const lastSpace = cut.lastIndexOf(' ');
  return lastSpace > 0 ? cut.slice(0, lastSpace) + '...' : cut + '...';
}
```

---

## Array Helpers

### Frontend/Backend Safety

✅ **Safe in both**: All array helpers are synchronous and pure (don't mutate originals).
⚠️ **Performance**: Be mindful of large arrays (>100k items).

### Performance Considerations

#### `unique()`, `uniqueBy()`, `groupBy()`
```typescript
// ⚠️ O(n) complexity - fine for most cases
const unique = unique(items); // Fast for arrays < 100k

// ⚠️ uniqueBy() uses Set - watch memory with large objects
const uniqueUsers = uniqueBy(users, u => u.id); // Fine for normal datasets

// 🔴 For VERY large datasets (millions), consider streaming or chunking
```

#### `shuffle()` - Not Cryptographically Secure
```typescript
// ✅ Fine for UI, games, random sampling
const shuffled = shuffle(playlist);

// ❌ NOT for cryptography or security
const secureToken = shuffle(chars).join(''); // DON'T DO THIS!

// ✅ For security, use crypto.randomBytes
import crypto from 'crypto';
const secureRandom = crypto.randomBytes(32).toString('hex');
```

### Common Pitfalls

#### `flatten()` vs `flattenDeep()`
```typescript
// flatten() - Only one level
flatten([[1, 2], [3, [4]]]) // [1, 2, 3, [4]]

// flattenDeep() - All levels
flattenDeep([[1, 2], [3, [4]]]) // [1, 2, 3, 4]

// ⚠️ Type safety lost with flattenDeep
```

#### `compact()` - Falsy Values
```typescript
// ⚠️ Removes ALL falsy values, including 0 and false
compact([0, 1, false, 2, '', 3]) // [1, 2, 3]
// Loses: 0, false, ''

// If you need to keep 0 or false, use filter manually
items.filter(item => item !== null && item !== undefined)
```

#### `minBy()`, `maxBy()` - Undefined Arrays
```typescript
// ⚠️ Returns undefined for empty arrays
minBy([], x => x.value) // undefined
maxBy([], x => x.value) // undefined

// ✅ Always check or provide default
const min = minBy(items, x => x.price) ?? { price: 0 };
```

---

## Async Helpers

### ⚠️ CRITICAL: Frontend vs Backend Safety

#### `debounceSync()` - React State Updates

**✅ Safe in React**:
```typescript
import { useMemo } from 'react';

function SearchComponent() {
  const [query, setQuery] = useState('');

  // ✅ MUST wrap in useMemo to prevent recreation
  const debouncedSetQuery = useMemo(
    () => debounceSync(setQuery, 300),
    [] // Empty deps - create once
  );

  return <input onChange={(e) => debouncedSetQuery(e.target.value)} />;
}
```

**⚠️ Pitfalls**:
```typescript
// ❌ DON'T create debounced function on every render
function Bad() {
  const [text, setText] = useState('');
  const debounced = debounceSync(setText, 300); // RECREATED EVERY RENDER!
  // ...
}

// ❌ DON'T forget cleanup in useEffect
useEffect(() => {
  const debounced = debounceSync(apiCall, 500);
  // ... use debounced
  // Missing cleanup = memory leak!
}, []);
```

**✅ Backend Safety**:
- Safe for non-critical operations (logging, file writes)
- ❌ NOT for critical ops (database writes, payments)
- For critical ops, use job queues (Bull, BullMQ)

#### `waitFor()` - Polling Dangers

**🔴 DANGEROUS in React** (without cleanup):
```typescript
// ❌ Memory leak - continues after unmount
function Bad() {
  useEffect(() => {
    waitFor(() => condition, { timeout: 30000 });
    // No cleanup!
  }, []);
}

// ✅ Proper cleanup
function Good() {
  useEffect(() => {
    let cancelled = false;

    waitFor(() => !cancelled && condition, {
      timeout: 30000,
      onFinish: () => !cancelled && doSomething(),
      onTimeout: () => !cancelled && handleTimeout()
    }).catch(() => {});

    return () => { cancelled = true }; // Cleanup!
  }, []);
}
```

**🔴 DANGEROUS in Backend** (production):
```typescript
// ❌ Wastes resources polling
app.get('/status', async (req, res) => {
  await waitFor(() => service.isReady()); // Blocks request!
  res.json({ status: 'ok' });
});

// ✅ Use event-driven pattern
service.on('ready', () => {
  console.log('Service ready!');
});
```

**Use Cases**:
- ✅ Tests, development, debugging
- ✅ One-time initialization checks
- ❌ Production polling (use events/webhooks instead)

#### `retry()` - Exponential Backoff Risks

**⚠️ Watch Total Wait Time**:
```typescript
// With maxRetries: 6, initialDelay: 1000, backoff: 2x
// Total possible wait: 1s + 2s + 4s + 8s + 16s + 32s = 63 seconds!

// ✅ Set maxDelay to cap wait times
retry(fn, {
  maxRetries: 6,
  initialDelay: 1000,
  maxDelay: 5000 // Cap at 5 seconds
});
```

**⚠️ Serverless Timeouts**:
```typescript
// ❌ Can exceed Lambda 15min limit
retry(longTask, { maxRetries: 10 }); // May timeout!

// ✅ Use job queues for long-running tasks
await queue.add('long-task', data);
```

**⚠️ Only Retry Appropriate Errors**:
```typescript
// ❌ Retrying client errors wastes time
retry(() => fetch('/api/data'), {
  shouldRetry: () => true // Retries 400s, 401s, etc!
});

// ✅ Only retry transient failures
retry(() => fetch('/api/data'), {
  shouldRetry: (error) => {
    const status = error?.response?.status;
    return !status || status >= 500; // Only retry server errors
  }
});
```

#### `sleep()` / `delay()` - Thread Blocking Myth

**✅ SAFE - Not blocking in JavaScript**:
```typescript
// This is NON-BLOCKING - other requests continue
async function handler(req, res) {
  await sleep(1000); // Pauses THIS request only
  res.json({ data });
}

// While one request sleeps, others are processed concurrently
```

**⚠️ When to be cautious**:
- Very high concurrency (thousands of requests)
- May exhaust connection pools or memory
- Consider job queues for high-volume scenarios

#### `parallelLimit()` - Concurrency Control

**✅ Use to prevent overwhelming services**:
```typescript
// ❌ All 1000 requests at once
await Promise.all(users.map(u => sendEmail(u)));

// ✅ Limit to 10 concurrent requests
await parallelLimit(
  users.map(u => () => sendEmail(u)),
  10
);
```

**⚠️ Doesn't prevent rate limits**:
- Still sends all requests eventually
- For rate limiting, use throttling or queues

#### `memoizeAsync()` - Cache Considerations

**⚠️ Memory Leaks**:
```typescript
// ❌ Unbounded cache - memory leak!
const cached = memoizeAsync(fetchUser);

// ✅ Use TTL to expire old entries
const cached = memoizeAsync(fetchUser, {
  ttl: 60000 // 1 minute cache
});
```

**⚠️ Stale Data**:
```typescript
// Cache persists across requests
// User updates profile, but cache shows old data
const cached = memoizeAsync(getProfile, { ttl: 3600000 }); // 1 hour!

// ✅ Invalidate on updates or use shorter TTL
```

---

## Object Helpers

### Frontend/Backend Safety

✅ **Safe in both**: All object helpers are synchronous and safe.
⚠️ **Deep operations**: `deepClone()`, `deepMerge()` can be slow on large objects.

### Performance & Safety

#### `deepClone()` - Performance
```typescript
// ⚠️ Can be slow on deep/large objects
const clone = deepClone(hugenestedObject); // May take time!

// ✅ For simple objects, use spread
const clone = { ...obj };

// ✅ For known structures, use structuredClone (native)
const clone = structuredClone(obj); // Faster than custom deep clone
```

**What it clones**:
- ✅ Objects, arrays, dates, sets, maps, regexes
- ❌ Functions (not cloned)
- ❌ Symbols (not cloned)
- ❌ WeakMaps, WeakSets (not cloned)

#### `deepMerge()` - Mutation & Arrays
```typescript
// ⚠️ Arrays are REPLACED, not merged
deepMerge(
  { tags: ['a', 'b'] },
  { tags: ['c'] }
) // { tags: ['c'] } - not ['a', 'b', 'c']!

// ✅ For array merging, do it manually
const merged = {
  ...obj1,
  ...obj2,
  tags: [...obj1.tags, ...obj2.tags]
};
```

#### `getPath()`, `setPath()`, `hasPath()` - Type Safety

**✅ Type-safe autocomplete**:
```typescript
const user = { profile: { name: "John", age: 30 } };

// ✅ Autocomplete suggests: "profile", "profile.name", "profile.age"
const name = getPath(user, "profile.name"); // Type: string | undefined

// ❌ Type error on invalid paths
getPath(user, "invalid.path"); // TypeScript error!
```

**⚠️ Pitfalls**:
```typescript
// Works at runtime, but may be unsafe
const value = getPath(obj, dynamicPath); // No autocomplete

// Always validate dynamic paths
if (hasPath(obj, dynamicPath)) {
  const value = getPath(obj, dynamicPath);
}
```

#### `flattenObject()` / `unflattenObject()` - Data Loss
```typescript
// ⚠️ Keys with dots are problematic
const obj = { "user.name": "John", user: { email: "..." } };
const flat = flattenObject(obj);
// Conflict! Both create "user.name" and "user.email"

// ⚠️ Arrays are NOT handled specially
flattenObject({ items: [1, 2, 3] })
// { 'items.0': 1, 'items.1': 2, 'items.2': 3 }
```

---

## 🎯 Quick Decision Guide

### "Should I use this helper in my React app?"

| Helper | React Safe? | Notes |
|--------|-------------|-------|
| String helpers | ✅ Yes | All safe, use freely |
| Array helpers | ✅ Yes | All safe, watch performance on large arrays |
| `debounceSync()` | ✅ Yes | **MUST** wrap in `useMemo` |
| `debounce()` | ✅ Yes | For async API calls |
| `waitFor()` | ⚠️ Careful | **MUST** add cleanup in `useEffect` |
| `retry()` | ✅ Yes | Great for failed fetches |
| `sleep()` | ✅ Yes | Non-blocking, safe to use |
| Object helpers | ✅ Yes | All safe |

### "Should I use this helper in my backend?"

| Helper | Backend Safe? | Notes |
|--------|---------------|-------|
| String helpers | ✅ Yes | All safe |
| Array helpers | ✅ Yes | Watch performance on huge datasets |
| `debounceSync()` | ⚠️ Limited | Only for non-critical ops (logging, file writes) |
| `debounce()` | ⚠️ Limited | Same as above |
| `waitFor()` | ❌ No | Use events/webhooks in production |
| `retry()` | ✅ Yes | Great for external API calls, DB reconnects |
| `sleep()` | ✅ Yes | Non-blocking, but watch concurrency |
| `parallelLimit()` | ✅ Yes | Prevent overwhelming services |
| Object helpers | ✅ Yes | All safe |

---

## 🔒 Security Checklist

Before using helpers with user input:

- [ ] `escapeHtml()` - NOT sufficient for XSS prevention, use DOMPurify
- [ ] `stripHtml()` - NEVER use for sanitization
- [ ] `slugify()` - Safe, but test for empty results
- [ ] Deep operations - Watch for prototype pollution if merging user objects
- [ ] Regex helpers - All inputs are escaped, safe from regex injection

---

## 📞 Need Help?

- **React Memory Leaks**: Always cleanup debounced/polling functions in `useEffect` return
- **Backend Performance**: For critical ops, prefer job queues over retry/debounce
- **Security**: Never trust `escapeHtml()` or `stripHtml()` for XSS prevention
- **Type Safety**: Use the type-safe `getPath()` / `setPath()` / `hasPath()` with autocomplete

**Remember**: When in doubt, check this guide or open an issue!
