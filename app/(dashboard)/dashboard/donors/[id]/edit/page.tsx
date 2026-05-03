"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { BLOOD_GROUPS } from "@/lib/blood-groups"
import { canManageDonors } from "@/lib/permissions"
import type { Address, BloodGroup } from "@/lib/types"

export default function EditDonorPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { data: session, status } = useSession()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [addresses, setAddresses] = useState<Address[]>([])
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

    if (!canManageDonors(session?.user?.role ?? null)) {
      router.replace("/403")
      return
    }

    const fetchData = async () => {
      try {
        const [donorRes, addressRes] = await Promise.all([
          fetch(`/api/donors/${params.id}`),
          fetch("/api/addresses"),
        ])

        const donorData = await donorRes.json()
        const addressData = await addressRes.json()

        if (!donorRes.ok) {
          toast({
            title: "Error",
            description: donorData.error || "Failed to load donor.",
            variant: "destructive",
          })
          router.push("/admin")
          return
        }

        const donor = donorData.donor
        setFormData({
          name: donor.name || "",
          fatherName: donor.fatherName || "",
          motherName: donor.motherName || "",
          address: donor.address || "",
          mobile: donor.mobile || "",
          age: donor.age?.toString() || "",
          dateOfBirth: donor.dateOfBirth?.slice(0, 10) || "",
          bloodGroup: donor.bloodGroup || "",
          lastDonationDate: donor.lastDonationDate?.slice(0, 10) || "",
        })

        if (addressRes.ok) {
          setAddresses(addressData.addresses || [])
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

    fetchData()
  }, [params.id, router, session?.user?.role, status, toast])

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsSaving(true)

    try {
      const res = await fetch(`/api/donors/${params.id}`, {
        method: "PATCH",
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
          title: "Donor Updated",
          description: "The donor has been updated successfully.",
        })
        router.push("/admin")
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to update donor.",
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-[520px] w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Edit Donor</h1>
          <p className="mt-1 text-muted-foreground">
            Update this blood donor record.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Donor Information</CardTitle>
          <CardDescription>
            Make changes to the registered blood donor.
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
                  onChange={(event) => handleChange("name", event.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile Number *</Label>
                <Input
                  id="mobile"
                  value={formData.mobile}
                  onChange={(event) => handleChange("mobile", event.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fatherName">Father&apos;s Name *</Label>
                <Input
                  id="fatherName"
                  value={formData.fatherName}
                  onChange={(event) =>
                    handleChange("fatherName", event.target.value)
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="motherName">Mother&apos;s Name *</Label>
                <Input
                  id="motherName"
                  value={formData.motherName}
                  onChange={(event) =>
                    handleChange("motherName", event.target.value)
                  }
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
                  onChange={(event) => handleChange("age", event.target.value)}
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
                    {addresses.map((address) => (
                      <SelectItem key={address.id} value={address.label}>
                        {address.label}
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
                  onChange={(event) =>
                    handleChange("dateOfBirth", event.target.value)
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastDonationDate">Last Donation Date</Label>
                <Input
                  id="lastDonationDate"
                  type="date"
                  value={formData.lastDonationDate}
                  onChange={(event) =>
                    handleChange("lastDonationDate", event.target.value)
                  }
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  "Saving..."
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Donor
                  </>
                )}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/admin">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
