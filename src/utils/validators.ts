/**
 * Validates if the given string is a valid EVM address.
 * @param address The address string to validate.
 * @returns True if valid, false otherwise.
 */
export const isValidEvmAddress = (address: string): boolean => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
};
