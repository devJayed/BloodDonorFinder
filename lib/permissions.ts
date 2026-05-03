import type { UserRole } from "@/lib/types"

// Define all available permissions
export type Permission =
  | "donor:view"
  | "donor:create"
  | "donor:update"
  | "donor:delete"
  | "donor:view_full" // Can see full mobile number
  | "user:manage"
  | "system:configure"

// Role to permissions mapping
const rolePermissions: Record<UserRole, Permission[]> = {
  SUPER_ADMIN: [
    "donor:view",
    "donor:view_full",
    "donor:create",
    "donor:update",
    "donor:delete",
    "user:manage",
    "system:configure",
  ],
  ADMIN: [
    "donor:view",
    "donor:view_full",
    "donor:create",
    "donor:update",
    "donor:delete",
  ],
  USER: ["donor:view", "donor:view_full"],
}

// Guest permissions (unauthenticated users)
const guestPermissions: Permission[] = ["donor:view"]

/**
 * Check if a role has a specific permission
 */
export function hasPermission(
  role: UserRole | null,
  permission: Permission
): boolean {
  if (!role) {
    return guestPermissions.includes(permission)
  }
  return rolePermissions[role]?.includes(permission) ?? false
}

/**
 * Get all permissions for a role
 */
export function getPermissions(role: UserRole | null): Permission[] {
  if (!role) {
    return guestPermissions
  }
  return rolePermissions[role] ?? []
}

/**
 * Check if user can access admin routes
 */
export function canAccessAdmin(role: UserRole | null): boolean {
  return role === "ADMIN" || role === "SUPER_ADMIN"
}

/**
 * Check if user can access super admin routes
 */
export function canAccessSuperAdmin(role: UserRole | null): boolean {
  return role === "SUPER_ADMIN"
}

/**
 * Check if user can create, update, or delete donor records.
 */
export function canManageDonors(role: UserRole | null): boolean {
  return role === "ADMIN" || role === "SUPER_ADMIN"
}

/**
 * Check if user can modify a specific donor
 * ADMIN and SUPER_ADMIN can modify any donor.
 */
export function canModifyDonor(
  role: UserRole,
  _userId: string,
  _donorCreatedBy: string
): boolean {
  return canManageDonors(role)
}

/**
 * Mask mobile number for guests (show only last 4 digits)
 */
export function maskMobileNumber(mobile: string, canViewFull: boolean): string {
  if (canViewFull) {
    return mobile
  }
  if (mobile.length <= 4) {
    return "****"
  }
  return "******" + mobile.slice(-4)
}
