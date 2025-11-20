import prisma from '../core/prisma';
import { Wallet } from '@prisma/client';
import { PolymarketService } from './polymarket';

export class WalletService {
    /**
     * Creates a new wallet for a user.
     */
    static async addWallet(userId: bigint, address: string, label: string | null, lastFillDate: Date | null): Promise<Wallet> {
        return prisma.wallet.create({
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
    static async initializeWallet(userId: bigint, address: string, label: string | null): Promise<Wallet> {
        // Fetch latest trade to initialize state
        const trades = await PolymarketService.getLatestTrades(address, 1);
        let lastFillDate = new Date();
        if (trades.length > 0) {
            lastFillDate = new Date(trades[0].timestamp * 1000);
        }

        return this.addWallet(userId, address, label, lastFillDate);
    }

    /**
     * Finds a wallet by user ID and address.
     */
    static async findWallet(userId: bigint, address: string): Promise<Wallet | null> {
        return prisma.wallet.findFirst({
            where: { userId, address },
        });
    }

    /**
     * Gets all wallets for a specific user.
     */
    static async getWalletsByUser(userId: bigint): Promise<Wallet[]> {
        return prisma.wallet.findMany({
            where: { userId },
            orderBy: { id: 'asc' },
        });
    }

    /**
     * Gets a wallet by its ID.
     */
    static async getWalletById(id: number): Promise<Wallet | null> {
        return prisma.wallet.findUnique({
            where: { id },
        });
    }

    /**
     * Updates a wallet's label.
     */
    static async updateLabel(id: number, label: string): Promise<Wallet> {
        return prisma.wallet.update({
            where: { id },
            data: { label },
        });
    }

    /**
     * Deletes a wallet by its ID.
     */
    static async deleteWallet(id: number): Promise<Wallet> {
        return prisma.wallet.delete({
            where: { id },
        });
    }

    /**
     * Counts the number of wallets for a user.
     */
    static async countWalletsByUser(userId: bigint): Promise<number> {
        return prisma.wallet.count({
            where: { userId },
        });
    }

    /**
     * Gets all wallets with their associated user data.
     * Used for polling.
     */
    static async getAllWalletsWithUser() {
        return prisma.wallet.findMany({
            include: { user: true },
        });
    }

    /**
     * Updates the last fill date for a wallet.
     */
    static async updateLastFillDate(id: number, date: Date): Promise<Wallet> {
        return prisma.wallet.update({
            where: { id },
            data: { lastFillDate: date },
        });
    }
}
