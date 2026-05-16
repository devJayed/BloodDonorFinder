"use client"

import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { Eye, EyeOff, Lock, Save, User, Mail, Phone, Shield } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

export default function ProfilePage() {
  const { data: session, status, update } = useSession()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [showPasswords, setShowPasswords] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  useEffect(() => {
    if (status !== "loading") {
      setIsLoading(false)
    }
  }, [status])

  useEffect(() => {
    if (session?.user) {
      setFormData({
        name: session.user.name || "",
        email: session.user.email || "",
        mobile: session.user.mobile || "",
      })
    }
  }, [session])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsSaving(true)

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      const data = await res.json()

      if (res.ok) {
        await update({ user: data.user })
        toast({
          title: "Profile Updated",
          description: "Your profile has been updated successfully.",
        })
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to update profile.",
          variant: "destructive",
        })
      }
    } catch {
      toast({
        title: "Error",
        description: "Something went wrong.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handlePasswordChange = async (event: React.FormEvent) => {
    event.preventDefault()

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "Password Too Short",
        description: "New password must be at least 6 characters.",
        variant: "destructive",
      })
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Passwords Do Not Match",
        description: "Please confirm the same new password.",
        variant: "destructive",
      })
      return
    }

    setIsChangingPassword(true)

    try {
      const res = await fetch("/api/profile/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      })
      const data = await res.json()

      if (res.ok) {
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        })
        setShowPasswords(false)
        toast({
          title: "Password Updated",
          description: "Your password has been changed successfully.",
        })
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to change password.",
          variant: "destructive",
        })
      }
    } catch {
      toast({
        title: "Error",
        description: "Something went wrong.",
        variant: "destructive",
      })
    } finally {
      setIsChangingPassword(false)
    }
  }

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
      label: "Mobile Number",
      value: session?.user?.mobile,
      icon: Phone,
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

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">{session?.user?.name}</CardTitle>
              <CardDescription>
                {session?.user?.email || session?.user?.mobile || "No contact set"}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="mb-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      name: event.target.value,
                    }))
                  }
                  required
                  minLength={2}
                  maxLength={100}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      email: event.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile Number</Label>
                <Input
                  id="mobile"
                  type="tel"
                  value={formData.mobile}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      mobile: event.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                "Saving..."
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Profile
                </>
              )}
            </Button>
          </form>

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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            Security
          </CardTitle>
          <CardDescription>
            Change your password using your current password for verification.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="font-medium text-foreground">Password</h3>
                <p className="text-sm text-muted-foreground">
                  Keep your account protected with a strong password.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setShowPasswords((prev) => !prev)}
                aria-label={showPasswords ? "Hide passwords" : "Show passwords"}
              >
                {showPasswords ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type={showPasswords ? "text" : "password"}
                  value={passwordData.currentPassword}
                  onChange={(event) =>
                    setPasswordData((prev) => ({
                      ...prev,
                      currentPassword: event.target.value,
                    }))
                  }
                  autoComplete="current-password"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type={showPasswords ? "text" : "password"}
                  value={passwordData.newPassword}
                  onChange={(event) =>
                    setPasswordData((prev) => ({
                      ...prev,
                      newPassword: event.target.value,
                    }))
                  }
                  autoComplete="new-password"
                  required
                  minLength={6}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type={showPasswords ? "text" : "password"}
                  value={passwordData.confirmPassword}
                  onChange={(event) =>
                    setPasswordData((prev) => ({
                      ...prev,
                      confirmPassword: event.target.value,
                    }))
                  }
                  autoComplete="new-password"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <Button type="submit" disabled={isChangingPassword}>
              {isChangingPassword ? (
                "Updating..."
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Change Password
                </>
              )}
            </Button>
          </form>
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
                <li>- Update your own account profile</li>
                <li>- Create and update your own donor profile</li>
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
