import { jest } from '@jest/globals'
import WebSocket from 'ws'
import { createApp } from '../app.js'
import type { AddressInfo } from 'net'

describe('WebSocket server', () => {
  let server: ReturnType<typeof createApp>['server']
  let wss: ReturnType<typeof createApp>['wss']
  let port: number

  beforeAll((done) => {
    ;({ server, wss } = createApp())
    server.listen(0, () => {
      port = (server.address() as AddressInfo).port
      done()
    })
  })

  afterAll((done) => {
    wss.close(() => server.close(done))
  })

  function connect(): Promise<WebSocket> {
    return new Promise((resolve) => {
      const ws = new WebSocket(`ws://localhost:${port}`)
      ws.once('open', () => resolve(ws))
    })
  }

  it('responds with ding-dong on ring', async () => {
    const ws = await connect()
    const response = await new Promise<string>((resolve) => {
      ws.once('message', (data) => resolve(data.toString()))
      ws.send(JSON.stringify({ event: 'ring' }))
    })
    expect(JSON.parse(response)).toEqual({ event: 'ding-dong' })
    ws.close()
  })

  it('logs [ws] ring received on ring', async () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {})
    const ws = await connect()
    await new Promise<void>((resolve) => {
      ws.once('message', () => resolve())
      ws.send(JSON.stringify({ event: 'ring' }))
    })
    expect(spy).toHaveBeenCalledWith('[ws] ring received')
    spy.mockRestore()
    ws.close()
  })

  it('sends no response for unknown event', async () => {
    const ws = await connect()
    const received: string[] = []
    ws.on('message', (data) => received.push(data.toString()))
    ws.send(JSON.stringify({ event: 'foo' }))
    await new Promise((resolve) => setTimeout(resolve, 100))
    expect(received).toHaveLength(0)
    ws.close()
  })

  it('sends no response for invalid JSON', async () => {
    const ws = await connect()
    const received: string[] = []
    ws.on('message', (data) => received.push(data.toString()))
    ws.send('not json at all')
    await new Promise((resolve) => setTimeout(resolve, 100))
    expect(received).toHaveLength(0)
    ws.close()
  })
})
