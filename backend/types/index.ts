// User types
export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  role?: 'admin' | 'user';
  created: string;
  updated: string;
  collectionId?: string;
  collectionName?: string;
  emailVisibility?: boolean;
  verified?: boolean;
}

// Product types
export interface Product {
  id: string;
  name: string;
  description?: string;
  price?: number;
  category?: string;
  status: 'active' | 'inactive' | 'draft';
  tags?: string[];
  config?: Record<string, any>;
  sku?: string;
  stock?: number;
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  images?: string[];
  meta_data?: Record<string, any>;
  created: string;
  updated: string;
}

export interface ProductInput {
  name: string;
  description?: string;
  price: number;
  category?: string;
  status: 'active' | 'inactive' | 'draft';
  tags?: string[];
  sku?: string;
  stock?: number;
  weight?: number;
  images?: string[];
}

// Order types
export interface Order {
  id: string;
  collectionId: string;
  collectionName: string;
  order_number: string;
  user_id: string;
  total_amount: number;
  payment_method: string;
  order_source: string;
  order_type: string;
  status: string;
  items: OrderItem[];
  shipping_address: ShippingAddress;
  logistics_info?: LogisticsInfo;
  notes?: string;
  shipped_at?: string;
  delivered_at?: string;
  // Expanded relations
  expand?: {
    user_id?: User;
  };
}

export interface OrderItem {
  product_id: string;
  product_name: string;
  product_image?: string;
  sku?: string;
  price: number;
  quantity: number;
  total: number;
}

export interface ShippingAddress {
  name: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  address: string;
  postal_code?: string;
}

export interface LogisticsInfo {
  company?: string;
  tracking_number?: string;
  status?: string;
  updates?: LogisticsUpdate[];
}

export interface LogisticsUpdate {
  time: string;
  status: string;
  description: string;
  location?: string;
}

export interface OrderInput {
  userId: string;
  totalAmount: number;
  paymentMethod: string;
  orderSource: string;
  orderType: string;
  items: OrderItemInput[];
  shippingAddress: ShippingAddressInput;
  notes?: string;
}

export interface OrderItemInput {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
}

export interface ShippingAddressInput {
  name: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  address: string;
  postalCode?: string;
}

// Refund types
export interface RefundRequest {
  id: string;
  service_number: string;
  order_id: string;
  user_id: string;
  refund_type: 'refund_only' | 'return_and_refund' | 'exchange';
  refund_amount: number;
  reason: 'quality_issue' | 'wrong_item' | 'damaged_in_transit' | 'not_as_described' | 'size_issue' | 'change_of_mind' | 'other';
  description: string;
  evidence_images?: string[];
  status: 'pending' | 'approved' | 'rejected' | 'processing' | 'completed' | 'cancelled';
  admin_notes?: string;
  processed_at?: string;
  processed_by?: string;
  created: string;
  updated: string;
  // Expanded relations
  expand?: {
    order_id?: Order;
    user_id?: User;
    processed_by?: User;
  };
}

// Order Settings
export interface OrderSetting {
  id: string;
  setting_key: string;
  setting_name: string;
  setting_value: string;
  setting_type: 'number' | 'boolean' | 'text' | 'json';
  description?: string;
  category: 'payment' | 'shipping' | 'timeout' | 'auto_operations' | 'notifications';
  created: string;
  updated: string;
}

// Query filters
export interface ProductQuery {
  page?: number;
  perPage?: number;
  status?: 'active' | 'inactive' | 'draft';
  category?: string;
  search?: string;
  sortBy?: 'name' | 'price' | 'created' | 'updated';
  sortOrder?: 'asc' | 'desc';
}

export interface OrderQuery {
  page?: number;
  perPage?: number;
  status?: string;
  payment_method?: string;
  order_source?: string;
  order_type?: string;
  user_id?: string;
  search?: string;
  date_from?: string;
  date_to?: string;
  sortBy?: 'id' | 'total_amount' | 'order_number';
  sortOrder?: 'asc' | 'desc';
}

export interface RefundQuery {
  page?: number;
  perPage?: number;
  status?: string;
  refund_type?: string;
  reason?: string;
  user_id?: string;
  order_id?: string;
  search?: string;
  date_from?: string;
  date_to?: string;
  sortBy?: 'created' | 'updated' | 'refund_amount' | 'processed_at';
  sortOrder?: 'asc' | 'desc';
}

// Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    perPage: number;
    totalPages: number;
    totalItems: number;
  };
}

// Statistics
export interface ProductStats {
  total: number;
  active: number;
  inactive: number;
  draft: number;
  categories: Record<string, number>;
  avgPrice?: number;
  totalStock?: number;
}

export interface OrderStats {
  total: number;
  pending_payment: number;
  paid: number;
  processing: number;
  shipped: number;
  delivered: number;
  completed: number;
  cancelled: number;
  refunding: number;
  refunded: number;
  total_amount: number;
  avg_amount: number;
  payment_methods: Record<string, number>;
  order_sources: Record<string, number>;
  order_types: Record<string, number>;
} 