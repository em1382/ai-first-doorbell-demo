import 'dotenv/config'
import { createApp } from './app.js'

const PORT = process.env.PORT ?? 3000

const { server, wss } = createApp()

const shutdown = () => {
  wss.close(() => server.close(() => process.exit(0)))
}
process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)

server.listen(PORT, () => console.log(`listening on http://localhost:${PORT}`))
