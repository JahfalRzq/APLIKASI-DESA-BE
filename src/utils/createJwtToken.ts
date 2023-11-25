import jwt from 'jsonwebtoken'
import { JwtPayload } from '../types/JwtPayload'
require('dotenv').config()

export const createJwtToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRATION,
  })
}
