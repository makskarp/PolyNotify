import { InlineKeyboard } from 'grammy';
import { MyContext } from '../context';
import { WalletService } from '../../services/wallet';
import { t, format } from '../../i18n';
import { isValidEvmAddress } from '../../utils/validators';
import { formatAddress } from '../../utils/formatters';

// --- Add Wallet Flow ---

export const addWalletHandler = async (ctx: MyContext) => {
    ctx.session.step = 'waiting_for_wallet';
    await ctx.reply(t.wallet.prompt, { parse_mode: 'Markdown' });
};

export const walletInputHandler = async (ctx: MyContext) => {
    if (ctx.session.step !== 'waiting_for_wallet') return;
    if (!ctx.message || !ctx.message.text || !ctx.from) return;

    const address = ctx.message.text.trim();

    if (!isValidEvmAddress(address)) {
        await ctx.reply(t.wallet.invalid);
        return;
    }

    try {
        const existing = await WalletService.findWallet(BigInt(ctx.from.id), address);

        if (existing) {
            await ctx.reply(t.wallet.exists);
            return;
        }

        // Store address temporarily and ask for label
        ctx.session.tempWalletAddress = address;
        ctx.session.step = 'waiting_for_label';

        await ctx.reply(t.wallet.label_prompt, {
            parse_mode: 'Markdown',
        });

    } catch (error) {
        console.error(error);
        await ctx.reply(t.wallet.error);
        ctx.session.step = 'idle';
    }
};

export const walletLabelHandler = async (ctx: MyContext) => {
    if (ctx.session.step !== 'waiting_for_label') return;
    if (!ctx.message || !ctx.message.text || !ctx.from || !ctx.session.tempWalletAddress) return;

    const label = ctx.message.text.trim();
    const address = ctx.session.tempWalletAddress;

    if (label.startsWith('/skip')) {
        await saveWallet(ctx, address, null);
    } else {
        await saveWallet(ctx, address, label);
    }
};

async function saveWallet(ctx: MyContext, address: string, label: string | null) {
    if (!ctx.from) return;

    try {
        await WalletService.initializeWallet(BigInt(ctx.from.id), address, label);

        await ctx.reply(format(t.wallet.added, {
            address,
            label: label || 'None'
        }), { parse_mode: 'Markdown' });

    } catch (error) {
        console.error(error);
        await ctx.reply(t.wallet.error);
    } finally {
        ctx.session.step = 'idle';
        ctx.session.tempWalletAddress = undefined;
    }
}

// --- List & Manage Wallets ---

export const listWalletsHandler = async (ctx: MyContext) => {
    ctx.session.step = 'idle';
    if (!ctx.from) return;

    const wallets = await WalletService.getWalletsByUser(BigInt(ctx.from.id));

    if (wallets.length === 0) {
        const emptyKeyboard = new InlineKeyboard().text(t.wallet.buttons.main_menu, 'main_menu_return');
        if (ctx.callbackQuery) {
            await ctx.editMessageText(t.wallet.list_empty, { reply_markup: emptyKeyboard });
            await ctx.answerCallbackQuery().catch(() => { });
        } else {
            await ctx.reply(t.wallet.list_empty, { reply_markup: emptyKeyboard });
        }
        return;
    }

    const keyboard = new InlineKeyboard();
    wallets.forEach((w) => {
        const addressShort = formatAddress(w.address);
        const label = w.label ? `🏷️ ${w.label} (${addressShort})` : `👛 ${addressShort}`;
        keyboard.text(label, `wallet_detail:${w.id}`).row();
    });
    keyboard.text(t.wallet.buttons.main_menu, 'main_menu_return');

    if (ctx.callbackQuery) {
        await ctx.editMessageText(t.wallet.list_header, {
            parse_mode: 'Markdown',
            reply_markup: keyboard,
        });
        await ctx.answerCallbackQuery().catch(() => { });
    } else {
        await ctx.reply(t.wallet.list_header, {
            parse_mode: 'Markdown',
            reply_markup: keyboard,
        });
    }
};

// --- Callback Handlers ---

// Helper to show wallet details
async function showWalletDetails(ctx: MyContext, walletId: number, edit: boolean = true) {
    const wallet = await WalletService.getWalletById(walletId);
    if (!wallet) {
        if (edit) return ctx.answerCallbackQuery('Wallet not found');
        else return ctx.reply('Wallet not found');
    }

    const message = format(t.wallet.detail_header, {
        address: wallet.address,
        label: wallet.label || 'None'
    });

    const keyboard = new InlineKeyboard()
        .text(t.wallet.buttons.edit, `wallet_edit:${wallet.id}`)
        .text(t.wallet.buttons.delete, `wallet_delete_confirm:${wallet.id}`).row()
        .text(t.wallet.buttons.back, 'wallet_list_back')
        .text(t.wallet.buttons.main_menu, 'main_menu_return');

    if (edit) {
        await ctx.editMessageText(message, {
            parse_mode: 'Markdown',
            reply_markup: keyboard,
        });
    } else {
        await ctx.reply(message, {
            parse_mode: 'Markdown',
            reply_markup: keyboard,
        });
    }
}

export const walletDetailCallback = async (ctx: MyContext, walletId: number) => {
    await showWalletDetails(ctx, walletId, true);
};

export const walletEditLabelCallback = async (ctx: MyContext, walletId: number) => {
    ctx.session.editingWalletId = walletId;
    ctx.session.step = 'waiting_for_edit_label';

    // Store the message ID of the wallet details to edit later
    if (ctx.callbackQuery?.message) {
        ctx.session.walletDetailMessageId = ctx.callbackQuery.message.message_id;
    }

    const promptMsg = await ctx.reply(t.wallet.edit_label_prompt);
    ctx.session.labelPromptMessageId = promptMsg.message_id;

    await ctx.answerCallbackQuery();
};

export const walletEditLabelInputHandler = async (ctx: MyContext) => {
    if (ctx.session.step !== 'waiting_for_edit_label') return;
    if (!ctx.message || !ctx.message.text || !ctx.session.editingWalletId) return;

    const newLabel = ctx.message.text.trim();
    const walletId = ctx.session.editingWalletId;

    try {
        // 1. Delete user's input message
        await ctx.deleteMessage().catch(() => { });

        // 2. Delete the "Send me new label" prompt
        if (ctx.session.labelPromptMessageId) {
            await ctx.api.deleteMessage(ctx.chat!.id, ctx.session.labelPromptMessageId).catch(() => { });
        }

        // 3. Update DB
        await WalletService.updateLabel(walletId, newLabel);

        // 4. Update the original wallet details message
        if (ctx.session.walletDetailMessageId) {
            // Re-fetch wallet to get updated data
            const wallet = await WalletService.getWalletById(walletId);
            if (wallet) {
                const message = format(t.wallet.detail_header, {
                    address: wallet.address,
                    label: wallet.label || 'None'
                });

                const keyboard = new InlineKeyboard()
                    .text(t.wallet.buttons.edit, `wallet_edit:${wallet.id}`)
                    .text(t.wallet.buttons.delete, `wallet_delete_confirm:${wallet.id}`).row()
                    .text(t.wallet.buttons.back, 'wallet_list_back')
                    .text(t.wallet.buttons.main_menu, 'main_menu_return');

                await ctx.api.editMessageText(ctx.chat!.id, ctx.session.walletDetailMessageId, message, {
                    parse_mode: 'Markdown',
                    reply_markup: keyboard
                }).catch(() => { });
            }
        } else {
            // Fallback if we lost the message ID (shouldn't happen often)
            await ctx.reply(format(t.wallet.label_updated, { label: newLabel }), { parse_mode: 'Markdown' });
            await showWalletDetails(ctx, walletId, false);
        }

    } catch (error) {
        console.error(error);
        await ctx.reply(t.wallet.error);
    } finally {
        ctx.session.step = 'idle';
        ctx.session.editingWalletId = undefined;
        ctx.session.walletDetailMessageId = undefined;
        ctx.session.labelPromptMessageId = undefined;
    }
};

export const walletDeleteConfirmCallback = async (ctx: MyContext, walletId: number) => {
    const wallet = await WalletService.getWalletById(walletId);
    if (!wallet) return ctx.answerCallbackQuery('Wallet not found');

    const message = format(t.wallet.delete_confirm, { address: wallet.address });

    const keyboard = new InlineKeyboard()
        .text(t.wallet.buttons.confirm_delete, `wallet_delete:${wallet.id}`)
        .text(t.wallet.buttons.cancel, `wallet_detail:${wallet.id}`);

    await ctx.editMessageText(message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard,
    });
};

export const walletDeleteCallback = async (ctx: MyContext, walletId: number) => {
    try {
        await WalletService.deleteWallet(walletId);
        await ctx.answerCallbackQuery(t.wallet.deleted);
        await listWalletsHandler(ctx); // Refresh list
    } catch (error) {
        console.error(error);
        await ctx.answerCallbackQuery('Error deleting wallet');
    }
};
