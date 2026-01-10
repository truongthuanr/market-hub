export type CatalogCategory = {
  id: number;
  name: string;
  slug: string;
  parent: number | null;
  created_at: string;
  updated_at: string;
};

export type CatalogImage = {
  id: number;
  url: string;
  position: number;
};

export type CatalogVariant = {
  id: number;
  sku: string | null;
  price: string;
  status: string;
};

export type CatalogProduct = {
  id: number;
  seller_id: number;
  name: string;
  slug: string;
  description: string;
  status: string;
  category: number | null;
  created_at: string;
  updated_at: string;
  variants?: CatalogVariant[];
  images?: CatalogImage[];
};

export type CartItem = {
  id: number;
  product_id: number;
  sku: string | null;
  qty: number;
  unit_price: string;
};

export type Cart = {
  id: number;
  user_id: number;
  status: string;
  expires_at: string | null;
  items: CartItem[];
};

export type Checkout = {
  order_id: number;
  total_amount: string;
  currency: string;
};

export type OrderItem = {
  id: number;
  product_id: number;
  sku: string | null;
  qty: number;
  unit_price: string;
};

export type Order = {
  id: number;
  user_id: number;
  status: string;
  total_amount: string;
  currency: string;
  created_at: string;
  items: OrderItem[];
};
