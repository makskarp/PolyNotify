"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidEvmAddress = void 0;
/**
 * Validates if the given string is a valid EVM address.
 * @param address The address string to validate.
 * @returns True if valid, false otherwise.
 */
const isValidEvmAddress = (address) => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
};
exports.isValidEvmAddress = isValidEvmAddress;
