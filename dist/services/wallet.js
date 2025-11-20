"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletService = void 0;
const prisma_1 = __importDefault(require("../core/prisma"));
const polymarket_1 = require("./polymarket");
class WalletService {
    /**
     * Creates a new wallet for a user.
     */
    static async addWallet(userId, address, label, lastFillDate) {
        return prisma_1.default.wallet.create({
            data: {
                userId,
                address,
                label,
                lastFillDate,
            },
        });
    }
    /**
     * Initializes a wallet by fetching the latest trade to determine the last fill date,
     * then adds it to the database.
     */
    static async initializeWallet(userId, address, label) {
        // Fetch latest trade to initialize state
        const trades = await polymarket_1.PolymarketService.getLatestTrades(address, 1);
        let lastFillDate = new Date();
        if (trades.length > 0) {
            lastFillDate = new Date(trades[0].timestamp * 1000);
        }
        return this.addWallet(userId, address, label, lastFillDate);
    }
    /**
     * Finds a wallet by user ID and address.
     */
    static async findWallet(userId, address) {
        return prisma_1.default.wallet.findFirst({
            where: { userId, address },
        });
    }
    /**
     * Gets all wallets for a specific user.
     */
    static async getWalletsByUser(userId) {
        return prisma_1.default.wallet.findMany({
            where: { userId },
            orderBy: { id: 'asc' },
        });
    }
    /**
     * Gets a wallet by its ID.
     */
    static async getWalletById(id) {
        return prisma_1.default.wallet.findUnique({
            where: { id },
        });
    }
    /**
     * Updates a wallet's label.
     */
    static async updateLabel(id, label) {
        return prisma_1.default.wallet.update({
            where: { id },
            data: { label },
        });
    }
    /**
     * Deletes a wallet by its ID.
     */
    static async deleteWallet(id) {
        return prisma_1.default.wallet.delete({
            where: { id },
        });
    }
    /**
     * Counts the number of wallets for a user.
     */
    static async countWalletsByUser(userId) {
        return prisma_1.default.wallet.count({
            where: { userId },
        });
    }
    /**
     * Gets all wallets with their associated user data.
     * Used for polling.
     */
    static async getAllWalletsWithUser() {
        return prisma_1.default.wallet.findMany({
            include: { user: true },
        });
    }
    /**
     * Updates the last fill date for a wallet.
     */
    static async updateLastFillDate(id, date) {
        return prisma_1.default.wallet.update({
            where: { id },
            data: { lastFillDate: date },
        });
    }
}
exports.WalletService = WalletService;
