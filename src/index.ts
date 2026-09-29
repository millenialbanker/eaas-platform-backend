import { Hono } from 'hono'
import { cors } from 'hono/cors'
import health from './routes/health'
import clients from './routes/clients'
import webhooks from './routes/webhooks'
import requests from './routes/requests'
import finances from './routes/finances'
import billing from './routes/billing'
import vendors from './routes/vendors'
import supplies from './routes/supplies'
import mailroom from './routes/mailroom'

type Bindings = { DB: any; QUEUE: any }

const app = new Hono<{ Bindings: Bindings }>()

app.use('/api/*', cors({
  origin: '*',
  allowHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
  allowMethods: ['POST', 'GET', 'PUT', 'OPTIONS'],
}))

app.get('/', (c) => c.text('Hello Cloudflare! EaaS Operations Backend is live.'))

app.route('/api/v1/health', health)
app.route('/api/v1/clients', clients)
app.route('/api/v1/webhooks', webhooks)
app.route('/api/v1/requests', requests)
app.route('/api/v1/finances', finances)
app.route('/api/v1/billing', billing)
app.route('/api/v1/vendors', vendors)
app.route('/api/v1/supplies', supplies)
app.route('/api/v1/mailroom', mailroom)

export default {
  fetch: app.fetch,
  async queue(batch: any, env: Bindings): Promise<void> {
    for (const message of batch.messages) {
      console.log('Background worker processing:', message.body)
    }
  }
}
