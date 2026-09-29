import { Hono } from 'hono'

const clients = new Hono<{ Bindings: { DB: any } }>()

clients.get('/', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM clients').all()
  return c.json(results)
})

export default clients
