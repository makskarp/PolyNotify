import axios from 'axios';

export interface Trade {
    proxyWallet: string;
    side: 'BUY' | 'SELL';
    asset: string;
    conditionId: string;
    size: number;
    price: number;
    timestamp: number;
    title: string;
    slug: string;
    icon: string;
    eventSlug: string;
    outcome: string;
    outcomeIndex: number;
    name: string;
    pseudonym: string;
    transactionHash: string;
}

export class PolymarketService {
    private static BASE_URL = 'https://data-api.polymarket.com';

    /**
     * Fetches the latest trades for a given user address.
     * @param address EVM address
     * @param limit Number of trades to fetch
     * @returns List of trades
     */
    static async getLatestTrades(address: string, limit: number = 10): Promise<Trade[]> {
        try {
            const response = await axios.get(`${this.BASE_URL}/trades`, {
                params: {
                    user: address,
                    limit: limit.toString(),
                    offset: '0',
                    takerOnly: 'false',
                },
            });
            return response.data;
        } catch (error) {
            console.error(`Error fetching trades for ${address}:`, error);
            return [];
        }
    }
}
