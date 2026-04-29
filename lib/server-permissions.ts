import "server-only"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { hasPermission, type Permission } from "@/lib/permissions"
import type { UserRole } from "@/lib/types"

const guestPermissions: Permission[] = ["donor:view"]

interface AuthSession {
  user: {
    id: string
    name: string
    email: string
    role: UserRole
  }
}

/**
 * Server-side authorization helper.
 * Use in API routes and server components only.
 */
export async function authorize(
  permission: Permission
): Promise<{ authorized: boolean; session: AuthSession | null }> {
  const session = (await getServerSession(authOptions)) as AuthSession | null

  if (!session?.user) {
    return {
      authorized: guestPermissions.includes(permission),
      session: null,
    }
  }

  return {
    authorized: hasPermission(session.user.role, permission),
    session,
  }
}

/**
 * Get current session with type safety.
 */
export async function getAuthSession() {
  return (await getServerSession(authOptions)) as AuthSession | null
}
