import cron from 'node-cron';
import { WalletService } from './wallet';
import { PolymarketService } from './polymarket';
import { NotificationService } from './notification';
import { Wallet, User } from '@prisma/client';

type WalletWithUser = Wallet & { user: User };

export class PollingService {
    constructor(private notificationService: NotificationService) { }

    start() {
        console.log('🕒 Polling service started...');

        // Run every minute
        cron.schedule('* * * * *', async () => {
            console.log('🔄 Checking for new trades...');
            await this.checkAllWallets();
        });
    }

    private async checkAllWallets() {
        try {
            const wallets = await WalletService.getAllWalletsWithUser();

            for (const wallet of wallets) {
                await this.processWallet(wallet);
                // Rate limiting: Wait 1 second between requests
                await new Promise((resolve) => setTimeout(resolve, 1000));
            }
        } catch (err) {
            console.error('Error in polling loop:', err);
        }
    }

    private async processWallet(wallet: WalletWithUser) {
        try {
            const trades = await PolymarketService.getLatestTrades(wallet.address, 5);

            if (trades.length === 0) return;

            // Filter for new trades
            const newTrades = trades.filter((trade) => {
                const tradeDate = new Date(trade.timestamp * 1000);
                return !wallet.lastFillDate || tradeDate > wallet.lastFillDate;
            });

            if (newTrades.length === 0) return;

            // Sort by time ascending (oldest first)
            newTrades.sort((a, b) => a.timestamp - b.timestamp);

            for (const trade of newTrades) {
                await this.notificationService.sendTradeNotification(wallet.user.id, trade);
            }

            // Update last fill date
            const latestTrade = newTrades[newTrades.length - 1];
            await WalletService.updateLastFillDate(wallet.id, new Date(latestTrade.timestamp * 1000));

        } catch (err) {
            console.error(`Error processing wallet ${wallet.address}:`, err);
        }
    }
}
