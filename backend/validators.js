const { z } = require('zod')

exports.NewBillSchema = z.object({
  name: z.string().min(1),
  amount: z.number().positive(),
  dueDay: z.number().int().min(1).max(31),
  category: z.string().min(1),
  clientRequestId: z.string().min(8),
  userId: z.string().min(1).optional()
})

exports.validate = (schema) => (req, res, next) => {
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: 'INVALID_REQUEST', issues: parsed.error.issues })
  req.body = parsed.data
  next()
}


