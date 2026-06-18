"use client"

import * as React from "react"
import { Search, Package, User, ArrowRight, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { Card, CardContent } from "@/components/ui/Card"
import { StatusChip } from "@/components/ui/StatusChip"
import { searchShipments } from "@/lib/supabase/api"

export default function SearchPage() {
  const router = useRouter()
  const [query, setQuery] = React.useState("")
  const [isSearching, setIsSearching] = React.useState(false)
  const [results, setResults] = React.useState(null)
  const [error, setError] = React.useState(null)

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!query.trim()) return
    setIsSearching(true)
    setError(null)
    try {
      const data = await searchShipments(query)
      setResults(data || [])
    } catch (err) {
      console.error(err)
      setError("Failed to fetch search results")
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold text-fg tracking-tight">Search</h1>
        <p className="text-sm text-fg-muted mt-1">Find parcels by tracking ID, phone, or name</p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-fg-faint w-4 h-4" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by tracking ID, sender name, or phone..."
            className="w-full h-11 pl-10 pr-4 rounded-[var(--radius-md)] border border-surface-3 bg-surface-1 text-sm text-fg placeholder:text-fg-faint focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/50 transition-all"
            autoFocus
          />
        </div>
        <Button type="submit" disabled={isSearching} className="h-11 min-w-[100px]">
          {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : "Search"}
        </Button>
      </form>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-[var(--radius-md)] text-sm">
          {error}
        </div>
      )}

      {/* Results */}
      {results && results.length > 0 && (
        <div className="space-y-4">
          <p className="text-xs text-fg-faint uppercase tracking-wider font-medium">{results.length} results found</p>

          {/* Desktop Table */}
          <Card className="overflow-hidden hidden lg:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-3/40">
                  <th className="text-left p-4 text-xs text-fg-faint uppercase tracking-wider font-medium">Tracking ID</th>
                  <th className="text-left p-4 text-xs text-fg-faint uppercase tracking-wider font-medium">Sender</th>
                  <th className="text-left p-4 text-xs text-fg-faint uppercase tracking-wider font-medium">Receiver</th>
                  <th className="text-left p-4 text-xs text-fg-faint uppercase tracking-wider font-medium">Dest</th>
                  <th className="text-left p-4 text-xs text-fg-faint uppercase tracking-wider font-medium">Weight</th>
                  <th className="text-left p-4 text-xs text-fg-faint uppercase tracking-wider font-medium">Status</th>
                  <th className="text-left p-4 text-xs text-fg-faint uppercase tracking-wider font-medium">Created By</th>
                  <th className="text-right p-4 text-xs text-fg-faint uppercase tracking-wider font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr key={r.id} onClick={() => router.push(`/shipments/${r.tracking_number}`)} className="border-b border-surface-3/20 hover:bg-surface-2/50 transition-colors cursor-pointer">
                    <td className="p-4 text-mono font-semibold text-fg">{r.tracking_number}</td>
                    <td className="p-4 text-fg-muted">{r.sender_name}</td>
                    <td className="p-4 text-fg-muted">{r.receiver_name}</td>
                    <td className="p-4">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        r.destination === "kano" ? "bg-success/10 text-success" : "bg-info/10 text-info"
                      }`}>{r.destination?.toUpperCase()}</span>
                    </td>
                    <td className="p-4 text-fg-muted text-mono">{r.weight_initial} kg</td>
                    <td className="p-4"><StatusChip status={r.status} /></td>
                    <td className="p-4 text-xs text-fg-muted">
                      {r.creator?.full_name || "Unknown"} <span className="text-fg-faint">({r.creator?.branch?.toUpperCase() || "?"})</span>
                    </td>
                    <td className="p-4 text-right text-fg-faint text-xs">{new Date(r.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          {/* Mobile List */}
          <div className="lg:hidden space-y-3">
            {results.map((r) => (
              <Link href={`/shipments/${r.tracking_number}`} key={r.id}>
                <Card className="overflow-hidden hover:border-surface-3 transition-colors">
                  <CardContent className="p-4 flex items-center justify-between pt-4">
                    <div className="space-y-1 min-w-0">
                      <p className="text-mono text-sm font-bold text-fg">{r.tracking_number}</p>
                      <p className="text-xs text-fg-faint truncate">
                        {r.sender_name} → {r.receiver_name} • {r.destination?.toUpperCase()} • {r.weight_initial}kg
                      </p>
                      <p className="text-[10px] text-fg-muted uppercase tracking-wider mt-1">
                        Added by {r.creator?.full_name || "Unknown"}
                      </p>
                    </div>
                    <StatusChip status={r.status} />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {results && results.length === 0 && (
        <div className="py-16 text-center">
          <Package className="w-10 h-10 text-fg-faint/30 mx-auto mb-3" />
          <p className="text-sm font-medium text-fg">No shipments found</p>
          <p className="text-xs text-fg-faint mt-1">Try a different tracking ID or name.</p>
        </div>
      )}

      {!results && !isSearching && (
        <div className="py-16 text-center">
          <Search className="w-10 h-10 text-fg-faint/30 mx-auto mb-3" />
          <p className="text-sm text-fg-faint">Enter a query to search shipments</p>
        </div>
      )}
    </div>
  )
}
