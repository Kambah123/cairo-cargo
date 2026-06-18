"use client"

import * as React from "react"
import { ArrowLeft, Box, Check, RefreshCw, ScanLine, Printer, Loader2, Package } from "lucide-react"
import Link from "next/link"
import QRCode from "react-qr-code"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { Card, CardContent } from "@/components/ui/Card"
import { StatusChip } from "@/components/ui/StatusChip"
import { getSackByNumber, assignShipmentToSack, updateSackStatus } from "@/lib/supabase/api"

const sackStatusFlow = ["open", "sealed", "shipped", "arrived", "delivered"]

export default function SackDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const sackNumber = params?.id

  const [sack, setSack] = React.useState(null)
  const [shipments, setShipments] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  
  const [trackingInput, setTrackingInput] = React.useState("")
  const [isAssigning, setIsAssigning] = React.useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = React.useState(false)

  const loadSack = async () => {
    if (!sackNumber) return
    try {
      const data = await getSackByNumber(sackNumber)
      setSack(data)
      setShipments(data.shipments || [])
    } catch (error) {
      console.error("Failed to load sack details", error)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    loadSack()
  }, [sackNumber])

  const handleAssignShipment = async (e) => {
    e.preventDefault()
    if (!trackingInput.trim()) return
    setIsAssigning(true)
    try {
      await assignShipmentToSack(trackingInput.trim().toUpperCase(), sackNumber)
      setTrackingInput("")
      await loadSack() // Refresh the list
    } catch (error) {
      console.error(error)
      alert("Failed to assign shipment. Ensure it exists and is not already assigned.")
    } finally {
      setIsAssigning(false)
    }
  }

  const handleUpdateStatus = async () => {
    if (!sack) return
    const currentIndex = sackStatusFlow.indexOf(sack.status)
    if (currentIndex >= sackStatusFlow.length - 1 || currentIndex === -1) return
    
    const nextStatus = sackStatusFlow[currentIndex + 1]
    const confirmMsg = nextStatus === 'sealed' 
      ? "Are you sure you want to seal this sack? You cannot easily add shipments once sealed." 
      : `Advance sack status to '${nextStatus}'? This will also update all internal shipments.`
      
    if (!window.confirm(confirmMsg)) return

    setIsUpdatingStatus(true)
    try {
      await updateSackStatus(sack.id, nextStatus)
      await loadSack() // Refresh to see updated shipments statuses too
    } catch (error) {
      console.error("Failed to update status", error)
      alert("Failed to update status")
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    )
  }

  if (!sack) {
    return (
      <div className="text-center py-12">
        <h2 className="text-lg font-semibold text-fg">Sack not found</h2>
        <p className="text-fg-muted mt-2">Could not find Sack ID: {sackNumber}</p>
        <Link href="/sacks">
          <Button variant="outline" className="mt-4">Back to Sacks</Button>
        </Link>
      </div>
    )
  }

  const totalWeight = shipments.reduce((sum, s) => sum + Number(s.weight_initial || 0), 0)

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-up print:m-0 print:max-w-none">
      
      {/* Printable Manifest Area (Hidden on screen, shown when printing) */}
      <div className="hidden print:block bg-white text-black p-6 mx-auto w-[8.5in] h-[11in]">
        <div className="text-center border-b-2 border-black pb-4 mb-6">
          <h1 className="text-3xl font-black uppercase tracking-widest">Cairo Cargo Sack Manifest</h1>
          <p className="text-lg font-bold mt-2 text-gray-600">CAIRO → {sack.destination?.toUpperCase()}</p>
        </div>
        
        <div className="flex justify-between items-center mb-8 border-b border-black pb-6">
          <div className="space-y-3 text-lg">
            <p><span className="font-bold text-gray-600">Sack ID:</span> <span className="font-mono font-bold">{sack.sack_number}</span></p>
            <p><span className="font-bold text-gray-600">Total Parcels:</span> {shipments.length}</p>
            <p><span className="font-bold text-gray-600">Total Weight:</span> {totalWeight.toFixed(1)} kg</p>
            <p><span className="font-bold text-gray-600">Date Sealed:</span> {new Date().toLocaleDateString()}</p>
          </div>
          <div className="bg-white p-2 border-2 border-black rounded-lg">
            <QRCode 
              value={`https://app.cairocargo.com/sacks/${sack.sack_number}`}
              size={120}
              level="H"
            />
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-4 uppercase">Parcels in this Sack</h2>
          <table className="w-full text-left border-collapse border border-black">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-black p-2 font-bold uppercase text-sm">Tracking ID</th>
                <th className="border border-black p-2 font-bold uppercase text-sm">Sender</th>
                <th className="border border-black p-2 font-bold uppercase text-sm">Receiver</th>
                <th className="border border-black p-2 font-bold uppercase text-sm">Weight (kg)</th>
              </tr>
            </thead>
            <tbody>
              {shipments.map((s, index) => (
                <tr key={s.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="border border-black p-2 font-mono font-bold">{s.tracking_number}</td>
                  <td className="border border-black p-2">{s.sender_name}</td>
                  <td className="border border-black p-2">{s.receiver_name}</td>
                  <td className="border border-black p-2 text-right">{s.weight_initial}</td>
                </tr>
              ))}
              {shipments.length === 0 && (
                <tr>
                  <td colSpan="4" className="border border-black p-4 text-center text-gray-500 italic">No parcels in this sack</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="print:hidden space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/sacks" className="w-9 h-9 rounded-[var(--radius-md)] bg-surface-2 flex items-center justify-center hover:bg-surface-3 transition-colors">
              <ArrowLeft className="w-4 h-4 text-fg-muted" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <Box className="w-5 h-5 text-accent" />
                <h1 className="text-xl font-bold text-fg text-mono tracking-tight">{sack.sack_number}</h1>
              </div>
              <p className="text-sm text-fg-muted">
                Destination: <strong className={sack.destination?.toLowerCase() === "kano" ? "text-success" : "text-info"}>
                  {sack.destination?.toUpperCase()}
                </strong>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2" onClick={() => window.print()}>
              <Printer className="w-3.5 h-3.5" /> Print Manifest
            </Button>
            <Button
              onClick={handleUpdateStatus}
              disabled={isUpdatingStatus || sack.status === "delivered"}
              size="sm"
              className="gap-2 min-w-[140px]"
            >
              {isUpdatingStatus ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              {sack.status === 'open' ? 'Seal Sack' : 'Advance Status'}
            </Button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex flex-col justify-center items-center">
              <p className="text-xs text-fg-faint uppercase tracking-wider">Status</p>
              <div className="mt-2"><StatusChip status={sack.status} /></div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex flex-col justify-center items-center">
              <p className="text-xs text-fg-faint uppercase tracking-wider">Parcels inside</p>
              <p className="text-2xl font-bold text-fg mt-1">{shipments.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex flex-col justify-center items-center">
              <p className="text-xs text-fg-faint uppercase tracking-wider">Total Weight</p>
              <p className="text-2xl font-bold text-fg mt-1 text-mono">{totalWeight.toFixed(1)} kg</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex flex-col justify-center items-center">
              <p className="text-xs text-fg-faint uppercase tracking-wider">Created</p>
              <p className="text-sm font-medium text-fg mt-2">{new Date(sack.created_at).toLocaleDateString()}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column: Assignment (Only visible if sack is open) */}
          {sack.status === "open" && (
            <div className="lg:col-span-1">
              <Card className="sticky top-6 border-accent/20">
                <CardContent className="p-5 pt-5 space-y-4">
                  <div className="flex items-center gap-2 text-accent">
                    <ScanLine className="w-4 h-4" />
                    <h2 className="text-sm font-semibold">Assign Shipment</h2>
                  </div>
                  <p className="text-xs text-fg-faint">
                    Scan a barcode or enter a tracking ID to add a shipment to this sack.
                  </p>
                  
                  <form onSubmit={handleAssignShipment} className="space-y-3">
                    <div className="space-y-1">
                      <input
                        value={trackingInput}
                        onChange={(e) => setTrackingInput(e.target.value)}
                        placeholder="e.g. KAN-2026..."
                        className="w-full h-11 px-3 rounded-[var(--radius-md)] border border-surface-3 bg-surface-1 text-sm text-fg text-mono placeholder:text-fg-faint focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/50 uppercase"
                        autoFocus
                      />
                    </div>
                    <Button type="submit" disabled={isAssigning || !trackingInput.trim()} className="w-full h-11">
                      {isAssigning ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add to Sack"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Right Column: Shipments List */}
          <div className={`space-y-4 ${sack.status === "open" ? "lg:col-span-2" : "lg:col-span-3"}`}>
            <h2 className="text-sm font-semibold text-fg">Assigned Shipments ({shipments.length})</h2>
            
            {shipments.length === 0 ? (
              <Card className="border-dashed bg-transparent border-surface-3">
                <CardContent className="p-8 text-center flex flex-col items-center">
                  <Package className="w-8 h-8 text-surface-3 mb-2" />
                  <p className="text-sm text-fg-faint">No shipments in this sack yet.</p>
                </CardContent>
              </Card>
            ) : (
              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-surface-3/40 bg-surface-1">
                        <th className="text-left p-4 text-xs text-fg-faint uppercase tracking-wider font-medium">Tracking ID</th>
                        <th className="text-left p-4 text-xs text-fg-faint uppercase tracking-wider font-medium">Weight</th>
                        <th className="text-left p-4 text-xs text-fg-faint uppercase tracking-wider font-medium">Status</th>
                        <th className="text-right p-4 text-xs text-fg-faint uppercase tracking-wider font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {shipments.map(s => (
                        <tr key={s.id} onClick={() => router.push(`/shipments/${s.tracking_number}`)} className="border-b border-surface-3/20 hover:bg-surface-2/50 transition-colors cursor-pointer">
                          <td className="p-4 text-mono font-semibold text-fg">{s.tracking_number}</td>
                          <td className="p-4 text-fg-muted text-mono">{s.weight_initial} kg</td>
                          <td className="p-4"><StatusChip status={s.status} /></td>
                          <td className="p-4 text-right text-fg-faint text-xs">{new Date(s.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
