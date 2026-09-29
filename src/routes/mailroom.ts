import { Hono } from 'hono'
const mailroom = new Hono<{ Bindings: { DB: any } }>()

mailroom.get('/', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM mailroom ORDER BY received_at DESC').all()
  return c.json(results)
})

mailroom.post('/', async (c) => {
  const { recipient_name, tracking_number } = await c.req.json()
  await c.env.DB.prepare('INSERT INTO mailroom (recipient_name, tracking_number) VALUES (?, ?)')
    .bind(recipient_name, tracking_number).run()
  return c.json({ success: true, message: 'Package logged into mailroom facility' }, 201)
})

export default mailroom
