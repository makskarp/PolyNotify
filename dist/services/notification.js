"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const i18n_1 = require("../i18n");
const date_1 = require("../utils/date");
class NotificationService {
    constructor(bot) {
        this.bot = bot;
    }
    async sendTradeNotification(userId, trade) {
        const sideEmoji = trade.side === 'BUY' ? '🟢' : '🔴';
        const price = trade.price.toFixed(2);
        const size = trade.size.toFixed(2);
        const value = (trade.price * trade.size).toFixed(2);
        const marketUrl = `https://polymarket.com/event/${trade.eventSlug}`;
        const time = (0, date_1.formatTimeUTC)(trade.timestamp);
        const message = [
            (0, i18n_1.format)(i18n_1.t.notification.new_trade, { emoji: sideEmoji }),
            '',
            (0, i18n_1.format)(i18n_1.t.notification.market, { title: trade.title, url: marketUrl }),
            (0, i18n_1.format)(i18n_1.t.notification.outcome, { outcome: trade.outcome }),
            (0, i18n_1.format)(i18n_1.t.notification.side, { side: trade.side }),
            (0, i18n_1.format)(i18n_1.t.notification.price, { price }),
            (0, i18n_1.format)(i18n_1.t.notification.size, { size, value }),
            (0, i18n_1.format)(i18n_1.t.notification.time, { time }),
        ].join('\n');
        try {
            await this.bot.api.sendMessage(Number(userId), message, {
                parse_mode: 'Markdown',
                link_preview_options: { is_disabled: true },
            });
        }
        catch (err) {
            console.error(`Failed to send message to user ${userId}:`, err);
        }
    }
}
exports.NotificationService = NotificationService;
