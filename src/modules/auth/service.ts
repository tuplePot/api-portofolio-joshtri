import { User, type LoginBody } from './model'

export interface AuthUserPayload {
  id: string
  email: string
  role: string
}

export abstract class AuthService {
  static async validateCredentials(data: LoginBody): Promise<AuthUserPayload | null> {
    const user = await User.findOne({ email: data.email.toLowerCase() }).lean()
    if (!user) return null

    const valid = await Bun.password.verify(data.password, user.password)
    if (!valid) return null

    return {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    }
  }
}
