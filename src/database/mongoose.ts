import dns from 'node:dns'
import { Elysia } from 'elysia'
import mongoose from 'mongoose'
import { env } from '../config'

// Local/ISP DNS refuses SRV queries (mongodb+srv://). Force public resolvers.
dns.setServers(['8.8.8.8', '1.1.1.1'])

// Idempotent — safe to call multiple times (serverless warm containers reuse the connection)
export const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return
  await mongoose.connect(env.databaseUrl)
  console.log('Connected to MongoDB')
}

// Database plugin: connects on start, disconnects cleanly on stop.
export const mongoosePlugin = new Elysia({ name: 'database.mongoose' })
  .onStart(connectDB)
  .onStop(async () => {
    await mongoose.disconnect()
  })