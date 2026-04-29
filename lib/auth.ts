import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { connectToDatabase } from "@/lib/mongodb"
import User, { type UserRole } from "@/models/User"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name: string
      email: string
      role: UserRole
    }
  }

  interface User {
    id: string
    name: string
    email: string
    role: UserRole
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: UserRole
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          console.log("[v0] Auth: Starting authorization for:", credentials?.email)
          
          if (!credentials?.email || !credentials?.password) {
            console.log("[v0] Auth: Missing email or password")
            return null
          }

          await connectToDatabase()
          console.log("[v0] Auth: Connected to database")

          const user = await User.findOne({ email: credentials.email }).select(
            "+password"
          )

          if (!user) {
            console.log("[v0] Auth: No user found with email:", credentials.email)
            return null
          }

          console.log("[v0] Auth: Found user:", user.email, "Role:", user.role)

          const isPasswordValid = await user.comparePassword(credentials.password)

          if (!isPasswordValid) {
            console.log("[v0] Auth: Invalid password for user:", credentials.email)
            return null
          }

          console.log("[v0] Auth: Password valid, returning user")
          
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
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
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id
        session.user.role = token.role
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
