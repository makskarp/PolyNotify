import { createBot } from './bot';
import { PollingService } from './services/polling';
import { NotificationService } from './services/notification';

async function main() {
    console.log('� Starting Polynotify...');

    const bot = createBot();
    const notificationService = new NotificationService(bot);
    const pollingService = new PollingService(notificationService);

    // Start services
    pollingService.start();
    console.log('🤖 Bot is running...');
    await bot.start();
}

main().catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
});
