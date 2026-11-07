export interface Producto {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number; // 0 | 1 (boolean en MySQL)
}

export interface ApiListResponse<T> {
  data: T[];
  links?: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  meta?: {
    current_page: number;
    last_page: number;
    total: number;
  };
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  name?: string;
  user?: {
    name?: string;
  };
}

export interface AuthResponse {
  access_token?: string;
  token_type?: string;
  name?: string;
  user?: {
    name?: string;
  };
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface CurrentUser {
  id: number;
  name: string;
}

export interface OrderItem {
  id: number;
  quantity: number;
  unit_price: number | string;
  product: string;
}

export interface Order {
  id: number;
  status: string;
  total: number | string;
  items: OrderItem[];
}

export interface CreateOrderData {
  items: Array<{
    product_id: number;
    quantity: number;
  }>;
}

export interface CreateOrderResponse {
  message: string;
  data: Order;
}

export function sleep(ms: number){
    return new Promise((resolve) => setTimeout(resolve, ms));
}