import { BadRequestError } from "../errors/index.js";

/**
 * Format sequence number to standard public problem ID format (e.g. ABH-0001)
 * Pads to a minimum of 4 digits, but does not truncate if seq >= 10000 (e.g. ABH-10000).
 *
 * @param {number} seq
 * @returns {string}
 */
export function formatProblemId(seq) {
    return `ABH-${String(seq).padStart(4, '0')}`;
}

/**
 * Check if a string matches the public problem ID format (e.g. ABH-0001, abh-1234)
 *
 * @param {string} id
 * @returns {boolean}
 */
export function isPublicProblemId(id) {
    if (typeof id !== 'string') return false;
    return /^ABH-\d+$/i.test(id.trim());
}

/**
 * Escape special regex characters in user-provided search strings
 *
 * @param {string} text
 * @returns {string}
 */
export function escapeRegex(text) {
    if (typeof text !== 'string') return '';
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

/**
 * Validate and normalize topics:
 * - Must be an array
 * - Max 20 topics
 * - Each topic must be a non-empty string <= 50 characters
 * - Trim whitespace
 * - Deduplicate case-insensitively, preserving original casing of first appearance
 *
 * @param {any} topics
 * @returns {string[]}
 */
export function validateAndNormalizeTopics(topics) {
    if (!Array.isArray(topics)) {
        throw new BadRequestError('topics', {
            reason: 'Topics must be an array of strings'
        });
    }

    if (topics.length > 20) {
        throw new BadRequestError('topics', {
            reason: 'Cannot exceed 20 topics per problem'
        });
    }

    const seen = new Set();
    const normalized = [];

    for (let i = 0; i < topics.length; i++) {
        const raw = topics[i];

        if (typeof raw !== 'string') {
            throw new BadRequestError(`topics[${i}]`, {
                reason: 'Each topic must be a string'
            });
        }

        const trimmed = raw.trim();

        if (trimmed.length === 0) {
            throw new BadRequestError(`topics[${i}]`, {
                reason: 'Topic string cannot be empty'
            });
        }

        if (trimmed.length > 50) {
            throw new BadRequestError(`topics[${i}]`, {
                reason: 'Topic string cannot exceed 50 characters'
            });
        }

        const lower = trimmed.toLowerCase();
        if (seen.has(lower)) {
            // Case-insensitive duplicate detected - skip subsequent duplicate
            continue;
        }

        seen.add(lower);
        normalized.push(trimmed);
    }

    return normalized;
}
