import http from 'node:http'
import { randomUUID } from 'node:crypto'
import express from 'express'
import { WebSocketServer, WebSocket } from 'ws'

export type ClientMessage = { event: 'ring' }
export type ServerMessage = { event: 'ding-dong' }

export interface TaggedWebSocket extends WebSocket {
  clientId: string
}

export function isClientMessage(val: unknown): val is ClientMessage {
  return (
    typeof val === 'object' &&
    val !== null &&
    (val as Record<string, unknown>)['event'] === 'ring'
  )
}

export function createApp() {
  const app = express()
  const server = http.createServer(app)
  const wss = new WebSocketServer({ server })

  app.use(express.static('public'))

  wss.on('connection', (ws: WebSocket) => {
    const client = ws as TaggedWebSocket
    client.clientId = randomUUID()
    console.log(`[ws] client connected: ${client.clientId}`)

    client.on('message', (raw) => {
      let parsed: unknown
      try {
        parsed = JSON.parse(raw.toString())
      } catch {
        return
      }
      if (isClientMessage(parsed)) {
        console.log(`[ws] ring received from ${client.clientId}`)
        const response: ServerMessage = { event: 'ding-dong' }
        client.send(JSON.stringify(response))
      }
    })

    client.on('close', () => {
      console.log(`[ws] client disconnected: ${client.clientId}`)
    })

    client.on('error', (err: Error) => console.error(`[ws error] ${client.clientId}:`, err.message))
  })

  return { app, server, wss }
}
