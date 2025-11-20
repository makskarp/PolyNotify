"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bot_1 = require("./bot");
const polling_1 = require("./services/polling");
const notification_1 = require("./services/notification");
async function main() {
    console.log('� Starting Polynotify...');
    const bot = (0, bot_1.createBot)();
    const notificationService = new notification_1.NotificationService(bot);
    const pollingService = new polling_1.PollingService(notificationService);
    // Start services
    pollingService.start();
    console.log('🤖 Bot is running...');
    await bot.start();
}
main().catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
});
