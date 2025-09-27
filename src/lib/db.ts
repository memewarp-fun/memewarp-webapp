import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || "postgres://postgres:30b9a9b6f3fc90e0b6ec@157.173.115.149:9218/memewarp?sslmode=disable"
    }
  }
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma