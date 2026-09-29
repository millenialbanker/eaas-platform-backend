import { Hono } from 'hono'
const billing = new Hono<{ Bindings: { DB: any } }>()

billing.get('/', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM client_billing ORDER BY created_at DESC').all()
  return c.json(results)
})

billing.post('/', async (c) => {
  const { client_id, amount, due_date } = await c.req.json()
  await c.env.DB.prepare('INSERT INTO client_billing (client_id, amount, due_date) VALUES (?, ?, ?)')
    .bind(client_id, amount, due_date).run()
  return c.json({ success: true, message: 'Billing record created' }, 201)
})

export default billing
