import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Shipment, Batch, Destination, ShipmentStatus, User, WeightAlert, AdminAction } from '@/types';

interface DataContextType {
  shipments: Shipment[];
  batches: Batch[];
  staff: User[];
  weightAlerts: WeightAlert[];
  adminActions: AdminAction[];
  addShipment: (shipment: Shipment) => Promise<void>;
  updateShipment: (id: string, updates: Partial<Shipment>) => Promise<void>;
  updateShipmentStatus: (id: string, status: ShipmentStatus) => Promise<void>;
  confirmArrival: (id: string, data: Shipment['arrivalConfirmation']) => Promise<void>;
  confirmDelivery: (id: string, data: Shipment['deliveryConfirmation']) => Promise<void>;
  addBatch: (batch: Batch) => Promise<void>;
  updateBatch: (id: string, updates: Partial<Batch>) => Promise<void>;
  getShipmentsByStatus: (statuses: ShipmentStatus[]) => Shipment[];
  getShipmentsByDestination: (dest: Destination) => Shipment[];
  getShipmentByTracking: (tracking: string) => Shipment | undefined;
  getShipmentsByBatch: (batchId: string) => Shipment[];

  // Staff Management
  addStaff: (staff: Omit<User, 'id' | 'createdAt'>, password?: string) => Promise<void>;
  updateStaff: (id: string, updates: Partial<User>) => Promise<void>;

  // Admin Actions & Alerts
  logAdminAction: (action: Omit<AdminAction, 'id' | 'timestamp'>) => Promise<void>;
  resolveWeightAlert: (id: string, adminId: string) => Promise<void>;

  isLoading: boolean;
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [staff, setStaff] = useState<User[]>([]);
  const [weightAlerts, setWeightAlerts] = useState<WeightAlert[]>([]);
  const [adminActions, setAdminActions] = useState<AdminAction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initial Fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [
          { data: shipmentsData },
          { data: batchesData },
          { data: profilesData },
          { data: alertsData },
          { data: actionsData }
        ] = await Promise.all([
          supabase.from('shipments').select('*').order('created_at', { ascending: false }),
          supabase.from('batches').select('*').order('created_at', { ascending: false }),
          supabase.from('profiles').select('*').order('created_at', { ascending: false }),
          supabase.from('weight_alerts').select('*').order('created_at', { ascending: false }),
          supabase.from('admin_actions').select('*').order('timestamp', { ascending: false })
        ]);

        if (shipmentsData) {
          setShipments(shipmentsData.map((s: any) => ({
            id: s.id,
            trackingNumber: s.tracking_number,
            senderName: s.sender_name,
            senderPhone: s.sender_phone,
            receiverName: s.receiver_name,
            receiverPhone: s.receiver_phone,
            destination: s.destination,
            itemDescription: s.item_description,
            weight: s.weight,
            weightUnit: s.weight_unit,
            photoUrl: s.photo_url,
            priorityLabels: s.priority_labels || [],
            totalAmount: s.total_amount,
            paidAmount: s.paid_amount,
            balanceDue: s.balance_due,
            status: s.status,
            batchId: s.batch_id,
            createdBy: s.created_by,
            createdAt: s.created_at,
            updatedAt: s.updated_at,
            weightAlert: s.weight_alert,
            arrivalConfirmation: s.arrival_confirmation,
            deliveryConfirmation: s.delivery_confirmation,
          })));
        }

        if (batchesData) {
          setBatches(batchesData.map((b: any) => ({
            id: b.id,
            destination: b.destination,
            flightDate: b.flight_date,
            status: b.status,
            shipmentCount: b.shipment_count,
            totalWeight: b.total_weight || 0,
            totalRevenue: b.total_revenue || 0,
            createdAt: b.created_at,
            updatedAt: b.updated_at,
          })));
        }

        if (profilesData) {
          setStaff(profilesData.map((p: any) => ({
            id: p.id,
            username: p.username,
            name: p.name,
            role: p.role,
            branch: p.branch || 'all',
            isActive: p.is_active ?? true,
            phone: p.phone,
            createdAt: p.created_at,
          })));
        }

        if (alertsData) {
          setWeightAlerts(alertsData.map((a: any) => ({
            id: a.id,
            shipmentId: a.shipment_id,
            trackingNumber: a.tracking_number,
            initialWeight: a.initial_weight,
            finalWeight: a.final_weight,
            discrepancy: a.discrepancy,
            status: a.status,
            resolvedBy: a.resolved_by,
            resolvedAt: a.resolved_at,
            createdAt: a.created_at,
          })));
        }

        if (actionsData) {
          setAdminActions(actionsData.map((a: any) => ({
            id: a.id,
            adminId: a.admin_id,
            adminName: a.admin_name,
            shipmentId: a.shipment_id,
            actionType: a.action_type,
            oldValue: a.old_value,
            newValue: a.new_value,
            reason: a.reason,
            timestamp: a.timestamp,
          })));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Real-time Subscriptions
  useEffect(() => {
    const shipmentsSub = supabase.channel('shipments_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shipments' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const s = payload.new;
          setShipments(prev => [{
            id: s.id,
            trackingNumber: s.tracking_number,
            senderName: s.sender_name,
            senderPhone: s.sender_phone,
            receiverName: s.receiver_name,
            receiverPhone: s.receiver_phone,
            destination: s.destination,
            itemDescription: s.item_description,
            weight: s.weight,
            weightUnit: s.weight_unit,
            photoUrl: s.photo_url,
            priorityLabels: s.priority_labels || [],
            totalAmount: s.total_amount,
            paidAmount: s.paid_amount,
            balanceDue: s.balance_due,
            status: s.status,
            batchId: s.batch_id,
            createdBy: s.created_by,
            createdAt: s.created_at,
            updatedAt: s.updated_at,
            weightAlert: s.weight_alert,
            arrivalConfirmation: s.arrival_confirmation,
            deliveryConfirmation: s.delivery_confirmation,
          }, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          const s = payload.new;
          setShipments(prev => prev.map(item => item.id === s.id ? {
            ...item,
            id: s.id,
            trackingNumber: s.tracking_number,
            senderName: s.sender_name,
            senderPhone: s.sender_phone,
            receiverName: s.receiver_name,
            receiverPhone: s.receiver_phone,
            destination: s.destination,
            itemDescription: s.item_description,
            weight: s.weight,
            weightUnit: s.weight_unit,
            photoUrl: s.photo_url,
            priorityLabels: s.priority_labels || [],
            totalAmount: s.total_amount,
            paidAmount: s.paid_amount,
            balanceDue: s.balance_due,
            status: s.status,
            batchId: s.batch_id,
            updatedAt: s.updated_at,
            weightAlert: s.weight_alert,
            arrivalConfirmation: s.arrival_confirmation,
            deliveryConfirmation: s.delivery_confirmation,
          } : item));
        } else if (payload.eventType === 'DELETE') {
          setShipments(prev => prev.filter(item => item.id !== payload.old.id));
        }
      })
      .subscribe();

    const batchesSub = supabase.channel('batches_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'batches' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const b = payload.new;
          setBatches(prev => [{
            id: b.id,
            destination: b.destination,
            flightDate: b.flight_date,
            status: b.status,
            shipmentCount: b.shipment_count,
            totalWeight: b.total_weight || 0,
            totalRevenue: b.total_revenue || 0,
            createdAt: b.created_at,
            updatedAt: b.updated_at,
          }, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          const b = payload.new;
          setBatches(prev => prev.map(item => item.id === b.id ? {
            ...item,
            status: b.status,
            shipmentCount: b.shipment_count,
            totalWeight: b.total_weight || 0,
            totalRevenue: b.total_revenue || 0,
            updatedAt: b.updated_at,
          } : item));
        }
      })
      .subscribe();

    const alertsSub = supabase.channel('alerts_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'weight_alerts' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const a = payload.new;
          setWeightAlerts(prev => [{
            id: a.id,
            shipmentId: a.shipment_id,
            trackingNumber: a.tracking_number,
            initialWeight: a.initial_weight,
            finalWeight: a.final_weight,
            discrepancy: a.discrepancy,
            status: a.status,
            resolvedBy: a.resolved_by,
            resolvedAt: a.resolved_at,
            createdAt: a.created_at,
          }, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          const a = payload.new;
          setWeightAlerts(prev => prev.map(item => item.id === a.id ? {
            ...item,
            status: a.status,
            resolvedBy: a.resolved_by,
            resolvedAt: a.resolved_at,
          } : item));
        }
      })
      .subscribe();

    const profilesSub = supabase.channel('profiles_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const p = payload.new;
          setStaff(prev => [{
            id: p.id,
            username: p.username,
            name: p.name,
            role: p.role,
            branch: p.branch || 'all',
            isActive: p.is_active ?? true,
            phone: p.phone,
            createdAt: p.created_at,
          }, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          const p = payload.new;
          setStaff(prev => prev.map(item => item.id === p.id ? {
            ...item,
            name: p.name,
            role: p.role,
            branch: p.branch || 'all',
            isActive: p.is_active ?? true,
            phone: p.phone,
          } : item));
        }
      })
      .subscribe();

    return () => {
      shipmentsSub.unsubscribe();
      batchesSub.unsubscribe();
      alertsSub.unsubscribe();
      profilesSub.unsubscribe();
    };
  }, []);

  const addShipment = useCallback(async (shipment: Shipment) => {
    const { error } = await supabase.from('shipments').insert({
      id: shipment.id,
      tracking_number: shipment.trackingNumber,
      sender_name: shipment.senderName,
      sender_phone: shipment.senderPhone,
      receiver_name: shipment.receiverName,
      receiver_phone: shipment.receiverPhone,
      destination: shipment.destination,
      item_description: shipment.itemDescription,
      weight: shipment.weight,
      weight_unit: shipment.weightUnit,
      photo_url: shipment.photoUrl,
      priority_labels: shipment.priorityLabels,
      total_amount: shipment.totalAmount,
      paid_amount: shipment.paidAmount,
      balance_due: shipment.balanceDue,
      status: shipment.status,
      batch_id: shipment.batchId,
      created_by: shipment.createdBy,
    });
    if (error) throw error;
  }, []);

  const updateShipment = useCallback(async (id: string, updates: Partial<Shipment>) => {
    const updateData: any = {};
    if (updates.senderName) updateData.sender_name = updates.senderName;
    if (updates.senderPhone) updateData.sender_phone = updates.senderPhone;
    if (updates.receiverName) updateData.receiver_name = updates.receiverName;
    if (updates.receiverPhone) updateData.receiver_phone = updates.receiverPhone;
    if (updates.itemDescription) updateData.item_description = updates.itemDescription;
    if (updates.weight) updateData.weight = updates.weight;
    if (updates.photoUrl) updateData.photo_url = updates.photoUrl;
    if (updates.priorityLabels) updateData.priority_labels = updates.priorityLabels;
    if (updates.totalAmount) updateData.total_amount = updates.totalAmount;
    if (updates.paidAmount) updateData.paid_amount = updates.paidAmount;
    if (updates.balanceDue) updateData.balance_due = updates.balanceDue;
    if (updates.status) updateData.status = updates.status;
    if (updates.batchId !== undefined) updateData.batch_id = updates.batchId;
    if (updates.weightAlert !== undefined) updateData.weight_alert = updates.weightAlert;
    if (updates.arrivalConfirmation) updateData.arrival_confirmation = updates.arrivalConfirmation;
    if (updates.deliveryConfirmation) updateData.delivery_confirmation = updates.deliveryConfirmation;

    updateData.updated_at = new Date().toISOString();

    const { error } = await supabase.from('shipments').update(updateData).eq('id', id);
    if (error) throw error;
  }, []);

  const updateShipmentStatus = useCallback(async (id: string, status: ShipmentStatus) => {
    const { error } = await supabase.from('shipments').update({
      status,
      updated_at: new Date().toISOString(),
    }).eq('id', id);
    if (error) throw error;
  }, []);

  const confirmArrival = useCallback(async (id: string, data: Shipment['arrivalConfirmation']) => {
    if (!data) return;
    const shipment = shipments.find(s => s.id === id);
    if (!shipment) return;

    const discrepancy = Math.abs(shipment.weight - data.currentWeight);
    const percentDiff = (discrepancy / shipment.weight) * 100;
    const hasAlert = percentDiff > 5 || discrepancy > 2;

    const { error } = await supabase.from('shipments').update({
      status: 'arrived',
      arrival_confirmation: data,
      weight_alert: hasAlert,
      updated_at: new Date().toISOString(),
    }).eq('id', id);

    if (error) throw error;

    if (hasAlert) {
      await supabase.from('weight_alerts').insert({
        shipment_id: id,
        tracking_number: shipment.trackingNumber,
        initial_weight: shipment.weight,
        final_weight: data.currentWeight,
        discrepancy,
        status: 'pending'
      });
    }
  }, [shipments]);

  const confirmDelivery = useCallback(async (id: string, data: Shipment['deliveryConfirmation']) => {
    const { error } = await supabase.from('shipments').update({
      status: 'delivered',
      delivery_confirmation: data,
      updated_at: new Date().toISOString(),
    }).eq('id', id);
    if (error) throw error;
  }, []);

  const addBatch = useCallback(async (batch: Batch) => {
    const { error } = await supabase.from('batches').insert({
      id: batch.id,
      destination: batch.destination,
      flight_date: batch.flightDate,
      status: batch.status,
      shipment_count: batch.shipmentCount,
      total_weight: batch.totalWeight,
      total_revenue: batch.totalRevenue,
    });
    if (error) throw error;
  }, []);

  const updateBatch = useCallback(async (id: string, updates: Partial<Batch>) => {
    const updateData: any = {};
    if (updates.status) updateData.status = updates.status;
    if (updates.shipmentCount !== undefined) updateData.shipment_count = updates.shipmentCount;
    if (updates.totalWeight !== undefined) updateData.total_weight = updates.totalWeight;
    if (updates.totalRevenue !== undefined) updateData.total_revenue = updates.totalRevenue;

    updateData.updated_at = new Date().toISOString();
    const { error } = await supabase.from('batches').update(updateData).eq('id', id);
    if (error) throw error;
  }, []);

  const addStaff = useCallback(async (staffData: Omit<User, 'id' | 'createdAt'>, password = 'demo-password-123') => {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: staffData.username,
      password,
    });
    if (authError && authError.message !== 'User already registered') throw authError;

    // Use upsert to create/update profile
    const id = authData.user?.id || (await supabase.from('profiles').select('id').eq('username', staffData.username).single()).data?.id;

    if (id) {
      const { error: profileError } = await supabase.from('profiles').upsert({
        id,
        username: staffData.username,
        name: staffData.name,
        role: staffData.role,
        branch: staffData.branch,
        is_active: staffData.isActive,
        phone: staffData.phone,
      });
      if (profileError) throw profileError;
    }
  }, []);

  const updateStaff = useCallback(async (id: string, updates: Partial<User>) => {
    const updateData: any = {};
    if (updates.name) updateData.name = updates.name;
    if (updates.role) updateData.role = updates.role;
    if (updates.branch) updateData.branch = updates.branch;
    if (updates.isActive !== undefined) updateData.is_active = updates.isActive;
    if (updates.phone) updateData.phone = updates.phone;

    const { error } = await supabase.from('profiles').update(updateData).eq('id', id);
    if (error) throw error;
  }, []);

  const logAdminAction = useCallback(async (action: Omit<AdminAction, 'id' | 'timestamp'>) => {
    const { error } = await supabase.from('admin_actions').insert({
      admin_id: action.adminId,
      admin_name: action.adminName,
      shipment_id: action.shipmentId,
      action_type: action.actionType,
      old_value: action.oldValue,
      new_value: action.newValue,
      reason: action.reason,
    });
    if (error) throw error;
  }, []);

  const resolveWeightAlert = useCallback(async (id: string, adminId: string) => {
    const { error } = await supabase.from('weight_alerts').update({
      status: 'resolved',
      resolved_by: adminId,
      resolved_at: new Date().toISOString(),
    }).eq('id', id);
    if (error) throw error;
  }, []);

  const getShipmentsByStatus = useCallback((statuses: ShipmentStatus[]) => shipments.filter(s => statuses.includes(s.status)), [shipments]);
  const getShipmentsByDestination = useCallback((dest: Destination) => shipments.filter(s => s.destination === dest), [shipments]);
  const getShipmentByTracking = useCallback((tracking: string) => shipments.find(s => s.trackingNumber.toLowerCase() === tracking.toLowerCase()), [shipments]);
  const getShipmentsByBatch = useCallback((batchId: string) => shipments.filter(s => s.batchId === batchId), [shipments]);

  return (
    <DataContext.Provider
      value={{
        shipments,
        batches,
        staff,
        weightAlerts,
        adminActions,
        addShipment,
        updateShipment,
        updateShipmentStatus,
        confirmArrival,
        confirmDelivery,
        addBatch,
        updateBatch,
        getShipmentsByStatus,
        getShipmentsByDestination,
        getShipmentByTracking,
        getShipmentsByBatch,
        addStaff,
        updateStaff,
        logAdminAction,
        resolveWeightAlert,
        isLoading,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
}
