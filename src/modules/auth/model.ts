import { t } from 'elysia'
import mongoose, { Schema } from 'mongoose'

// ─── TypeBox (Elysia validation) ─────────────────────────────────────────────

export const loginBody = t.Object({
  email: t.String({ format: 'email', maxLength: 254 }),
  password: t.String({ minLength: 12, maxLength: 128 }),
})

export type LoginBody = typeof loginBody.static

// ─── Mongoose ────────────────────────────────────────────────────────────────

export interface IUser {
  email: string
  password: string
  role: 'admin'
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin'], default: 'admin' },
  },
  { timestamps: true }
)

export const User = mongoose.model<IUser>('User', UserSchema)
