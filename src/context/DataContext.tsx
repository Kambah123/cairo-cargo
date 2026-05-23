import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Shipment, Batch, Destination, ShipmentStatus } from '@/types';

interface DataContextType {
  shipments: Shipment[];
  batches: Batch[];
  addShipment: (shipment: Shipment) => Promise<void>;
  updateShipment: (id: string, updates: Partial<Shipment>) => Promise<void>;
  updateShipmentStatus: (id: string, status: ShipmentStatus) => Promise<void>;
  confirmArrival: (id: string, data: Shipment['arrivalConfirmation']) => Promise<void>;
  confirmDelivery: (id: string, data: Shipment['deliveryConfirmation']) => Promise<void>;
  addBatch: (batch: Batch) => Promise<void>;
  getShipmentsByStatus: (statuses: ShipmentStatus[]) => Shipment[];
  getShipmentsByDestination: (dest: Destination) => Shipment[];
  getShipmentByTracking: (tracking: string) => Shipment | undefined;
  getShipmentsByBatch: (batchId: string) => Shipment[];
  isLoading: boolean;
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch initial data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch batches
        const { data: batchesData, error: batchesError } = await supabase
          .from('batches')
          .select('*');

        if (batchesError) throw batchesError;

        // Fetch shipments
        const { data: shipmentsData, error: shipmentsError } = await supabase
          .from('shipments')
          .select('*');

        if (shipmentsError) throw shipmentsError;

        // Transform data to match types
        const transformedBatches: Batch[] = (batchesData || []).map((b: any) => ({
          id: b.id,
          destination: b.destination,
          flightDate: b.flight_date,
          status: b.status,
          shipmentCount: b.shipment_count,
          createdAt: b.created_at,
        }));

        const transformedShipments: Shipment[] = (shipmentsData || []).map((s: any) => ({
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
          arrivalConfirmation: s.arrival_confirmation,
          deliveryConfirmation: s.delivery_confirmation,
        }));

        setBatches(transformedBatches);
        setShipments(transformedShipments);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Subscribe to real-time updates
    const batchesSubscription = supabase
      .channel('batches')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'batches' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newBatch: Batch = {
              id: payload.new.id,
              destination: payload.new.destination,
              flightDate: payload.new.flight_date,
              status: payload.new.status,
              shipmentCount: payload.new.shipment_count,
              createdAt: payload.new.created_at,
            };
            setBatches((prev) => [...prev, newBatch]);
          } else if (payload.eventType === 'UPDATE') {
            setBatches((prev) =>
              prev.map((b) =>
                b.id === payload.new.id
                  ? {
                      id: payload.new.id,
                      destination: payload.new.destination,
                      flightDate: payload.new.flight_date,
                      status: payload.new.status,
                      shipmentCount: payload.new.shipment_count,
                      createdAt: payload.new.created_at,
                    }
                  : b
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setBatches((prev) => prev.filter((b) => b.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    const shipmentsSubscription = supabase
      .channel('shipments')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'shipments' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newShipment: Shipment = {
              id: payload.new.id,
              trackingNumber: payload.new.tracking_number,
              senderName: payload.new.sender_name,
              senderPhone: payload.new.sender_phone,
              receiverName: payload.new.receiver_name,
              receiverPhone: payload.new.receiver_phone,
              destination: payload.new.destination,
              itemDescription: payload.new.item_description,
              weight: payload.new.weight,
              weightUnit: payload.new.weight_unit,
              photoUrl: payload.new.photo_url,
              priorityLabels: payload.new.priority_labels || [],
              totalAmount: payload.new.total_amount,
              paidAmount: payload.new.paid_amount,
              balanceDue: payload.new.balance_due,
              status: payload.new.status,
              batchId: payload.new.batch_id,
              createdBy: payload.new.created_by,
              createdAt: payload.new.created_at,
              updatedAt: payload.new.updated_at,
              arrivalConfirmation: payload.new.arrival_confirmation,
              deliveryConfirmation: payload.new.delivery_confirmation,
            };
            setShipments((prev) => [newShipment, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setShipments((prev) =>
              prev.map((s) =>
                s.id === payload.new.id
                  ? {
                      id: payload.new.id,
                      trackingNumber: payload.new.tracking_number,
                      senderName: payload.new.sender_name,
                      senderPhone: payload.new.sender_phone,
                      receiverName: payload.new.receiver_name,
                      receiverPhone: payload.new.receiver_phone,
                      destination: payload.new.destination,
                      itemDescription: payload.new.item_description,
                      weight: payload.new.weight,
                      weightUnit: payload.new.weight_unit,
                      photoUrl: payload.new.photo_url,
                      priorityLabels: payload.new.priority_labels || [],
                      totalAmount: payload.new.total_amount,
                      paidAmount: payload.new.paid_amount,
                      balanceDue: payload.new.balance_due,
                      status: payload.new.status,
                      batchId: payload.new.batch_id,
                      createdBy: payload.new.created_by,
                      createdAt: payload.new.created_at,
                      updatedAt: payload.new.updated_at,
                      arrivalConfirmation: payload.new.arrival_confirmation,
                      deliveryConfirmation: payload.new.delivery_confirmation,
                    }
                  : s
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setShipments((prev) => prev.filter((s) => s.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      batchesSubscription.unsubscribe();
      shipmentsSubscription.unsubscribe();
    };
  }, []);

  const addShipment = useCallback(async (shipment: Shipment) => {
    try {
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

      // Update batch shipment count if batch exists
      if (shipment.batchId) {
        await supabase
          .from('batches')
          .update({ shipment_count: supabase.rpc('increment_shipment_count', { batch_id: shipment.batchId }) })
          .eq('id', shipment.batchId);
      }
    } catch (error) {
      console.error('Error adding shipment:', error);
      throw error;
    }
  }, []);

  const updateShipment = useCallback(async (id: string, updates: Partial<Shipment>) => {
    try {
      const updateData: any = {};
      
      if (updates.senderName) updateData.sender_name = updates.senderName;
      if (updates.senderPhone) updateData.sender_phone = updates.senderPhone;
      if (updates.receiverName) updateData.receiver_name = updates.receiverName;
      if (updates.receiverPhone) updateData.receiver_phone = updates.receiverPhone;
      if (updates.itemDescription) updateData.item_description = updates.itemDescription;
      if (updates.weight) updateData.weight = updates.weight;
      if (updates.weightUnit) updateData.weight_unit = updates.weightUnit;
      if (updates.photoUrl) updateData.photo_url = updates.photoUrl;
      if (updates.priorityLabels) updateData.priority_labels = updates.priorityLabels;
      if (updates.totalAmount) updateData.total_amount = updates.totalAmount;
      if (updates.paidAmount) updateData.paid_amount = updates.paidAmount;
      if (updates.balanceDue) updateData.balance_due = updates.balanceDue;
      if (updates.status) updateData.status = updates.status;
      if (updates.arrivalConfirmation) updateData.arrival_confirmation = updates.arrivalConfirmation;
      if (updates.deliveryConfirmation) updateData.delivery_confirmation = updates.deliveryConfirmation;

      updateData.updated_at = new Date().toISOString();

      const { error } = await supabase
        .from('shipments')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating shipment:', error);
      throw error;
    }
  }, []);

  const updateShipmentStatus = useCallback(async (id: string, status: ShipmentStatus) => {
    try {
      const { error } = await supabase
        .from('shipments')
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating shipment status:', error);
      throw error;
    }
  }, []);

  const confirmArrival = useCallback(async (id: string, data: Shipment['arrivalConfirmation']) => {
    try {
      const { error } = await supabase
        .from('shipments')
        .update({
          status: 'arrived' as ShipmentStatus,
          arrival_confirmation: data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error confirming arrival:', error);
      throw error;
    }
  }, []);

  const confirmDelivery = useCallback(async (id: string, data: Shipment['deliveryConfirmation']) => {
    try {
      const { error } = await supabase
        .from('shipments')
        .update({
          status: 'delivered' as ShipmentStatus,
          delivery_confirmation: data,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error confirming delivery:', error);
      throw error;
    }
  }, []);

  const addBatch = useCallback(async (batch: Batch) => {
    try {
      const { error } = await supabase.from('batches').insert({
        id: batch.id,
        destination: batch.destination,
        flight_date: batch.flightDate,
        status: batch.status,
        shipment_count: batch.shipmentCount,
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error adding batch:', error);
      throw error;
    }
  }, []);

  const getShipmentsByStatus = useCallback(
    (statuses: ShipmentStatus[]) => shipments.filter((s) => statuses.includes(s.status)),
    [shipments]
  );

  const getShipmentsByDestination = useCallback(
    (dest: Destination) => shipments.filter((s) => s.destination === dest),
    [shipments]
  );

  const getShipmentByTracking = useCallback(
    (tracking: string) => shipments.find((s) => s.trackingNumber.toLowerCase() === tracking.toLowerCase()),
    [shipments]
  );

  const getShipmentsByBatch = useCallback(
    (batchId: string) => shipments.filter((s) => s.batchId === batchId),
    [shipments]
  );

  return (
    <DataContext.Provider
      value={{
        shipments,
        batches,
        addShipment,
        updateShipment,
        updateShipmentStatus,
        confirmArrival,
        confirmDelivery,
        addBatch,
        getShipmentsByStatus,
        getShipmentsByDestination,
        getShipmentByTracking,
        getShipmentsByBatch,
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
