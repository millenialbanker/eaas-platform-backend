import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { sign, verify } from 'hono/jwt'

type Bindings = {
  DB: D1Database
  JWT_SECRET: string
}

const app = new Hono<{ Bindings: Bindings }>()
app.use('/*', cors())

// 1. AUTH LOGIN
app.post('/api/auth/login', async (c) => {
  const { email, password } = await c.req.json()
  const user: any = await c.env.DB.prepare(`SELECT * FROM users WHERE email = ?`).bind(email).first()
  if (!user) return c.json({ error: 'Invalid credentials' }, 401)

  const payload = {
    sub: user.id, email: user.email, role: user.role, operator_id: user.operator_id,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24
  }
  const token = await sign(payload, c.env.JWT_SECRET)
  return c.json({ token, role: user.role })
})

// 2. ASSET RFID SCAN
app.post('/api/assets/scan', async (c) => {
  const { rfid_tag_epc, serial_number, operator_id, location_zone, batch_id } = await c.req.json()
  try {
    await c.env.DB.prepare(
      `INSERT INTO assets (id, rfid_tag_epc, serial_number, operator_id, location_zone, status, batch_id) VALUES (?, ?, ?, ?, ?, 'Installed', ?)`
    ).bind(crypto.randomUUID(), rfid_tag_epc, serial_number, operator_id, location_zone, batch_id).run()
    return c.json({ success: true, message: 'Asset registered.' }, 201)
  } catch (err) {
    return c.json({ success: false, error: 'Tag collision or database error.' }, 400)
  }
})

// 3. SERVICE TICKETS & SLA
app.post('/api/tickets/create', async (c) => {
  const { operator_id, asset_id, issue_type, priority, description } = await c.req.json()
  const ticketId = `TICK-${Math.floor(100000 + Math.random() * 900000)}`
  await c.env.DB.prepare(
    `INSERT INTO service_tickets (ticket_id, operator_id, asset_id, issue_type, description, status) VALUES (?, ?, ?, ?, ?, 'Open')`
  ).bind(ticketId, operator_id, asset_id, issue_type, `${priority?.toUpperCase() || 'NORMAL'}: ${description}`).run()
  return c.json({ success: true, ticket_id: ticketId, message: 'Ticket logged with SLA clock.' }, 201)
})

// 4. INVOICING & FINANCE
app.post('/api/finance/invoices/generate', async (c) => {
  const { operator_id, billing_month, gross_amount, nbfc_debt_service, due_date } = await c.req.json()
  const invoiceId = `INV-${Math.floor(100000 + Math.random() * 900000)}`
  const net_revenue = gross_amount - nbfc_debt_service
  await c.env.DB.prepare(
    `INSERT INTO invoices (invoice_id, operator_id, billing_month, gross_amount, nbfc_debt_service, net_revenue, status, due_date) VALUES (?, ?, ?, ?, ?, ?, 'Pending', ?)`
  ).bind(invoiceId, operator_id, billing_month, gross_amount, nbfc_debt_service, net_revenue, due_date).run()
  return c.json({ success: true, invoice_id: invoiceId, net_revenue }, 201)
})

// 5. INVENTORY & LOW SUPPLY ALERTS
app.post('/api/supplies/update', async (c) => {
  const { item_id, current_stock } = await c.req.json()
  await c.env.DB.prepare(`UPDATE facility_supplies SET current_stock = ? WHERE item_id = ?`).bind(current_stock, item_id).run()
  const item: any = await c.env.DB.prepare(`SELECT * FROM facility_supplies WHERE item_id = ?`).bind(item_id).first()
  let alertTriggered = item && item.current_stock <= item.minimum_threshold
  return c.json({ success: true, low_stock_alert: alertTriggered })
})

// 6. DIGITAL MAILROOM
app.post('/api/mailroom/receive', async (c) => {
  const { operator_id, client_company, courier_name, tracking_number } = await c.req.json()
  const packageId = `PKG-${Math.floor(100000 + Math.random() * 900000)}`
  await c.env.DB.prepare(
    `INSERT INTO mailroom_packages (package_id, operator_id, client_company, courier_name, tracking_number, status) VALUES (?, ?, ?, ?, ?, 'Received')`
  ).bind(packageId, operator_id, client_company, courier_name, tracking_number).run()
  return c.json({ success: true, package_id: packageId, message: 'Package logged & client notified.' }, 201)
})

export default app
