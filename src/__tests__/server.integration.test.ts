import { jest } from '@jest/globals'
import WebSocket from 'ws'
import { createApp } from '../app.js'
import type { AddressInfo } from 'net'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

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

  it('logs ring received with client id', async () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {})
    const ws = await connect()
    await new Promise<void>((resolve) => {
      ws.once('message', () => resolve())
      ws.send(JSON.stringify({ event: 'ring' }))
    })
    const calls = spy.mock.calls.map((c) => String(c[0]))
    expect(calls.some((msg) => msg.startsWith('[ws] ring received from ') && UUID_RE.test(msg.split('from ')[1]))).toBe(true)
    spy.mockRestore()
    ws.close()
  })

  it('assigns unique client id per connection', async () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {})
    const [ws1, ws2] = await Promise.all([connect(), connect()])
    const ids = spy.mock.calls
      .map((c) => String(c[0]))
      .filter((msg) => msg.startsWith('[ws] client connected: '))
      .map((msg) => msg.split(': ')[1])
    expect(ids).toHaveLength(2)
    expect(ids[0]).toMatch(UUID_RE)
    expect(ids[1]).toMatch(UUID_RE)
    expect(ids[0]).not.toBe(ids[1])
    spy.mockRestore()
    ws1.close()
    ws2.close()
  })

  it('logs disconnect with client id', async () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {})
    const ws = await connect()
    await new Promise<void>((resolve) => {
      ws.once('close', () => resolve())
      ws.close()
    })
    const calls = spy.mock.calls.map((c) => String(c[0]))
    expect(calls.some((msg) => msg.startsWith('[ws] client disconnected: ') && UUID_RE.test(msg.split(': ')[1]))).toBe(true)
    spy.mockRestore()
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
