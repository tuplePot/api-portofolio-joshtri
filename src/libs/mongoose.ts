import dns from 'node:dns'
import { Elysia } from 'elysia'
import mongoose from 'mongoose'

// Local/ISP DNS refuses SRV queries (mongodb+srv://). Force public resolvers.
dns.setServers(['8.8.8.8', '1.1.1.1'])

export const mongoosePlugin = new Elysia({ name: 'mongoose' })
  .onStart(async () => {
    await mongoose.connect(process.env.DATABASE_URL!)
    console.log('Connected to MongoDB')
  })
  .onStop(async () => {
    await mongoose.disconnect()
  })
