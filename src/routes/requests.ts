import { Hono } from 'hono'

type Bindings = { DB: any }
type Variables = { user: { name: string; role: string } }

const requests = new Hono<{ Bindings: Bindings; Variables: Variables }>()

requests.use('/*', async (c, next) => {
  const apiKey = c.req.header('x-api-key')
  if (!apiKey) return c.json({ success: false, error: 'Unauthorized: Missing API key' }, 401)

  const user = await c.env.DB.prepare('SELECT name, role FROM users WHERE api_key = ?').bind(apiKey).first()
  if (!user) return c.json({ success: false, error: 'Forbidden: Invalid API key' }, 403)

  c.set('user', user)
  await next()
})

requests.get('/', async (c) => {
  const user = c.get('user')
  if (user.role === 'finance') {
    const { results } = await c.env.DB.prepare('SELECT * FROM service_requests ORDER BY created_at DESC').all()
    return c.json({ role: 'finance', requests: results })
  } else {
    const { results } = await c.env.DB.prepare('SELECT * FROM service_requests WHERE operator_name = ? ORDER BY created_at DESC').bind(user.name).all()
    return c.json({ role: 'operator', requests: results })
  }
})

requests.post('/', async (c) => {
  const user = c.get('user')
  try {
    const { request_type, details } = await c.req.json()
    if (!request_type || !details) return c.json({ success: false, error: 'Missing required fields' }, 400)

    await c.env.DB.prepare(
      'INSERT INTO service_requests (operator_name, request_type, details) VALUES (?, ?, ?)'
    ).bind(user.name, request_type, details).run()

    return c.json({ success: true, message: `Service request raised successfully for ${user.name}` }, 201)
  } catch (error) {
    return c.json({ success: false, error: 'Failed to create service request' }, 500)
  }
})

export default requests
