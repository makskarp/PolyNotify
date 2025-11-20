import en from './en.json';

export type TranslationKey = keyof typeof en;

// Simple nested key access could be added here if needed, 
// but for now we'll keep it type-safe with top-level keys or specific structure.
// To keep it simple and type-safe, we will export the raw object for now,
// or a helper function.

export const t = en;

export const format = (str: string, args: Record<string, string | number>): string => {
    let formatted = str;
    for (const [key, value] of Object.entries(args)) {
        formatted = formatted.replace(`{${key}}`, String(value));
    }
    return formatted;
};
