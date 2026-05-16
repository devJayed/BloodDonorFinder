import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { normalizeIdentifier } from "@/lib/auth-identifiers"
import { connectToDatabase } from "@/lib/mongodb"
import User, { type UserRole } from "@/models/User"

declare module "next-auth" {
  interface Session {
      user: {
        id: string
        name: string
        email?: string | null
        mobile?: string | null
        role: UserRole
      }
  }

  interface User {
    id: string
    name: string
    email?: string | null
    mobile?: string | null
    role: UserRole
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: UserRole
    mobile?: string | null
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        identifier: { label: "Email or mobile", type: "text" },
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const identifierInput = credentials?.identifier || credentials?.email
          console.log("[v0] Auth: Starting authorization for:", identifierInput)
          
          if (!identifierInput || !credentials?.password) {
            console.log("[v0] Auth: Missing identifier or password")
            return null
          }

          const identifier = normalizeIdentifier(identifierInput)

          if (!identifier) {
            console.log("[v0] Auth: Invalid identifier")
            return null
          }

          await connectToDatabase()
          console.log("[v0] Auth: Connected to database")

          const user = await User.findOne({
            [identifier.type]: identifier.value,
          }).select("+password")

          if (!user) {
            console.log("[v0] Auth: No user found for:", identifier.value)
            return null
          }

          console.log("[v0] Auth: Found user:", user.email || user.mobile, "Role:", user.role)

          const isPasswordValid = await user.comparePassword(credentials.password)

          if (!isPasswordValid) {
            console.log("[v0] Auth: Invalid password for user:", identifier.value)
            return null
          }

          console.log("[v0] Auth: Password valid, returning user")
          
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email ?? null,
            mobile: user.mobile ?? null,
            role: user.role,
          }
        } catch (error) {
          console.error("[v0] Auth: Error during authorization:", error)
          return null
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "google") {
        return true
      }

      if (!user.email) {
        return false
      }

      await connectToDatabase()

      const existingUser = await User.findOne({ email: user.email.toLowerCase() })

      if (existingUser) {
        if (!existingUser.name && user.name) {
          existingUser.name = user.name
          await existingUser.save()
        }

        user.id = existingUser._id.toString()
        user.role = existingUser.role
        user.mobile = existingUser.mobile ?? null
        return true
      }

      const createdUser = await User.create({
        name: user.name || user.email.split("@")[0],
        email: user.email.toLowerCase(),
        role: "USER",
      })

      user.id = createdUser._id.toString()
      user.role = createdUser.role
      user.mobile = createdUser.mobile ?? null
      return true
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.mobile = user.mobile ?? null
      }

      if (trigger === "update" && session?.user) {
        if (typeof session.user.name === "string") {
          token.name = session.user.name
        }
        if (typeof session.user.email === "string") {
          token.email = session.user.email
        }
        if (typeof session.user.mobile === "string") {
          token.mobile = session.user.mobile
        }
      }

      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id
        session.user.role = token.role
        if (typeof token.name === "string") {
          session.user.name = token.name
        }
        if (typeof token.email === "string") {
          session.user.email = token.email
        }
        if (typeof token.mobile === "string") {
          session.user.mobile = token.mobile
        }
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
}
