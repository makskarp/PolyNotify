"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PollingService = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const wallet_1 = require("./wallet");
const polymarket_1 = require("./polymarket");
class PollingService {
    constructor(notificationService) {
        this.notificationService = notificationService;
    }
    start() {
        console.log('🕒 Polling service started...');
        // Run every minute
        node_cron_1.default.schedule('* * * * *', async () => {
            console.log('🔄 Checking for new trades...');
            await this.checkAllWallets();
        });
    }
    async checkAllWallets() {
        try {
            const wallets = await wallet_1.WalletService.getAllWalletsWithUser();
            for (const wallet of wallets) {
                await this.processWallet(wallet);
                // Rate limiting: Wait 1 second between requests
                await new Promise((resolve) => setTimeout(resolve, 1000));
            }
        }
        catch (err) {
            console.error('Error in polling loop:', err);
        }
    }
    async processWallet(wallet) {
        try {
            const trades = await polymarket_1.PolymarketService.getLatestTrades(wallet.address, 20);
            if (trades.length === 0)
                return;
            // Filter for new trades
            const newTrades = trades.filter((trade) => {
                const tradeDate = new Date(trade.timestamp * 1000);
                return !wallet.lastFillDate || tradeDate > wallet.lastFillDate;
            });
            if (newTrades.length === 0)
                return;
            // Sort by time ascending (oldest first)
            newTrades.sort((a, b) => a.timestamp - b.timestamp);
            for (const trade of newTrades) {
                await this.notificationService.sendTradeNotification(wallet.user.id, trade);
            }
            // Update last fill date
            const latestTrade = newTrades[newTrades.length - 1];
            await wallet_1.WalletService.updateLastFillDate(wallet.id, new Date(latestTrade.timestamp * 1000));
        }
        catch (err) {
            console.error(`Error processing wallet ${wallet.address}:`, err);
        }
    }
}
exports.PollingService = PollingService;
