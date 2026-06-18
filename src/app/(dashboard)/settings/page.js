import { Card, CardContent } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { User, Shield, Building2, LogOut } from "lucide-react"
import { signOut } from "@/app/actions/auth"
import { createClient } from "@/lib/supabase/server"

export const metadata = {
  title: "Settings | Cairo Cargo",
}

export default async function SettingsPage() {
  const supabase = await createClient()
  
  // Fetch current user and profile
  const { data: { user } } = await supabase.auth.getUser()
  const { data: profile } = await supabase
    .from('staff_profiles')
    .select('*')
    .eq('id', user?.id)
    .single()

  const fullName = profile?.full_name || "Unknown User"
  const email = profile?.email || user?.email || ""
  const initials = fullName.charAt(0).toUpperCase()
  
  // Format role display
  let roleDisplay = "Staff"
  if (profile?.role === 'admin') roleDisplay = "Administrator"
  else if (profile?.role === 'cairo_staff') roleDisplay = "Cairo Staff"
  else if (profile?.role === 'kano_staff') roleDisplay = "Kano Staff"
  else if (profile?.role) roleDisplay = profile.role

  const branchDisplay = profile?.branch ? profile.branch.toUpperCase() : "Unknown"

  return (
    <div className="max-w-2xl space-y-8 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold text-fg tracking-tight">Settings</h1>
        <p className="text-sm text-fg-muted mt-1">Manage your account and preferences</p>
      </div>

      {/* Profile */}
      <Card>
        <CardContent className="p-5 pt-5 space-y-4">
          <h2 className="text-xs font-bold text-fg-faint uppercase tracking-wider flex items-center gap-2">
            <User className="w-3.5 h-3.5" /> Profile
          </h2>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-lg">
              {initials}
            </div>
            <div>
              <p className="text-sm font-semibold text-fg">{fullName}</p>
              <p className="text-xs text-fg-faint">{email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Role & Branch */}
      <Card>
        <CardContent className="p-5 pt-5 space-y-4">
          <h2 className="text-xs font-bold text-fg-faint uppercase tracking-wider flex items-center gap-2">
            <Shield className="w-3.5 h-3.5" /> Role & Access
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="p-3 rounded-[var(--radius-md)] bg-surface-0 border border-surface-3/60">
              <p className="text-xs text-fg-faint">Role</p>
              <p className="text-sm font-medium text-fg mt-0.5">{roleDisplay}</p>
            </div>
            <div className="p-3 rounded-[var(--radius-md)] bg-surface-0 border border-surface-3/60">
              <p className="text-xs text-fg-faint">Branch</p>
              <p className="text-sm font-medium text-fg mt-0.5 capitalize">{branchDisplay}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Office Info */}
      <Card>
        <CardContent className="p-5 pt-5 space-y-4">
          <h2 className="text-xs font-bold text-fg-faint uppercase tracking-wider flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5" /> Office Hubs
          </h2>
          <div className="space-y-2">
            {[
              { name: "Cairo (Origin)", code: "CAI", color: "bg-accent/10 text-accent" },
              { name: "Kano (Destination)", code: "KAN", color: "bg-success/10 text-success" },
              { name: "Abuja (Destination)", code: "ABJ", color: "bg-info/10 text-info" },
            ].map((hub) => (
              <div key={hub.code} className="flex items-center justify-between p-3 rounded-[var(--radius-md)] bg-surface-0 border border-surface-3/60">
                <span className="text-sm text-fg">{hub.name}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${hub.color}`}>{hub.code}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sign Out */}
      <form action={signOut}>
        <Button type="submit" variant="destructive" className="gap-2">
          <LogOut className="w-4 h-4" />
          Sign Out
        </Button>
      </form>
    </div>
  )
}
