import { createClient } from './client'

export async function getCurrentUserProfile() {
  const supabase = createClient()
  const { data: { user }, error: authErr } = await supabase.auth.getUser()
  if (authErr || !user) return null
  
  const { data: profile } = await supabase
    .from('staff_profiles')
    .select('*')
    .eq('id', user.id)
    .single()
    
  return profile
}

// SHIPMENTS
export async function getRecentShipments() {
  const supabase = createClient()
  const profile = await getCurrentUserProfile()
  
  let query = supabase
    .from('shipments')
    .select('*, creator:staff_profiles!created_by(full_name, branch, role)')
    .order('created_at', { ascending: false })
    .limit(10)
    
  if (profile && profile.role !== 'admin') {
    query = query.eq('created_by', profile.id)
  }
  
  const { data, error } = await query
  if (error) throw error
  return data
}

export async function createShipment(shipmentData) {
  const supabase = createClient()
  const profile = await getCurrentUserProfile()
  
  const payload = {
    ...shipmentData,
    created_by: profile?.id
  }
  
  const { data, error } = await supabase
    .from('shipments')
    .insert([payload])
    .select()
    .single()
    
  if (error) throw error
  return data
}

export async function getShipmentById(trackingNumber) {
  const supabase = createClient()
  const profile = await getCurrentUserProfile()
  
  let query = supabase
    .from('shipments')
    .select('*, creator:staff_profiles!created_by(full_name, branch, role)')
    .eq('tracking_number', trackingNumber)
    
  if (profile && profile.role !== 'admin') {
    query = query.eq('created_by', profile.id)
  }

  const { data, error } = await query.single()
    
  if (error) throw error
  return data
}

export async function updateShipmentStatus(id, newStatus) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('shipments')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
    
  if (error) throw error
  return data
}

// SACKS
export async function getOpenSacks() {
  const supabase = createClient()
  const profile = await getCurrentUserProfile()
  
  let query = supabase
    .from('sacks')
    .select('*, creator:staff_profiles!created_by(full_name, branch, role)')
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    
  if (profile && profile.role !== 'admin') {
    query = query.eq('created_by', profile.id)
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function getClosedSacks() {
  const supabase = createClient()
  const profile = await getCurrentUserProfile()
  
  let query = supabase
    .from('sacks')
    .select('*, creator:staff_profiles!created_by(full_name, branch, role)')
    .in('status', ['sealed', 'shipped', 'arrived'])
    .order('created_at', { ascending: false })
    .limit(10)
    
  if (profile && profile.role !== 'admin') {
    query = query.eq('created_by', profile.id)
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function createSack(destination) {
  const supabase = createClient()
  const profile = await getCurrentUserProfile()
  
  const destCode = destination.substring(0, 1).toUpperCase()
  const randomNum = Math.floor(1000 + Math.random() * 9000)
  const sack_id = `SACK-${destCode}-${randomNum}`

  const { data, error } = await supabase
    .from('sacks')
    .insert([{ sack_id, destination, status: 'open', created_by: profile?.id }])
    .select()
    .single()
    
  if (error) throw error
  return data
}

export async function getSackByNumber(sackNumber) {
  const supabase = createClient()
  const profile = await getCurrentUserProfile()
  
  let query = supabase
    .from('sacks')
    .select('*, creator:staff_profiles!created_by(full_name, branch, role)')
    .eq('sack_id', sackNumber)
    
  if (profile && profile.role !== 'admin') {
    query = query.eq('created_by', profile.id)
  }

  const { data: sack, error: sackError } = await query.single()
    
  if (sackError) throw sackError

  // Fetch all shipments assigned to this sack
  const { data: shipments, error: shipError } = await supabase
    .from('shipments')
    .select('*, creator:staff_profiles!created_by(full_name, branch, role)')
    .eq('sack_id', sack.id) // Assuming sack_id in shipments refers to the sack's UUID or string ID. Wait, usually it refers to the UUID. Let's use sack.id. Wait, previously I assigned using sack_number string. Let's use sackNumber string if shipments.sack_id is string. No, shipments.sack_id is UUID according to schema! So we must use sack.id.
    .order('created_at', { ascending: false })
    
  if (shipError) throw shipError

  return { ...sack, shipments: shipments || [] }
}

export async function assignShipmentToSack(trackingNumber, sackNumber) {
  const supabase = createClient()
  
  // First verify the shipment exists
  const profile = await getCurrentUserProfile()
  let findQuery = supabase
    .from('shipments')
    .select('id, status')
    .eq('tracking_number', trackingNumber)
    
  if (profile && profile.role !== 'admin') {
    findQuery = findQuery.eq('created_by', profile.id)
  }
    
  const { data: shipment, error: findError } = await findQuery.single()
  if (findError) throw new Error('Shipment not found or access denied')

  // Get Sack UUID
  const { data: sack, error: sackError } = await supabase.from('sacks').select('id').eq('sack_id', sackNumber).single()
  if (sackError) throw new Error('Sack not found')

  const { data, error } = await supabase
    .from('shipments')
    .update({ sack_id: sack.id, status: 'packed', updated_at: new Date().toISOString() })
    .eq('id', shipment.id)
    .select()
    .single()
    
  if (error) throw error
  return data
}

export async function updateSackStatus(sackInternalId, newStatus) {
  const supabase = createClient()
  
  const { data: sack, error: sackError } = await supabase
    .from('sacks')
    .update({ status: newStatus })
    .eq('id', sackInternalId)
    .select()
    .single()
    
  if (sackError) throw sackError

  let shipmentStatus = newStatus
  if (newStatus === 'sealed') shipmentStatus = 'awaiting_shipment'

  const { error: cascadeError } = await supabase
    .from('shipments')
    .update({ status: shipmentStatus, updated_at: new Date().toISOString() })
    .eq('sack_id', sackInternalId)

  if (cascadeError) console.error("Failed to cascade status to shipments:", cascadeError)

  return sack
}

// SEARCH
export async function searchShipments(queryStr) {
  const supabase = createClient()
  const profile = await getCurrentUserProfile()
  
  let query = supabase
    .from('shipments')
    .select('*, creator:staff_profiles!created_by(full_name, branch, role)')
    .or(`tracking_number.ilike.%${queryStr}%,sender_name.ilike.%${queryStr}%,receiver_name.ilike.%${queryStr}%,sender_phone.ilike.%${queryStr}%,receiver_phone.ilike.%${queryStr}%`)
    .order('created_at', { ascending: false })
    .limit(20)
    
  if (profile && profile.role !== 'admin') {
    query = query.eq('created_by', profile.id)
  }

  const { data, error } = await query
    
  if (error) throw error
  return data
}

// STORAGE
export async function uploadParcelPhoto(file) {
  const supabase = createClient()
  
  // Generate a unique filename: timestamp-random.ext
  const ext = file.name.split('.').pop() || 'jpg'
  const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`
  
  const { data, error } = await supabase.storage
    .from('parcel_photos')
    .upload(filename, file, {
      cacheControl: '3600',
      upsert: false
    })
    
  if (error) throw error
  
  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('parcel_photos')
    .getPublicUrl(data.path)
    
  return publicUrl
}

// DASHBOARD STATS
export async function getDashboardStats() {
  const supabase = createClient()
  const profile = await getCurrentUserProfile()
  
  // Create base queries with correct exact matching for accurate counts
  let shipmentsQuery = supabase.from('shipments').select('*', { count: 'exact', head: true })
  let todayIntakeQuery = supabase.from('shipments').select('*', { count: 'exact', head: true }).gte('created_at', new Date().toISOString().split('T')[0])
  let transitQuery = supabase.from('shipments').select('*', { count: 'exact', head: true }).in('status', ['shipped', 'arrived'])
  let pendingQuery = supabase.from('shipments').select('*', { count: 'exact', head: true }).eq('status', 'ready_for_pickup')
  let activeSacksQuery = supabase.from('sacks').select('*', { count: 'exact', head: true }).eq('status', 'open')

  // Apply role filtering if not admin
  if (profile && profile.role !== 'admin') {
    shipmentsQuery = shipmentsQuery.eq('created_by', profile.id)
    todayIntakeQuery = todayIntakeQuery.eq('created_by', profile.id)
    transitQuery = transitQuery.eq('created_by', profile.id)
    pendingQuery = pendingQuery.eq('created_by', profile.id)
    activeSacksQuery = activeSacksQuery.eq('created_by', profile.id)
  }

  // Execute all count queries in parallel
  const [
    { count: totalIntake },
    { count: todayIntake },
    { count: inTransit },
    { count: pendingPickup },
    { count: activeSacks }
  ] = await Promise.all([
    shipmentsQuery,
    todayIntakeQuery,
    transitQuery,
    pendingQuery,
    activeSacksQuery
  ])

  return {
    todayIntake: todayIntake || 0,
    inTransit: inTransit || 0,
    pendingPickup: pendingPickup || 0,
    activeSacks: activeSacks || 0
  }
}
