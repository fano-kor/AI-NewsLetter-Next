import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient().$extends({
  query: {
    $allModels: {
      async $allOperations({ operation, model, args, query }) {
        const startTime = Date.now()
        const result = await query(args)
        const duration = Date.now() - startTime
        
        if (process.env.NODE_ENV === 'production') {
          console.log(JSON.stringify({
            timestamp: new Date().toISOString(),
            level: 'info',
            event: 'prisma:query',
            model,
            operation,
            duration: `${duration}ms`
          }))
        }
        return result
      }
    }
  }
})

export default prisma

