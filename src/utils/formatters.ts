/**
 * Formats an EVM address to a shortened string.
 * @param address The full EVM address.
 * @returns The shortened address (e.g., "0x1234...5678").
 */
export const formatAddress = (address: string): string => {
    if (address.length < 10) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
};
