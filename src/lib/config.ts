import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://qvgpmylkuermltgfzhme.supabase.co"
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2Z3BteWxrdWVybWx0Z2Z6aG1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyODU1MzEsImV4cCI6MjA2ODg2MTUzMX0.o1pQ34DGbZYsF1ukGJqoiVeHTH0qzi8RVMQ1OWoxGDQ"

// Supabase client for serverless backend
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Import adapter after creating supabase client
import { supabaseClient } from './adapters/supabase-adapter'

// Use our Supabase adapter that mimics Medusa SDK interface
export const sdk = supabaseClient as any
