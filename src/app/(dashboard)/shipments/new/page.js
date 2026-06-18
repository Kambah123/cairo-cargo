"use client"

import * as React from "react"
import { ArrowLeft, Camera, Printer, CheckCircle2, ChevronRight, Loader2, MessageCircle } from "lucide-react"
import Link from "next/link"
import QRCode from "react-qr-code"
import { Button } from "@/components/ui/Button"
import { Card, CardContent } from "@/components/ui/Card"
import { createShipment, uploadParcelPhoto } from "@/lib/supabase/api"

const steps = ["Sender & Receiver", "Parcel Details", "Confirmation"]

export default function NewShipmentPage() {
  const [step, setStep] = React.useState(0)
  const [photoCaptured, setPhotoCaptured] = React.useState(false)
  const [photoFile, setPhotoFile] = React.useState(null)
  const [photoPreview, setPhotoPreview] = React.useState(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState(null)
  const [shipmentData, setShipmentData] = React.useState(null)

  // Form State
  const [formData, setFormData] = React.useState({
    sender_name: "",
    sender_phone: "",
    destination: "",
    receiver_name: "",
    receiver_phone: "",
    weight: "",
    description: "",
    declared_value: ""
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleNext = (e) => {
    e.preventDefault()
    setStep(1)
  }

  const handlePhotoCapture = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhotoFile(file)
      if (photoPreview) URL.revokeObjectURL(photoPreview) // cleanup
      setPhotoPreview(URL.createObjectURL(file))
      setPhotoCaptured(true)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    
    try {
      const prefix = formData.destination === "kano" ? "KAN" : formData.destination === "abuja" ? "ABJ" : "LAG"
      const date = new Date().toISOString().slice(0, 10).replace(/-/g, "")
      const seq = String(Math.floor(Math.random() * 9999)).padStart(4, "0")
      const trackingNumber = `${prefix}-${date}-${seq}`

      // Create shipment object
      const newShipment = {
        tracking_number: trackingNumber,
        sender_name: formData.sender_name,
        sender_phone: formData.sender_phone,
        receiver_name: formData.receiver_name,
        receiver_phone: formData.receiver_phone,
        destination: formData.destination,
        weight_initial: parseFloat(formData.weight) || 0,
        weight_final: parseFloat(formData.weight) || 0,
        notes: formData.description,
        status: 'received',
        priority: 'normal',
        total_amount: 0, // Calculate properly later
        paid_amount: 0,
        balance: 0,
        photo_url: null
      }

      if (photoFile) {
        const url = await uploadParcelPhoto(photoFile)
        newShipment.photo_url = url
      }

      const result = await createShipment(newShipment)
      setShipmentData(result)
      setStep(2)
    } catch (err) {
      console.error(err)
      setError(err.message || "Failed to create shipment")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const getWhatsAppLink = () => {
    if (!shipmentData) return "#"
    const message = `Hello ${shipmentData.receiver_name}, your parcel from ${shipmentData.sender_name} is on the way via Cairo Cargo! Track it here: https://app.cairocargo.com/track/${shipmentData.tracking_number}`
    const phone = shipmentData.receiver_phone.replace(/[^0-9]/g, "")
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-up print:m-0 print:max-w-none">
      {/* Header (Hidden when printing) */}
      <div className="flex items-center gap-4 print:hidden">
        <Link href="/dashboard" className="w-9 h-9 rounded-[var(--radius-md)] bg-surface-2 flex items-center justify-center hover:bg-surface-3 transition-colors">
          <ArrowLeft className="w-4 h-4 text-fg-muted" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-fg tracking-tight">New Shipment</h1>
          <p className="text-sm text-fg-muted">Register a new parcel for shipping</p>
        </div>
      </div>

      {/* Step Indicator (Hidden when printing) */}
      <div className="flex items-center gap-2 print:hidden">
        {steps.map((s, i) => (
          <React.Fragment key={i}>
            <div className={`flex items-center gap-2 ${i <= step ? "text-accent" : "text-fg-faint"}`}>
              <div className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center ${
                i < step ? "bg-accent text-bg" :
                i === step ? "border-2 border-accent text-accent" :
                "border border-surface-3 text-fg-faint"
              }`}>
                {i < step ? "✓" : i + 1}
              </div>
              <span className="text-xs font-medium hidden sm:inline">{s}</span>
            </div>
            {i < steps.length - 1 && <div className={`flex-1 h-px ${i < step ? "bg-accent/40" : "bg-surface-3"}`} />}
          </React.Fragment>
        ))}
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-[var(--radius-md)] text-sm print:hidden">
          {error}
        </div>
      )}

      {/* Step 1: Sender & Receiver */}
      {step === 0 && (
        <form onSubmit={handleNext} className="space-y-5 print:hidden">
          <Card>
            <CardContent className="p-5 space-y-4 pt-5">
              <h2 className="text-sm font-semibold text-fg">Sender Information</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-fg-muted uppercase tracking-wider">Sender Name</label>
                  <input required name="sender_name" value={formData.sender_name} onChange={handleChange} placeholder="Full Name" className="w-full h-11 px-3.5 rounded-[var(--radius-md)] border border-surface-3 bg-surface-0 text-sm text-fg placeholder:text-fg-faint focus:outline-none focus:ring-2 focus:ring-accent/40 transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-fg-muted uppercase tracking-wider">Sender Phone</label>
                  <input required name="sender_phone" value={formData.sender_phone} onChange={handleChange} type="tel" placeholder="+20 100..." className="w-full h-11 px-3.5 rounded-[var(--radius-md)] border border-surface-3 bg-surface-0 text-sm text-fg placeholder:text-fg-faint focus:outline-none focus:ring-2 focus:ring-accent/40 transition-all" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 space-y-4 pt-5">
              <h2 className="text-sm font-semibold text-fg">Receiver Information</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-medium text-fg-muted uppercase tracking-wider">Destination</label>
                  <select required name="destination" value={formData.destination} onChange={handleChange} className="w-full h-11 px-3.5 rounded-[var(--radius-md)] border border-surface-3 bg-surface-0 text-sm text-fg focus:outline-none focus:ring-2 focus:ring-accent/40 transition-all">
                    <option value="">Select destination hub</option>
                    <option value="kano">Kano (KAN)</option>
                    <option value="abuja">Abuja (ABJ)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-fg-muted uppercase tracking-wider">Receiver Name</label>
                  <input required name="receiver_name" value={formData.receiver_name} onChange={handleChange} placeholder="Full Name" className="w-full h-11 px-3.5 rounded-[var(--radius-md)] border border-surface-3 bg-surface-0 text-sm text-fg placeholder:text-fg-faint focus:outline-none focus:ring-2 focus:ring-accent/40 transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-fg-muted uppercase tracking-wider">Receiver Phone</label>
                  <input required name="receiver_phone" value={formData.receiver_phone} onChange={handleChange} type="tel" placeholder="+234 800..." className="w-full h-11 px-3.5 rounded-[var(--radius-md)] border border-surface-3 bg-surface-0 text-sm text-fg placeholder:text-fg-faint focus:outline-none focus:ring-2 focus:ring-accent/40 transition-all" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Button type="submit" className="w-full sm:w-auto ml-auto flex h-11">
            Continue <ChevronRight className="w-4 h-4" />
          </Button>
        </form>
      )}

      {/* Step 2: Parcel Details */}
      {step === 1 && (
        <form onSubmit={handleSubmit} className="space-y-5 print:hidden">
          <Card>
            <CardContent className="p-5 space-y-4 pt-5">
              <h2 className="text-sm font-semibold text-fg">Parcel Details</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-fg-muted uppercase tracking-wider">Weight (kg)</label>
                  <input required name="weight" value={formData.weight} onChange={handleChange} type="number" step="0.1" placeholder="0.0" className="w-full h-11 px-3.5 rounded-[var(--radius-md)] border border-surface-3 bg-surface-0 text-sm text-fg text-mono placeholder:text-fg-faint focus:outline-none focus:ring-2 focus:ring-accent/40 transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-fg-muted uppercase tracking-wider">Declared Value ($)</label>
                  <input name="declared_value" value={formData.declared_value} onChange={handleChange} type="number" placeholder="Optional" className="w-full h-11 px-3.5 rounded-[var(--radius-md)] border border-surface-3 bg-surface-0 text-sm text-fg placeholder:text-fg-faint focus:outline-none focus:ring-2 focus:ring-accent/40 transition-all" />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-medium text-fg-muted uppercase tracking-wider">Description</label>
                  <textarea required name="description" value={formData.description} onChange={handleChange} placeholder="Brief description of items" className="w-full min-h-[80px] px-3.5 py-2.5 rounded-[var(--radius-md)] border border-surface-3 bg-surface-0 text-sm text-fg placeholder:text-fg-faint focus:outline-none focus:ring-2 focus:ring-accent/40 transition-all resize-none" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 space-y-4 pt-5">
              <h2 className="text-sm font-semibold text-fg">Scale Photo Verification</h2>
              {!photoCaptured ? (
                <>
                  <input type="file" accept="image/*" capture="environment" className="hidden" id="cameraInput" onChange={handlePhotoCapture} />
                  <label
                    htmlFor="cameraInput"
                    className="w-full h-28 border-2 border-dashed border-surface-3 rounded-[var(--radius-lg)] bg-surface-0 flex flex-col items-center justify-center gap-2 hover:border-accent/40 hover:bg-accent/5 transition-all cursor-pointer"
                  >
                    <Camera className="w-6 h-6 text-fg-faint" />
                    <span className="text-sm text-fg-muted">Click to capture scale photo</span>
                  </label>
                </>
              ) : (
                <div className="w-full h-40 border border-accent/30 rounded-[var(--radius-lg)] bg-surface-0 overflow-hidden relative group">
                  {photoPreview && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photoPreview} alt="Scale Photo" className="w-full h-full object-cover" />
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <input type="file" accept="image/*" capture="environment" className="hidden" id="cameraInputRetake" onChange={handlePhotoCapture} />
                    <label htmlFor="cameraInputRetake" className="text-white text-sm font-medium cursor-pointer py-2 px-4 bg-black/50 rounded-full hover:bg-black/70">
                      Retake Photo
                    </label>
                  </div>
                  <div className="absolute top-2 right-2 bg-success text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => setStep(0)}>Back</Button>
            <Button type="submit" disabled={!photoCaptured || isSubmitting} className="flex-1 h-11">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Generate ID & Complete"}
            </Button>
          </div>
        </form>
      )}

      {/* Step 3: Confirmation & Print Tag */}
      {step === 2 && shipmentData && (
        <div className="space-y-6 pt-4 sm:pt-8 animate-fade-up">
          <div className="text-center print:hidden">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-success" />
            </div>
            <h2 className="text-xl font-bold text-fg">Registration Complete</h2>
            <p className="text-sm text-fg-muted mt-1">The shipment has been recorded successfully.</p>
          </div>

          {/* Printable Label Area */}
          <div className="bg-white text-black p-6 rounded-xl mx-auto max-w-sm shadow-xl print:shadow-none print:max-w-none print:w-[4in] print:h-[6in] print:rounded-none">
            <div className="text-center border-b-2 border-black pb-4 mb-4">
              <h1 className="text-2xl font-black uppercase tracking-widest">Cairo Cargo</h1>
              <p className="text-sm font-bold mt-1 text-gray-600">CAIRO → {shipmentData.destination.toUpperCase()}</p>
            </div>
            
            <div className="flex justify-center mb-6 bg-white p-2">
              <QRCode 
                value={`https://app.cairocargo.com/track/${shipmentData.tracking_number}`}
                size={180}
                level="H"
                className="w-full max-w-[180px] h-auto"
              />
            </div>

            <div className="text-center mb-6">
              <p className="text-3xl font-black tracking-tight font-mono">{shipmentData.tracking_number}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm font-medium border-t-2 border-black pt-4">
              <div>
                <p className="text-gray-500 uppercase text-xs">Sender</p>
                <p className="font-bold">{shipmentData.sender_name}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-500 uppercase text-xs">Receiver</p>
                <p className="font-bold">{shipmentData.receiver_name}</p>
              </div>
              <div>
                <p className="text-gray-500 uppercase text-xs">Weight</p>
                <p className="font-bold text-lg">{shipmentData.weight_initial} kg</p>
              </div>
              <div className="text-right">
                <p className="text-gray-500 uppercase text-xs">Date</p>
                <p className="font-bold">{new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto pt-4 print:hidden">
            <Button onClick={handlePrint} className="flex-1 gap-2">
              <Printer className="w-4 h-4" />
              Print Label
            </Button>
            <Button variant="outline" onClick={() => {
              setStep(0)
              setPhotoCaptured(false)
              setPhotoFile(null)
              if (photoPreview) URL.revokeObjectURL(photoPreview)
              setPhotoPreview(null)
              setShipmentData(null)
              setFormData({
                sender_name: "", sender_phone: "", destination: "", receiver_name: "",
                receiver_phone: "", weight: "", description: "", declared_value: ""
              })
            }} className="flex-1">
              New Shipment
            </Button>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto pt-2 print:hidden">
            <a href={getWhatsAppLink()} target="_blank" rel="noopener noreferrer" className="w-full">
              <Button type="button" variant="secondary" className="w-full gap-2 bg-[#25D366]/10 text-[#128C7E] hover:bg-[#25D366]/20 border-none">
                <MessageCircle className="w-4 h-4" />
                Notify via WhatsApp
              </Button>
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
