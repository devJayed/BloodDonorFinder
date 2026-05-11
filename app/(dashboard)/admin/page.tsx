"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Droplet, Edit, Plus, Search, Trash2, Upload, Users } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { PagePagination } from "@/components/page-pagination"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import type { Donor } from "@/lib/types"

const pageSize = 10

export default function AdminPage() {
  useSession()
  const { toast } = useToast()
  const [donors, setDonors] = useState<Donor[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [bloodGroupCount, setBloodGroupCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isImporting, setIsImporting] = useState(false)
  const importInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 300)

    return () => window.clearTimeout(timer)
  }, [searchQuery])

  const fetchDonors = useCallback(async () => {
    setIsLoading(true)

    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
      })

      if (debouncedSearchQuery.trim()) {
        params.set("q", debouncedSearchQuery.trim())
      }

      const res = await fetch(`/api/donors?${params.toString()}`)
      const data = await res.json()
      if (res.ok) {
        setDonors(data.donors || [])
        setTotalItems(data.pagination?.totalItems || 0)
        setTotalPages(data.pagination?.totalPages || 1)
        setBloodGroupCount(data.stats?.bloodGroupCount || 0)
      }
    } catch (error) {
      console.error("Failed to fetch donors:", error)
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, debouncedSearchQuery])

  useEffect(() => {
    fetchDonors()
  }, [fetchDonors])

  const handleDelete = async (donorId: string) => {
    try {
      const res = await fetch(`/api/donors/${donorId}`, {
        method: "DELETE",
      })

      if (res.ok) {
        toast({
          title: "Donor Deleted",
          description: "The donor has been removed successfully.",
        })
        fetchDonors()
      } else {
        const data = await res.json()
        toast({
          title: "Error",
          description: data.error || "Failed to delete donor.",
          variant: "destructive",
        })
      }
    } catch {
      toast({
        title: "Error",
        description: "Something went wrong.",
        variant: "destructive",
      })
    }
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ""

    if (!file) return

    const formData = new FormData()
    formData.append("file", file)
    setIsImporting(true)

    try {
      const res = await fetch("/api/donors/import", {
        method: "POST",
        body: formData,
      })
      const data = await res.json()

      if (res.ok) {
        toast({
          title: "Donors Imported",
          description: `${data.imported} donor${
            data.imported === 1 ? "" : "s"
          } imported. ${data.skipped} row${
            data.skipped === 1 ? "" : "s"
          } skipped.`,
        })
        fetchDonors()
      } else {
        toast({
          title: "Import Failed",
          description: data.error || "Failed to import donors.",
          variant: "destructive",
        })
      }
    } catch {
      toast({
        title: "Import Failed",
        description: "Something went wrong.",
        variant: "destructive",
      })
    } finally {
      setIsImporting(false)
    }
  }

  const stats = [
    {
      title: "Total Donors",
      value: totalItems,
      icon: Users,
      color: "bg-blue-500/10 text-blue-600",
    },
    {
      title: "Blood Groups",
      value: bloodGroupCount,
      icon: Droplet,
      color: "bg-red-500/10 text-red-600",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
          <p className="mt-1 text-muted-foreground">
            Manage all blood donors in the system.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Input
            ref={importInputRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={handleImport}
          />
          <Button
            variant="outline"
            disabled={isImporting}
            onClick={() => importInputRef.current?.click()}
          >
            <Upload className="mr-2 h-4 w-4" />
            {isImporting ? "Importing..." : "Import Excel"}
          </Button>
          <Button asChild>
            <Link href="/dashboard/add-donor">
              <Plus className="mr-2 h-4 w-4" />
              Add Donor
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="flex items-center gap-4 p-4">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.color}`}
              >
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground">{stat.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Donors Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>All Donors</CardTitle>
              <CardDescription>
                View and manage registered blood donors.
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search donors..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : donors.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              No donors found.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Blood Group</TableHead>
                      <TableHead className="hidden md:table-cell">Address</TableHead>
                      <TableHead className="hidden sm:table-cell">Mobile</TableHead>
                      <TableHead className="hidden lg:table-cell">Created By</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {donors.map((donor) => (
                      <TableRow key={donor.id}>
                        <TableCell className="font-medium">{donor.name}</TableCell>
                        <TableCell>
                          {donor.bloodGroup ? (
                            <Badge variant="outline" className="font-semibold text-primary">
                              {donor.bloodGroup}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">N/A</span>
                          )}
                        </TableCell>
                        <TableCell className="hidden max-w-[200px] truncate md:table-cell">
                          {donor.address || (
                            <span className="text-muted-foreground">N/A</span>
                          )}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {donor.mobile}
                        </TableCell>
                        <TableCell className="hidden max-w-[160px] truncate lg:table-cell">
                          {donor.createdByName || donor.createdBy}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/dashboard/donors/${donor.id}/edit`}>
                                <Edit className="h-4 w-4" />
                              </Link>
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" className="text-destructive">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Donor</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete {donor.name}? This
                                    action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(donor.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <PagePagination
                page={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
