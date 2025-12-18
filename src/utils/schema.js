export const DEFAULT_LOG_SCHEMA = {
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
        teeth: false
    },
    specialCare: {
        eczema: '',
        redButt: '',
        diarrhea: '',
        other: ''
    }
}

/**
 * Merges a log object with the default schema to ensure all fields exist.
 * @param {Object} log - The log object to normalize.
 * @returns {Object} - The normalized log object.
 */
export const normalizeLog = (log) => {
    if (!log) return JSON.parse(JSON.stringify(DEFAULT_LOG_SCHEMA));

    // Deep merge helper could be used here, but for now we'll do a shallow merge of top-level objects
    // and specific nested objects that are critical.
    // A robust solution would use a library like lodash.merge, but we want to keep it simple and dependency-free.

    const normalized = { ...DEFAULT_LOG_SCHEMA, ...log };

    // Ensure nested objects exist and have their default properties
    normalized.stats = { ...DEFAULT_LOG_SCHEMA.stats, ...(log.stats || {}) };
    normalized.supplements = { ...DEFAULT_LOG_SCHEMA.supplements, ...(log.supplements || {}) };

    // For deeply nested objects like health, development, care, specialCare
    normalized.health = { ...DEFAULT_LOG_SCHEMA.health, ...(log.health || {}) };
    if (log.health) {
        normalized.health.skin = { ...DEFAULT_LOG_SCHEMA.health.skin, ...(log.health.skin || {}) };
        normalized.health.respiratory = { ...DEFAULT_LOG_SCHEMA.health.respiratory, ...(log.health.respiratory || {}) };
        normalized.health.other = { ...DEFAULT_LOG_SCHEMA.health.other, ...(log.health.other || {}) };
    }

    normalized.development = { ...DEFAULT_LOG_SCHEMA.development, ...(log.development || {}) };
    if (log.development) {
        normalized.development.motor = { ...DEFAULT_LOG_SCHEMA.development.motor, ...(log.development.motor || {}) };
        normalized.development.fineMotor = { ...DEFAULT_LOG_SCHEMA.development.fineMotor, ...(log.development.fineMotor || {}) };
        normalized.development.language = { ...DEFAULT_LOG_SCHEMA.development.language, ...(log.development.language || {}) };
    }

    normalized.care = { ...DEFAULT_LOG_SCHEMA.care, ...(log.care || {}) };
    normalized.specialCare = { ...DEFAULT_LOG_SCHEMA.specialCare, ...(log.specialCare || {}) };

    // Ensure arrays exist (we don't merge arrays, we just ensure they are arrays)
    if (!Array.isArray(normalized.feedings)) normalized.feedings = DEFAULT_LOG_SCHEMA.feedings;
    if (!Array.isArray(normalized.sleeps)) normalized.sleeps = DEFAULT_LOG_SCHEMA.sleeps;
    if (!Array.isArray(normalized.diapers)) normalized.diapers = DEFAULT_LOG_SCHEMA.diapers;

    return normalized;
}
