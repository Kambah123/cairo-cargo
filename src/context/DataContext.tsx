import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Shipment, Batch, Destination, ShipmentStatus } from '@/types';

const INITIAL_SHIPMENTS: Shipment[] = [
  {
    id: 'KAN-20260521-0010',
    trackingNumber: 'KAN-20260521-0010',
    senderName: 'Ahmed Hassan',
    senderPhone: '+20 101 234 5678',
    receiverName: 'Musa Ibrahim',
    receiverPhone: '+234 801 234 5678',
    destination: 'kano',
    itemDescription: 'Electronics and clothing items',
    weight: 18,
    weightUnit: 'kg',
    photoUrl: '/package-scale.jpg',
    priorityLabels: ['express', 'paid'],
    totalAmount: 250,
    paidAmount: 250,
    balanceDue: 0,
    status: 'shipped',
    batchId: 'FL-CAR-KNO-250521-A',
    createdBy: 'cairo_staff_1',
    createdAt: '2025-05-21T10:30:00Z',
    updatedAt: '2025-05-21T14:00:00Z',
  },
  {
    id: 'ABU-20260521-0005',
    trackingNumber: 'ABU-20260521-0005',
    senderName: 'Fatima Ali',
    senderPhone: '+20 102 345 6789',
    receiverName: 'John Okonkwo',
    receiverPhone: '+234 802 345 6789',
    destination: 'abuja',
    itemDescription: 'Home appliances and kitchenware',
    weight: 32,
    weightUnit: 'kg',
    priorityLabels: ['fragile'],
    totalAmount: 420,
    paidAmount: 200,
    balanceDue: 220,
    status: 'arrived',
    batchId: 'FL-CAR-ABU-250521-B',
    createdBy: 'cairo_staff_1',
    createdAt: '2025-05-21T09:15:00Z',
    updatedAt: '2025-05-22T08:30:00Z',
    arrivalConfirmation: {
      confirmedAt: '2025-05-22T08:30:00Z',
      confirmedBy: 'nigeria_staff_1',
      currentWeight: 31.5,
      conditionNotes: 'All items in good condition',
    },
  },
  {
    id: 'KAN-20260520-0042',
    trackingNumber: 'KAN-20260520-0042',
    senderName: 'Omar Khalil',
    senderPhone: '+20 103 456 7890',
    receiverName: 'Amina Yusuf',
    receiverPhone: '+234 803 456 7890',
    destination: 'kano',
    itemDescription: 'Textile fabrics and garments',
    weight: 45,
    weightUnit: 'kg',
    priorityLabels: ['paid'],
    totalAmount: 380,
    paidAmount: 380,
    balanceDue: 0,
    status: 'delivered',
    batchId: 'FL-CAR-KNO-200521-A',
    createdBy: 'cairo_staff_1',
    createdAt: '2025-05-20T11:00:00Z',
    updatedAt: '2025-05-22T16:42:00Z',
    arrivalConfirmation: {
      confirmedAt: '2025-05-21T10:00:00Z',
      confirmedBy: 'nigeria_staff_1',
      currentWeight: 45,
      conditionNotes: 'Good condition',
    },
    deliveryConfirmation: {
      collectorName: 'Amina Yusuf',
      collectorPhone: '+234 803 456 7890',
      deliveredAt: '2025-05-22T16:42:00Z',
      confirmedBy: 'nigeria_staff_1',
    },
  },
  {
    id: 'ABU-20260522-0012',
    trackingNumber: 'ABU-20260522-0012',
    senderName: 'Sara Mahmoud',
    senderPhone: '+20 104 567 8901',
    receiverName: 'Peter Adebayo',
    receiverPhone: '+234 804 567 8901',
    destination: 'abuja',
    itemDescription: 'Books and educational materials',
    weight: 12,
    weightUnit: 'kg',
    priorityLabels: ['express', 'balance_due'],
    totalAmount: 180,
    paidAmount: 50,
    balanceDue: 130,
    status: 'received',
    createdBy: 'cairo_staff_1',
    createdAt: '2025-05-22T08:00:00Z',
    updatedAt: '2025-05-22T08:00:00Z',
  },
  {
    id: 'KAN-20260522-0015',
    trackingNumber: 'KAN-20260522-0015',
    senderName: 'Ibrahim Saleh',
    senderPhone: '+20 105 678 9012',
    receiverName: 'Hassan Bello',
    receiverPhone: '+234 805 678 9012',
    destination: 'kano',
    itemDescription: 'Spare auto parts',
    weight: 28,
    weightUnit: 'kg',
    priorityLabels: ['paid'],
    totalAmount: 310,
    paidAmount: 310,
    balanceDue: 0,
    status: 'awaiting_flight',
    batchId: 'FL-CAR-KNO-250521-B',
    createdBy: 'cairo_staff_1',
    createdAt: '2025-05-22T07:30:00Z',
    updatedAt: '2025-05-22T12:00:00Z',
  },
];

const INITIAL_BATCHES: Batch[] = [
  {
    id: 'FL-CAR-KNO-250521-A',
    destination: 'kano',
    flightDate: '2025-05-25',
    status: 'shipped',
    shipmentCount: 12,
    createdAt: '2025-05-21T00:00:00Z',
  },
  {
    id: 'FL-CAR-ABU-250521-B',
    destination: 'abuja',
    flightDate: '2025-05-25',
    status: 'shipped',
    shipmentCount: 8,
    createdAt: '2025-05-21T00:00:00Z',
  },
  {
    id: 'FL-CAR-KNO-250521-B',
    destination: 'kano',
    flightDate: '2025-05-26',
    status: 'open',
    shipmentCount: 5,
    createdAt: '2025-05-22T00:00:00Z',
  },
];

interface DataContextType {
  shipments: Shipment[];
  batches: Batch[];
  addShipment: (shipment: Shipment) => void;
  updateShipment: (id: string, updates: Partial<Shipment>) => void;
  updateShipmentStatus: (id: string, status: ShipmentStatus) => void;
  confirmArrival: (id: string, data: Shipment['arrivalConfirmation']) => void;
  confirmDelivery: (id: string, data: Shipment['deliveryConfirmation']) => void;
  addBatch: (batch: Batch) => void;
  getShipmentsByStatus: (statuses: ShipmentStatus[]) => Shipment[];
  getShipmentsByDestination: (dest: Destination) => Shipment[];
  getShipmentByTracking: (tracking: string) => Shipment | undefined;
  getShipmentsByBatch: (batchId: string) => Shipment[];
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [shipments, setShipments] = useState<Shipment[]>(INITIAL_SHIPMENTS);
  const [batches, setBatches] = useState<Batch[]>(INITIAL_BATCHES);

  const addShipment = useCallback((shipment: Shipment) => {
    setShipments((prev) => [shipment, ...prev]);
    setBatches((prev) =>
      prev.map((b) =>
        b.id === shipment.batchId
          ? { ...b, shipmentCount: b.shipmentCount + 1 }
          : b
      )
    );
  }, []);

  const updateShipment = useCallback((id: string, updates: Partial<Shipment>) => {
    setShipments((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s))
    );
  }, []);

  const updateShipmentStatus = useCallback((id: string, status: ShipmentStatus) => {
    setShipments((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status, updatedAt: new Date().toISOString() } : s))
    );
  }, []);

  const confirmArrival = useCallback((id: string, data: Shipment['arrivalConfirmation']) => {
    setShipments((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, status: 'arrived' as ShipmentStatus, arrivalConfirmation: data, updatedAt: new Date().toISOString() }
          : s
      )
    );
  }, []);

  const confirmDelivery = useCallback((id: string, data: Shipment['deliveryConfirmation']) => {
    setShipments((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, status: 'delivered' as ShipmentStatus, deliveryConfirmation: data, updatedAt: new Date().toISOString() }
          : s
      )
    );
  }, []);

  const addBatch = useCallback((batch: Batch) => {
    setBatches((prev) => [...prev, batch]);
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
