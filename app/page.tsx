"use client"

import { useCallback, useEffect, useState } from "react"
import { Header } from "@/components/header"
import { SearchBar } from "@/components/search-bar"
import { DonorGrid } from "@/components/donor-grid"
import { PagePagination } from "@/components/page-pagination"
import type { Donor } from "@/lib/types"

const pageSize = 9

export default function Home() {
  const [bloodGroup, setBloodGroup] = useState("all")
  const [address, setAddress] = useState("all")
  const [activeBloodGroup, setActiveBloodGroup] = useState("all")
  const [activeAddress, setActiveAddress] = useState("all")
  const [donors, setDonors] = useState<Donor[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [hasSearched, setHasSearched] = useState(false)

  useEffect(() => {
    const fetchDonors = async () => {
      setIsLoading(true)

      try {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: pageSize.toString(),
        })

        if (hasSearched && activeBloodGroup !== "all") {
          params.set("bloodGroup", activeBloodGroup)
        }

        if (hasSearched && activeAddress !== "all") {
          params.set("address", activeAddress)
        }

        const res = await fetch(`/api/donors?${params.toString()}`)
        const data = await res.json()

        if (res.ok) {
          setDonors(data.donors || [])
          setTotalItems(data.pagination?.totalItems || 0)
          setTotalPages(data.pagination?.totalPages || 1)
        }
      } catch (error) {
        console.error("Failed to fetch donors:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDonors()
  }, [activeAddress, activeBloodGroup, currentPage, hasSearched])

  const handleSearch = useCallback(() => {
    setActiveBloodGroup(bloodGroup)
    setActiveAddress(address)
    setHasSearched(true)
    setCurrentPage(1)
  }, [address, bloodGroup])

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
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
            {totalItems} donor{totalItems !== 1 && "s"} found
          </span>
        </div>

        <div className="space-y-6">
          <DonorGrid donors={donors} isLoading={isLoading} />
          <PagePagination
            page={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={handlePageChange}
          />
        </div>
      </main>

      <footer className="border-t border-border/40 py-6">
        <div className="container mx-auto max-w-6xl px-4 text-center text-sm text-muted-foreground">
          <p>Blood Donor Finder — Connecting donors with those in need.</p>
        </div>
      </footer>
    </div>
  )
}
