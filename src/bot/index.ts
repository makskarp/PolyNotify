import { Bot, session } from 'grammy';
import { config } from '../config/env';
import { MyContext, SessionData } from './context';
import prisma from '../core/prisma';
import { startHandler } from './handlers/start';
import {
    addWalletHandler,
    listWalletsHandler,
    walletInputHandler,
    walletLabelHandler,
    walletDetailCallback,
    walletEditLabelCallback,
    walletEditLabelInputHandler,
    walletDeleteConfirmCallback,
    walletDeleteCallback
} from './handlers/wallet';
import { t } from '../i18n';
import { mainMenu } from './menus/main';

export const createBot = () => {
    const bot = new Bot<MyContext>(config.BOT_TOKEN);

    // Middleware
    bot.use(session({ initial: (): SessionData => ({ step: 'idle' }) }));

    // Commands
    bot.command('start', startHandler);

    // Menus
    bot.hears(t.menu.add_wallet, addWalletHandler);
    bot.hears(t.menu.my_wallets, listWalletsHandler);
    bot.hears(t.menu.help, async (ctx) => {
        ctx.session.step = 'idle';
        await ctx.reply(t.help, { parse_mode: 'Markdown' });
    });

    // Inputs
    bot.on('message:text', async (ctx, next) => {
        if (ctx.session.step === 'waiting_for_label') {
            await walletLabelHandler(ctx);
        } else if (ctx.session.step === 'waiting_for_edit_label') {
            await walletEditLabelInputHandler(ctx);
        } else {
            await walletInputHandler(ctx);
        }
    });

    // Callbacks
    bot.callbackQuery(/^wallet_detail:(\d+)$/, async (ctx) => {
        const walletId = Number(ctx.match[1]);
        await walletDetailCallback(ctx, walletId);
    });

    bot.callbackQuery(/^wallet_edit:(\d+)$/, async (ctx) => {
        const walletId = Number(ctx.match[1]);
        await walletEditLabelCallback(ctx, walletId);
    });

    bot.callbackQuery(/^wallet_delete_confirm:(\d+)$/, async (ctx) => {
        const walletId = Number(ctx.match[1]);
        await walletDeleteConfirmCallback(ctx, walletId);
    });

    bot.callbackQuery(/^wallet_delete:(\d+)$/, async (ctx) => {
        const walletId = Number(ctx.match[1]);
        await walletDeleteCallback(ctx, walletId);
    });

    bot.callbackQuery('wallet_list_back', listWalletsHandler);

    bot.callbackQuery('main_menu_return', async (ctx) => {
        await ctx.answerCallbackQuery();
        await ctx.deleteMessage().catch(() => { });

        if (!ctx.from) return;

        // Check if user has any wallets
        const count = await prisma.wallet.count({
            where: { userId: ctx.from.id }
        });

        const message = count > 0 ? t.wallet.all_set : t.wallet.main_menu_empty;

        await ctx.reply(message, {
            parse_mode: 'Markdown',
            reply_markup: mainMenu
        });
    });

    // Error handling
    bot.catch((err) => {
        console.error('Error in bot:', err);
    });

    return bot;
};
