"use client"

import * as React from "react"
import { ArrowLeft, MapPin, User, Scale, RefreshCw, Printer, Package, Loader2, MessageCircle } from "lucide-react"
import Link from "next/link"
import QRCode from "react-qr-code"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { Card, CardContent } from "@/components/ui/Card"
import { StatusChip } from "@/components/ui/StatusChip"
import { getShipmentById, updateShipmentStatus } from "@/lib/supabase/api"

const statusFlow = ["received", "packed", "awaiting_shipment", "shipped", "arrived", "ready_for_pickup", "delivered", "hold"]

export default function ParcelDetailsPage() {
  const params = useParams()
  const id = params?.id

  const [parcel, setParcel] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [isUpdating, setIsUpdating] = React.useState(false)

  React.useEffect(() => {
    async function loadData() {
      if (!id) return
      try {
        const data = await getShipmentById(id)
        setParcel(data)
      } catch (error) {
        console.error("Failed to load parcel:", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [id])

  const handleUpdateStatus = async () => {
    if (!parcel) return
    const currentIndex = statusFlow.indexOf(parcel.status)
    // Avoid advancing if it's not a normal linear status (like hold) or already at end
    if (currentIndex >= statusFlow.indexOf("delivered") || currentIndex === -1) return
    
    setIsUpdating(true)
    try {
      const nextStatus = statusFlow[currentIndex + 1]
      await updateShipmentStatus(parcel.id, nextStatus)
      setParcel({ ...parcel, status: nextStatus })
    } catch (error) {
      console.error("Failed to update status", error)
      alert("Failed to update status")
    } finally {
      setIsUpdating(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const getWhatsAppLink = () => {
    if (!parcel) return "#"
    const message = `Hello ${parcel.receiver_name}, your parcel from ${parcel.sender_name} is on the way via Cairo Cargo! Track it here: https://app.cairocargo.com/track/${parcel.tracking_number}`
    const phone = parcel.receiver_phone.replace(/[^0-9]/g, "")
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    )
  }

  if (!parcel) {
    return (
      <div className="text-center py-12">
        <h2 className="text-lg font-semibold text-fg">Shipment not found</h2>
        <p className="text-fg-muted mt-2">Could not find tracking ID: {id}</p>
        <Link href="/dashboard">
          <Button variant="outline" className="mt-4">Back to Dashboard</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-up print:m-0 print:max-w-none">
      {/* Printable Label Area (Hidden on screen, shown when printing) */}
      <div className="hidden print:block bg-white text-black p-6 mx-auto w-[4in] h-[6in]">
        <div className="text-center border-b-2 border-black pb-4 mb-4">
          <h1 className="text-2xl font-black uppercase tracking-widest">Cairo Cargo</h1>
          <p className="text-sm font-bold mt-1 text-gray-600">CAIRO → {parcel.destination?.toUpperCase()}</p>
        </div>
        
        <div className="flex justify-center mb-6 bg-white p-2">
          <QRCode 
            value={`https://app.cairocargo.com/track/${parcel.tracking_number}`}
            size={180}
            level="H"
            className="w-full max-w-[180px] h-auto"
          />
        </div>

        <div className="text-center mb-6">
          <p className="text-3xl font-black tracking-tight font-mono">{parcel.tracking_number}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm font-medium border-t-2 border-black pt-4">
          <div>
            <p className="text-gray-500 uppercase text-xs">Sender</p>
            <p className="font-bold">{parcel.sender_name}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-500 uppercase text-xs">Receiver</p>
            <p className="font-bold">{parcel.receiver_name}</p>
          </div>
          <div>
            <p className="text-gray-500 uppercase text-xs">Weight</p>
            <p className="font-bold text-lg">{parcel.weight_initial} kg</p>
          </div>
          <div className="text-right">
            <p className="text-gray-500 uppercase text-xs">Date</p>
            <p className="font-bold">{new Date(parcel.created_at).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      <div className="print:hidden space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="w-9 h-9 rounded-[var(--radius-md)] bg-surface-2 flex items-center justify-center hover:bg-surface-3 transition-colors">
              <ArrowLeft className="w-4 h-4 text-fg-muted" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-fg text-mono tracking-tight">{parcel.tracking_number}</h1>
              <p className="text-sm text-fg-muted">Created {new Date(parcel.created_at).toLocaleString()}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="gap-2" onClick={handlePrint}>
            <Printer className="w-3.5 h-3.5" /> Reprint
          </Button>
        </div>

        {/* Status Bar */}
        <Card className="border-accent/20">
          <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-5">
            <div className="flex items-center gap-4">
              <StatusChip status={parcel.status} className="text-sm px-3 py-1.5" />
              <span className="text-xs text-fg-faint">Tracking active</span>
            </div>
            <Button
              onClick={handleUpdateStatus}
              disabled={isUpdating || parcel.status === "delivered" || parcel.status === "hold"}
              size="sm"
              className="gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isUpdating ? "animate-spin" : ""}`} />
              {isUpdating ? "Updating..." : "Advance Status"}
            </Button>
          </CardContent>
        </Card>

        {/* Status Progress */}
        <Card>
          <CardContent className="p-5 pt-5">
            <div className="flex items-center gap-1 overflow-x-auto pb-2">
              {statusFlow.map((s, i) => {
                const currentIdx = statusFlow.indexOf(parcel.status)
                const isActive = currentIdx !== -1 && i <= currentIdx
                const isCurrent = i === currentIdx
                
                // Skip 'hold' from linear flow display
                if (s === "hold") return null;

                return (
                  <React.Fragment key={s}>
                    <div className={`flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium ${
                      isCurrent ? "bg-accent/15 text-accent border border-accent/30" :
                      isActive ? "bg-success/10 text-success" :
                      "bg-surface-2 text-fg-faint"
                    }`}>
                      {isActive && i < currentIdx && <span className="w-1.5 h-1.5 rounded-full bg-success" />}
                      {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />}
                      {s.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                    </div>
                    {i < statusFlow.length - 2 && ( // -2 because 'hold' is last
                      <div className={`w-6 h-px flex-shrink-0 ${isActive ? "bg-accent/30" : "bg-surface-3"}`} />
                    )}
                  </React.Fragment>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Details Grid */}
        <div className="grid lg:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-5 space-y-4 pt-5">
              <h3 className="text-xs font-semibold text-fg-faint uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5" /> Routing
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-fg-muted">Origin</span>
                  <span className="text-sm font-medium text-fg">Cairo</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-fg-muted">Destination</span>
                  <span className="text-sm font-medium text-fg">{parcel.destination?.toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-fg-muted">Sack ID</span>
                  <span className="text-sm text-mono font-medium text-accent">{parcel.sack_id ? parcel.sack_id : "Not assigned"}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 space-y-4 pt-5">
              <h3 className="text-xs font-semibold text-fg-faint uppercase tracking-wider flex items-center gap-2">
                <User className="w-3.5 h-3.5" /> Contacts
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-fg">{parcel.sender_name}</p>
                  <p className="text-xs text-fg-faint">{parcel.sender_phone} — Sender</p>
                </div>
                <div className="h-px bg-surface-3/60" />
                <div>
                  <p className="text-sm font-medium text-fg">{parcel.receiver_name}</p>
                  <p className="text-xs text-fg-faint">{parcel.receiver_phone} — Receiver</p>
                  <a href={getWhatsAppLink()} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 mt-2 text-xs font-medium text-[#25D366] hover:text-[#128C7E] transition-colors">
                    <MessageCircle className="w-3.5 h-3.5" />
                    Notify via WhatsApp
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardContent className="p-5 space-y-4 pt-5">
              <h3 className="text-xs font-semibold text-fg-faint uppercase tracking-wider flex items-center gap-2">
                <Scale className="w-3.5 h-3.5" /> Specifications
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-fg-faint">Weight</p>
                  <p className="text-lg font-bold text-fg text-mono">{parcel.weight_initial} kg</p>
                </div>
                <div>
                  <p className="text-xs text-fg-faint">Value</p>
                  <p className="text-lg font-bold text-fg text-mono">₦{parcel.declared_value}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-xs text-fg-faint">Description</p>
                  <p className="text-sm text-fg mt-1">{parcel.description || "No description provided."}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Staff Information */}
          <Card className="lg:col-span-2">
            <CardContent className="p-5 space-y-4 pt-5">
              <h3 className="text-xs font-semibold text-fg-faint uppercase tracking-wider flex items-center gap-2">
                <User className="w-3.5 h-3.5" /> Staff Information
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-fg-faint">Created By</p>
                  <p className="text-sm font-medium text-fg mt-1">{parcel.creator?.full_name || "Unknown"}</p>
                </div>
                <div>
                  <p className="text-xs text-fg-faint">Branch</p>
                  <p className="text-sm font-medium text-fg mt-1 capitalize">{parcel.creator?.branch || "Unknown"}</p>
                </div>
                <div>
                  <p className="text-xs text-fg-faint">Role</p>
                  <p className="text-sm font-medium text-fg mt-1 capitalize">{parcel.creator?.role?.replace('_', ' ') || "Staff"}</p>
                </div>
                <div>
                  <p className="text-xs text-fg-faint">Date Added</p>
                  <p className="text-sm font-medium text-fg mt-1">{new Date(parcel.created_at).toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
