# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**nswag-ts** (npm: `swagger-ts-api_zwj`) is a CLI tool that generates TypeScript client code from Swagger/OpenAPI JSON documents. It fetches swagger specs via HTTP, parses them, and renders TypeScript files using EJS templates with optional Prettier formatting.

## Commands

- `npm run build` — Compile TypeScript (`src/` → `dist/`) via `tsc`
- `npm run build:dev` — Compile in watch mode
- `npm run release` — Build and publish to npm registry
- `npm run init` — Run `nswag init dev` (copies default templates to `test/` directory for development)
- `npm run run` — Run `nswag run dev` (generates code using `test/nswag/config.js`)
- `npm run version` / `npm run help` — Show version or help

Note: The `dev` flag in `init`/`run` scripts sets `basePath` to `./test` instead of the consuming project's root (see `bin/nswag.js:19`).

## Architecture

### Entry Point

`bin/nswag.js` — CLI entry that parses args and dispatches to `dist/init` or `dist/run`. Two commands:
- **`init`** — Copies `def/` (config + EJS templates) into the target project's `nswag/` directory
- **`run`** — Reads `nswag/config.js`, fetches swagger JSON per API config, and generates TypeScript code

### Source Modules (`src/`)

| File | Purpose |
|------|---------|
| `type.ts` | All TypeScript interfaces: `NswagOptions`, `SwaggerApi`, `Tag`, `Method`, `Model`, `Propertie`, `Enum`, `EnumItem` |
| `fs.ts` | File utilities: `copy` (recursive), `markDirsSync` (mkdir -p), `removeDirSync` (rm -rf) |
| `init.ts` | Copies `def/` directory to target project's `nswag/` folder |
| `swagger.ts` | **Core** — `Swagger` class: parses swagger JSON, converts types, resolves `$ref`, builds tags/methods/models/enums, renders EJS templates, writes output files |
| `run.ts` | Orchestrator: reads config, fetches swagger JSON via axios, constructs `Swagger` instances, calls `generate()` |

### Code Generation Flow

1. `run.ts` reads `nswag/config.js` → iterates over `Apis` array
2. Each API config triggers an HTTP GET to `SwaggerUrl` (with `rejectUnauthorized: false`)
3. `Swagger` class parses the JSON (`components.schemas` for OpenAPI 3, `definitions` for Swagger 2)
4. `generate()` cleans output dir, then renders templates:
   - `base.ejs` → `base/index.ts` (API base class with axios)
   - `model.ejs` → `model/index.ts` (DTO interfaces & enums)
   - `method.ejs` → `{ControllerName}.ts` per tag (API method functions)
   - `mock.ejs` / `mock-method.ejs` → `mock/` (if `Mock: true`)
5. Output is optionally formatted with Prettier

### Templates (`def/tpl/`)

Default EJS templates copied to user's project during `init`. Users can customize them. The `Swagger` class is passed as the EJS `context`, so template helpers (`getParameter`, `getTagModels`, `getResponses`, `getModelsAndEnums`, `mock`, `getTags`) are callable inside templates.

### Published Package

`files` in `package.json` includes only `dist/`, `def/`, `bin/`. Source (`src/`) is not published.
