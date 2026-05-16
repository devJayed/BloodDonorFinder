export function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

export function normalizeMobile(mobile: string) {
  return mobile.trim().replace(/[\s().-]/g, "")
}

export function isEmail(value: string) {
  return /^\S+@\S+\.\S+$/.test(value.trim())
}

export function isMobile(value: string) {
  const normalized = normalizeMobile(value)
  return /^\+?\d{8,15}$/.test(normalized)
}

export function normalizeIdentifier(identifier: string) {
  const value = identifier.trim()

  if (isEmail(value)) {
    return {
      type: "email" as const,
      value: normalizeEmail(value),
    }
  }

  if (isMobile(value)) {
    return {
      type: "mobile" as const,
      value: normalizeMobile(value),
    }
  }

  return null
}
