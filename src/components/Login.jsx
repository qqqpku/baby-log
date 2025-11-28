import { useState } from 'react'
import { login } from '../services/auth'

export default function Login({ onLoginSuccess }) {
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            await login(password)
            onLoginSuccess()
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '1rem'
        }}>
            <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '2rem',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                maxWidth: '400px',
                width: '100%'
            }}>
                <h1 style={{
                    fontSize: '1.75rem',
                    fontWeight: '700',
                    marginBottom: '0.5rem',
                    color: '#1a202c',
                    textAlign: 'center'
                }}>
                    🍼 宝宝成长记录
                </h1>
                <p style={{
                    color: '#718096',
                    textAlign: 'center',
                    marginBottom: '2rem',
                    fontSize: '0.9rem'
                }}>
                    请输入密码访问您的记录
                </p>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '0.5rem',
                            fontWeight: '600',
                            color: '#2d3748'
                        }}>
                            密码
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="输入您的密码"
                            autoFocus
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '2px solid #e2e8f0',
                                borderRadius: '8px',
                                fontSize: '1rem',
                                outline: 'none',
                                transition: 'border-color 0.2s'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#667eea'}
                            onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                        />
                    </div>

                    {error && (
                        <div style={{
                            padding: '0.75rem',
                            background: '#fed7d7',
                            color: '#c53030',
                            borderRadius: '8px',
                            marginBottom: '1rem',
                            fontSize: '0.9rem'
                        }}>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || !password}
                        style={{
                            width: '100%',
                            padding: '0.875rem',
                            background: loading || !password ? '#cbd5e0' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            fontWeight: '600',
                            cursor: loading || !password ? 'not-allowed' : 'pointer',
                            transition: 'transform 0.2s, box-shadow 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            if (!loading && password) {
                                e.target.style.transform = 'translateY(-2px)'
                                e.target.style.boxShadow = '0 10px 20px rgba(102, 126, 234, 0.4)'
                            }
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)'
                            e.target.style.boxShadow = 'none'
                        }}
                    >
                        {loading ? '登录中...' : '登录'}
                    </button>
                </form>

                <div style={{
                    marginTop: '1.5rem',
                    padding: '1rem',
                    background: '#edf2f7',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    color: '#4a5568'
                }}>
                    <strong>提示：</strong>密码用于保护您的数据隐私。请牢记您的密码，忘记密码将无法恢复数据。
                </div>
            </div>
        </div>
    )
}
