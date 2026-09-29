import { Hono } from 'hono'
const vendors = new Hono<{ Bindings: { DB: any } }>()

vendors.get('/', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM vendors').all()
  return c.json(results)
})

vendors.post('/', async (c) => {
  const { vendor_name, category, contact_email } = await c.req.json()
  await c.env.DB.prepare('INSERT INTO vendors (vendor_name, category, contact_email) VALUES (?, ?, ?)')
    .bind(vendor_name, category, contact_email).run()
  return c.json({ success: true, message: 'Vendor added successfully' }, 201)
})

export default vendors
