import { Hono } from 'hono'

// Bind the D1 database for TypeScript support
type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

app.get('/', (c) => c.text('Hello Cloudflare! The backend is live.'))

app.get('/api/v1/health', (c) => {
  return c.json({ status: 'operational', service: 'eaas-platform', timestamp: new Date().toISOString() })
})

app.post('/api/v1/webhooks/receive', async (c) => {
  try {
    const payload = await c.req.json()
    console.log('Incoming payload:', payload)
    return c.json({ success: true, message: 'Data logged securely' }, 201)
  } catch (error) {
    return c.json({ success: false, error: 'Invalid JSON' }, 400)
  }
})

// NEW: Query your live D1 database
app.get('/api/v1/clients', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM clients').all()
  return c.json(results)
})

export default app
