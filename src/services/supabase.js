import { createClient } from '@supabase/supabase-js'

// These will be populated from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

// Table name
const TABLE_NAME = 'logs'

export const getLogs = async () => {
    const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('*')
        .order('date', { ascending: false })

    if (error) {
        console.error('Error fetching logs:', error)
        throw error
    }

    // Transform back to our app's format if needed
    // Our app expects the full log object. 
    // We will store the full JSON in a 'content' column, 
    // but for easier querying we might also have 'date' as a column.
    // Let's assume we store: id, date, content (jsonb)

    return data.map(row => ({
        ...row.content,
        id: row.id // Ensure ID matches
    }))
}

export const saveLog = async (log) => {
    // We store the full log object in 'content' column
    // and extract 'date' for sorting/querying
    const row = {
        id: log.id,
        date: log.date,
        content: log,
        updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
        .from(TABLE_NAME)
        .upsert(row)
        .select()

    if (error) {
        console.error('Error saving log:', error)
        throw error
    }

    return log
}

export const deleteLog = async (id) => {
    const { error } = await supabase
        .from(TABLE_NAME)
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting log:', error)
        throw error
    }
}

export const importLogs = async (logs) => {
    // Bulk insert/upsert
    const rows = logs.map(log => ({
        id: log.id,
        date: log.date,
        content: log,
        updated_at: new Date().toISOString()
    }))

    const { error } = await supabase
        .from(TABLE_NAME)
        .upsert(rows)

    if (error) {
        console.error('Error importing logs:', error)
        throw error
    }
}
