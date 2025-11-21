import { createBot } from './bot';
import { PollingService } from './services/polling';
import { NotificationService } from './services/notification';
import http from 'http';

const PORT = process.env.PORT || 3000;
async function main() {
    console.log('� Starting Polynotify...');

    const bot = createBot();
    const notificationService = new NotificationService(bot);
    const pollingService = new PollingService(notificationService);

    // Start services
    pollingService.start();

    // Start simple HTTP server for health checks (required for Render Web Services)
    http.createServer((req, res) => {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Polynotify Bot is running');
    }).listen(PORT, () => {
        console.log(`🌍 Health check server listening on port ${PORT}`);
    });

    console.log('🤖 Bot is running...');
    await bot.start();
}

main().catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
});
