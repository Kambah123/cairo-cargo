"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/Card"
import { StatusChip } from "@/components/ui/StatusChip"
import { Box, Plus, ScanLine, ArrowRight, Clock, Package, Truck, TrendingUp, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/Button"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { getRecentShipments, getOpenSacks } from "@/lib/supabase/api"

export default function DashboardPage() {
  const router = useRouter()
  const [recentShipments, setRecentShipments] = React.useState([])
  const [stats, setStats] = React.useState([
    { label: "Today's Intake", value: "0", change: null, icon: Package, color: "text-accent" },
    { label: "In Transit", value: "0", change: null, icon: Truck, color: "text-[#a78bfa]" },
    { label: "Pending Pickup", value: "0", change: null, icon: Clock, color: "text-warning" },
    { label: "Active Sacks", value: "0", change: null, icon: Box, color: "text-info" },
  ])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function loadData() {
      try {
        const [shipments, sacks] = await Promise.all([
          getRecentShipments(),
          getOpenSacks()
        ])

        setRecentShipments(shipments || [])

        // Calculate simple stats based on recent data for MVP
        const todayIntake = shipments.filter(s => new Date(s.created_at).toDateString() === new Date().toDateString()).length
        const inTransit = shipments.filter(s => ['shipped', 'arrived'].includes(s.status)).length
        const pendingPickup = shipments.filter(s => s.status === 'ready_for_pickup').length

        setStats([
          { label: "Today's Intake", value: todayIntake.toString(), change: null, icon: Package, color: "text-accent" },
          { label: "In Transit", value: inTransit.toString(), change: null, icon: Truck, color: "text-[#a78bfa]" },
          { label: "Pending Pickup", value: pendingPickup.toString(), change: null, icon: Clock, color: "text-warning" },
          { label: "Active Sacks", value: (sacks?.length || 0).toString(), change: null, icon: Box, color: "text-info" },
        ])
      } catch (error) {
        console.error("Failed to load dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const formatTimeAgo = (dateString) => {
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
    const daysDifference = Math.round((new Date(dateString) - new Date()) / (1000 * 60 * 60 * 24))
    if (daysDifference === 0) return 'Today'
    return rtf.format(daysDifference, 'day')
  }

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-fg tracking-tight">Dashboard</h1>
          <p className="text-sm text-fg-muted mt-1">Cairo Station — {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
        <Link href="/shipments/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            New Shipment
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="group hover:border-surface-3 transition-colors">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-fg-faint uppercase tracking-wider font-medium">{stat.label}</p>
                  <p className="text-3xl font-bold text-fg mt-2 tracking-tight">
                    {loading ? <Loader2 className="w-6 h-6 animate-spin mt-1 text-surface-3" /> : stat.value}
                  </p>
                  {stat.change && (
                    <p className="text-xs text-success font-medium mt-1 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {stat.change} from yesterday
                    </p>
                  )}
                </div>
                <div className={`w-10 h-10 rounded-[var(--radius-md)] bg-surface-2 flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "New Shipment", href: "/shipments/new", icon: Plus, accent: true },
          { label: "Manage Sacks", href: "/sacks", icon: Box },
          { label: "Search", href: "/search", icon: Package },
          { label: "Settings", href: "/settings", icon: TrendingUp },
        ].map((action) => (
          <Link key={action.label} href={action.href}>
            <div className={`flex items-center gap-3 p-4 rounded-[var(--radius-lg)] border transition-all duration-200 cursor-pointer group ${
              action.accent
                ? "bg-accent/10 border-accent/20 hover:bg-accent/15"
                : "bg-surface-1 border-surface-3/60 hover:border-surface-3"
            }`}>
              <action.icon className={`w-5 h-5 ${action.accent ? "text-accent" : "text-fg-muted group-hover:text-fg"}`} />
              <span className={`text-sm font-medium ${action.accent ? "text-accent" : "text-fg-muted group-hover:text-fg"}`}>
                {action.label}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Shipments Table */}
      <Card>
        <div className="p-5 flex items-center justify-between border-b border-surface-3/60">
          <h2 className="text-sm font-semibold text-fg">Recent Shipments</h2>
          <Link href="/search" className="text-xs text-accent hover:underline flex items-center gap-1">
            View All <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-3/40">
                <th className="text-left p-4 text-xs text-fg-faint uppercase tracking-wider font-medium">Tracking ID</th>
                <th className="text-left p-4 text-xs text-fg-faint uppercase tracking-wider font-medium">Sender</th>
                <th className="text-left p-4 text-xs text-fg-faint uppercase tracking-wider font-medium">Destination</th>
                <th className="text-left p-4 text-xs text-fg-faint uppercase tracking-wider font-medium">Weight</th>
                <th className="text-left p-4 text-xs text-fg-faint uppercase tracking-wider font-medium">Status</th>
                <th className="text-left p-4 text-xs text-fg-faint uppercase tracking-wider font-medium">Created By</th>
                <th className="text-right p-4 text-xs text-fg-faint uppercase tracking-wider font-medium">Time</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-fg-faint"><Loader2 className="w-5 h-5 animate-spin mx-auto" /></td>
                </tr>
              ) : recentShipments.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-fg-faint">No shipments found.</td>
                </tr>
              ) : (
                recentShipments.map((s) => (
                  <tr key={s.id} onClick={() => router.push(`/shipments/${s.tracking_number}`)} className="border-b border-surface-3/20 hover:bg-surface-2/50 transition-colors cursor-pointer">
                    <td className="p-4 text-mono font-semibold text-fg">{s.tracking_number}</td>
                    <td className="p-4 text-fg-muted">{s.sender_name}</td>
                    <td className="p-4">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        s.destination === "kano" ? "bg-success/10 text-success" : "bg-info/10 text-info"
                      }`}>{s.destination?.toUpperCase()}</span>
                    </td>
                    <td className="p-4 text-fg-muted text-mono">{s.weight_initial} kg</td>
                    <td className="p-4"><StatusChip status={s.status} /></td>
                    <td className="p-4 text-xs text-fg-muted">
                      {s.creator?.full_name || "Unknown"} <span className="text-fg-faint">({s.creator?.branch?.toUpperCase() || "?"})</span>
                    </td>
                    <td className="p-4 text-right text-fg-faint text-xs">{formatTimeAgo(s.created_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile List */}
        <div className="lg:hidden divide-y divide-surface-3/30">
          {loading ? (
            <div className="p-8 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-fg-faint" /></div>
          ) : recentShipments.length === 0 ? (
            <div className="p-8 text-center text-fg-faint text-sm">No shipments found.</div>
          ) : (
            recentShipments.map((s) => (
              <div key={s.id} onClick={() => router.push(`/shipments/${s.tracking_number}`)} className="p-4 flex items-center justify-between hover:bg-surface-2/50 transition-colors cursor-pointer">
                <div className="space-y-1">
                  <p className="text-mono text-sm font-semibold text-fg">{s.tracking_number}</p>
                  <p className="text-xs text-fg-faint">{s.sender_name} • {s.destination?.toUpperCase()} • {s.weight_initial}kg</p>
                  <p className="text-xs text-fg-muted">Added by {s.creator?.full_name || "Unknown"} ({s.creator?.branch?.toUpperCase() || "?"})</p>
                </div>
                <StatusChip status={s.status} />
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  )
}
