"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import Link from "next/link"
import { CheckCircle2, Users, UserPlus, Search, Shield } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { canAccessAdmin, canManageDonors } from "@/lib/permissions"
import type { Donor, UserRole } from "@/lib/types"

export default function DashboardPage() {
  const { data: session } = useSession()
  const userRole = session?.user?.role as UserRole | undefined
  const [myDonor, setMyDonor] = useState<Donor | null>(null)
  const [completionPercentage, setCompletionPercentage] = useState(0)
  const isAdmin = canManageDonors(userRole ?? null)

  useEffect(() => {
    if (!session?.user || isAdmin) return

    const fetchMyDonorProfile = async () => {
      try {
        const res = await fetch("/api/donors/me")
        const data = await res.json()

        if (res.ok) {
          setMyDonor(data.donor)
          setCompletionPercentage(data.completionPercentage || 0)
        }
      } catch (error) {
        console.error("Failed to fetch donor profile:", error)
      }
    }

    fetchMyDonorProfile()
  }, [isAdmin, session?.user])

  const quickActions = [
    {
      title: "Search Donors",
      description: "Find blood donors in your area",
      icon: Search,
      href: "/",
      color: "bg-blue-500/10 text-blue-600",
    },
    {
      title: "My Profile",
      description: "View or update your account profile",
      icon: Users,
      href: "/dashboard/profile",
      color: "bg-green-500/10 text-green-600",
    },
    {
      title: "My Donor Profile",
      description: "Create or update your own donor profile",
      icon: UserPlus,
      href: "/dashboard/add-donor",
      color: "bg-purple-500/10 text-purple-600",
      roles: ["USER"] as UserRole[],
    },
    {
      title: "Add Donor",
      description: "Register a new blood donor",
      icon: UserPlus,
      href: "/dashboard/add-donor",
      color: "bg-purple-500/10 text-purple-600",
      roles: ["ADMIN", "SUPER_ADMIN"] as UserRole[],
    },
  ].filter((action) => !action.roles || action.roles.includes(userRole as UserRole))
  const donorProfileHref = myDonor
    ? `/dashboard/donors/${myDonor.id}/edit`
    : "/dashboard/add-donor"

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Welcome back, {session?.user?.name}
        </h1>
        <p className="mt-1 text-muted-foreground">
          Manage your profile and find donors in your area.
        </p>
      </div>

      {/* Role Badge */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground">Account Role</p>
            <p className="text-sm text-muted-foreground">
              You are logged in as{" "}
              <span className="font-semibold text-primary">{userRole}</span>
            </p>
          </div>
        </CardContent>
      </Card>

      {!isAdmin && (
        <Card className="border-green-500/20 bg-green-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <CheckCircle2 className="h-5 w-5" />
              {completionPercentage === 100
                ? "Donor Profile Complete"
                : "Complete Your Donor Profile"}
            </CardTitle>
            <CardDescription>
              Your donor profile is {completionPercentage}% complete.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={completionPercentage} />
            <Button asChild variant="outline">
              <Link href={donorProfileHref}>
                {myDonor ? "Update Donor Profile" : "Complete Donor Profile"}
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Quick Actions
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action) => (
            <Card
              key={action.title}
              className="transition-all hover:shadow-md"
            >
              <CardHeader className="pb-2">
                <div
                  className={`mb-2 flex h-10 w-10 items-center justify-center rounded-lg ${action.color}`}
                >
                  <action.icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-base">{action.title}</CardTitle>
                <CardDescription className="text-sm">
                  {action.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full">
                  <Link href={action.href}>Go to {action.title}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Admin Access */}
      {canAccessAdmin(userRole ?? null) && canManageDonors(userRole ?? null) && (
        <Card className="border-orange-500/20 bg-orange-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <Shield className="h-5 w-5" />
              Admin Access
            </CardTitle>
            <CardDescription>
              You have administrative privileges. Access the admin panel to
              manage all donors.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href="/admin">Go to Admin Panel</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
