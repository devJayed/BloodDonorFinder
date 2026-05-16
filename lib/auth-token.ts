import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function getAuthToken(request: NextRequest) {
  const secret = process.env.NEXTAUTH_SECRET

  const token = await getToken({
    req: request,
    secret,
  })

  if (token) {
    return token
  }

  const secureToken = await getToken({
    req: request,
    secret,
    secureCookie: true,
  })

  if (secureToken) {
    return secureToken
  }

  return getToken({
    req: request,
    secret,
    secureCookie: false,
  })
}
