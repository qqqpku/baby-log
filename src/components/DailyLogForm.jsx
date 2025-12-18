import { useState, useEffect } from 'react'

const DEFAULT_LOG_SCHEMA = {
    id: '',
    date: '',
    createdAt: '',
    summary: '',
    stats: {
        height: '',
        weight: '',
        temp: '',
        mood: ''
    },
    feedings: Array(6).fill({
        time: '',
        breastL: '',
        breastR: '',
        breastMl: '',
        formula: '',
        solidsTime: '',
        solidsFood: ''
    }),
    sleeps: Array(4).fill({
        start: '',
        end: ''
    }),
    diapers: Array(6).fill({
        time: '',
        notes: ''
    }),
    supplements: {
        ad: false,
        d3: false,
        dha: false,
        calcium: false,
        iron: false,
        probiotics: false,
        lactase: false
    },
    health: {
        skin: { none: true, redness: false, eczema: false, rash: false, allergy: false },
        respiratory: { none: true, cough: false, congestion: false, runnyNose: false, sneeze: false },
        other: { none: true, cry: false, refuseFood: false, vomit: false, retch: false }
    },
    development: {
        motor: { sit: false, stand: false, crawl: false, walk: false },
        fineMotor: { grasp: false, pass: false, oppose: false, pushPull: false },
        language: { pronounce: false, understand: false, interact: false }
    },
    care: {
        washHands: false,
        washFace: false,
        bath: false,
        nails: false,
        oral: false,
        nose: false,
        teeth: false,
        swimming: false
    },
    specialCare: {
        eczema: '',
        redButt: '',
        diarrhea: '',
        other: ''
    }
}

const TRANSLATIONS = {
    supplements: { ad: 'AD', d3: 'D3', dha: 'DHA', calcium: '钙', iron: '铁', probiotics: '益生菌', lactase: '乳糖酶' },
    care: { washHands: '洗手', washFace: '洗脸', bath: '洗澡', nails: '剪指甲', oral: '口腔清洁', nose: '鼻腔清洁', teeth: '牙齿清洁', swimming: '游泳' },
    motor: { sit: '坐', stand: '站', crawl: '爬', walk: '走' },
    fineMotor: { grasp: '抓握', pass: '传递', oppose: '对捏', pushPull: '推拉' },
    language: { pronounce: '发音练习', understand: '语言理解', interact: '互动交流' }
}

export default function DailyLogForm({ onSave, onUpdate, lastLog, editingLog, onCancelEdit }) {
    const [formData, setFormData] = useState(() => {
        try {
            const initialData = JSON.parse(JSON.stringify(DEFAULT_LOG_SCHEMA))

            // Auto-fill times from last log if available
            if (lastLog) {
                if (lastLog.feedings && Array.isArray(lastLog.feedings)) {
                    initialData.feedings = lastLog.feedings.map((f, i) => ({
                        ...initialData.feedings[i], // Keep structure
                        time: f.time || '' // Copy time only
                    }))
                }
                if (lastLog.sleeps && Array.isArray(lastLog.sleeps)) {
                    initialData.sleeps = lastLog.sleeps.map((s, i) => ({
                        ...initialData.sleeps[i],
                        start: s.start || '',
                        end: s.end || ''
                    }))
                }
            }

            // Auto-fill height/weight from last log
            if (lastLog && lastLog.stats) {
                initialData.stats.height = lastLog.stats.height || ''
                initialData.stats.weight = lastLog.stats.weight || ''
            }

            return initialData
        } catch (e) {
            console.error('Failed to parse schema', e)
            return {}
        }
    })

    useEffect(() => {
        const today = new Date().toISOString().split('T')[0]
        setFormData(prev => ({ ...prev, date: today }))
    }, [])

    // Load editing log data when editingLog changes
    useEffect(() => {
        if (editingLog) {
            // Separate user notes from auto-generated summary
            const loadedData = { ...editingLog }
            if (loadedData.summary) {
                // Extract user notes (everything before the stats line)
                // Stats line format: "\n(总母乳: ..." or just "(总母乳: ..." if no user notes
                const statsPattern = /\n?\(总母乳:/
                const match = loadedData.summary.match(statsPattern)
                if (match) {
                    loadedData.summary = loadedData.summary.substring(0, match.index)
                }
            }
            setFormData(loadedData)
        }
    }, [editingLog])

    const handleChange = (section, field, value, index = null, subField = null) => {
        setFormData(prev => {
            const newData = { ...prev }
            if (section === 'root') {
                newData[field] = value
            } else if (Array.isArray(newData[section])) {
                const newArray = [...newData[section]]
                newArray[index] = { ...newArray[index], [field]: value }
                newData[section] = newArray
            } else if (subField) {
                newData[section] = {
                    ...newData[section],
                    [field]: { ...newData[section][field], [subField]: value }
                }
            } else {
                newData[section] = { ...newData[section], [field]: value }
            }
            return newData
        })
    }

    const calculateSleepDuration = () => {
        if (!formData?.sleeps) return '0小时0分钟'
        let totalMinutes = 0
        formData.sleeps.forEach(s => {
            if (s.start && s.end) {
                try {
                    const start = new Date(`2000/01/01 ${s.start}`)
                    const end = new Date(`2000/01/01 ${s.end}`)
                    let diff = (end - start) / 1000 / 60
                    if (diff < 0) diff += 24 * 60
                    if (!isNaN(diff)) totalMinutes += diff
                } catch (e) {
                    console.error('Error calculating sleep', e)
                }
            }
        })
        return `${Math.floor(totalMinutes / 60)}小时${totalMinutes % 60}分钟`
    }
    const totalSleep = calculateSleepDuration()

    const handleSubmit = (e) => {
        e.preventDefault()

        // Calculate totals for summary
        const totalBreast = formData.feedings?.reduce((acc, curr) => acc + (Number(curr.breastL) || 0) + (Number(curr.breastR) || 0), 0) || 0
        const totalBreastMl = formData.feedings?.reduce((acc, curr) => acc + (Number(curr.breastMl) || 0), 0) || 0
        const totalFormula = formData.feedings?.reduce((acc, curr) => acc + (Number(curr.formula) || 0), 0) || 0

        let statsSummary = ''
        if (totalBreast > 0) statsSummary += `总母乳: ${totalBreast}分钟, `
        if (totalBreastMl > 0) statsSummary += `总瓶喂: ${totalBreastMl}ml, `

        statsSummary += `总米粉: ${totalFormula}勺, 总睡眠: ${totalSleep}`
        // Always use trimmed user notes (no old stats) and append fresh stats
        const userNotes = formData.summary ? formData.summary.trim() : ''
        const finalSummary = userNotes ? `${userNotes}\n(${statsSummary})` : `(${statsSummary})`

        if (editingLog) {
            // Update existing log
            onUpdate({
                ...formData,
                summary: finalSummary
            })
        } else {
            // Create new log
            const safeId = Date.now().toString(36) + Math.random().toString(36).substr(2)
            onSave({
                ...formData,
                summary: finalSummary,
                id: safeId,
                createdAt: new Date().toISOString()
            })
        }
    }

    if (!formData) return <div>Loading...</div>

    return (
        <form onSubmit={handleSubmit} className="log-form">
            {/* Header Section */}
            <div className="card">
                <div className="section-title">📅 基本信息</div>
                <div className="grid-2">
                    <div className="input-group">
                        <label className="label">日期</label>
                        <input
                            type="date"
                            className="input"
                            value={formData.date || ''}
                            onChange={e => handleChange('root', 'date', e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-group">
                        <label className="label">身高 (cm)</label>
                        <input
                            type="number"
                            step="0.1"
                            className="input"
                            placeholder="0.0"
                            value={formData.stats?.height || ''}
                            onChange={e => handleChange('stats', 'height', e.target.value)}
                        />
                        {lastLog?.stats?.height && !formData.stats?.height && <div style={{ fontSize: '0.8rem', color: 'var(--color-text-sub)', marginTop: '0.2rem' }}>上次记录: {lastLog.stats.height}cm ({lastLog.date})</div>}
                        {lastLog?.stats?.height && formData.stats?.height === lastLog.stats.height && <div style={{ fontSize: '0.8rem', color: 'var(--color-text-sub)', marginTop: '0.2rem' }}>上次更新: {lastLog.date}</div>}
                    </div>
                    <div className="input-group">
                        <label className="label">体重 (kg)</label>
                        <input
                            type="number"
                            step="0.01"
                            className="input"
                            placeholder="0.00"
                            value={formData.stats?.weight || ''}
                            onChange={e => handleChange('stats', 'weight', e.target.value)}
                        />
                        {lastLog?.stats?.weight && !formData.stats?.weight && <div style={{ fontSize: '0.8rem', color: 'var(--color-text-sub)', marginTop: '0.2rem' }}>上次记录: {lastLog.stats.weight}kg ({lastLog.date})</div>}
                        {lastLog?.stats?.weight && formData.stats?.weight === lastLog.stats.weight && <div style={{ fontSize: '0.8rem', color: 'var(--color-text-sub)', marginTop: '0.2rem' }}>上次更新: {lastLog.date}</div>}
                    </div>
                    <div className="input-group">
                        <label className="label">精神状态</label>
                        <input
                            type="text"
                            className="input"
                            placeholder="开心, 烦躁..."
                            value={formData.stats?.mood || ''}
                            onChange={e => handleChange('stats', 'mood', e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Feeding Section */}
            <div className="card">
                <div className="section-title">🍼 喂养记录</div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '500px' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', fontSize: '0.85rem', color: 'var(--color-text-sub)' }}>
                                <th style={{ padding: '0.5rem' }}>时间</th>
                                <th style={{ padding: '0.5rem' }}>母乳 (ml)</th>
                                <th style={{ padding: '0.5rem' }}>米粉 (勺)</th>
                                <th style={{ padding: '0.5rem' }}>辅食</th>
                            </tr>
                        </thead>
                        <tbody>
                            {formData.feedings?.map((row, i) => (
                                <tr key={i} style={{ borderTop: '1px solid var(--color-border)' }}>
                                    <td style={{ padding: '0.5rem' }}>
                                        <input
                                            type="time"
                                            className="input"
                                            style={{ padding: '0.25rem' }}
                                            value={row.time || ''}
                                            onChange={e => handleChange('feedings', 'time', e.target.value, i)}
                                        />
                                    </td>
                                    <td style={{ padding: '0.5rem' }}>
                                        {(row.breastL || row.breastR) ? (
                                            <div style={{ display: 'flex', gap: '4px' }}>
                                                <input
                                                    type="number" className="input" placeholder="左" style={{ padding: '0.25rem' }}
                                                    value={row.breastL || ''} onChange={e => handleChange('feedings', 'breastL', e.target.value, i)}
                                                />
                                                <input
                                                    type="number" className="input" placeholder="右" style={{ padding: '0.25rem' }}
                                                    value={row.breastR || ''} onChange={e => handleChange('feedings', 'breastR', e.target.value, i)}
                                                />
                                            </div>
                                        ) : (
                                            <input
                                                type="number" className="input" placeholder="瓶喂(ml)" style={{ padding: '0.25rem' }}
                                                value={row.breastMl || ''} onChange={e => handleChange('feedings', 'breastMl', e.target.value, i)}
                                            />
                                        )}
                                    </td>
                                    <td style={{ padding: '0.5rem' }}>
                                        <input
                                            type="number" className="input" style={{ padding: '0.25rem' }}
                                            value={row.formula || ''} onChange={e => handleChange('feedings', 'formula', e.target.value, i)}
                                        />
                                    </td>
                                    <td style={{ padding: '0.5rem' }}>
                                        <input
                                            type="text" className="input" placeholder="食物" style={{ padding: '0.25rem' }}
                                            value={row.solidsFood || ''} onChange={e => handleChange('feedings', 'solidsFood', e.target.value, i)}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Sleep & Diaper Grid */}
            <div className="grid-2" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
                {/* Sleep */}
                <div className="card">
                    <div className="section-title">😴 睡眠记录</div>
                    {formData.sleeps?.map((row, i) => (
                        <div key={i} className="flex-center" style={{ gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <input
                                type="time" className="input"
                                value={row.start || ''} onChange={e => handleChange('sleeps', 'start', e.target.value, i)}
                            />
                            <span>-</span>
                            <input
                                type="time" className="input"
                                value={row.end || ''} onChange={e => handleChange('sleeps', 'end', e.target.value, i)}
                            />
                        </div>
                    ))}
                </div>

                {/* Diaper */}
                <div className="card">
                    <div className="section-title">💩 大便记录</div>
                    {formData.diapers?.slice(0, 4).map((row, i) => (
                        <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <input
                                type="time" className="input" style={{ padding: '0.25rem' }}
                                value={row.time || ''} onChange={e => handleChange('diapers', 'time', e.target.value, i)}
                            />
                            <input
                                type="text" className="input" placeholder="备注 (性状/颜色)" style={{ padding: '0.25rem' }}
                                value={row.notes || ''} onChange={e => handleChange('diapers', 'notes', e.target.value, i)}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Supplements & Care */}
            <div className="card">
                <div className="section-title">💊 补剂与护理</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
                    <label className="flex-center" style={{ gap: '0.25rem', cursor: 'pointer' }}>
                        <input type="checkbox" checked={formData.supplements?.ad || false} onChange={e => handleChange('supplements', 'ad', e.target.checked)} />
                        <span style={{ fontSize: '0.9rem' }}>AD</span>
                    </label>
                    <label className="flex-center" style={{ gap: '0.25rem', cursor: 'pointer' }}>
                        <input type="checkbox" checked={formData.supplements?.d3 || false} onChange={e => handleChange('supplements', 'd3', e.target.checked)} />
                        <span style={{ fontSize: '0.9rem' }}>D3</span>
                    </label>
                    <label className="flex-center" style={{ gap: '0.25rem', cursor: 'pointer' }}>
                        <input type="checkbox" checked={formData.supplements?.dha || false} onChange={e => handleChange('supplements', 'dha', e.target.checked)} />
                        <span style={{ fontSize: '0.9rem' }}>DHA</span>
                    </label>
                    <label className="flex-center" style={{ gap: '0.25rem', cursor: 'pointer' }}>
                        <input type="checkbox" checked={formData.supplements?.calcium || false} onChange={e => handleChange('supplements', 'calcium', e.target.checked)} />
                        <span style={{ fontSize: '0.9rem' }}>钙</span>
                    </label>
                    <label className="flex-center" style={{ gap: '0.25rem', cursor: 'pointer' }}>
                        <input type="checkbox" checked={formData.supplements?.iron || false} onChange={e => handleChange('supplements', 'iron', e.target.checked)} />
                        <span style={{ fontSize: '0.9rem' }}>铁</span>
                    </label>
                    <label className="flex-center" style={{ gap: '0.25rem', cursor: 'pointer' }}>
                        <input type="checkbox" checked={formData.supplements?.probiotics || false} onChange={e => handleChange('supplements', 'probiotics', e.target.checked)} />
                        <span style={{ fontSize: '0.9rem' }}>益生菌</span>
                    </label>
                    <label className="flex-center" style={{ gap: '0.25rem', cursor: 'pointer' }}>
                        <input type="checkbox" checked={formData.supplements?.lactase || false} onChange={e => handleChange('supplements', 'lactase', e.target.checked)} />
                        <span style={{ fontSize: '0.9rem' }}>乳糖酶</span>
                    </label>
                </div>
                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
                    <div className="label" style={{ marginBottom: '0.5rem' }}>日常护理</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                        <label className="flex-center" style={{ gap: '0.25rem', cursor: 'pointer' }}>
                            <input type="checkbox" checked={formData.care?.washHands || false} onChange={e => handleChange('care', 'washHands', e.target.checked)} />
                            <span style={{ fontSize: '0.9rem' }}>洗手</span>
                        </label>
                        <label className="flex-center" style={{ gap: '0.25rem', cursor: 'pointer' }}>
                            <input type="checkbox" checked={formData.care?.washFace || false} onChange={e => handleChange('care', 'washFace', e.target.checked)} />
                            <span style={{ fontSize: '0.9rem' }}>洗脸</span>
                        </label>
                        <label className="flex-center" style={{ gap: '0.25rem', cursor: 'pointer' }}>
                            <input type="checkbox" checked={formData.care?.bath || false} onChange={e => handleChange('care', 'bath', e.target.checked)} />
                            <span style={{ fontSize: '0.9rem' }}>洗澡</span>
                        </label>
                        <label className="flex-center" style={{ gap: '0.25rem', cursor: 'pointer' }}>
                            <input type="checkbox" checked={formData.care?.nails || false} onChange={e => handleChange('care', 'nails', e.target.checked)} />
                            <span style={{ fontSize: '0.9rem' }}>剪指甲</span>
                        </label>
                        <label className="flex-center" style={{ gap: '0.25rem', cursor: 'pointer' }}>
                            <input type="checkbox" checked={formData.care?.oral || false} onChange={e => handleChange('care', 'oral', e.target.checked)} />
                            <span style={{ fontSize: '0.9rem' }}>口腔清洁</span>
                        </label>
                        <label className="flex-center" style={{ gap: '0.25rem', cursor: 'pointer' }}>
                            <input type="checkbox" checked={formData.care?.nose || false} onChange={e => handleChange('care', 'nose', e.target.checked)} />
                            <span style={{ fontSize: '0.9rem' }}>鼻腔清洁</span>
                        </label>
                        <label className="flex-center" style={{ gap: '0.25rem', cursor: 'pointer' }}>
                            <input type="checkbox" checked={formData.care?.teeth || false} onChange={e => handleChange('care', 'teeth', e.target.checked)} />
                            <span style={{ fontSize: '0.9rem' }}>牙齿清洁</span>
                        </label>
                        <label className="flex-center" style={{ gap: '0.25rem', cursor: 'pointer' }}>
                            <input type="checkbox" checked={formData.care?.swimming || false} onChange={e => handleChange('care', 'swimming', e.target.checked)} />
                            <span style={{ fontSize: '0.9rem' }}>游泳</span>
                        </label>
                    </div>
                </div>
            </div>

            {/* Development */}
            <div className="card">
                <div className="section-title">🧠 早教/锻炼</div>
                <div className="grid-2">
                    <div>
                        <div className="label">大动作</div>
                        <label style={{ display: 'block', marginBottom: '0.25rem' }}>
                            <input type="checkbox" style={{ marginRight: '0.5rem' }} checked={formData.development?.motor?.sit || false} onChange={e => handleChange('development', 'motor', e.target.checked, null, 'sit')} />
                            <span style={{ fontSize: '0.9rem' }}>坐</span>
                        </label>
                        <label style={{ display: 'block', marginBottom: '0.25rem' }}>
                            <input type="checkbox" style={{ marginRight: '0.5rem' }} checked={formData.development?.motor?.stand || false} onChange={e => handleChange('development', 'motor', e.target.checked, null, 'stand')} />
                            <span style={{ fontSize: '0.9rem' }}>站</span>
                        </label>
                        <label style={{ display: 'block', marginBottom: '0.25rem' }}>
                            <input type="checkbox" style={{ marginRight: '0.5rem' }} checked={formData.development?.motor?.crawl || false} onChange={e => handleChange('development', 'motor', e.target.checked, null, 'crawl')} />
                            <span style={{ fontSize: '0.9rem' }}>爬</span>
                        </label>
                        <label style={{ display: 'block', marginBottom: '0.25rem' }}>
                            <input type="checkbox" style={{ marginRight: '0.5rem' }} checked={formData.development?.motor?.walk || false} onChange={e => handleChange('development', 'motor', e.target.checked, null, 'walk')} />
                            <span style={{ fontSize: '0.9rem' }}>走</span>
                        </label>
                    </div>
                    <div>
                        <div className="label">精细动作/语言社交</div>
                        <label style={{ display: 'block', marginBottom: '0.25rem' }}>
                            <input type="checkbox" style={{ marginRight: '0.5rem' }} checked={formData.development?.fineMotor?.grasp || false} onChange={e => handleChange('development', 'fineMotor', e.target.checked, null, 'grasp')} />
                            <span style={{ fontSize: '0.9rem' }}>抓握</span>
                        </label>
                        <label style={{ display: 'block', marginBottom: '0.25rem' }}>
                            <input type="checkbox" style={{ marginRight: '0.5rem' }} checked={formData.development?.fineMotor?.pass || false} onChange={e => handleChange('development', 'fineMotor', e.target.checked, null, 'pass')} />
                            <span style={{ fontSize: '0.9rem' }}>传递</span>
                        </label>
                        <label style={{ display: 'block', marginBottom: '0.25rem' }}>
                            <input type="checkbox" style={{ marginRight: '0.5rem' }} checked={formData.development?.fineMotor?.oppose || false} onChange={e => handleChange('development', 'fineMotor', e.target.checked, null, 'oppose')} />
                            <span style={{ fontSize: '0.9rem' }}>对捏</span>
                        </label>
                        <label style={{ display: 'block', marginBottom: '0.25rem' }}>
                            <input type="checkbox" style={{ marginRight: '0.5rem' }} checked={formData.development?.fineMotor?.pushPull || false} onChange={e => handleChange('development', 'fineMotor', e.target.checked, null, 'pushPull')} />
                            <span style={{ fontSize: '0.9rem' }}>推拉</span>
                        </label>
                        <label style={{ display: 'block', marginBottom: '0.25rem' }}>
                            <input type="checkbox" style={{ marginRight: '0.5rem' }} checked={formData.development?.language?.pronounce || false} onChange={e => handleChange('development', 'language', e.target.checked, null, 'pronounce')} />
                            <span style={{ fontSize: '0.9rem' }}>发音练习</span>
                        </label>
                        <label style={{ display: 'block', marginBottom: '0.25rem' }}>
                            <input type="checkbox" style={{ marginRight: '0.5rem' }} checked={formData.development?.language?.understand || false} onChange={e => handleChange('development', 'language', e.target.checked, null, 'understand')} />
                            <span style={{ fontSize: '0.9rem' }}>语言理解</span>
                        </label>
                        <label style={{ display: 'block', marginBottom: '0.25rem' }}>
                            <input type="checkbox" style={{ marginRight: '0.5rem' }} checked={formData.development?.language?.interact || false} onChange={e => handleChange('development', 'language', e.target.checked, null, 'interact')} />
                            <span style={{ fontSize: '0.9rem' }}>互动交流</span>
                        </label>
                    </div>
                </div>
            </div>

            {/* Summary */}
            <div className="card">
                <div className="section-title">📝 今日总结</div>

                <div className="grid-2" style={{ marginBottom: '1rem', background: 'var(--color-bg)', padding: '0.5rem', borderRadius: 'var(--radius-md)' }}>
                    <div>
                        <div className="label">总母乳 {formData.feedings?.reduce((acc, curr) => acc + (Number(curr.breastMl) || 0), 0) > 0 ? '(ml)' : '(分钟)'}</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--color-primary-dark)' }}>
                            {formData.feedings?.reduce((acc, curr) => acc + (Number(curr.breastMl) || 0), 0) > 0
                                ? formData.feedings?.reduce((acc, curr) => acc + (Number(curr.breastMl) || 0), 0)
                                : formData.feedings?.reduce((acc, curr) => acc + (Number(curr.breastL) || 0) + (Number(curr.breastR) || 0), 0)
                            }
                            {formData.feedings?.reduce((acc, curr) => acc + (Number(curr.breastMl) || 0), 0) > 0 && formData.feedings?.reduce((acc, curr) => acc + (Number(curr.breastL) || 0) + (Number(curr.breastR) || 0), 0) > 0 && (
                                <span style={{ fontSize: '0.8rem', fontWeight: 'normal' }}> (+{formData.feedings?.reduce((acc, curr) => acc + (Number(curr.breastL) || 0) + (Number(curr.breastR) || 0), 0)}分)</span>
                            )}
                        </div>
                    </div>
                    <div>
                        <div className="label">总米粉 (勺)</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--color-secondary)' }}>
                            {formData.feedings?.reduce((acc, curr) => acc + (Number(curr.formula) || 0), 0) || 0}
                        </div>
                    </div>
                    <div style={{ gridColumn: '1 / -1', marginTop: '0.5rem' }}>
                        <div className="label">总睡眠</div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--color-accent)' }}>
                            {totalSleep}
                        </div>
                    </div>
                </div>

                <div className="input-group">
                    <label className="label">新增食物</label>
                    <input
                        type="text"
                        className="input"
                        placeholder="例如：菠菜..."
                        value={formData.newFood || ''}
                        onChange={e => handleChange('root', 'newFood', e.target.value)}
                    />
                </div>

                <div className="input-group">
                    <label className="label">观察备注</label>
                    <textarea
                        className="input"
                        rows="3"
                        placeholder="一天的总体情况..."
                        value={formData.summary || ''}
                        onChange={e => handleChange('root', 'summary', e.target.value)}
                    />
                </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '1rem', fontSize: '1.1rem' }}>
                    {editingLog ? '更新记录' : '保存记录'}
                </button>
                {editingLog && (
                    <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ padding: '1rem', fontSize: '1.1rem' }}
                        onClick={onCancelEdit}
                    >
                        取消
                    </button>
                )}
            </div>
        </form>
    )
}
