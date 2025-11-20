"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatDateUTC = exports.formatTimeUTC = void 0;
/**
 * Formats a timestamp (in seconds or ms) to a readable UTC string.
 * @param timestamp Unix timestamp in seconds or milliseconds
 * @returns Formatted string (e.g., "12:34:56 PM UTC")
 */
const formatTimeUTC = (timestamp) => {
    const ms = timestamp > 10000000000 ? timestamp : timestamp * 1000;
    return new Date(ms).toLocaleTimeString('en-US', {
        timeZone: 'UTC',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short',
    });
};
exports.formatTimeUTC = formatTimeUTC;
/**
 * Formats a date to a readable UTC string.
 * @param date Date object
 * @returns Formatted string
 */
const formatDateUTC = (date) => {
    return date.toLocaleDateString('en-US', {
        timeZone: 'UTC',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};
exports.formatDateUTC = formatDateUTC;
