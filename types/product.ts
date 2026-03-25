export interface ProductList {
  id: number;
  creator_name: string;
  title: string;
  description: string;
  image: string | null;
  price: string;
  discounted_price: string;
  inventory: number;
  discount: string;
  weight: string | null;
  height: string | null;
  length: string | null;
  width: string | null;
  variant_count: string;
  created_at: string;
}

export interface ProductDetail {
  id: number;
  creator_id: string;
  creator_name: string;
  title: string;
  description: string;
  image: string | null;
  price: string;
  discounted_price: string;
  inventory: number;
  tags: string;
  tag_list: string[];
  discount: string;
  ar_link: string | null;
  weight: string | null;
  height: string | null;
  width: string | null;
  length: string | null;
  variants: Variant[];
  created_at: string;
  updated_at: string;
}

export interface Variant {
  id: number;
  name: string;
  price: string;
  inventory: number;
}

export interface PaginatedProductList {
  count: number;
  next: string | null;
  previous: string | null;
  results: ProductList[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: null | unknown;
}
