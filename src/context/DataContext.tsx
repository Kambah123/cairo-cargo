import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Shipment, Batch, User, WeightAlert, AdminAction, ShipmentStatus, Destination, Sack } from '@/types';
import { toast } from 'sonner';

interface DataContextType {
  shipments: Shipment[];
  batches: Batch[];
  sacks: Sack[];
  staff: User[];
  weightAlerts: WeightAlert[];
  adminActions: AdminAction[];
  isLoading: boolean;
  isOnline: boolean;
  addShipment: (shipment: Shipment) => Promise<void>;
  updateShipment: (id: string, updates: Partial<Shipment>) => Promise<void>;
  updateShipmentStatus: (id: string, status: ShipmentStatus) => Promise<void>;
  confirmArrival: (id: string, data: Shipment['arrivalConfirmation']) => Promise<void>;
  confirmDelivery: (id: string, data: Shipment['deliveryConfirmation']) => Promise<void>;
  addBatch: (batch: Batch) => Promise<void>;
  updateBatch: (id: string, updates: Partial<Batch>) => Promise<void>;
  addSack: (sack: Sack) => Promise<void>;
  updateSack: (id: string, updates: Partial<Sack>) => Promise<void>;
  deleteShipment: (id: string) => Promise<void>;
  getShipmentsByStatus: (statuses: ShipmentStatus[]) => Shipment[];
  getShipmentsByDestination: (destination: Destination) => Shipment[];
  getShipmentByTracking: (tracking: string) => Shipment | undefined;
  getShipmentsByBatch: (batchId: string) => Shipment[];
  getShipmentsBySack: (sackId: string) => Shipment[];
  addStaff: (user: any, password?: string) => Promise<void>;
  updateStaff: (id: string, updates: Partial<User>) => Promise<void>;
  logAdminAction: (action: any) => Promise<void>;
  resolveWeightAlert: (id: string, adminId: string, status: 'resolved' | 'ignored', reason?: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [sacks, setSacks] = useState<Sack[]>([]);
  const [staff, setStaff] = useState<User[]>([]);
  const [weightAlerts, setWeightAlerts] = useState<WeightAlert[]>([]);
  const [adminActions, setAdminActions] = useState<AdminAction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const mapShipment = (s: any): Shipment => ({
    id: s.id,
    trackingNumber: s.tracking_number,
    senderName: s.sender_name,
    senderPhone: s.sender_phone,
    receiverName: s.receiver_name,
    receiverPhone: s.receiver_phone,
    destination: s.destination,
    itemDescription: s.item_description,
    weight: Number(s.weight),
    weightUnit: s.weight_unit,
    photoUrl: s.photo_url,
    priorityLabels: s.priority_labels || [],
    totalAmount: Number(s.total_amount),
    paidAmount: Number(s.paid_amount),
    balanceDue: Number(s.balance_due),
    status: s.status,
    batchId: s.batch_id,
    sackId: s.sack_id,
    createdBy: s.created_by,
    createdAt: s.created_at,
    updatedAt: s.updated_at,
    weightAlert: s.weight_alert,
    flightNumber: s.flight_number,
    awbNumber: s.awb_number,
    pickupPhotoUrl: s.pickup_photo_url,
    arrivalConfirmation: s.arrival_confirmation,
    deliveryConfirmation: s.delivery_confirmation,
    refusalReason: s.refusal_reason
  });

  const mapBatch = (b: any): Batch => ({
    id: b.id,
    destination: b.destination,
    flightDate: b.flight_date,
    status: b.status,
    shipmentCount: b.shipment_count,
    totalWeight: Number(b.total_weight),
    totalRevenue: Number(b.total_revenue),
    flightNumber: b.flight_number,
    awbNumber: b.awb_number,
    createdAt: b.created_at,
    updatedAt: b.updated_at
  });

  const mapSack = (s: any): Sack => ({
    id: s.id,
    destination: s.destination,
    status: s.status,
    parcelCount: s.parcel_count,
    totalWeight: Number(s.total_weight),
    createdAt: s.created_at,
    updatedAt: s.updated_at,
    createdBy: s.created_by
  });

  const mapProfile = (p: any): User => ({
    id: p.id,
    username: p.username,
    name: p.name,
    phone: p.phone,
    role: p.role,
    branch: p.branch,
    isActive: p.is_active,
    createdAt: p.created_at,
    lastLoginAt: p.last_login_at,
    lastLoginIp: p.last_login_ip,
    passwordChangedAt: p.password_changed_at
  });

  const fetchData = async () => {
    try {
      const [
        { data: shipData },
        { data: batchData },
        { data: sackData },
        { data: profData },
        { data: alData },
        { data: actData }
      ] = await Promise.all([
        supabase.from('shipments').select('*').order('created_at', { ascending: false }),
        supabase.from('batches').select('*').order('created_at', { ascending: false }),
        supabase.from('sacks').select('*').order('created_at', { ascending: false }),
        supabase.from('profiles').select('*'),
        supabase.from('weight_alerts').select('*').order('created_at', { ascending: false }),
        supabase.from('admin_actions').select('*').order('timestamp', { ascending: false })
      ]);

      if (shipData) setShipments(shipData.map(mapShipment));
      if (batchData) setBatches(batchData.map(mapBatch));
      if (sackData) setSacks(sackData.map(mapSack));
      if (profData) setStaff(profData.map(mapProfile));
      if (alData) setWeightAlerts(alData.map((a: any) => ({
        id: a.id, shipmentId: a.shipment_id, trackingNumber: a.tracking_number,
        initialWeight: Number(a.initial_weight), finalWeight: Number(a.final_weight), discrepancy: Number(a.discrepancy),
        status: a.status, resolvedBy: a.resolved_by, resolvedAt: a.resolved_at, createdAt: a.created_at,
        reason: a.reason
      })));
      if (actData) setAdminActions(actData.map((a: any) => ({
        id: a.id, adminId: a.admin_id, adminName: a.admin_name, shipmentId: a.shipment_id,
        batchId: a.batch_id, actionType: a.action_type, oldValue: a.old_value,
        newValue: a.new_value, reason: a.reason, timestamp: a.timestamp
      })));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const syncOfflineQueue = useCallback(async () => {
    const queue = JSON.parse(localStorage.getItem('offline_queue') || '[]');
    if (queue.length === 0) return;

    toast.info(`Syncing ${queue.length} offline actions...`);
    for (const action of queue) {
      try {
        if (action.type === 'shipment_update') {
          await supabase.from('shipments').update(action.data).eq('id', action.id);
        } else if (action.type === 'shipment_insert') {
          await supabase.from('shipments').insert(action.data);
        } else if (action.type === 'sack_insert') {
          await supabase.from('sacks').insert(action.data);
        }
      } catch (e) {
        console.error('Sync failed for action:', action, e);
      }
    }
    localStorage.removeItem('offline_queue');
    fetchData();
    toast.success('Offline data synchronized');
  }, []);

  const queueAction = (type: string, id: string, data: any) => {
    const queue = JSON.parse(localStorage.getItem('offline_queue') || '[]');
    queue.push({ type, id, data, timestamp: new Date().toISOString() });
    localStorage.setItem('offline_queue', JSON.stringify(queue));
    toast.warning('Working offline: Action queued');
  };

  useEffect(() => {
    fetchData();

    const handleOnline = () => { setIsOnline(true); syncOfflineQueue(); };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const shipSub = supabase.channel('shipments_all').on('postgres_changes', { event: '*', schema: 'public', table: 'shipments' }, fetchData).subscribe();
    const batchSub = supabase.channel('batches_all').on('postgres_changes', { event: '*', schema: 'public', table: 'batches' }, fetchData).subscribe();
    const sackSub = supabase.channel('sacks_all').on('postgres_changes', { event: '*', schema: 'public', table: 'sacks' }, fetchData).subscribe();
    const profSub = supabase.channel('profiles_all').on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, fetchData).subscribe();
    const alertSub = supabase.channel('alerts_all').on('postgres_changes', { event: '*', schema: 'public', table: 'weight_alerts' }, fetchData).subscribe();
    const actionSub = supabase.channel('actions_all').on('postgres_changes', { event: '*', schema: 'public', table: 'admin_actions' }, fetchData).subscribe();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      shipSub.unsubscribe();
      batchSub.unsubscribe();
      sackSub.unsubscribe();
      profSub.unsubscribe();
      alertSub.unsubscribe();
      actionSub.unsubscribe();
    };
  }, [syncOfflineQueue]);

  const addShipment = useCallback(async (s: Shipment) => {
    const data = {
      id: s.id, tracking_number: s.trackingNumber, sender_name: s.senderName,
      sender_phone: s.senderPhone, receiver_name: s.receiverName,
      receiver_phone: s.receiverPhone, destination: s.destination,
      item_description: s.itemDescription, weight: s.weight,
      weight_unit: s.weightUnit, photo_url: s.photoUrl,
      priority_labels: s.priorityLabels, total_amount: s.totalAmount,
      paid_amount: s.paidAmount, balance_due: s.balanceDue, status: s.status,
      created_by: s.createdBy
    };

    if (!navigator.onLine) {
      queueAction('shipment_insert', s.id, data);
      return;
    }

    const { error } = await supabase.from('shipments').insert(data);
    if (error) throw error;
  }, []);

  const updateShipment = useCallback(async (id: string, updates: Partial<Shipment>) => {
    const { data: { user } } = await supabase.auth.getUser();
    const oldShipment = shipments.find(s => s.id === id);
    const dbUpdates: any = { updated_at: new Date().toISOString() };

    if (updates.status) dbUpdates.status = updates.status;
    if (updates.paidAmount !== undefined) dbUpdates.paid_amount = updates.paidAmount;
    if (updates.totalAmount !== undefined) dbUpdates.total_amount = updates.totalAmount;
    if (updates.balanceDue !== undefined) dbUpdates.balance_due = updates.balanceDue;
    if (updates.senderName) dbUpdates.sender_name = updates.senderName;
    if (updates.senderPhone) dbUpdates.sender_phone = updates.senderPhone;
    if (updates.receiverName) dbUpdates.receiver_name = updates.receiverName;
    if (updates.receiverPhone) dbUpdates.receiver_phone = updates.receiverPhone;
    if (updates.itemDescription) dbUpdates.item_description = updates.itemDescription;
    if (updates.weight) dbUpdates.weight = updates.weight;
    if (updates.batchId !== undefined) dbUpdates.batch_id = updates.batchId;
    if (updates.sackId !== undefined) dbUpdates.sack_id = updates.sackId;
    if (updates.flightNumber) dbUpdates.flight_number = updates.flightNumber;
    if (updates.awbNumber) dbUpdates.awb_number = updates.awbNumber;
    if (updates.photoUrl) dbUpdates.photo_url = updates.photoUrl;
    if (updates.pickupPhotoUrl) dbUpdates.pickup_photo_url = updates.pickupPhotoUrl;

    if (!navigator.onLine) {
      queueAction('shipment_update', id, dbUpdates);
      return;
    }

    const { error } = await supabase.from('shipments').update(dbUpdates).eq('id', id);
    if (error) throw error;

    // Trigger sack stats update if sackId changed
    if (updates.sackId !== undefined || (updates.weight && oldShipment?.sackId)) {
        const targetSackId = updates.sackId || oldShipment?.sackId;
        if (targetSackId) {
            const sackParcels = shipments.filter(p => p.id === id ? (updates.sackId === targetSackId) : p.sackId === targetSackId);
            const count = sackParcels.length;
            const weight = sackParcels.reduce((sum, p) => sum + (p.id === id ? (updates.weight || p.weight) : p.weight), 0);
            await supabase.from('sacks').update({ parcel_count: count, total_weight: weight }).eq('id', targetSackId);
        }
    }

    await supabase.from('admin_actions').insert({
        admin_id: user?.id,
        admin_name: staff.find(p => p.id === user?.id)?.name || 'Staff',
        shipment_id: id,
        action_type: 'edit_shipment',
        old_value: JSON.stringify(oldShipment),
        new_value: JSON.stringify(updates),
        reason: 'Standard update'
    });
  }, [shipments, staff]);

  const updateShipmentStatus = useCallback(async (id: string, status: ShipmentStatus) => {
    const { data: { user } } = await supabase.auth.getUser();
    const oldStatus = shipments.find(s => s.id === id)?.status;
    await supabase.from('shipments').update({ status, updated_at: new Date().toISOString() }).eq('id', id);

    await supabase.from('admin_actions').insert({
        admin_id: user?.id,
        admin_name: staff.find(p => p.id === user?.id)?.name || 'Staff',
        shipment_id: id,
        action_type: 'status_change',
        old_value: oldStatus,
        new_value: status,
        reason: 'Workflow progression'
    });
  }, [shipments, staff]);

  const deleteShipment = useCallback(async (id: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('shipments').delete().eq('id', id);
    if (error) throw error;

    await supabase.from('admin_actions').insert({
        admin_id: user?.id,
        admin_name: staff.find(p => p.id === user?.id)?.name || 'Staff',
        shipment_id: id,
        action_type: 'delete_shipment',
        reason: 'Administrative deletion'
    });
  }, [staff]);

  const confirmArrival = useCallback(async (id: string, data: Shipment['arrivalConfirmation']) => {
    if (!data) return;
    const s = shipments.find(x => x.id === id);
    if (!s) return;
    const diff = Math.abs(s.weight - data.currentWeight);
    const hasAlert = (diff / s.weight) > 0.05 || diff > 2;
    await supabase.from('shipments').update({ status: 'arrived', arrival_confirmation: data, weight_alert: hasAlert }).eq('id', id);
    if (hasAlert) {
      await supabase.from('weight_alerts').insert({
        shipment_id: id, tracking_number: s.trackingNumber, initial_weight: s.weight,
        final_weight: data.currentWeight, discrepancy: diff, status: 'pending'
      });
    }

    await supabase.from('admin_actions').insert({
        admin_id: data.confirmedBy,
        admin_name: staff.find(p => p.id === data.confirmedBy)?.name || 'Nigeria Staff',
        shipment_id: id,
        action_type: 'confirm_arrival',
        new_value: JSON.stringify(data),
        reason: hasAlert ? 'Weight discrepancy detected' : 'Standard arrival'
    });
  }, [shipments, staff]);

  const confirmDelivery = useCallback(async (id: string, data: Shipment['deliveryConfirmation']) => {
    const shipment = shipments.find(s => s.id === id);
    await supabase.from('shipments').update({
      status: 'delivered',
      delivery_confirmation: data,
      paid_amount: shipment?.totalAmount,
      balance_due: 0
    }).eq('id', id);

    await supabase.from('admin_actions').insert({
        admin_id: data?.confirmedBy,
        admin_name: staff.find(p => p.id === data?.confirmedBy)?.name || 'Nigeria Staff',
        shipment_id: id,
        action_type: 'confirm_delivery',
        new_value: JSON.stringify(data),
        reason: 'Handover complete'
    });
  }, [shipments, staff]);

  const addBatch = useCallback(async (b: Batch) => {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('batches').insert({
      id: b.id, destination: b.destination, flight_date: b.flightDate, status: b.status,
      shipment_count: b.shipmentCount, total_weight: b.totalWeight, total_revenue: b.totalRevenue
    });

    await supabase.from('admin_actions').insert({
        admin_id: user?.id,
        admin_name: staff.find(p => p.id === user?.id)?.name || 'Staff',
        batch_id: b.id,
        action_type: 'create_batch',
        reason: 'New flight preparation'
    });
  }, [staff]);

  const updateBatch = useCallback(async (id: string, updates: Partial<Batch>) => {
    const { data: { user } } = await supabase.auth.getUser();
    const dbUpdates: any = {};
    if (updates.status) dbUpdates.status = updates.status;
    if (updates.shipmentCount !== undefined) dbUpdates.shipment_count = updates.shipmentCount;
    if (updates.totalWeight !== undefined) dbUpdates.total_weight = updates.totalWeight;
    if (updates.totalRevenue !== undefined) dbUpdates.total_revenue = updates.totalRevenue;
    if (updates.flightNumber) dbUpdates.flight_number = updates.flightNumber;
    if (updates.awbNumber) dbUpdates.awb_number = updates.awbNumber;

    await supabase.from('batches').update(dbUpdates).eq('id', id);

    if (updates.status === 'ready_for_flight' || updates.status === 'shipped') {
        await supabase.from('shipments').update({ status: updates.status }).eq('batch_id', id);
    }

    await supabase.from('admin_actions').insert({
        admin_id: user?.id,
        admin_name: staff.find(p => p.id === user?.id)?.name || 'Staff',
        batch_id: id,
        action_type: 'edit_batch',
        new_value: JSON.stringify(updates),
        reason: 'Batch modification'
    });
  }, [staff]);

  const addSack = useCallback(async (s: Sack) => {
    const data = {
      id: s.id, destination: s.destination, status: s.status,
      parcel_count: s.parcelCount, total_weight: s.totalWeight,
      created_by: s.createdBy
    };

    if (!navigator.onLine) {
      queueAction('sack_insert', s.id, data);
      return;
    }

    const { error } = await supabase.from('sacks').insert(data);
    if (error) throw error;
  }, []);

  const updateSack = useCallback(async (id: string, updates: Partial<Sack>) => {
    const dbUpdates: any = { updated_at: new Date().toISOString() };
    if (updates.status) dbUpdates.status = updates.status;
    if (updates.parcelCount !== undefined) dbUpdates.parcel_count = updates.parcelCount;
    if (updates.totalWeight !== undefined) dbUpdates.total_weight = updates.totalWeight;

    const { error } = await supabase.from('sacks').update(dbUpdates).eq('id', id);
    if (error) throw error;
  }, []);

  const addStaff = useCallback(async (data: any, pass = 'Demo123!') => {
    const { data: auth, error: authError } = await supabase.auth.signUp({ email: data.username, password: pass });
    if (authError) throw authError;
    if (auth.user) {
      await supabase.from('profiles').upsert({
        id: auth.user.id, username: data.username, name: data.name, role: data.role,
        branch: data.branch, is_active: data.isActive, phone: data.phone
      });

      const { data: admin } = await supabase.auth.getUser();
      await supabase.from('admin_actions').insert({
          admin_id: admin.user?.id,
          admin_name: staff.find(p => p.id === admin.user?.id)?.name || 'Admin',
          action_type: 'create_staff',
          new_value: data.username,
          reason: 'Access granting'
      });
    }
  }, [staff]);

  const updateStaff = useCallback(async (id: string, updates: Partial<User>) => {
    const dbUpdates: any = {};
    if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;
    if (updates.name) dbUpdates.name = updates.name;
    if (updates.phone) dbUpdates.phone = updates.phone;
    if (updates.role) dbUpdates.role = updates.role;
    if (updates.branch) dbUpdates.branch = updates.branch;

    await supabase.from('profiles').update(dbUpdates).eq('id', id);

    const { data: admin } = await supabase.auth.getUser();
    await supabase.from('admin_actions').insert({
        admin_id: admin.user?.id,
        admin_name: staff.find(p => p.id === admin.user?.id)?.name || 'Admin',
        action_type: 'update_staff',
        new_value: JSON.stringify(updates),
        reason: 'Access management'
    });
  }, [staff]);

  const logAdminAction = useCallback(async (a: any) => {
    await supabase.from('admin_actions').insert({
      admin_id: a.adminId, admin_name: a.adminName, shipment_id: a.shipmentId,
      batch_id: a.batchId, action_type: a.actionType, old_value: a.old_value,
      new_value: a.new_value, reason: a.reason
    });
  }, []);

  const resolveWeightAlert = useCallback(async (id: string, adminId: string, status: 'resolved' | 'ignored', reason?: string) => {
    await supabase.from('weight_alerts').update({
      status, resolved_by: adminId, resolved_at: new Date().toISOString(), reason
    }).eq('id', id);

    const alert = weightAlerts.find(a => a.id === id);
    if (status === 'resolved' && alert) {
        await supabase.from('shipments').update({ weight_alert: false }).eq('id', alert.shipmentId);
    }

    await supabase.from('admin_actions').insert({
        admin_id: adminId,
        admin_name: staff.find(p => p.id === adminId)?.name || 'Admin',
        shipment_id: alert?.shipmentId,
        action_type: 'resolve_alert',
        new_value: status,
        reason: reason || 'Alert resolution'
    });
  }, [weightAlerts, staff]);

  const getShipmentsByStatus = (st: ShipmentStatus[]) => shipments.filter(s => st.includes(s.status));
  const getShipmentsByDestination = (d: Destination) => shipments.filter(s => s.destination === d);
  const getShipmentByTracking = (t: string) => shipments.find(s => s.trackingNumber.toLowerCase() === t.toLowerCase());
  const getShipmentsByBatch = (id: string) => shipments.filter(s => s.batchId === id);
  const getShipmentsBySack = (id: string) => shipments.filter(s => s.sackId === id);

  return (
    <DataContext.Provider value={{
      shipments, batches, sacks, staff, weightAlerts, adminActions, addShipment, updateShipment,
      updateShipmentStatus, confirmArrival, confirmDelivery, addBatch, updateBatch, addSack, updateSack,
      deleteShipment, getShipmentsByStatus, getShipmentsByDestination, getShipmentByTracking,
      getShipmentsByBatch, getShipmentsBySack, addStaff, updateStaff, logAdminAction, resolveWeightAlert, isLoading, isOnline
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData error');
  return context;
}
