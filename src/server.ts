import 'dotenv/config'
import http from 'node:http'
import express from 'express'
import { WebSocketServer, WebSocket } from 'ws'

type ClientMessage = { event: 'ring' }
type ServerMessage = { event: 'ding-dong' }

function isClientMessage(val: unknown): val is ClientMessage {
  return (
    typeof val === 'object' &&
    val !== null &&
    (val as Record<string, unknown>)['event'] === 'ring'
  )
}

const PORT = process.env.PORT ?? 3000

const app = express()
const server = http.createServer(app)
const wss = new WebSocketServer({ server })

app.use(express.static('public'))

wss.on('connection', (ws: WebSocket) => {
  ws.on('message', (raw) => {
    let parsed: unknown
    try {
      parsed = JSON.parse(raw.toString())
    } catch {
      return
    }
    if (isClientMessage(parsed)) {
      console.log('[ws] ring received')
      const response: ServerMessage = { event: 'ding-dong' }
      ws.send(JSON.stringify(response))
    }
  })
  ws.on('error', (err: Error) => console.error('[ws error]', err.message))
})

const shutdown = () => {
  wss.close(() => server.close(() => process.exit(0)))
}
process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)

server.listen(PORT, () => console.log(`listening on http://localhost:${PORT}`))
