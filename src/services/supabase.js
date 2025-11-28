import { createClient } from '@supabase/supabase-js'
import { getUserId } from './auth'

// These will be populated from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

// Table name
const TABLE_NAME = 'logs'

export const getLogs = async () => {
    const userId = getUserId()
    if (!userId) throw new Error('Not authenticated')

    const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })

    if (error) {
        console.error('Error fetching logs:', error)
        throw error
    }

    return data.map(row => ({
        ...row.content,
        id: row.id
    }))
}

export const saveLog = async (log) => {
    const userId = getUserId()
    if (!userId) throw new Error('Not authenticated')

    const row = {
        id: log.id,
        date: log.date,
        content: log,
        user_id: userId,
        updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
        .from(TABLE_NAME)
        .upsert(row)
        .select()

    if (error) {
        console.error('Error saving log:', error)
        console.error('Error details:', JSON.stringify(error, null, 2))
        throw error
    }

    return log
}

export const deleteLog = async (id) => {
    const userId = getUserId()
    if (!userId) throw new Error('Not authenticated')

    const { error } = await supabase
        .from(TABLE_NAME)
        .delete()
        .eq('id', id)
        .eq('user_id', userId)

    if (error) {
        console.error('Error deleting log:', error)
        throw error
    }
}

export const importLogs = async (logs) => {
    const userId = getUserId()
    if (!userId) throw new Error('Not authenticated')

    const rows = logs.map(log => {
        // Generate a new ID to prevent overwriting existing records (ownership transfer)
        // This creates a copy of the data for the current user
        const newId = Date.now().toString(36) + Math.random().toString(36).substr(2)

        return {
            ...log, // Keep original content
            id: newId, // New ID
            date: log.date,
            content: { ...log, id: newId }, // Update ID inside content too
            user_id: userId,
            updated_at: new Date().toISOString()
        }
    })

    const { error } = await supabase
        .from(TABLE_NAME)
        .upsert(rows)

    if (error) {
        console.error('Error importing logs:', error)
        throw error
    }
}
