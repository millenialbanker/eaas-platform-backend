import { Hono } from 'hono'

const webhooks = new Hono<{ Bindings: { QUEUE: any } }>()

webhooks.post('/receive', async (c) => {
  try {
    const payload = await c.req.json()
    
    // Instantly send the payload to the background queue instead of processing it here
    await c.env.QUEUE.send(payload)
    
    // Return a 202 Accepted instantly so the client isn't kept waiting
    return c.json({ success: true, message: 'Payload queued for background processing' }, 202)
  } catch (error) {
    return c.json({ success: false, error: 'Invalid JSON' }, 400)
  }
})

export default webhooks
