import { Bot } from 'grammy';
import { Trade } from './polymarket';
import { t, format } from '../i18n';
import { formatTimeUTC } from '../utils/date';

export class NotificationService {
    constructor(private bot: Bot<any>) { }

    async sendTradeNotification(userId: bigint, trade: Trade) {
        const sideEmoji = trade.side === 'BUY' ? '🟢' : '🔴';
        const price = trade.price.toFixed(2);
        const size = trade.size.toFixed(2);
        const value = (trade.price * trade.size).toFixed(2);
        const marketUrl = `https://polymarket.com/event/${trade.eventSlug}`;
        const time = formatTimeUTC(trade.timestamp);

        const message = [
            format(t.notification.new_trade, { emoji: sideEmoji }),
            '',
            format(t.notification.market, { title: trade.title, url: marketUrl }),
            format(t.notification.outcome, { outcome: trade.outcome }),
            format(t.notification.side, { side: trade.side }),
            format(t.notification.price, { price }),
            format(t.notification.size, { size, value }),
            format(t.notification.time, { time }),
        ].join('\n');

        try {
            await this.bot.api.sendMessage(Number(userId), message, {
                parse_mode: 'Markdown',
                link_preview_options: { is_disabled: true },
            });
        } catch (err) {
            console.error(`Failed to send message to user ${userId}:`, err);
        }
    }
}
