"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const bot_1 = require("../bot");
const polling_1 = require("../services/polling");
const notification_1 = require("../services/notification");
// Initialize services outside handler to reuse connections if possible
const bot = (0, bot_1.createBot)();
const notificationService = new notification_1.NotificationService(bot);
const pollingService = new polling_1.PollingService(notificationService);
// AWS Lambda handler for Scheduled Event (Cron)
const handler = async () => {
    console.log('⏰ Cron Lambda triggered');
    await pollingService.runOnce();
    console.log('✅ Cron execution finished');
};
exports.handler = handler;
