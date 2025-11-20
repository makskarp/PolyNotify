"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PolymarketService = void 0;
const axios_1 = __importDefault(require("axios"));
class PolymarketService {
    /**
     * Fetches the latest trades for a given user address.
     * @param address EVM address
     * @param limit Number of trades to fetch
     * @returns List of trades
     */
    static async getLatestTrades(address, limit = 10) {
        try {
            const response = await axios_1.default.get(`${this.BASE_URL}/trades`, {
                params: {
                    user: address,
                    limit: limit.toString(),
                    offset: '0',
                    takerOnly: 'false',
                },
            });
            return response.data;
        }
        catch (error) {
            console.error(`Error fetching trades for ${address}:`, error);
            return [];
        }
    }
}
exports.PolymarketService = PolymarketService;
PolymarketService.BASE_URL = 'https://data-api.polymarket.com';
