"use client"

import { Calendar, MapPin, Phone, User, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ContactPopup } from "@/components/contact-popup"
import type { Donor } from "@/lib/types"
import { useState } from "react"

interface DonorCardProps {
  donor: Donor
}

export function DonorCard({ donor }: DonorCardProps) {
  const [isContactOpen, setIsContactOpen] = useState(false)
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "খুঁজে পাওয়া যায়নি"
    return new Date(dateString).toLocaleDateString("bn-BD", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="mobile-stable-card">
      <Card className="group overflow-hidden rounded-2xl border-border/50 bg-card shadow-none sm:shadow-md sm:transition-shadow sm:duration-300 sm:hover:shadow-xl sm:hover:shadow-primary/10">
        <CardContent className="p-5">
          <div className="mb-4 flex items-start justify-between">
            <div className="min-w-0 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 sm:transition-colors sm:group-hover:bg-primary/20">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div className="min-w-0">
                <h3 className="truncate font-semibold text-foreground">{donor.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {donor.age ? `${donor.age} years old` : "Age not added"}
                </p>
              </div>
            </div>
            {donor.bloodGroup && (
              <Badge
                variant="secondary"
                className="rounded-lg bg-primary px-3 py-1 text-sm font-bold text-primary-foreground"
              >
                {donor.bloodGroup}
              </Badge>
            )}
          </div>

          <div className="mb-4 space-y-2">
            <div className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4 shrink-0 text-primary/70" />
              <span className="truncate">
                পিতার নামঃ {donor.fatherName}
              </span>
            </div>
            <div className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 shrink-0 text-primary/70" />
              <span className="truncate">{donor.address || "Address not added"}</span>
            </div>
            <div className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 shrink-0 text-primary/70" />
              <span className="truncate">সর্বশেষ রক্ত দানের তারিখঃ {formatDate(donor.lastDonationDate)}</span>
            </div>
          </div>

          <div className="flex items-center justify-end">
            <Button
              size="sm"
              className="rounded-xl"
              onClick={() => setIsContactOpen(true)}
            >
              <Phone className="mr-1.5 h-3.5 w-3.5" />
              Call Now
            </Button>
          </div>

          <ContactPopup
            isOpen={isContactOpen}
            onClose={() => setIsContactOpen(false)}
            phoneNumber={donor.mobile}
            donorName={donor.name}
          />
        </CardContent>
      </Card>
    </div>
  )
}
