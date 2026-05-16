import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getAuthToken } from "@/lib/auth-token"

// Routes that require authentication
const protectedRoutes = ["/dashboard", "/admin", "/super-admin"]

// Routes that require specific roles
const adminRoutes = ["/admin"]
const superAdminRoutes = ["/super-admin"]

// Routes that authenticated users should not access
const authRoutes = ["/login", "/register"]

function getRoleHome(role?: string) {
  if (role === "SUPER_ADMIN") return "/super-admin"
  if (role === "ADMIN") return "/admin"
  return "/dashboard"
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Get the token (JWT session)
  const token = await getAuthToken(request)

  const isAuthenticated = !!token
  const userRole = token?.role as string | undefined

  // Check if trying to access auth pages while logged in
  if (isAuthenticated && authRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL(getRoleHome(userRole), request.url))
  }

  // Check protected routes
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Check admin routes
    if (adminRoutes.some((route) => pathname.startsWith(route))) {
      if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
        return NextResponse.redirect(new URL("/403", request.url))
      }
    }

    // Check super admin routes
    if (superAdminRoutes.some((route) => pathname.startsWith(route))) {
      if (userRole !== "SUPER_ADMIN") {
        return NextResponse.redirect(new URL("/403", request.url))
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/super-admin/:path*",
    "/login",
    "/register",
  ],
}
