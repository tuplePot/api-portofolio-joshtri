import { Elysia } from 'elysia'
import { PrismaClient } from '../generated/prisma/client'

const prisma = new PrismaClient()

export const db = new Elysia({ name: 'db' })
  .decorate('db', prisma)
