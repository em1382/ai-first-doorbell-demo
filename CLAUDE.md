# CLAUDE.md — AI Assistant Context

## Project
WebSocket doorbell demo. Node.js + Express + ws library + TypeScript. Client sends `ring`, server responds `ding-dong`, browser plays synth bell via Web Audio API. No audio files. No build step for frontend.

## Architecture
```
Browser <──WebSocket──> src/server.ts (Express + WebSocketServer, same port)
         HTTP GET /      └── serves public/index.html
```

- `src/server.ts` — entry point. `http.createServer(app)` lets ws and Express share one port.
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
│   └── server.ts
├── dist/               # gitignored
├── public/
│   └── index.html
├── CLAUDE.md
├── README.md
├── package.json
├── tsconfig.json
├── .env.example
├── .env
└── .gitignore
```

## Key Commands
```
npm run dev    # tsx watch — run TypeScript directly, auto-reload
npm run build  # tsc — compile to dist/
npm start      # node dist/server.js — production
```

## Environment Variables
Copy `.env.example` → `.env`. Only `PORT` is required (default: 3000).

## TypeScript Conventions
- Strict mode (`"strict": true`)
- No `any` — parse `unknown` WS messages with type guard before use
- `tsx` for dev (no compile step), `tsc` for prod

## Extending
- **New WS events**: add case to `wss.on('connection')` handler in `src/server.ts` + extend `ClientMessage`/`ServerMessage` union + add `ws.addEventListener('message')` case in `index.html`
- **Broadcast to all clients**: iterate `wss.clients` Set: `wss.clients.forEach(c => c.send(...))`
- **Persist state**: add a module, import into `src/server.ts` — no framework needed
- **Auth/rooms**: add query params to the WebSocket URL (`ws://host?room=x`) and parse in `src/server.ts` using the `request` arg of the `connection` event
