---
phase: 3-facebook-integration
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/services/facebook.ts
  - src/index.ts
autonomous: true
requirements:
  - FB-01
  - FB-02
  - FB-03
  - FB-04
user_setup:
  - service: facebook
    why: "Page posting requires external configuration"
    env_vars:
      - name: FACEBOOK_PAGE_ID
        source: "Facebook Page Settings -> Page ID"
      - name: FACEBOOK_ACCESS_TOKEN
        source: "Graph API Explorer -> Get Token -> Select Page"

must_haves:
  truths:
    - "Posts appear on Facebook Fanpage with text content"
    - "Page Access Token works (not user token) — verified via Graph API"
    - "Token renewal mechanism in place (renew before 60-day expiry)"
    - "Posting time randomized within ±15 minute window to avoid spam detection"
  artifacts:
    - path: "src/services/facebook.ts"
      provides: "Facebook Graph API integration"
      exports: ["postToPage", "getPageInfo", "validateToken"]
    - path: "src/index.ts"
      provides: "Hono router with /facebook/* endpoints"
  key_links:
    - from: "src/index.ts"
      to: "src/services/facebook.ts"
      via: "import and call functions"
      pattern: "import.*facebook"
---

<objective>
Implement Facebook Fanpage posting with Page Access Token management and spam prevention.

Purpose: Enable the system to post content to Facebook Fanpage with proper token handling and timing randomization to avoid spam detection.

Output: Working facebook.ts service with postToPage, getPageInfo, validateToken functions, and API endpoints.
</objective>

<execution_context>
@$HOME/.config/opencode/get-shit-done/workflows/execute-plan.md
@$HOME/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/3-CONTEXT.md
@.planning/ROADMAP.md
@.planning/REQUIREMENTS.md
</context>

<tasks>

<task type="auto">
  <name>task 1: Create Facebook service with core functions</name>
  <files>src/services/facebook.ts</files>
  <action>
Create `src/services/facebook.ts` with the following:

1. **Type definitions**:
   - `PostResult`: { success: boolean, postId?: string, error?: string }
   - `PageInfo`: { id: string, name: string, fan_count: number }
   - `FacebookPost`: { caption: string, imageUrl?: string }

2. **Core functions** (use built-in fetch for Cloudflare Workers):
   - `postToPage(caption: string, imageUrl?: string): Promise<PostResult>`
     - POST to `https://graph.facebook.com/v25.0/{pageId}/photos` (preferred for photo posts) or `/feed`
     - Include `access_token` from env
     - Handle errors: invalid token, rate limit, missing photo
   - `getPageInfo(): Promise<PageInfo>`
     - GET `https://graph.facebook.com/v25.0/{pageId}?fields=id,name,fan_count`
   - `validateToken(): Promise<boolean>`
     - GET to `/me` endpoint to verify token validity

3. **Token handling**:
   - Read from `FACEBOOK_ACCESS_TOKEN` and `FACEBOOK_PAGE_ID` env vars
   - Return clear errors if tokens missing

4. **Error handling per CONTEXT.md**:
   - Invalid token: Log error, alert admin, stop pipeline
   - Rate limit: Wait, retry once after 5 min
   - Missing photo: Fallback to text-only post (/feed endpoint)
   - API timeout: Log, continue with next step
</action>
<verify>
<automated>tsc --noEmit src/services/facebook.ts 2>&1 || echo "tsc not available, manual check required"</automated>
</verify>
<done>Facebook service module created with postToPage, getPageInfo, validateToken exported</done>
</task>

<task type="auto">
  <name>task 2: Add spam prevention with random timing</name>
  <files>src/services/facebook.ts</files>
  <action>
Add to facebook.ts:

1. **Random delay function**:
   - `getRandomDelay(): number` — returns random value between 0-15 minutes (in ms)
   - Used to randomize posting time from scheduled time

2. **Content variation helpers**:
   - Hook phrases array: ["Mới nhất:", "Cập nhật:", "Hot:", "Thông tin mới:", "Chú ý:"]
   - `getRandomHook(): string` — picks random hook for variation
   - Occasionally (20% chance) post text-only without image

3. **Rate limiting**:
   - Track last post time in module-level variable (in-memory for Workers)
   - Enforce minimum 1 hour between posts

4. **Token expiry tracking**:
   - Log warning when token is >50 days old
   - Include expiry info in page info response
</action>
<verify>
<automated>grep -n "getRandomDelay\|getRandomHook" src/services/facebook.ts</automated>
</verify>
<done>Spam prevention functions added: random delay 0-15min, hook variation, rate limiting</done>
</task>

<task type="auto">
  <name>task 3: Wire Facebook endpoints to Hono router</name>
  <files>src/index.ts</files>
  <action>
Update `src/index.ts` to add Facebook API routes:

1. **POST /facebook/post** — Post content to Fanpage
   - Body: { caption: string, imageUrl?: string }
   - Calls postToPage(caption, imageUrl)
   - Returns { success, postId, error }

2. **GET /facebook/info** — Get page info
   - Calls getPageInfo()
   - Returns { id, name, fan_count }

3. **GET /facebook/validate** — Validate token
   - Calls validateToken()
   - Returns { valid: boolean }

4. **POST /facebook/test** — Test endpoint (for verification)
   - Posts a test message to verify setup
   - Requires FACEBOOK_ACCESS_TOKEN and FACEBOOK_PAGE_ID env vars
</action>
<verify>
<automated>grep -n "facebook" src/index.ts</automated>
</verify>
<done>Facebook API routes added to Hono router: POST /facebook/post, GET /facebook/info, GET /facebook/validate, POST /facebook/test</done>
</task>

</tasks>

<verification>
- [ ] facebook.ts exports postToPage, getPageInfo, validateToken
- [ ] TypeScript compiles without errors
- [ ] /facebook/post endpoint accepts caption and optional imageUrl
- [ ] /facebook/info returns page id, name, fan_count
- [ ] /facebook/validate returns token validity status
- [ ] Random delay function returns 0-900000ms (0-15 min)
- [ ] getRandomHook returns random hook phrase
- [ ] Rate limiting enforces 1 hour minimum between posts
</verification>

<success_criteria>
1. Posts appear on Facebook Fanpage with text content
2. Page Access Token works (not user token) — verified via Graph API
3. Token renewal mechanism in place (renew before 60-day expiry)
4. Posting time randomized within ±15 minute window to avoid spam detection
</success_criteria>

<output>
After completion, create `.planning/phases/3-facebook-integration/3-01-SUMMARY.md`
</output>