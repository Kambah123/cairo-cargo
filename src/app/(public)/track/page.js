"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Package, Search, CheckCircle2, Plane, Truck, PackageCheck, MapPin, Scale, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { StatusChip } from "@/components/ui/StatusChip"
import { getShipmentById } from "@/lib/supabase/api"

export default function TrackingPortal() {
  const [trackingId, setTrackingId] = React.useState("")
  const [isSearching, setIsSearching] = React.useState(false)
  const [hasSearched, setHasSearched] = React.useState(false)
  const [trackingData, setTrackingData] = React.useState(null)
  const [error, setError] = React.useState(null)

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!trackingId.trim()) return
    setIsSearching(true)
    setError(null)
    setHasSearched(false)
    
    try {
      const data = await getShipmentById(trackingId.trim())
      if (!data) throw new Error("Tracking ID not found")
      
      // Calculate dynamic steps based on current status
      const statusOrder = ["received", "packed", "shipped", "arrived", "delivered"]
      const currentStatusIdx = statusOrder.indexOf(data.status) !== -1 ? statusOrder.indexOf(data.status) : 
                               (data.status === 'awaiting_shipment' ? 1 : 
                               (data.status === 'ready_for_pickup' ? 3 : 0))

      const generateSteps = () => {
        const baseDate = new Date(data.created_at).toLocaleDateString()
        return [
          { 
            name: "Package Received", detail: "Cairo Station", 
            status: currentStatusIdx > 0 ? "completed" : currentStatusIdx === 0 ? "current" : "pending", 
            icon: Package, date: baseDate 
          },
          { 
            name: "Processed & Packed", detail: "Export documentation verified", 
            status: currentStatusIdx > 1 ? "completed" : currentStatusIdx === 1 ? "current" : "pending", 
            icon: CheckCircle2, date: currentStatusIdx >= 1 ? "Updated" : "—" 
          },
          { 
            name: "In Transit", detail: "En route to destination", 
            status: currentStatusIdx > 2 ? "completed" : currentStatusIdx === 2 ? "current" : "pending", 
            icon: Plane, date: currentStatusIdx >= 2 ? "Updated" : "—" 
          },
          { 
            name: `Arrival at ${data.destination?.toUpperCase()}`, detail: "Pending pickup or delivery", 
            status: currentStatusIdx > 3 ? "completed" : currentStatusIdx === 3 ? "current" : "pending", 
            icon: Truck, date: currentStatusIdx >= 3 ? "Updated" : "—" 
          },
          { 
            name: "Delivered", detail: "Package handed to receiver", 
            status: currentStatusIdx === 4 ? "completed" : "pending", 
            icon: PackageCheck, date: currentStatusIdx === 4 ? "Updated" : "—" 
          },
        ]
      }

      setTrackingData({
        id: data.tracking_number,
        status: data.status,
        origin: "Cairo",
        destination: data.destination,
        weight: `${data.weight_initial} kg`,
        receiver: data.receiver_name,
        estArrival: "TBD", // Could calculate 5-7 days from created_at
        steps: generateSteps()
      })
    } catch (err) {
      console.error(err)
      setError("Shipment not found. Please check your tracking ID.")
      setTrackingData(null)
    } finally {
      setIsSearching(false)
      setHasSearched(true)
    }
  }

  return (
    <div className="min-h-screen bg-bg text-fg flex flex-col lg:flex-row">
      {/* ── Left Panel: Branding ── */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] p-16 xl:p-24 bg-surface-0 border-r border-surface-3/60 relative overflow-hidden">
        {/* Decorative gradient orb */}
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-accent/5 blur-[100px]" />

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-[var(--radius-md)] bg-accent flex items-center justify-center">
              <Package className="w-5 h-5 text-bg" />
            </div>
            <span className="text-lg font-bold text-fg tracking-tight">Cairo Cargo</span>
          </div>

          <h1 className="text-5xl xl:text-6xl font-bold text-fg leading-[1.1] tracking-tight">
            Track your<br />
            shipment<span className="text-accent">.</span>
          </h1>
          <p className="text-lg text-fg-muted mt-6 max-w-md leading-relaxed">
            Real-time visibility into your cargo from Cairo to Nigeria. Enter your tracking ID to see current status and estimated delivery.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="relative z-10 flex items-center gap-10 pt-8 border-t border-surface-3/60">
          <div>
            <p className="text-2xl font-bold text-fg">5,000+</p>
            <p className="text-xs text-fg-faint uppercase tracking-wider mt-1">Parcels Shipped</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-fg">99.8%</p>
            <p className="text-xs text-fg-faint uppercase tracking-wider mt-1">On-Time Rate</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-fg">2</p>
            <p className="text-xs text-fg-faint uppercase tracking-wider mt-1">Destinations</p>
          </div>
        </motion.div>
      </div>

      {/* ── Right Panel: Tracking ── */}
      <div className="flex-1 flex items-start lg:items-center justify-center p-6 lg:p-16 overflow-y-auto">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-xl space-y-8">
          {/* Mobile header */}
          <div className="lg:hidden flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-[var(--radius-md)] bg-accent flex items-center justify-center">
              <Package className="w-5 h-5 text-bg" />
            </div>
            <span className="text-lg font-bold text-fg tracking-tight">Cairo Cargo</span>
          </div>

          <div>
            <h2 className="text-2xl lg:hidden font-bold text-fg tracking-tight">Track Shipment</h2>
            <p className="text-fg-muted mt-1 lg:hidden">Enter your tracking ID below.</p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-fg-faint w-4 h-4" />
                <input
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value.toUpperCase())}
                  placeholder="Enter tracking ID, e.g. KAN-20260618-0010"
                  className="w-full h-12 pl-10 pr-4 rounded-[var(--radius-md)] border border-surface-3 bg-surface-1 text-sm text-fg text-mono placeholder:text-fg-faint placeholder:font-sans focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/50 transition-all uppercase"
                  required
                />
              </div>
            </div>
            <Button type="submit" disabled={isSearching} className="h-12 min-w-[100px]">
              {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : "Track"}
            </Button>
          </form>

          {/* Error Message */}
          {error && hasSearched && !isSearching && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-[var(--radius-md)] text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {/* Results */}
          <AnimatePresence>
            {hasSearched && !isSearching && trackingData && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                {/* Info Card */}
                <div className="rounded-[var(--radius-lg)] bg-surface-1 border border-surface-3/60 overflow-hidden">
                  <div className="p-5 flex items-start justify-between">
                    <div>
                      <p className="text-xs text-fg-faint uppercase tracking-wider font-medium">Tracking ID</p>
                      <p className="text-xl font-bold text-fg text-mono mt-1">{trackingData.id}</p>
                    </div>
                    <StatusChip status={trackingData.status} />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-surface-3/30">
                    {[
                      { label: "Route", value: `${trackingData.origin} → ${trackingData.destination?.toUpperCase()}`, icon: MapPin },
                      { label: "Weight", value: trackingData.weight, icon: Scale },
                      { label: "Receiver", value: trackingData.receiver, icon: null },
                      { label: "Est. Arrival", value: trackingData.estArrival, icon: null },
                    ].map((item, i) => (
                      <div key={i} className="bg-surface-0 p-4">
                        <p className="text-[10px] text-fg-faint uppercase tracking-wider">{item.label}</p>
                        <p className="text-sm font-semibold text-fg mt-1 truncate">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Timeline */}
                <div className="rounded-[var(--radius-lg)] bg-surface-1 border border-surface-3/60 p-6">
                  <h3 className="text-sm font-semibold text-fg mb-6">Shipment Progress</h3>

                  <div className="space-y-0">
                    {trackingData.steps.map((step, index) => {
                      const isCompleted = step.status === "completed"
                      const isCurrent = step.status === "current"

                      return (
                        <motion.div
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.08 + 0.2 }}
                          key={index}
                          className="flex gap-4 relative pb-6 last:pb-0"
                        >
                          {/* Connector line */}
                          {index !== trackingData.steps.length - 1 && (
                            <div className={`absolute left-[15px] top-8 bottom-0 w-px ${isCompleted ? "bg-accent/40" : "bg-surface-3"}`} />
                          )}

                          {/* Icon */}
                          <div className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 flex-shrink-0 transition-all ${
                            isCompleted ? "bg-accent/15 border-accent text-accent" :
                            isCurrent ? "bg-accent/10 border-accent text-accent glow-accent" :
                            "bg-surface-2 border-surface-3 text-fg-faint"
                          }`}>
                            <step.icon className={`w-3.5 h-3.5 ${isCurrent ? "animate-pulse" : ""}`} />
                          </div>

                          {/* Content */}
                          <div className="pt-1 min-w-0">
                            <p className={`text-sm font-medium ${isCompleted || isCurrent ? "text-fg" : "text-fg-faint"}`}>
                              {step.name}
                            </p>
                            <p className="text-xs text-fg-faint mt-0.5">{step.detail}</p>
                            {isCurrent && (
                              <p className="text-xs text-accent font-medium mt-1">In progress</p>
                            )}
                          </div>

                          {/* Date */}
                          <p className={`text-xs text-mono ml-auto pt-1 flex-shrink-0 ${isCompleted || isCurrent ? "text-fg-muted" : "text-fg-faint"}`}>
                            {step.date}
                          </p>
                        </motion.div>
                      )
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
}
