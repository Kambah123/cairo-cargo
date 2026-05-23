export type UserRole = 'cairo_staff' | 'kano_staff' | 'abuja_staff' | 'admin';

export type Destination = 'kano' | 'abuja';

export type ShipmentStatus =
  | 'received'
  | 'awaiting_flight'
  | 'shipped'
  | 'arrived'
  | 'ready_for_pickup'
  | 'delivered'
  | 'on_hold';

export type PriorityLabel = 'express' | 'fragile' | 'paid' | 'balance_due';

export interface Shipment {
  id: string;
  trackingNumber: string;
  senderName: string;
  senderPhone: string;
  receiverName: string;
  receiverPhone: string;
  destination: Destination;
  itemDescription: string;
  weight: number;
  weightUnit: string;
  photoUrl?: string;
  priorityLabels: PriorityLabel[];
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  status: ShipmentStatus;
  batchId?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  weightAlert?: boolean;
  arrivalConfirmation?: {
    confirmedAt: string;
    confirmedBy: string;
    currentWeight: number;
    conditionNotes: string;
  };
  deliveryConfirmation?: {
    collectorName: string;
    collectorPhone: string;
    deliveredAt: string;
    confirmedBy: string;
  };
}

export interface Batch {
  id: string;
  destination: Destination;
  flightDate: string;
  status: 'open' | 'closed' | 'shipped';
  shipmentCount: number;
  totalWeight: number;
  totalRevenue: number;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  username: string; // Used as login (email)
  name: string;
  phone?: string;
  role: UserRole;
  branch: 'cairo' | 'kano' | 'abuja' | 'all';
  isActive: boolean;
  createdAt: string;
}

export interface WeightAlert {
  id: string;
  shipmentId: string;
  trackingNumber: string;
  initialWeight: number;
  finalWeight: number;
  discrepancy: number;
  status: 'pending' | 'resolved';
  resolvedBy?: string;
  resolvedAt?: string;
  createdAt: string;
}

export interface AdminAction {
  id: string;
  adminId: string;
  adminName: string;
  shipmentId: string;
  actionType: 'override_status' | 'edit_details' | 'delete_shipment' | 'adjust_balance';
  oldValue?: string;
  newValue?: string;
  reason: string;
  timestamp: string;
}

export const STATUS_FLOW: ShipmentStatus[] = [
  'received',
  'awaiting_flight',
  'shipped',
  'arrived',
  'ready_for_pickup',
  'delivered',
];

export const CAIRO_STATUSES: ShipmentStatus[] = ['received', 'awaiting_flight', 'shipped'];
export const NIGERIA_STATUSES: ShipmentStatus[] = ['arrived', 'ready_for_pickup', 'delivered'];

export const STATUS_LABELS: Record<ShipmentStatus, string> = {
  received: 'Received',
  awaiting_flight: 'Awaiting Flight',
  shipped: 'Shipped',
  arrived: 'Arrived',
  ready_for_pickup: 'Ready for Pickup',
  delivered: 'Delivered',
  on_hold: 'On Hold',
};

export const DESTINATION_COLORS: Record<Destination, string> = {
  kano: '#38A169',
  abuja: '#3182CE',
};

export const PRIORITY_CONFIG: Record<PriorityLabel, { label: string; bg: string; text: string }> = {
  express: { label: 'Express', bg: '#FEF3C7', text: '#D69E2E' },
  fragile: { label: 'Fragile', bg: '#FED7D7', text: '#E53E3E' },
  paid: { label: 'Paid', bg: '#C6F6D5', text: '#38A169' },
  balance_due: { label: 'Balance Due', bg: '#FEEBC8', text: '#DD6B20' },
};

export const STATUS_BADGE_COLORS: Record<ShipmentStatus, { bg: string; text: string }> = {
  received: { bg: '#EDF2F7', text: '#4A5568' },
  awaiting_flight: { bg: '#FEF3C7', text: '#D69E2E' },
  shipped: { bg: '#EBF8FF', text: '#3182CE' },
  arrived: { bg: '#E9D8FD', text: '#805AD5' },
  ready_for_pickup: { bg: '#FEEBC8', text: '#DD6B20' },
  delivered: { bg: '#C6F6D5', text: '#38A169' },
  on_hold: { bg: '#FED7D7', text: '#E53E3E' },
};
