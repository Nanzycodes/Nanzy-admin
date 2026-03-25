export type ExperienceType =
  | "shortlet" | "spa" | "salon" | "hotel" | "rental"
  | "pharmacy" | "bakery" | "restaurant" | "cafe" | "alcohol"
  | "boat" | "car" | "gift";

export interface ExperienceList {
  id: number;
  creator_name: string;
  business_name: string;
  experience_type: ExperienceType;
  product_count: number;
  created_at: string;
}

export interface ExperienceProduct {
  id: number;
  image: string | null;
  title: string;
  description: string;
  price: string;
  tag_list: string[];
  amenity_list: string[];
  capacity: number | null;
  nightly_rate: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExperienceDetail {
  id: number;
  creator_name: string;
  business_name: string;
  experience_type: ExperienceType;
  products: ExperienceProduct[];
  created_at: string;
  updated_at: string;
}

export interface PaginatedExperienceList {
  count: number;
  next: string | null;
  previous: string | null;
  results: ExperienceList[];
}
