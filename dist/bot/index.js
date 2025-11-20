"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBot = void 0;
const grammy_1 = require("grammy");
const env_1 = require("../config/env");
const prisma_1 = __importDefault(require("../core/prisma"));
const start_1 = require("./handlers/start");
const wallet_1 = require("./handlers/wallet");
const i18n_1 = require("../i18n");
const main_1 = require("./menus/main");
const createBot = () => {
    const bot = new grammy_1.Bot(env_1.config.BOT_TOKEN);
    // Middleware
    bot.use((0, grammy_1.session)({ initial: () => ({ step: 'idle' }) }));
    // Commands
    bot.command('start', start_1.startHandler);
    // Menus
    bot.hears(i18n_1.t.menu.add_wallet, wallet_1.addWalletHandler);
    bot.hears(i18n_1.t.menu.my_wallets, wallet_1.listWalletsHandler);
    bot.hears(i18n_1.t.menu.help, async (ctx) => {
        ctx.session.step = 'idle';
        await ctx.reply(i18n_1.t.help, { parse_mode: 'Markdown' });
    });
    // Inputs
    bot.on('message:text', async (ctx, next) => {
        if (ctx.session.step === 'waiting_for_label') {
            await (0, wallet_1.walletLabelHandler)(ctx);
        }
        else if (ctx.session.step === 'waiting_for_edit_label') {
            await (0, wallet_1.walletEditLabelInputHandler)(ctx);
        }
        else {
            await (0, wallet_1.walletInputHandler)(ctx);
        }
    });
    // Callbacks
    bot.callbackQuery(/^wallet_detail:(\d+)$/, async (ctx) => {
        const walletId = Number(ctx.match[1]);
        await (0, wallet_1.walletDetailCallback)(ctx, walletId);
    });
    bot.callbackQuery(/^wallet_edit:(\d+)$/, async (ctx) => {
        const walletId = Number(ctx.match[1]);
        await (0, wallet_1.walletEditLabelCallback)(ctx, walletId);
    });
    bot.callbackQuery(/^wallet_delete_confirm:(\d+)$/, async (ctx) => {
        const walletId = Number(ctx.match[1]);
        await (0, wallet_1.walletDeleteConfirmCallback)(ctx, walletId);
    });
    bot.callbackQuery(/^wallet_delete:(\d+)$/, async (ctx) => {
        const walletId = Number(ctx.match[1]);
        await (0, wallet_1.walletDeleteCallback)(ctx, walletId);
    });
    bot.callbackQuery('wallet_list_back', wallet_1.listWalletsHandler);
    bot.callbackQuery('main_menu_return', async (ctx) => {
        await ctx.answerCallbackQuery();
        await ctx.deleteMessage().catch(() => { });
        if (!ctx.from)
            return;
        // Check if user has any wallets
        const count = await prisma_1.default.wallet.count({
            where: { userId: ctx.from.id }
        });
        const message = count > 0 ? i18n_1.t.wallet.all_set : i18n_1.t.wallet.main_menu_empty;
        await ctx.reply(message, {
            parse_mode: 'Markdown',
            reply_markup: main_1.mainMenu
        });
    });
    // Error handling
    bot.catch((err) => {
        console.error('Error in bot:', err);
    });
    return bot;
};
exports.createBot = createBot;
