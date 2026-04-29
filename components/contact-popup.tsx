"use client"

import { Phone, MessageCircle, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useState } from "react"

interface ContactPopupProps {
  isOpen: boolean
  onClose: () => void
  phoneNumber: string
  donorName: string
}

export function ContactPopup({
  isOpen,
  onClose,
  phoneNumber,
  donorName,
}: ContactPopupProps) {
  const [copied, setCopied] = useState(false)

  const handleCopyNumber = () => {
    navigator.clipboard.writeText(phoneNumber)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handlePhoneCall = () => {
    window.open(`tel:${phoneNumber}`, "_self")
  }

  const handleWhatsApp = () => {
    // WhatsApp format: https://wa.me/[country-code][number]
    const whatsappUrl = `https://wa.me/${phoneNumber.replace(/\D/g, "")}`
    window.open(whatsappUrl, "_blank")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-sm rounded-2xl border-border/50 bg-card sm:rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-foreground">
            যোগাযোগঃ {donorName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Phone Number Display */}
          <div className="rounded-xl bg-secondary p-4">
            <p className="mb-2 text-sm font-medium text-muted-foreground">
              Mobile Number
            </p>
            <div className="flex items-center justify-between gap-3">
              <p className="text-xl font-bold text-foreground">{phoneNumber}</p>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopyNumber}
                className="rounded-lg"
              >
                <Copy className="h-4 w-4" />
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
          </div>

          {/* Contact Options */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              Contact Options
            </p>
            <div className="flex gap-2">
              {/* Call Now button - only visible on mobile devices */}
              <Button
                onClick={handlePhoneCall}
                size="sm"
                className="flex-1 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 sm:hidden"
              >
                <Phone className="mr-1.5 h-4 w-4" />
                <span className="text-sm">Call Now</span>
              </Button>

              <Button
                onClick={handleWhatsApp}
                size="sm"
                className="flex-1 rounded-lg bg-green-600 text-white hover:bg-green-700"
              >
                <MessageCircle className="mr-1.5 h-4 w-4" />
                <span className="text-sm">WhatsApp</span>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
