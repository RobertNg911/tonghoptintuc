---
phase: 01-setup
plan: 01
type: execute
wave: 1
depends_on: []
files_modified: [package.json, wrangler.toml, tsconfig.json, .gitignore, src/index.ts, src/routes/health.ts, src/utils/env.ts]
autonomous: true
requirements: []
must_haves:
  truths:
    - "Worker can be deployed to Cloudflare without errors"
    - "GET /health returns 200 OK with status"
    - "Environment variables load correctly for API keys"
    - "Project structure ready for incremental development"
  artifacts:
    - path: "src/index.ts"
      provides: "Main Hono app entry point with middleware"
      min_lines: 15
    - path: "src/routes/health.ts"
      provides: "Health endpoint route handler"
      min_lines: 20
    - path: "src/utils/env.ts"
      provides: "Environment variable validation"
      min_lines: 20
    - path: "package.json"
      provides: "Project dependencies"
      exports: ["dev", "deploy"]
    - path: "wrangler.toml"
      provides: "Cloudflare Workers configuration"
      contains: "name = \"tonghoptintuc\""
  key_links:
    - from: "src/index.ts"
      to: "src/routes/health.ts"
      via: "app.route()"
      pattern: "app.route\\('/health', healthRoute\\)"
    - from: "src/index.ts"
      to: "hono"
      via: "import"
      pattern: "import.*from 'hono'"
---

<objective>
Create Cloudflare Workers project with Hono framework, including health endpoint for validation. Establish project foundation that can be deployed and verified.
</objective>

<context>
@.planning/phases/01-setup/01-CONTEXT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/REQUIREMENTS.md
</context>

<tasks>

<task type="auto">
  <name>task 1: Initialize Cloudflare Workers project</name>
  <files>package.json, wrangler.toml, tsconfig.json, .gitignore</files>
  <action>
    Create the following files in the project root:

    1. **package.json**:
    ```json
    {
      "name": "tonghoptintuc",
      "version": "1.0.0",
      "type": "module",
      "scripts": {
        "dev": "wrangler dev",
        "deploy": "wrangler deploy",
        "build": "wrangler deploy"
      },
      "dependencies": {
        "hono": "^4.0.0"
      },
      "devDependencies": {
        "@cloudflare/workers-types": "^4.20241127.0",
        "typescript": "^5.7.2",
        "wrangler": "^3.97.0"
      }
    }
    ```

    2. **wrangler.toml**:
    ```toml
    name = "tonghoptintuc"
    main = "src/index.ts"
    compatibility_date = "2026-04-12"
    workers_dev = true
    
    [vars]
    NODE_ENV = "production"
    LOG_LEVEL = "info"
    ```

    3. **tsconfig.json**:
    ```json
    {
      "compilerOptions": {
        "target": "ES2022",
        "lib": ["ES2022"],
        "module": "ES2022",
        "moduleResolution": "bundler",
        "resolveJsonModule": true,
        "allowJs": true,
        "strict": true,
        "skipLibCheck": true,
        "noEmit": true,
        "esModuleInterop": true,
        "types": ["@cloudflare/workers-types"]
      },
      "include": ["src/**/*"]
    }
    ```

    4. **.gitignore**:
    ```
    node_modules/
    dist/
    .wrangler/
    .dev.vars
    ```
  </action>
  <verify>
    <automated>test -f package.json && test -f wrangler.toml && test -f tsconfig.json && echo "CONFIG_CREATED"</automated>
  </verify>
  <done>package.json, wrangler.toml, tsconfig.json, and .gitignore exist with valid content</done>
</task>

<task type="auto">
  <name>task 2: Create Hono app with health endpoint</name>
  <files>src/index.ts, src/routes/health.ts, src/utils/env.ts</files>
  <action>
    Create the following files:

    1. **src/index.ts** (main entry):
    ```typescript
    import { Hono } from 'hono';
    import { cors } from 'hono/cors';
    import { logger } from 'hono/logger';
    import { healthRoute } from './routes/health';

    const app = new Hono();

    // Middleware
    app.use('*', cors());
    app.use('*', logger());

    // Routes
    app.route('/health', healthRoute);

    // Default route
    app.get('/', (c) => c.json({ 
      name: 'TongHopTinTuc',
      version: '1.0.0',
      status: 'running'
    }));

    export default app;
    ```

    2. **src/routes/health.ts**:
    ```typescript
    import { Hono } from 'hono';
    import { getRuntimeKey } from 'hono/adapter';

    const healthRoute = new Hono();

    // Track start time for uptime calculation
    const startTime = Date.now();

    healthRoute.get('/', (c) => {
      const uptimeMs = Date.now() - startTime;
      const uptime = formatUptime(uptimeMs);
      
      return c.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        uptime,
        runtime: getRuntimeKey()
      });
    });

    function formatUptime(ms: number): string {
      const seconds = Math.floor(ms / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      
      if (hours > 0) {
        return `${hours}h ${minutes % 60}m`;
      } else if (minutes > 0) {
        return `${minutes}m ${seconds % 60}s`;
      }
      return `${seconds}s`;
    }

    export { healthRoute };
    ```

    3. **src/utils/env.ts** (environment validation):
    ```typescript
    interface Env {
      FACEBOOK_PAGE_ID: string;
      FACEBOOK_ACCESS_TOKEN: string;
      GEMINI_API_KEY: string;
      LOG_LEVEL?: string;
      NODE_ENV?: string;
    }

    function getEnv(c: { env: Env }): Env {
      const required = ['FACEBOOK_PAGE_ID', 'FACEBOOK_ACCESS_TOKEN', 'GEMINI_API_KEY'];
      const missing: string[] = [];

      for (const key of required) {
        if (!c.env[key] || c.env[key].trim() === '') {
          missing.push(key);
        }
      }

      if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
      }

      return c.env as Env;
    }

    export { getEnv, type Env };
    ```
  </action>
  <verify>
    <automated>test -f src/index.ts && test -f src/routes/health.ts && test -f src/utils/env.ts && echo "SOURCE_CREATED"</automated>
  </verify>
  <done>src/index.ts creates Hono app with middleware and health route, health.ts returns proper JSON response, env.ts validates required environment variables</done>
</task>

<task type="auto">
  <name>task 3: Verify health endpoint works</name>
  <files>src/index.ts, src/routes/health.ts</files>
  <action>
    Run the development server and verify health endpoint responds correctly:
    
    1. Install dependencies: `npm install`
    2. Start dev server in background: `npm run dev &`
    3. Test health endpoint: `curl http://localhost:8787/health`
    4. Verify response contains: status: "ok", timestamp, version, uptime
    
    The endpoint should return 200 OK with valid JSON containing the required fields.
  </action>
  <verify>
    <automated>curl -s http://localhost:8787/health | grep -q '"status":"ok"' && echo "HEALTH_OK"</automated>
  </verify>
  <done>GET /health returns 200 OK with JSON containing status: "ok", timestamp, version, and uptime fields</done>
</task>

</tasks>

<verification>
- [ ] package.json valid with hono, wrangler dependencies
- [ ] wrangler.toml configured with name, main, compatibility_date
- [ ] tsconfig.json configured for Cloudflare Workers
- [ ] src/index.ts creates Hono app with cors and logger middleware
- [ ] /health route returns expected JSON structure
- [ ] Environment variable validation in src/utils/env.ts
- [ ] Dev server starts without errors
- [ ] Health endpoint responds with 200 OK
</verification>

<success_criteria>
1. Worker deploys to Cloudflare without errors
2. GET /health returns 200 OK with status, timestamp, version, uptime
3. Environment variables load correctly for API keys
4. Project structure ready for incremental development
</success_criteria>

<output>
After completion, create `.planning/phases/01-setup/01-SUMMARY.md`
</output>
