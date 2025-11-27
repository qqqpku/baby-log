import * as db from './db'
import * as supabase from './supabase'

// Check if Supabase is configured
const isSupabaseConfigured =
    import.meta.env.VITE_SUPABASE_URL &&
    import.meta.env.VITE_SUPABASE_ANON_KEY

console.log('Storage mode:', isSupabaseConfigured ? 'Supabase Cloud' : 'Local IndexedDB')

export const getLogs = isSupabaseConfigured ? supabase.getLogs : db.getLogs
export const saveLog = isSupabaseConfigured ? supabase.saveLog : db.saveLog
export const deleteLog = isSupabaseConfigured ? supabase.deleteLog : db.deleteLog
export const importLogs = isSupabaseConfigured ? supabase.importLogs : db.importLogs
