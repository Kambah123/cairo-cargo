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
  addStaff: (staff: Omit<User, 'id' | 'createdAt'>, password?: string) => Promise<void>;
  updateStaff: (id: string, updates: Partial<User>) => Promise<void>;
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Execute queries individually so one missing table doesn't break the app
        const { data: shipData } = await supabase.from('shipments').select('*').order('created_at', { ascending: false });
        if (shipData) setShipments(shipData.map((s: any) => ({
          id: s.id, trackingNumber: s.tracking_number, senderName: s.sender_name, senderPhone: s.sender_phone,
          receiverName: s.receiver_name, receiverPhone: s.receiver_phone, destination: s.destination,
          itemDescription: s.item_description, weight: s.weight, weightUnit: s.weight_unit,
          photoUrl: s.photo_url, priorityLabels: s.priority_labels || [], totalAmount: s.total_amount,
          paidAmount: s.paid_amount, balanceDue: s.balance_due, status: s.status, batchId: s.batch_id,
          createdBy: s.created_by, createdAt: s.created_at, updatedAt: s.updated_at,
          weightAlert: s.weight_alert, arrivalConfirmation: s.arrival_confirmation, deliveryConfirmation: s.delivery_confirmation,
        })));

        const { data: batchData } = await supabase.from('batches').select('*').order('created_at', { ascending: false });
        if (batchData) setBatches(batchData.map((b: any) => ({
          id: b.id, destination: b.destination, flightDate: b.flight_date, status: b.status,
          shipmentCount: b.shipment_count, totalWeight: b.total_weight || 0, totalRevenue: b.total_revenue || 0,
          createdAt: b.created_at, updatedAt: b.updated_at,
        })));

        const { data: profData } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
        if (profData) setStaff(profData.map((p: any) => ({
          id: p.id, username: p.username, name: p.name, role: p.role, branch: p.branch || 'all',
          isActive: p.is_active ?? true, phone: p.phone, createdAt: p.created_at,
        })));

        const { data: alData } = await supabase.from('weight_alerts').select('*');
        if (alData) setWeightAlerts(alData.map((a: any) => ({
          id: a.id, shipmentId: a.shipment_id, trackingNumber: a.tracking_number,
          initialWeight: a.initial_weight, finalWeight: a.final_weight, discrepancy: a.discrepancy,
          status: a.status, resolvedBy: a.resolved_by, resolvedAt: a.resolved_at, createdAt: a.created_at,
        })));

        const { data: actData } = await supabase.from('admin_actions').select('*');
        if (actData) setAdminActions(actData.map((a: any) => ({
          id: a.id, adminId: a.admin_id, adminName: a.admin_name, shipmentId: a.shipment_id,
          actionType: a.action_type, oldValue: a.old_value, newValue: a.new_value, reason: a.reason, timestamp: a.timestamp,
        })));

      } catch (error) {
        console.error('Data Fetch Error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Standard CRUD operations (kept from previous implementation)
  const addShipment = useCallback(async (s: Shipment) => {
    const { error } = await supabase.from('shipments').insert({ id: s.id, tracking_number: s.trackingNumber, sender_name: s.senderName, sender_phone: s.senderPhone, receiver_name: s.receiverName, receiver_phone: s.receiverPhone, destination: s.destination, item_description: s.itemDescription, weight: s.weight, weight_unit: s.weightUnit, photo_url: s.photoUrl, priority_labels: s.priorityLabels, total_amount: s.totalAmount, paid_amount: s.paidAmount, balance_due: s.balanceDue, status: s.status, batch_id: s.batchId, created_by: s.createdBy });
    if (error) throw error;
  }, []);

  const updateShipment = useCallback(async (id: string, updates: Partial<Shipment>) => {
    const data: any = {};
    if (updates.status) data.status = updates.status;
    if (updates.paidAmount !== undefined) { data.paid_amount = updates.paidAmount; data.balance_due = updates.balanceDue; }
    const { error } = await supabase.from('shipments').update(data).eq('id', id);
    if (error) throw error;
  }, []);

  const updateShipmentStatus = useCallback(async (id: string, status: ShipmentStatus) => {
    await supabase.from('shipments').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
  }, []);

  const confirmArrival = useCallback(async (id: string, data: Shipment['arrivalConfirmation']) => {
    if (!data) return;
    const s = shipments.find(x => x.id === id);
    if (!s) return;
    const diff = Math.abs(s.weight - data.currentWeight);
    const hasAlert = (diff / s.weight) > 0.05 || diff > 2;
    await supabase.from('shipments').update({ status: 'arrived', arrival_confirmation: data, weight_alert: hasAlert }).eq('id', id);
    if (hasAlert) await supabase.from('weight_alerts').insert({ shipment_id: id, tracking_number: s.trackingNumber, initial_weight: s.weight, final_weight: data.currentWeight, discrepancy: diff, status: 'pending' });
  }, [shipments]);

  const confirmDelivery = useCallback(async (id: string, data: Shipment['deliveryConfirmation']) => {
    await supabase.from('shipments').update({ status: 'delivered', delivery_confirmation: data }).eq('id', id);
  }, []);

  const addBatch = useCallback(async (b: Batch) => {
    await supabase.from('batches').insert({ id: b.id, destination: b.destination, flight_date: b.flightDate, status: b.status, shipment_count: b.shipmentCount, total_weight: b.totalWeight, total_revenue: b.totalRevenue });
  }, []);

  const updateBatch = useCallback(async (id: string, updates: Partial<Batch>) => {
    const data: any = {};
    if (updates.status) data.status = updates.status;
    if (updates.shipmentCount !== undefined) data.shipment_count = updates.shipmentCount;
    await supabase.from('batches').update(data).eq('id', id);
  }, []);

  const addStaff = useCallback(async (data: any, pass = 'demo-password-123') => {
    const { data: auth } = await supabase.auth.signUp({ email: data.username, password: pass });
    if (auth.user) await supabase.from('profiles').upsert({ id: auth.user.id, username: data.username, name: data.name, role: data.role, branch: data.branch, is_active: data.isActive });
  }, []);

  const updateStaff = useCallback(async (id: string, updates: Partial<User>) => {
    const data: any = {};
    if (updates.isActive !== undefined) data.is_active = updates.isActive;
    await supabase.from('profiles').update(data).eq('id', id);
  }, []);

  const logAdminAction = useCallback(async (a: any) => {
    await supabase.from('admin_actions').insert({ admin_id: a.adminId, admin_name: a.adminName, shipment_id: a.shipmentId, action_type: a.actionType, old_value: a.oldValue, new_value: a.newValue, reason: a.reason });
  }, []);

  const resolveWeightAlert = useCallback(async (id: string, adminId: string) => {
    await supabase.from('weight_alerts').update({ status: 'resolved', resolved_by: adminId, resolved_at: new Date().toISOString() }).eq('id', id);
  }, []);

  const getShipmentsByStatus = (st: ShipmentStatus[]) => shipments.filter(s => st.includes(s.status));
  const getShipmentsByDestination = (d: Destination) => shipments.filter(s => s.destination === d);
  const getShipmentByTracking = (t: string) => shipments.find(s => s.trackingNumber.toLowerCase() === t.toLowerCase());
  const getShipmentsByBatch = (id: string) => shipments.filter(s => s.batchId === id);

  return (
    <DataContext.Provider value={{ shipments, batches, staff, weightAlerts, adminActions, addShipment, updateShipment, updateShipmentStatus, confirmArrival, confirmDelivery, addBatch, updateBatch, getShipmentsByStatus, getShipmentsByDestination, getShipmentByTracking, getShipmentsByBatch, addStaff, updateStaff, logAdminAction, resolveWeightAlert, isLoading }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData error');
  return context;
}
