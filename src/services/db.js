import { openDB } from 'idb'

const DB_NAME = 'baby-log-db'
const STORE_NAME = 'logs'
const VERSION = 1

const dbPromise = openDB(DB_NAME, VERSION, {
    upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
            const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
            store.createIndex('date', 'date')
        }
    },
})

export const getLogs = async () => {
    const db = await dbPromise
    const logs = await db.getAll(STORE_NAME)
    return logs.sort((a, b) => new Date(b.date) - new Date(a.date))
}

export const saveLog = async (log) => {
    const db = await dbPromise
    await db.put(STORE_NAME, log)
    return log
}

export const deleteLog = async (id) => {
    const db = await dbPromise
    await db.delete(STORE_NAME, id)
}

export const importLogs = async (logs) => {
    const db = await dbPromise
    const tx = db.transaction(STORE_NAME, 'readwrite')
    const store = tx.objectStore(STORE_NAME)

    for (const log of logs) {
        // Generate new ID to avoid conflicts and ensure it's treated as a new copy
        const newId = Date.now().toString(36) + Math.random().toString(36).substr(2)
        const newLog = { ...log, id: newId }
        await store.put(newLog)
    }

    await tx.done
}
