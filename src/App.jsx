import React, { useState, useEffect } from 'react'
import DailyLogForm from './components/DailyLogForm'
import LogHistory from './components/LogHistory'
import Login from './components/Login'
import { normalizeLog } from './utils/schema'
import { isAuthenticated, logout } from './services/auth'

import { getLogs, saveLog as saveLogToDb, deleteLog as deleteLogFromDb, importLogs } from './services/storage'
import { exportDataAsJSON, generateExportFilename } from './utils/export'

function App() {
  const [authenticated, setAuthenticated] = useState(isAuthenticated())
  const [view, setView] = useState('form') // 'form' or 'history'
  const [logs, setLogs] = useState([])
  const [editingLog, setEditingLog] = useState(null)
  const [showMenu, setShowMenu] = useState(false)
  const fileInputRef = React.useRef(null)

  const handleLoginSuccess = () => {
    setAuthenticated(true)
  }

  const handleLogout = () => {
    if (confirm('确定要退出登录吗？')) {
      logout()
      setAuthenticated(false)
      setLogs([])
    }
  }

  useEffect(() => {
    if (authenticated) {
      loadLogs()
    }
  }, [authenticated])

  const loadLogs = async () => {
    try {
      const data = await getLogs()
      setLogs(data.map(normalizeLog))
    } catch (err) {
      console.error('Failed to load logs:', err)
    }
  }

  const saveLog = async (newLog) => {
    try {
      await saveLogToDb(newLog)
      await loadLogs()
      setView('history')
    } catch (err) {
      console.error('Failed to save log:', err)
    }
  }

  const updateLog = async (updatedLog) => {
    try {
      await saveLogToDb(updatedLog)
      await loadLogs()
      setEditingLog(null)
      setView('history')
    } catch (err) {
      console.error('Failed to update log:', err)
    }
  }

  const handleEdit = (log) => {
    setEditingLog(log)
    setView('form')
  }

  const deleteLog = async (id) => {
    if (!confirm('确定要删除这条记录吗？')) return

    try {
      await deleteLogFromDb(id)
      setLogs(prevLogs => prevLogs.filter(log => log.id !== id))
    } catch (err) {
      console.error('Failed to delete log:', err)
    }
  }

  const handleExport = async () => {
    try {
      const data = await getLogs()
      const filename = generateExportFilename()
      exportDataAsJSON(data, filename)
      alert(`已导出 ${data.length} 条记录`)
    } catch (err) {
      console.error('Failed to export data:', err)
      alert('导出失败，请重试')
    }
  }

  const handleImportClick = () => {
    fileInputRef.current.click()
  }

  const handleFileChange = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const importedData = JSON.parse(e.target.result)
        if (!Array.isArray(importedData)) {
          throw new Error('Invalid data format')
        }

        if (confirm(`准备导入 ${importedData.length} 条记录，这可能会覆盖现有的同名记录。确定继续吗？`)) {
          await importLogs(importedData)
          await loadLogs()
          alert('导入成功！')
        }
      } catch (err) {
        console.error('Import failed:', err)
        alert(`导入失败：${err.message}`)
      }
      // Reset file input
      event.target.value = ''
    }
    reader.readAsText(file)
  }

  if (!authenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />
  }

  return (
    <div className="app-container">
      <header style={{
        padding: '1rem',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(255,255,255,0.8)',
        backdropFilter: 'blur(10px)',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--color-primary-dark)' }}>
          宝宝成长记录
        </h1>
        <nav style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className={`btn ${view === 'form' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setView('form')}
          >
            新记录
          </button>
          <button
            className={`btn ${view === 'history' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setView('history')}
          >
            历史记录
          </button>
          <div style={{ position: 'relative' }}>
            <button
              className="btn btn-secondary"
              onClick={() => setShowMenu(!showMenu)}
              title="更多选项"
            >
              ⚙️ 更多
            </button>
            {showMenu && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '0.5rem',
                background: 'white',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                border: '1px solid #e2e8f0',
                minWidth: '120px',
                zIndex: 20,
                overflow: 'hidden'
              }}>
                <button
                  onClick={() => { handleExport(); setShowMenu(false) }}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '0.75rem 1rem',
                    textAlign: 'left',
                    background: 'none',
                    border: 'none',
                    borderBottom: '1px solid #edf2f7',
                    cursor: 'pointer',
                    color: '#4a5568',
                    fontSize: '0.9rem'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#f7fafc'}
                  onMouseLeave={(e) => e.target.style.background = 'none'}
                >
                  📥 导出数据
                </button>
                <button
                  onClick={() => { handleImportClick(); setShowMenu(false) }}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '0.75rem 1rem',
                    textAlign: 'left',
                    background: 'none',
                    border: 'none',
                    borderBottom: '1px solid #edf2f7',
                    cursor: 'pointer',
                    color: '#4a5568',
                    fontSize: '0.9rem'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#f7fafc'}
                  onMouseLeave={(e) => e.target.style.background = 'none'}
                >
                  📤 导入数据
                </button>
                <button
                  onClick={() => { handleLogout(); setShowMenu(false) }}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '0.75rem 1rem',
                    textAlign: 'left',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#e53e3e',
                    fontSize: '0.9rem'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#fff5f5'}
                  onMouseLeave={(e) => e.target.style.background = 'none'}
                >
                  🚪 退出登录
                </button>
              </div>
            )}
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: 'none' }}
            accept=".json"
          />
        </nav>
      </header>

      <main className="container">
        {view === 'form' ? (
          <DailyLogForm
            onSave={saveLog}
            onUpdate={updateLog}
            lastLog={logs[0]}
            editingLog={editingLog}
            onCancelEdit={() => setEditingLog(null)}
          />
        ) : (
          <LogHistory logs={logs} onDelete={deleteLog} onEdit={handleEdit} />
        )}
      </main>
    </div>
  )
}

export default App
