"use client"

import { motion } from "framer-motion"
import { HeartOff } from "lucide-react"
import { DonorCard } from "@/components/donor-card"
import { Skeleton } from "@/components/ui/skeleton"
import type { Donor } from "@/lib/types"

interface DonorGridProps {
  donors: Donor[]
  isLoading: boolean
}

export function DonorGrid({ donors, isLoading }: DonorGridProps) {
  if (isLoading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-2xl bg-card p-5 shadow-md">
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-xl" />
                <div>
                  <Skeleton className="mb-2 h-5 w-32" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
              <Skeleton className="h-6 w-10 rounded-lg" />
            </div>
            <div className="mb-4 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-16 rounded-lg" />
              <Skeleton className="h-8 w-24 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (donors.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center rounded-2xl bg-card py-16 shadow-md"
      >
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <HeartOff className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-foreground">
          No Donors Found
        </h3>
        <p className="text-center text-muted-foreground">
          Try adjusting your search filters to find more donors.
        </p>
      </motion.div>
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {donors.map((donor, index) => (
        <DonorCard key={donor.id} donor={donor} index={index} />
      ))}
    </div>
  )
}
