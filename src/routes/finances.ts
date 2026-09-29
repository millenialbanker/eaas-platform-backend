import { Hono } from 'hono'
const finances = new Hono<{ Bindings: { DB: any } }>()

finances.get('/', async (c) => {
  const clientsCount = await c.env.DB.prepare('SELECT COUNT(*) as total FROM clients').first()
  const requestsCount = await c.env.DB.prepare('SELECT COUNT(*) as total FROM service_requests').first()

  return c.json({
    active_clients: clientsCount?.total || 0,
    total_service_requests: requestsCount?.total || 0,
    platform_status: 'Healthy',
    generated_at: new Date().toISOString()
  })
})

export default finances
