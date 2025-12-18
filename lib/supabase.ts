// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Server-side client with service role key (bypasses RLS)
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Helper to generate cuid-like IDs
export function generateId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 15);
  return `c${timestamp}${randomPart}`;
}

// Type definitions matching the database schema
export interface Station {
  id: string;
  name: string;
  streamUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Show {
  id: string;
  imageUrl: string | null;
  title: string;
  description: string | null;
  stationId: string;
  createdAt: string;
  updatedAt: string;
  station?: Station;
  oaps?: OapOnShow[];
  schedules?: ScheduleSlot[];
}

export interface Oap {
  id: string;
  name: string;
  role: string | null;
  imageUrl: string | null;
  twitter: string | null;
  instagram: string | null;
  bio: string | null;
  createdAt: string;
  updatedAt: string;
  shows?: OapOnShow[];
}

export interface OapOnShow {
  oapId: string;
  showId: string;
  role: string | null;
  oap?: Oap;
  show?: Show;
}

export interface ScheduleSlot {
  id: string;
  stationId: string;
  showId: string;
  dayOfWeek: number;
  startMin: number;
  endMin: number;
  createdAt: string;
  updatedAt: string;
  station?: Station;
  show?: Show;
}

export interface Settings {
  id: string;
  stationId: string;
  streamUrl: string;
  timezone: string;
  uploadsNamespace: string;
  aboutHtml: string | null;
  socials: Record<string, string> | null;
  theme: Record<string, string> | null;
  createdAt: string;
  updatedAt: string;
  station?: Station;
}
