"use client"

import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { User, Mail, Shield } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status !== "loading") {
      setIsLoading(false)
    }
  }, [status])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-2 h-4 w-64" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  const profileFields = [
    {
      label: "Full Name",
      value: session?.user?.name,
      icon: User,
    },
    {
      label: "Email Address",
      value: session?.user?.email,
      icon: Mail,
    },
    {
      label: "Account Role",
      value: session?.user?.role,
      icon: Shield,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
        <p className="mt-1 text-muted-foreground">
          View and manage your account information.
        </p>
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">{session?.user?.name}</CardTitle>
              <CardDescription>{session?.user?.email}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {profileFields.map((field) => (
              <div
                key={field.label}
                className="rounded-lg border border-border bg-secondary/50 p-4"
              >
                <div className="flex items-center gap-2 text-muted-foreground">
                  <field.icon className="h-4 w-4" />
                  <span className="text-sm">{field.label}</span>
                </div>
                <p className="mt-1 font-medium text-foreground">
                  {field.value || "Not set"}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Role Permissions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Role Permissions
          </CardTitle>
          <CardDescription>
            Your current role and what you can do in the system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border bg-secondary/30 p-4">
            {session?.user?.role === "SUPER_ADMIN" && (
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>- Full system access</li>
                <li>- Manage users and admins</li>
                <li>- System configuration</li>
                <li>- Create, update, delete all donors</li>
              </ul>
            )}
            {session?.user?.role === "ADMIN" && (
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>- Create, update, delete donors</li>
                <li>- Moderate donor data</li>
                <li>- View all donor information</li>
              </ul>
            )}
            {session?.user?.role === "USER" && (
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>- Create your own donor profile</li>
                <li>- Update your donor profile</li>
                <li>- View all donors</li>
                <li>- Access personal dashboard</li>
              </ul>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
