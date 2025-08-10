export interface Lead {
  id?: string;
  name?: string | null;
  email: string;
  phone?: string | null;
  trade: string;
  postcode: string;
  description: string;
  estimate?: string;
  status?: 'new' | 'contacted' | 'quoted' | 'hired' | 'completed' | 'rejected';
  created_at?: string;
}

export interface TradeCategory {
  name: string;
  icon: string;
  jobs: number;
}

export interface Tradesperson {
  id: string | number;
  name: string;
  trade: string;
  rating: number;
  reviews: number;
  location: string;
  image: string;
  verified: boolean;
  yearsExperience: number;
}

export interface SearchParams {
  trade: string;
  postcode: string;
}

export interface JobEstimateResponse {
  estimate: string;
}

export interface LeadFormData {
  name: string;
  email: string;
  phone: string;
  trade: string;
  postcode: string;
  description: string;
  estimate: string;
}
