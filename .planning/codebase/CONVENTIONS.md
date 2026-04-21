# CONVENTIONS.md - TongHopTinTuc Coding Conventions

## Language
- **JavaScript** - Plain JS, no TypeScript (despite tsconfig.json)
- **Node.js** - ESM or CJS (currently CJS)

## Naming
- `camelCase` for functions/variables
- `PascalCase` for classes/interfaces

## Project Structure
- Entry point scripts in root: `fetch-news.js`, `generate.js`, `gen-image.js`, `post.js`
- Services in `src/services/`
- Utilities in `src/`

## Environment
- `.dev.vars` for local development
- Use `process.env` for all config

## Error Handling
- Log errors with `console.error`
- Exit with `process.exit(1)` on failure

---

*Generated: 2026-04-18*