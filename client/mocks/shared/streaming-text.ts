// Natural LLM-like text patterns for realistic streaming

export const RESEARCH_TEXT = `Analyzing the codebase structure...

Found 3 relevant files in src/auth/:
- src/auth/login.ts (authentication entry point)
- src/auth/session.ts (session management)
- src/auth/types.ts (type definitions)

The current authentication implementation uses JWT tokens stored in
localStorage. The main flow is:

1. User submits credentials to /api/auth/login
2. Server validates and returns JWT + refresh token
3. Client stores tokens and attaches JWT to subsequent requests

Key findings:
- No refresh token rotation (security risk)
- Session expiry hardcoded to 24h
- Missing rate limiting on login endpoint`;

export const PLAN_TEXT = `Based on the analysis, here's the implementation plan:

## Task 1: Add refresh token rotation
- Modify src/auth/session.ts to track token usage
- Add rotation logic on each refresh
- Update client to handle new token on rotation

## Task 2: Make session expiry configurable
- Add SESSION_EXPIRY_HOURS to .env
- Update src/auth/login.ts to read from env
- Default to 24h for backwards compatibility

## Task 3: Implement rate limiting
- Add rate-limiter-flexible package
- Create middleware in src/middleware/rateLimit.ts
- Apply to /api/auth/* routes

Estimated changes: 4 files, ~120 lines added`;

export const EXECUTE_TEXT = `Starting implementation...

## Task 1: Implementing refresh token rotation

Updating session.ts to track token generation count and rotate
on each refresh. This prevents token replay attacks.

## Task 2: Making session expiry configurable

Reading SESSION_EXPIRY_HOURS from environment with 24h default.
Updating JWT signing to use the configured value.

## Task 3: Adding rate limiting

Creating rate limiter middleware with:
- 5 attempts per minute for login
- 10 attempts per minute for other auth endpoints

Running verification checks...

All changes complete. Summary:
- Modified 3 files
- Added 1 new file
- 45 lines added, 12 lines removed`;

export const ANALYZE_TEXT = `Diagnosing the issue...

Searching for error patterns in the codebase:

Found the root cause in src/auth/login.ts:42

The validateToken function is being called with a null token
when the Authorization header is malformed. The current code:

\`\`\`typescript
const token = authHeader.slice(7);  // Assumes "Bearer " prefix
const payload = validateToken(token);
\`\`\`

This fails when:
1. Header doesn't start with "Bearer "
2. Header is exactly "Bearer" with no token
3. Token contains invalid characters

The fix should validate the header format before extraction.`;

export const FIX_TEXT = `Implementing the fix...

Adding header validation before token extraction:

\`\`\`typescript
if (!authHeader?.startsWith('Bearer ') || authHeader.length <= 7) {
  res.status(401).json({ error: 'Invalid authorization header' });
  return;
}
\`\`\`

Running tests to verify the fix...

All tests passing:
- auth/login.test.ts: 4 passed
- auth/middleware.test.ts: 3 passed
- integration/auth.test.ts: 6 passed

Fix complete.`;
