import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type ServiceRequestStatus = 'pending' | 'accepted' | 'on_the_way' | 'completed' | 'cancelled';

export interface ServiceRequest {
  id: string;
  service_key: string;
  service_name: string;
  customer_name: string;
  phone: string | null;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  user_id: string | null;
  notes: string | null;
  status: ServiceRequestStatus;
  created_at: string;
  provider_name: string | null;
}

export interface ChatMessage {
  id: string;
  request_id: string;
  sender_type: 'customer' | 'provider';
  sender_name: string;
  message: string;
  created_at: string;
}
