"use client"

import { useState, useRef, useEffect } from "react"
import { Search, ChevronDown, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { BLOOD_GROUPS } from "@/lib/blood-groups"
import type { Address } from "@/lib/types"

const fallbackAddresses: Address[] = []

interface SearchBarProps {
  bloodGroup: string
  setBloodGroup: (value: string) => void
  address: string
  setAddress: (value: string) => void
  name: string
  setName: (value: string) => void
  mobile: string
  setMobile: (value: string) => void
  onSearch: () => void
}

export function SearchBar({
  bloodGroup,
  setBloodGroup,
  address,
  setAddress,
  name,
  setName,
  mobile,
  setMobile,
  onSearch,
}: SearchBarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState(address === "all" ? "" : address)
  const [addresses, setAddresses] = useState<Address[]>(fallbackAddresses)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const filteredAddresses = addresses.filter((addr) =>
    addr.label.toLowerCase().includes(inputValue.toLowerCase())
  )

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const res = await fetch("/api/addresses")
        const data = await res.json()

        if (res.ok) {
          setAddresses(data.addresses || [])
        }
      } catch (error) {
        console.error("Failed to fetch addresses:", error)
      }
    }

    fetchAddresses()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleInputChange = (value: string) => {
    setInputValue(value)
    setAddress(value || "all")
    setIsOpen(true)
  }

  const handleSelectAddress = (addr: string) => {
    setInputValue(addr)
    setAddress(addr)
    setIsOpen(false)
  }

  const handleClear = () => {
    setInputValue("")
    setAddress("all")
    inputRef.current?.focus()
  }

  return (
    <div className="w-full rounded-2xl bg-card p-6 shadow-lg shadow-primary/5 ring-1 ring-border/50">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-foreground">
          Find Blood Donors
        </h2>
        <p className="text-sm text-muted-foreground">
          Search for donors by blood group, location, name, or mobile number
        </p>
      </div>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          onSearch()
        }}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5"
      >
        <Select value={bloodGroup} onValueChange={setBloodGroup}>
          <SelectTrigger className="h-12 rounded-xl border-input bg-background text-foreground">
            <SelectValue placeholder="Blood Group" />
          </SelectTrigger>
          <SelectContent className="scrollbar-professional max-h-[calc(5*2.5rem+0.5rem)]">
            <SelectItem value="all">All Blood Groups</SelectItem>
            {BLOOD_GROUPS.map((group) => (
              <SelectItem key={group} value={group}>
                {group}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="relative">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              onFocus={() => setIsOpen(true)}
              placeholder="Search or select address..."
              className="h-12 w-full rounded-xl border border-input bg-background pl-4 pr-16 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            />
            <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
              {inputValue && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
              </button>
            </div>
          </div>

          {isOpen && (
            <div
              ref={dropdownRef}
              className="scrollbar-professional absolute z-50 mt-1 max-h-[calc(5*2.5rem+0.5rem)] w-full overflow-y-auto rounded-xl border border-border bg-popover p-1 shadow-lg"
            >
              <button
                type="button"
                onClick={() => handleSelectAddress("all")}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-accent ${
                  address === "all"
                    ? "bg-accent text-accent-foreground"
                    : "text-popover-foreground"
                }`}
              >
                <span>All Addresses</span>
                {address === "all" && <Check className="h-4 w-4" />}
              </button>
              {filteredAddresses.length > 0 ? (
                filteredAddresses.map((addr) => (
                  <button
                    key={addr.id}
                    type="button"
                    onClick={() => handleSelectAddress(addr.label)}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-accent ${
                      address === addr.label
                        ? "bg-accent text-accent-foreground"
                        : "text-popover-foreground"
                    }`}
                  >
                    <span>{addr.label}</span>
                    {address === addr.label && <Check className="h-4 w-4" />}
                  </button>
                ))
              ) : (
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  No addresses found
                </div>
              )}
            </div>
          )}
        </div>

        <input
          type="text"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Donor name"
          className="h-12 w-full rounded-xl border border-input bg-background px-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        />

        <input
          type="tel"
          inputMode="tel"
          value={mobile}
          onChange={(event) => setMobile(event.target.value)}
          placeholder="Mobile number"
          className="h-12 w-full rounded-xl border border-input bg-background px-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        />

        <Button
          type="submit"
          className="h-12 rounded-xl text-base font-medium sm:col-span-2 lg:col-span-1"
        >
          <Search className="mr-2 h-4 w-4" />
          Search Donors
        </Button>
      </form>
    </div>
  )
}
