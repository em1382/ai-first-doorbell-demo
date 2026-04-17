# WebSocket Doorbell

Minimal WebSocket demo: click a button, hear a bell. Built with Node.js, Express, and the `ws` library. No audio files — sound is synthesized with the Web Audio API.

## Prerequisites

- Node.js 20+

## Setup

```bash
npm install
cp .env.example .env
```

## Run

```bash
npm run dev   # development (auto-reload)
npm start     # production
```

Open [http://localhost:3000](http://localhost:3000), click **RING**. Open multiple tabs to simulate multiple clients — each connection gets a unique ID visible in the server logs.

## How It Works

```
Browser ──[ring]──────────> server.js
        <──[ding-dong]────── server.js
        plays synth bell
```

1. Browser connects to `ws://localhost:3000`
2. Button click sends `{ event: "ring" }` over the WebSocket
3. Server receives it, responds with `{ event: "ding-dong" }`
4. Browser plays a two-tone bell (880 Hz + 660 Hz) using the Web Audio API

## AI-Assisted Development

See `CLAUDE.md` for project context optimized for AI assistants — architecture overview, extension patterns, and conventions.
