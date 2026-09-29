import { Hono } from 'hono'
import health from './routes/health'
import clients from './routes/clients'
import webhooks from './routes/webhooks'

type Bindings = {
  DB: any
  QUEUE: any
}

const app = new Hono<{ Bindings: Bindings }>()

app.get('/', (c) => c.text('Hello Cloudflare! The backend is live.'))

// Register the modular routing tree
app.route('/api/v1/health', health)
app.route('/api/v1/clients', clients)
app.route('/api/v1/webhooks', webhooks)

// Export both the Hono fetch handler (HTTP) and the Queue consumer handler (Background)
export default {
  fetch: app.fetch,
  async queue(batch: any, env: Bindings): Promise<void> {
    // This runs entirely in the background, out of the way of your web traffic
    for (const message of batch.messages) {
      console.log('Background worker processing queued payload:', message.body)
      
      // Future logic: insert into D1, trigger GitHub Action scanners, etc.
    }
  }
}
