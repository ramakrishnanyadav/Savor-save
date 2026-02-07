// Order Tracking Types

export type OrderStatus = 
  | 'placed' 
  | 'confirmed' 
  | 'preparing' 
  | 'ready' 
  | 'picked_up' 
  | 'on_the_way' 
  | 'nearby' 
  | 'delivered' 
  | 'cancelled' 
  | 'failed';

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type DeliveryType = 'delivery' | 'pickup' | 'dine-in';

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
  customizations?: string[];
  notes?: string;
}

export interface Location {
  lat: number;
  lng: number;
  address?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  
  // Restaurant info
  restaurantId: string;
  restaurantName: string;
  restaurantLocation?: string;
  restaurantDistance?: number;
  
  // Order details
  items: OrderItem[];
  totalAmount: number;
  subtotal: number;
  deliveryFee: number;
  taxAmount: number;
  discountAmount: number;
  
  // Status
  status: OrderStatus;
  deliveryType: DeliveryType;
  
  // Delivery info
  estimatedDeliveryTime?: Date;
  actualDeliveryTime?: Date;
  deliveryAddress?: string;
  deliveryInstructions?: string;
  
  // Delivery person
  deliveryPersonName?: string;
  deliveryPersonPhone?: string;
  deliveryPersonLocation?: Location;
  
  // Customer
  customerName?: string;
  customerPhone?: string;
  customerLocation?: Location;
  
  // Payment
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  paymentId?: string;
  transactionId?: string;
  
  // Rating
  rating?: number;
  review?: string;
  reviewImages?: string[];
  
  // Timestamps
  placedAt: Date;
  confirmedAt?: Date;
  preparingAt?: Date;
  readyAt?: Date;
  pickedUpAt?: Date;
  onTheWayAt?: Date;
  deliveredAt?: Date;
  cancelledAt?: Date;
  
  // Cancellation
  cancellationReason?: string;
  cancelledBy?: 'customer' | 'restaurant' | 'system';
  
  // Metadata
  notes?: string;
  specialInstructions?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderStatusHistory {
  id: string;
  orderId: string;
  status: OrderStatus;
  message?: string;
  location?: Location;
  createdAt: Date;
}

export interface DeliveryTracking {
  id: string;
  orderId: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  heading?: number;
  speed?: number;
  batteryLevel?: number;
  timestamp: Date;
}

export interface RestaurantLocation {
  id: string;
  restaurantId: string;
  restaurantName: string;
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  state?: string;
  pincode?: string;
  phone?: string;
  
  // Operating hours
  openingTime?: string;
  closingTime?: string;
  isOpen: boolean;
  
  // Delivery info
  avgPreparationTime: number;
  minOrderAmount: number;
  deliveryRadius: number;
  deliveryFee: number;
  
  // Ratings
  rating: number;
  totalReviews: number;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomerAddress {
  id: string;
  userId: string;
  label: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state?: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface NearbyRestaurant extends RestaurantLocation {
  distance: number;
  estimatedDeliveryMinutes: number;
}

export interface OrderTrackingState {
  currentStatus: OrderStatus;
  statusHistory: OrderStatusHistory[];
  estimatedTime?: number; // minutes remaining
  isDelivered: boolean;
  isCancelled: boolean;
  canCancel: boolean;
  canRate: boolean;
  deliveryPersonLocation?: Location;
  progressPercentage: number;
}

export interface CreateOrderInput {
  restaurantId: string;
  restaurantName: string;
  items: OrderItem[];
  deliveryType: DeliveryType;
  deliveryAddress?: string;
  deliveryInstructions?: string;
  customerLocation?: Location;
  paymentMethod: string;
  specialInstructions?: string;
}

export interface UpdateOrderStatusInput {
  orderId: string;
  newStatus: OrderStatus;
  message?: string;
  location?: Location;
}

export interface RateOrderInput {
  orderId: string;
  rating: number;
  review?: string;
  reviewImages?: string[];
}
