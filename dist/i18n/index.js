"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.format = exports.t = void 0;
const en_json_1 = __importDefault(require("./en.json"));
// Simple nested key access could be added here if needed, 
// but for now we'll keep it type-safe with top-level keys or specific structure.
// To keep it simple and type-safe, we will export the raw object for now,
// or a helper function.
exports.t = en_json_1.default;
const format = (str, args) => {
    let formatted = str;
    for (const [key, value] of Object.entries(args)) {
        formatted = formatted.replace(`{${key}}`, String(value));
    }
    return formatted;
};
exports.format = format;
