export type UserRole = 'cairo_staff' | 'kano_staff' | 'abuja_staff' | 'admin';

export type Destination = 'kano' | 'abuja';

export type ShipmentStatus =
  | 'received'
  | 'awaiting_flight'
  | 'ready_for_flight'
  | 'flight_booked'
  | 'departed'
  | 'shipped'
  | 'arrived'
  | 'ready_for_pickup'
  | 'delivered'
  | 'on_hold'
  | 'returned';

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
  flightNumber?: string;
  awbNumber?: string;
  pickupPhotoUrl?: string;
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
    cashCollected?: number;
  };
  refusalReason?: string;
}

export interface Batch {
  id: string;
  destination: Destination;
  flightDate: string;
  status: 'open' | 'closed' | 'ready_for_flight' | 'flight_booked' | 'departed' | 'shipped';
  shipmentCount: number;
  totalWeight: number;
  totalRevenue: number;
  flightNumber?: string;
  awbNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  username: string;
  name: string;
  phone?: string;
  role: UserRole;
  branch: 'cairo' | 'kano' | 'abuja' | 'all';
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
  lastLoginIp?: string;
  passwordChangedAt?: string;
}

export interface WeightAlert {
  id: string;
  shipmentId: string;
  trackingNumber: string;
  initialWeight: number;
  finalWeight: number;
  discrepancy: number;
  status: 'pending' | 'resolved' | 'ignored';
  reason?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  createdAt: string;
}

export interface AdminAction {
  id: string;
  adminId: string;
  adminName: string;
  shipmentId?: string;
  batchId?: string;
  actionType: string;
  oldValue?: string;
  newValue?: string;
  reason: string;
  timestamp: string;
}

export const STATUS_FLOW: ShipmentStatus[] = [
  'received',
  'awaiting_flight',
  'ready_for_flight',
  'flight_booked',
  'departed',
  'shipped',
  'arrived',
  'ready_for_pickup',
  'delivered',
];

export const CAIRO_STATUSES: ShipmentStatus[] = ['received', 'awaiting_flight', 'ready_for_flight', 'flight_booked', 'departed', 'shipped'];
export const NIGERIA_STATUSES: ShipmentStatus[] = ['arrived', 'ready_for_pickup', 'delivered', 'returned'];

export const STATUS_LABELS: Record<ShipmentStatus, string> = {
  received: 'Received',
  awaiting_flight: 'Awaiting Flight',
  ready_for_flight: 'Ready for Flight',
  flight_booked: 'Flight Booked',
  departed: 'Departed',
  shipped: 'Shipped',
  arrived: 'Arrived',
  ready_for_pickup: 'Ready for Pickup',
  delivered: 'Delivered',
  on_hold: 'On Hold',
  returned: 'Returned',
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
  ready_for_flight: { bg: '#E9D8FD', text: '#805AD5' },
  flight_booked: { bg: '#BEE3F8', text: '#2B6CB0' },
  departed: { bg: '#C6F6D5', text: '#2F855A' },
  shipped: { bg: '#EBF8FF', text: '#3182CE' },
  arrived: { bg: '#E9D8FD', text: '#805AD5' },
  ready_for_pickup: { bg: '#FEEBC8', text: '#DD6B20' },
  delivered: { bg: '#C6F6D5', text: '#38A169' },
  on_hold: { bg: '#FED7D7', text: '#E53E3E' },
  returned: { bg: '#FEEBC8', text: '#DD6B20' },
};
