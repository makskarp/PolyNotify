"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatAddress = void 0;
/**
 * Formats an EVM address to a shortened string.
 * @param address The full EVM address.
 * @returns The shortened address (e.g., "0x1234...5678").
 */
const formatAddress = (address) => {
    if (address.length < 10)
        return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
};
exports.formatAddress = formatAddress;
