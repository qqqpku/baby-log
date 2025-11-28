// Simple password-based authentication
// Password is hashed to create a deterministic user_id

const AUTH_TOKEN_KEY = 'baby_log_auth_token'

/**
 * Hash password to create user_id
 * Uses SHA-256 for deterministic hashing
 */
export const hashPassword = async (password) => {
    const encoder = new TextEncoder()
    const data = encoder.encode(password)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    return hashHex
}

/**
 * Login with password
 * Stores user_id in localStorage
 */
export const login = async (password) => {
    if (!password || password.trim() === '') {
        throw new Error('密码不能为空')
    }

    const userId = await hashPassword(password)
    localStorage.setItem(AUTH_TOKEN_KEY, userId)
    return userId
}

/**
 * Logout
 * Clears authentication token
 */
export const logout = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY)
}

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
    return localStorage.getItem(AUTH_TOKEN_KEY) !== null
}

/**
 * Get current user_id
 */
export const getUserId = () => {
    return localStorage.getItem(AUTH_TOKEN_KEY)
}
