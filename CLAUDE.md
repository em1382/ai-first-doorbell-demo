# CLAUDE.md — AI Assistant Context

## Project
WebSocket doorbell demo. Node.js + Express + ws library + TypeScript. Client sends `ring`, server responds `ding-dong`, browser plays synth bell via Web Audio API. No audio files. No build step for frontend.

## Architecture
```
Browser <──WebSocket──> src/server.ts (Express + WebSocketServer, same port)
         HTTP GET /      └── serves public/index.html
```

- `src/app.ts` — `createApp()` factory; exports `isClientMessage`, `ClientMessage`, `ServerMessage`. Import this in tests.
- `src/server.ts` — entry point only. Calls `createApp()`, binds signals, starts listening.
- `dist/` — compiled output (gitignored), produced by `tsc`
- `public/index.html` — self-contained frontend. WebSocket client + Web Audio synth inline.
- JSON message protocol typed as discriminated union:
  ```ts
  type ClientMessage = { event: 'ring' }
  type ServerMessage = { event: 'ding-dong' }
  ```

## File Layout
```
├── src/
│   ├── app.ts                        # server factory + exported types/helpers
│   ├── server.ts                     # entry point — starts server, handles signals
│   └── __tests__/
│       ├── isClientMessage.test.ts   # unit tests for type guard
│       └── server.integration.test.ts
├── dist/                             # gitignored, produced by tsc
├── public/
│   └── index.html
├── CLAUDE.md
├── README.md
├── package.json
├── tsconfig.json          # prod build (excludes __tests__)
├── tsconfig.test.json     # test build (adds jest types, isolatedModules)
├── jest.config.js
├── .env.example
├── .env
└── .gitignore
```

## Key Commands
```
npm run dev    # tsx watch — run TypeScript directly, auto-reload
npm run build  # tsc — compile to dist/
npm start      # node dist/server.js — production
npm test       # jest — run all tests
```

## Environment Variables
Copy `.env.example` → `.env`. Only `PORT` is required (default: 3000).

## Module System
**ESM only. No CJS.** `"type": "module"` in package.json. All source files use `import`/`export`. Relative imports require explicit `.js` extensions (NodeNext resolution). Do not use `require()`, `module.exports`, or `.cjs` files.

Jest runs with `NODE_OPTIONS=--experimental-vm-modules` for native ESM support. Use `import { jest } from '@jest/globals'` when `jest` object is needed in test files.

## TypeScript Conventions
- Strict mode (`"strict": true`)
- No `any` — parse `unknown` WS messages with type guard before use
- `tsx` for dev (no compile step), `tsc` for prod

## Extending
- **New WS events**: add case to `wss.on('connection')` handler in `src/server.ts` + extend `ClientMessage`/`ServerMessage` union + add `ws.addEventListener('message')` case in `index.html`
- **Broadcast to all clients**: iterate `wss.clients` Set: `wss.clients.forEach(c => c.send(...))`
- **Persist state**: add a module, import into `src/server.ts` — no framework needed
- **Auth/rooms**: add query params to the WebSocket URL (`ws://host?room=x`) and parse in `src/server.ts` using the `request` arg of the `connection` event
