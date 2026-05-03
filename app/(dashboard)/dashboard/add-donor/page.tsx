"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { ArrowLeft, UserPlus } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { BLOOD_GROUPS } from "@/lib/blood-groups"
import { canManageDonors } from "@/lib/permissions"
import type { Address, BloodGroup } from "@/lib/types"

export default function AddDonorPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingProfile, setIsCheckingProfile] = useState(true)
  const [addresses, setAddresses] = useState<Address[]>([])
  const isAdmin = canManageDonors(session?.user?.role ?? null)

  const [formData, setFormData] = useState({
    name: "",
    fatherName: "",
    motherName: "",
    address: "",
    mobile: "",
    age: "",
    dateOfBirth: "",
    bloodGroup: "" as BloodGroup | "",
    lastDonationDate: "",
  })

  useEffect(() => {
    if (status === "loading") return

    const fetchPageData = async () => {
      try {
        if (!isAdmin) {
          const profileRes = await fetch("/api/donors/me")
          const profileData = await profileRes.json()

          if (profileRes.ok && profileData.donor?.id) {
            router.replace(`/dashboard/donors/${profileData.donor.id}/edit`)
            return
          }
        }

        const addressRes = await fetch("/api/addresses")
        const addressData = await addressRes.json()

        if (addressRes.ok) {
          setAddresses(addressData.addresses || [])
        }
      } catch (error) {
        console.error("Failed to fetch donor form data:", error)
      } finally {
        setIsCheckingProfile(false)
      }
    }

    fetchPageData()
  }, [isAdmin, router, status])

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const res = await fetch("/api/donors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          age: parseInt(formData.age) || 0,
          bloodGroup: formData.bloodGroup || null,
          dateOfBirth: formData.dateOfBirth || null,
          lastDonationDate: formData.lastDonationDate || null,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        toast({
          title: isAdmin ? "Donor Added" : "Profile Completed",
          description: isAdmin
            ? "The donor has been registered successfully."
            : "Your donor profile has been created successfully.",
        })
        router.push("/dashboard")
      } else {
        if (res.status === 409 && data.donorId) {
          router.push(`/dashboard/donors/${data.donorId}/edit`)
          return
        }

        toast({
          title: "Error",
          description: data.error || "Failed to add donor.",
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
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {isCheckingProfile ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            Loading donor profile...
          </CardContent>
        </Card>
      ) : (
        <>
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {isAdmin ? "Add New Donor" : "Complete Donor Profile"}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {isAdmin
              ? "Register a new blood donor in the system."
              : "Create your own blood donor profile."}
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Donor Information</CardTitle>
          <CardDescription>
            {isAdmin
              ? "Fill in the details of the new blood donor."
              : "Fill in your details to make your donor profile complete."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile Number *</Label>
                <Input
                  id="mobile"
                  value={formData.mobile}
                  onChange={(e) => handleChange("mobile", e.target.value)}
                  placeholder="Enter mobile number"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fatherName">Father&apos;s Name *</Label>
                <Input
                  id="fatherName"
                  value={formData.fatherName}
                  onChange={(e) => handleChange("fatherName", e.target.value)}
                  placeholder="Enter father's name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="motherName">Mother&apos;s Name *</Label>
                <Input
                  id="motherName"
                  value={formData.motherName}
                  onChange={(e) => handleChange("motherName", e.target.value)}
                  placeholder="Enter mother's name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="age">Age *</Label>
                <Input
                  id="age"
                  type="number"
                  min="18"
                  max="65"
                  value={formData.age}
                  onChange={(e) => handleChange("age", e.target.value)}
                  placeholder="Enter age"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bloodGroup">Blood Group</Label>
                <Select
                  value={formData.bloodGroup}
                  onValueChange={(value) => handleChange("bloodGroup", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select blood group" />
                  </SelectTrigger>
                  <SelectContent>
                    {BLOOD_GROUPS.map((group) => (
                      <SelectItem key={group} value={group}>
                        {group}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="address">Address *</Label>
                <Select
                  value={formData.address}
                  onValueChange={(value) => handleChange("address", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select address" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    {addresses.map((addr) => (
                      <SelectItem key={addr.id} value={addr.label}>
                        {addr.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleChange("dateOfBirth", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastDonationDate">Last Donation Date</Label>
                <Input
                  id="lastDonationDate"
                  type="date"
                  value={formData.lastDonationDate}
                  onChange={(e) => handleChange("lastDonationDate", e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  "Adding..."
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    {isAdmin ? "Add Donor" : "Complete Profile"}
                  </>
                )}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/dashboard">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
        </>
      )}
    </div>
  )
}
