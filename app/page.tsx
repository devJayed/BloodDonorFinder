"use client"

import { useState, useCallback, useEffect, useMemo } from "react"
import { Header } from "@/components/header"
import { SearchBar } from "@/components/search-bar"
import { DonorGrid } from "@/components/donor-grid"
import type { Donor } from "@/lib/types"

export default function Home() {
  const [bloodGroup, setBloodGroup] = useState("all")
  const [address, setAddress] = useState("all")
  const [allDonors, setAllDonors] = useState<Donor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasSearched, setHasSearched] = useState(false)

  useEffect(() => {
    const fetchDonors = async () => {
      try {
        const res = await fetch("/api/donors")
        const data = await res.json()

        if (res.ok) {
          setAllDonors(data.donors || [])
        }
      } catch (error) {
        console.error("Failed to fetch donors:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDonors()
  }, [])

  const filteredDonors = useMemo(() => {
    if (!hasSearched) return allDonors

    return allDonors.filter((donor) => {
      const matchesBloodGroup =
        bloodGroup === "all" || donor.bloodGroup === bloodGroup
      const matchesAddress =
        address === "all" ||
        donor.address.toLowerCase().includes(address.toLowerCase())

      return matchesBloodGroup && matchesAddress
    })
  }, [allDonors, bloodGroup, address, hasSearched])

  const handleSearch = useCallback(() => {
    setHasSearched(true)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="mb-3 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Find Blood Donors Near You
          </h1>
          <p className="mx-auto max-w-2xl text-pretty text-muted-foreground">
            Connect with verified blood donors in your area. Every donation can
            save up to three lives. Search by blood type and location.
          </p>
        </div>

        <div className="mb-8">
          <SearchBar
            bloodGroup={bloodGroup}
            setBloodGroup={setBloodGroup}
            address={address}
            setAddress={setAddress}
            onSearch={handleSearch}
          />
        </div>

        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">
            {hasSearched ? "Search Results" : "All Donors"}
          </h2>
          <span className="text-sm text-muted-foreground">
            {filteredDonors.length} donor{filteredDonors.length !== 1 && "s"}{" "}
            found
          </span>
        </div>

        <DonorGrid donors={filteredDonors} isLoading={isLoading} />
      </main>

      <footer className="border-t border-border/40 py-6">
        <div className="container mx-auto max-w-6xl px-4 text-center text-sm text-muted-foreground">
          <p>Blood Donor Finder — Connecting donors with those in need.</p>
        </div>
      </footer>
    </div>
  )
}
