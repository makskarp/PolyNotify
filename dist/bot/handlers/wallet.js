"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.walletDeleteCallback = exports.walletDeleteConfirmCallback = exports.walletEditLabelInputHandler = exports.walletEditLabelCallback = exports.walletDetailCallback = exports.listWalletsHandler = exports.walletLabelHandler = exports.walletInputHandler = exports.addWalletHandler = void 0;
const grammy_1 = require("grammy");
const wallet_1 = require("../../services/wallet");
const i18n_1 = require("../../i18n");
const validators_1 = require("../../utils/validators");
const formatters_1 = require("../../utils/formatters");
// --- Add Wallet Flow ---
const addWalletHandler = async (ctx) => {
    ctx.session.step = 'waiting_for_wallet';
    await ctx.reply(i18n_1.t.wallet.prompt, { parse_mode: 'Markdown' });
};
exports.addWalletHandler = addWalletHandler;
const walletInputHandler = async (ctx) => {
    if (ctx.session.step !== 'waiting_for_wallet')
        return;
    if (!ctx.message || !ctx.message.text || !ctx.from)
        return;
    const address = ctx.message.text.trim();
    if (!(0, validators_1.isValidEvmAddress)(address)) {
        await ctx.reply(i18n_1.t.wallet.invalid);
        return;
    }
    try {
        const existing = await wallet_1.WalletService.findWallet(BigInt(ctx.from.id), address);
        if (existing) {
            await ctx.reply(i18n_1.t.wallet.exists);
            return;
        }
        // Store address temporarily and ask for label
        ctx.session.tempWalletAddress = address;
        ctx.session.step = 'waiting_for_label';
        await ctx.reply(i18n_1.t.wallet.label_prompt, {
            parse_mode: 'Markdown',
        });
    }
    catch (error) {
        console.error(error);
        await ctx.reply(i18n_1.t.wallet.error);
        ctx.session.step = 'idle';
    }
};
exports.walletInputHandler = walletInputHandler;
const walletLabelHandler = async (ctx) => {
    if (ctx.session.step !== 'waiting_for_label')
        return;
    if (!ctx.message || !ctx.message.text || !ctx.from || !ctx.session.tempWalletAddress)
        return;
    const label = ctx.message.text.trim();
    const address = ctx.session.tempWalletAddress;
    if (label.startsWith('/skip')) {
        await saveWallet(ctx, address, null);
    }
    else {
        await saveWallet(ctx, address, label);
    }
};
exports.walletLabelHandler = walletLabelHandler;
async function saveWallet(ctx, address, label) {
    if (!ctx.from)
        return;
    try {
        await wallet_1.WalletService.initializeWallet(BigInt(ctx.from.id), address, label);
        await ctx.reply((0, i18n_1.format)(i18n_1.t.wallet.added, {
            address,
            label: label || 'None'
        }), { parse_mode: 'Markdown' });
    }
    catch (error) {
        console.error(error);
        await ctx.reply(i18n_1.t.wallet.error);
    }
    finally {
        ctx.session.step = 'idle';
        ctx.session.tempWalletAddress = undefined;
    }
}
// --- List & Manage Wallets ---
const listWalletsHandler = async (ctx) => {
    ctx.session.step = 'idle';
    if (!ctx.from)
        return;
    const wallets = await wallet_1.WalletService.getWalletsByUser(BigInt(ctx.from.id));
    if (wallets.length === 0) {
        const emptyKeyboard = new grammy_1.InlineKeyboard().text(i18n_1.t.wallet.buttons.main_menu, 'main_menu_return');
        if (ctx.callbackQuery) {
            await ctx.editMessageText(i18n_1.t.wallet.list_empty, { reply_markup: emptyKeyboard });
            await ctx.answerCallbackQuery().catch(() => { });
        }
        else {
            await ctx.reply(i18n_1.t.wallet.list_empty, { reply_markup: emptyKeyboard });
        }
        return;
    }
    const keyboard = new grammy_1.InlineKeyboard();
    wallets.forEach((w) => {
        const addressShort = (0, formatters_1.formatAddress)(w.address);
        const label = w.label ? `🏷️ ${w.label} (${addressShort})` : `👛 ${addressShort}`;
        keyboard.text(label, `wallet_detail:${w.id}`).row();
    });
    keyboard.text(i18n_1.t.wallet.buttons.main_menu, 'main_menu_return');
    if (ctx.callbackQuery) {
        await ctx.editMessageText(i18n_1.t.wallet.list_header, {
            parse_mode: 'Markdown',
            reply_markup: keyboard,
        });
        await ctx.answerCallbackQuery().catch(() => { });
    }
    else {
        await ctx.reply(i18n_1.t.wallet.list_header, {
            parse_mode: 'Markdown',
            reply_markup: keyboard,
        });
    }
};
exports.listWalletsHandler = listWalletsHandler;
// --- Callback Handlers ---
// Helper to show wallet details
async function showWalletDetails(ctx, walletId, edit = true) {
    const wallet = await wallet_1.WalletService.getWalletById(walletId);
    if (!wallet) {
        if (edit)
            return ctx.answerCallbackQuery('Wallet not found');
        else
            return ctx.reply('Wallet not found');
    }
    const message = (0, i18n_1.format)(i18n_1.t.wallet.detail_header, {
        address: wallet.address,
        label: wallet.label || 'None'
    });
    const keyboard = new grammy_1.InlineKeyboard()
        .text(i18n_1.t.wallet.buttons.edit, `wallet_edit:${wallet.id}`)
        .text(i18n_1.t.wallet.buttons.delete, `wallet_delete_confirm:${wallet.id}`).row()
        .text(i18n_1.t.wallet.buttons.back, 'wallet_list_back')
        .text(i18n_1.t.wallet.buttons.main_menu, 'main_menu_return');
    if (edit) {
        await ctx.editMessageText(message, {
            parse_mode: 'Markdown',
            reply_markup: keyboard,
        });
    }
    else {
        await ctx.reply(message, {
            parse_mode: 'Markdown',
            reply_markup: keyboard,
        });
    }
}
const walletDetailCallback = async (ctx, walletId) => {
    await showWalletDetails(ctx, walletId, true);
};
exports.walletDetailCallback = walletDetailCallback;
const walletEditLabelCallback = async (ctx, walletId) => {
    ctx.session.editingWalletId = walletId;
    ctx.session.step = 'waiting_for_edit_label';
    // Store the message ID of the wallet details to edit later
    if (ctx.callbackQuery?.message) {
        ctx.session.walletDetailMessageId = ctx.callbackQuery.message.message_id;
    }
    const promptMsg = await ctx.reply(i18n_1.t.wallet.edit_label_prompt);
    ctx.session.labelPromptMessageId = promptMsg.message_id;
    await ctx.answerCallbackQuery();
};
exports.walletEditLabelCallback = walletEditLabelCallback;
const walletEditLabelInputHandler = async (ctx) => {
    if (ctx.session.step !== 'waiting_for_edit_label')
        return;
    if (!ctx.message || !ctx.message.text || !ctx.session.editingWalletId)
        return;
    const newLabel = ctx.message.text.trim();
    const walletId = ctx.session.editingWalletId;
    try {
        // 1. Delete user's input message
        await ctx.deleteMessage().catch(() => { });
        // 2. Delete the "Send me new label" prompt
        if (ctx.session.labelPromptMessageId) {
            await ctx.api.deleteMessage(ctx.chat.id, ctx.session.labelPromptMessageId).catch(() => { });
        }
        // 3. Update DB
        await wallet_1.WalletService.updateLabel(walletId, newLabel);
        // 4. Update the original wallet details message
        if (ctx.session.walletDetailMessageId) {
            // Re-fetch wallet to get updated data
            const wallet = await wallet_1.WalletService.getWalletById(walletId);
            if (wallet) {
                const message = (0, i18n_1.format)(i18n_1.t.wallet.detail_header, {
                    address: wallet.address,
                    label: wallet.label || 'None'
                });
                const keyboard = new grammy_1.InlineKeyboard()
                    .text(i18n_1.t.wallet.buttons.edit, `wallet_edit:${wallet.id}`)
                    .text(i18n_1.t.wallet.buttons.delete, `wallet_delete_confirm:${wallet.id}`).row()
                    .text(i18n_1.t.wallet.buttons.back, 'wallet_list_back')
                    .text(i18n_1.t.wallet.buttons.main_menu, 'main_menu_return');
                await ctx.api.editMessageText(ctx.chat.id, ctx.session.walletDetailMessageId, message, {
                    parse_mode: 'Markdown',
                    reply_markup: keyboard
                }).catch(() => { });
            }
        }
        else {
            // Fallback if we lost the message ID (shouldn't happen often)
            await ctx.reply((0, i18n_1.format)(i18n_1.t.wallet.label_updated, { label: newLabel }), { parse_mode: 'Markdown' });
            await showWalletDetails(ctx, walletId, false);
        }
    }
    catch (error) {
        console.error(error);
        await ctx.reply(i18n_1.t.wallet.error);
    }
    finally {
        ctx.session.step = 'idle';
        ctx.session.editingWalletId = undefined;
        ctx.session.walletDetailMessageId = undefined;
        ctx.session.labelPromptMessageId = undefined;
    }
};
exports.walletEditLabelInputHandler = walletEditLabelInputHandler;
const walletDeleteConfirmCallback = async (ctx, walletId) => {
    const wallet = await wallet_1.WalletService.getWalletById(walletId);
    if (!wallet)
        return ctx.answerCallbackQuery('Wallet not found');
    const message = (0, i18n_1.format)(i18n_1.t.wallet.delete_confirm, { address: wallet.address });
    const keyboard = new grammy_1.InlineKeyboard()
        .text(i18n_1.t.wallet.buttons.confirm_delete, `wallet_delete:${wallet.id}`)
        .text(i18n_1.t.wallet.buttons.cancel, `wallet_detail:${wallet.id}`);
    await ctx.editMessageText(message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard,
    });
};
exports.walletDeleteConfirmCallback = walletDeleteConfirmCallback;
const walletDeleteCallback = async (ctx, walletId) => {
    try {
        await wallet_1.WalletService.deleteWallet(walletId);
        await ctx.answerCallbackQuery(i18n_1.t.wallet.deleted);
        await (0, exports.listWalletsHandler)(ctx); // Refresh list
    }
    catch (error) {
        console.error(error);
        await ctx.answerCallbackQuery('Error deleting wallet');
    }
};
exports.walletDeleteCallback = walletDeleteCallback;
