import { NextRequest, NextResponse } from "next/server"
import { getAuthToken } from "@/lib/auth-token"

function getRoleHome(role?: string) {
  if (role === "SUPER_ADMIN") return "/super-admin"
  if (role === "ADMIN") return "/admin"
  return "/dashboard"
}

function isAllowedForRole(pathname: string, role?: string) {
  if (pathname.startsWith("/super-admin")) {
    return role === "SUPER_ADMIN"
  }

  if (pathname.startsWith("/admin")) {
    return role === "ADMIN" || role === "SUPER_ADMIN"
  }

  return true
}

function getSafeCallbackUrl(request: NextRequest, roleHome: string, role?: string) {
  const callbackUrl = request.nextUrl.searchParams.get("callbackUrl")

  if (!callbackUrl) {
    return roleHome
  }

  try {
    const url = new URL(callbackUrl, request.nextUrl.origin)

    if (
      url.origin !== request.nextUrl.origin ||
      url.pathname.startsWith("/login") ||
      url.pathname.startsWith("/register") ||
      !isAllowedForRole(url.pathname, role)
    ) {
      return roleHome
    }

    return `${url.pathname}${url.search}${url.hash}`
  } catch {
    return roleHome
  }
}

export async function GET(request: NextRequest) {
  const token = await getAuthToken(request)

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  const role = typeof token.role === "string" ? token.role : undefined
  const roleHome = getRoleHome(role)
  const destination = getSafeCallbackUrl(request, roleHome, role)

  return NextResponse.redirect(new URL(destination, request.url))
}
