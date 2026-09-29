import { Hono } from 'hono'
const supplies = new Hono<{ Bindings: { DB: any } }>()

supplies.get('/', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM supplies').all()
  const lowSupplies = results.filter((item: any) => item.quantity <= item.threshold)
  
  return c.json({
    inventory: results,
    head_office_alerts: lowSupplies.map((item: any) => ({
      alert: `LOW SUPPLY WARNING: ${item.item_name} has dropped to ${item.quantity} (Threshold: ${item.threshold})`,
      item: item.item_name
    }))
  })
})

supplies.post('/update', async (c) => {
  const { id, quantity } = await c.req.json()
  await c.env.DB.prepare('UPDATE supplies SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
    .bind(quantity, id).run()
  return c.json({ success: true, message: 'Supply inventory updated' })
})

export default supplies
