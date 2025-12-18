import { useState } from 'react'

export default function LogHistory({ logs, onDelete, onEdit }) {
    const [expandedId, setExpandedId] = useState(null)

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id)
    }

    if (logs.length === 0) {
        return (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
                <h3 style={{ color: 'var(--color-text-sub)' }}>暂无记录</h3>
                <p style={{ color: 'var(--color-text-sub)', marginTop: '0.5rem' }}>
                    点击“新记录”开始添加吧！
                </p>
            </div>
        )
    }

    return (
        <div className="history-list">
            {logs.map(log => (
                <div key={log.id} className="card" style={{ padding: '0', overflow: 'hidden' }}>
                    <div
                        onClick={() => toggleExpand(log.id)}
                        style={{
                            padding: '1rem',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: expandedId === log.id ? 'var(--color-bg)' : 'white'
                        }}
                    >
                        <div>
                            <div style={{ fontWeight: '600', fontSize: '1.1rem' }}>{log.date}</div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--color-text-sub)' }}>
                                {log.stats?.height && `${log.stats.height}cm `}
                                {log.stats?.weight && `• ${log.stats.weight}kg `}
                                {log.stats?.mood && `• ${log.stats.mood}`}
                            </div>
                        </div>
                        <div style={{ transform: expandedId === log.id ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
                            ▼
                        </div>
                    </div>

                    {expandedId === log.id && (
                        <div style={{ padding: '1rem', borderTop: '1px solid var(--color-border)' }}>
                            {/* Summary View of the day */}
                            <div style={{ marginBottom: '1rem' }}>
                                <strong>总结:</strong> {log.summary || '无'}
                            </div>

                            <div className="grid-2">
                                <div>
                                    <h4 className="label">喂养</h4>
                                    <ul style={{ paddingLeft: '1rem', fontSize: '0.9rem' }}>
                                        {(log.feedings || []).filter(f => f.time).map((f, i) => (
                                            <li key={i}>
                                                {f.time} -
                                                {f.breastMl ? ` 母乳:${f.breastMl}ml` : <>
                                                    {f.breastL && ` 左:${f.breastL}分`}
                                                    {f.breastR && ` 右:${f.breastR}分`}
                                                </>}
                                                {f.formula && ` ${f.formula}勺`}
                                                {f.solidsFood && ` (${f.solidsFood})`}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="label">睡眠</h4>
                                    <ul style={{ paddingLeft: '1rem', fontSize: '0.9rem' }}>
                                        {(log.sleeps || []).filter(s => s.start).map((s, i) => (
                                            <li key={i}>{s.start} - {s.end}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {log.diapers && log.diapers.some(d => d.time) && (
                                <div style={{ marginTop: '1rem' }}>
                                    <h4 className="label">大便</h4>
                                    <ul style={{ paddingLeft: '1rem', fontSize: '0.9rem' }}>
                                        {log.diapers.filter(d => d.time).map((d, i) => (
                                            <li key={i}>{d.time} - {d.notes || '无备注'}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {/* Action Buttons */}
                            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEdit(log);
                                    }}
                                    style={{
                                        background: 'none',
                                        border: '1px solid #1890ff',
                                        color: '#1890ff',
                                        padding: '0.5rem 1rem',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    ✏️ 编辑
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete(log.id);
                                    }}
                                    style={{
                                        background: 'none',
                                        border: '1px solid #ff4d4f',
                                        color: '#ff4d4f',
                                        padding: '0.5rem 1rem',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    🗑️ 删除记录
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
}
