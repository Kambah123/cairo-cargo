"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/Card"
import { StatusChip } from "@/components/ui/StatusChip"
import { Box, Plus, ScanLine, ArrowRight, Lock, Truck, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/Button"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { getOpenSacks, getClosedSacks, createSack } from "@/lib/supabase/api"

export default function SacksPage() {
  const router = useRouter()
  const [openSacks, setOpenSacks] = React.useState([])
  const [closedSacks, setClosedSacks] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [isCreating, setIsCreating] = React.useState(false)

  const loadData = async () => {
    try {
      const [open, closed] = await Promise.all([
        getOpenSacks(),
        getClosedSacks()
      ])
      setOpenSacks(open || [])
      setClosedSacks(closed || [])
    } catch (error) {
      console.error("Failed to load sacks", error)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    loadData()
  }, [])

  const handleCreateSack = async () => {
    const dest = window.prompt("Enter destination for new sack (e.g. Kano, Abuja):", "Kano")
    if (!dest) return
    setIsCreating(true)
    try {
      const newSack = await createSack(dest)
      router.push(`/sacks/${newSack.sack_number}`)
    } catch (error) {
      console.error("Failed to create sack", error)
      alert("Failed to create sack")
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-fg tracking-tight">Sack Management</h1>
          <p className="text-sm text-fg-muted mt-1">Consolidate parcels into transport sacks</p>
        </div>
        <Button onClick={handleCreateSack} disabled={isCreating} className="gap-2">
          {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          New Sack
        </Button>
      </div>

      {loading ? (
        <div className="py-12 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      ) : (
        <>
          {/* Open Sacks */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <h2 className="text-xs font-bold text-fg-faint uppercase tracking-wider">Open Sacks — Filling</h2>
            </div>

            {openSacks.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-surface-3 rounded-[var(--radius-lg)]">
                <p className="text-sm text-fg-faint">No open sacks found. Create one to start scanning parcels.</p>
              </div>
            ) : (
              <div className="grid lg:grid-cols-2 gap-4">
                {openSacks.map(sack => (
                  <Card key={sack.id} className="overflow-hidden hover:border-surface-3 transition-colors cursor-pointer" onClick={() => router.push(`/sacks/${sack.sack_number}`)}>
                    <CardContent className="p-0">
                      {/* Header */}
                      <div className="p-5 flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-[var(--radius-md)] flex items-center justify-center ${
                            sack.destination?.toLowerCase() === "kano" ? "bg-success/10 text-success" : "bg-info/10 text-info"
                          }`}>
                            <Box className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-mono font-bold text-fg">{sack.sack_id}</p>
                            <p className={`text-xs font-medium ${sack.destination?.toLowerCase() === "kano" ? "text-success" : "text-info"}`}>
                              → {sack.destination?.toUpperCase()}
                            </p>
                            <p className="text-[10px] text-fg-faint mt-1 uppercase tracking-wider">
                              Added by {sack.creator?.full_name || "Unknown"}
                            </p>
                          </div>
                        </div>
                        <StatusChip status={sack.status} />
                      </div>

                      {/* Actions */}
                      <div className="p-4 flex gap-2 bg-surface-0 border-t border-surface-3/60">
                        <Button variant="outline" size="sm" className="flex-1 gap-2">
                          <ScanLine className="w-3.5 h-3.5" /> Manage Parcels
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>

          {/* Closed Sacks */}
          <section className="space-y-4">
            <h2 className="text-xs font-bold text-fg-faint uppercase tracking-wider">Recently Sealed & Shipped</h2>

            {closedSacks.length === 0 ? (
              <div className="p-8 text-center text-sm text-fg-faint bg-surface-1 border border-surface-3/60 rounded-[var(--radius-lg)]">
                No closed sacks found.
              </div>
            ) : (
              <Card className="overflow-hidden">
                <div className="hidden lg:block">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-surface-3/40">
                        <th className="text-left p-4 text-xs text-fg-faint uppercase tracking-wider font-medium">Sack ID</th>
                        <th className="text-left p-4 text-xs text-fg-faint uppercase tracking-wider font-medium">Destination</th>
                        <th className="text-left p-4 text-xs text-fg-faint uppercase tracking-wider font-medium">Status</th>
                        <th className="text-left p-4 text-xs text-fg-faint uppercase tracking-wider font-medium">Created By</th>
                        <th className="text-right p-4 text-xs text-fg-faint uppercase tracking-wider font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {closedSacks.map(s => (
                        <tr key={s.id} onClick={() => router.push(`/sacks/${s.sack_id}`)} className="border-b border-surface-3/20 hover:bg-surface-2/50 transition-colors cursor-pointer">
                          <td className="p-4 text-mono font-semibold text-fg">{s.sack_id}</td>
                          <td className="p-4">
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                              s.destination?.toLowerCase() === "kano" ? "bg-success/10 text-success" : "bg-info/10 text-info"
                            }`}>{s.destination?.toUpperCase()}</span>
                          </td>
                          <td className="p-4"><StatusChip status={s.status} /></td>
                          <td className="p-4 text-xs text-fg-muted">
                            {s.creator?.full_name || "Unknown"} <span className="text-fg-faint">({s.creator?.branch?.toUpperCase() || "?"})</span>
                          </td>
                          <td className="p-4 text-right text-fg-faint text-xs">{new Date(s.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile */}
                <div className="lg:hidden divide-y divide-surface-3/30">
                  {closedSacks.map(s => (
                    <div key={s.id} onClick={() => router.push(`/sacks/${s.sack_id}`)} className="p-4 flex items-center justify-between cursor-pointer hover:bg-surface-2/50">
                      <div className="space-y-1">
                        <p className="text-mono text-sm font-semibold text-fg">{s.sack_id}</p>
                        <p className="text-xs text-fg-faint">{s.destination?.toUpperCase()}</p>
                        <p className="text-xs text-fg-muted">Added by {s.creator?.full_name || "Unknown"} ({s.creator?.branch?.toUpperCase() || "?"})</p>
                      </div>
                      <StatusChip status={s.status} />
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </section>
        </>
      )}
    </div>
  )
}
