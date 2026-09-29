import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Cloudflare! The backend is live.')
})

// Standard health check for client capacity monitoring
app.get('/api/v1/health', (c) => {
  return c.json({ 
    status: 'operational', 
    service: 'eaas-platform',
    timestamp: new Date().toISOString() 
  })
})

// Webhook receiver for automated workflow payloads or alerts
app.post('/api/v1/webhooks/receive', async (c) => {
  try {
    const payload = await c.req.json()
    console.log('Incoming payload:', payload)
    return c.json({ success: true, message: 'Data logged securely' }, 201)
  } catch (error) {
    return c.json({ success: false, error: 'Invalid JSON' }, 400)
  }
})

export default app
