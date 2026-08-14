/**
 * Persistence and retention for per-key typing analytics.
 */

export const KEYPRESS_ANALYTICS_STORAGE_KEY = "keypress-analytics";

/** Full per-attempt breakdowns kept for latest / last-5 / last-10 views */
export const MAX_KEYPRESS_ATTEMPTS = 10;

/** Rolling long-term per-key aggregates, including the current month */
export const KEYPRESS_RETENTION_MONTHS = 6;

export const KEYPRESS_ANALYTICS_VERSION = 1 as const;
