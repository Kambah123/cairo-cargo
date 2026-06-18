import { Card, CardContent } from "@/components/ui/Card"
import { Users, Plus, ShieldCheck } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import CreateUserForm from "./CreateUserForm"

export const metadata = {
  title: "Admin | User Management",
}

export default async function AdminUsersPage() {
  const supabase = await createClient()
  
  // 1. Verify user is admin
  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  if (authErr || !user) redirect('/login')

  const { data: profile } = await supabase
    .from('staff_profiles')
    .select('role')
    .eq('id', user.id)
    .single()
    
  if (!profile || profile.role !== 'admin') {
    // If not admin, send them back to the dashboard
    redirect('/dashboard')
  }

  // 2. Fetch all users
  const { data: staffMembers } = await supabase
    .from('staff_profiles')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-8 animate-fade-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-fg tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-accent" />
            System Administration
          </h1>
          <p className="text-sm text-fg-muted mt-1">Manage staff accounts and permissions</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column: Create Form */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2 text-accent border-b border-surface-3 pb-4">
                <Plus className="w-4 h-4" />
                <h2 className="text-sm font-semibold">Add New Staff Member</h2>
              </div>
              <CreateUserForm />
            </CardContent>
          </Card>
        </div>

        {/* Right Column: User Directory */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-fg-muted" />
            <h2 className="text-sm font-semibold text-fg">Active Staff Directory</h2>
          </div>
          
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-3/40 bg-surface-1">
                    <th className="text-left p-4 text-xs text-fg-faint uppercase tracking-wider font-medium">Name</th>
                    <th className="text-left p-4 text-xs text-fg-faint uppercase tracking-wider font-medium">Email</th>
                    <th className="text-left p-4 text-xs text-fg-faint uppercase tracking-wider font-medium">Role</th>
                    <th className="text-left p-4 text-xs text-fg-faint uppercase tracking-wider font-medium">Branch</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-3/20">
                  {staffMembers?.map(member => (
                    <tr key={member.id} className="hover:bg-surface-2/30 transition-colors">
                      <td className="p-4 font-medium text-fg">{member.full_name}</td>
                      <td className="p-4 text-fg-muted">{member.email}</td>
                      <td className="p-4">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          member.role === 'admin' ? 'bg-accent/10 text-accent' : 'bg-surface-3 text-fg-muted'
                        }`}>
                          {member.role === 'admin' ? 'Admin' : 'Staff'}
                        </span>
                      </td>
                      <td className="p-4 text-fg-muted capitalize">{member.branch}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
