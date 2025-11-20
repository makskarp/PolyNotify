import { Context, SessionFlavor } from 'grammy';

export interface SessionData {
    step?: 'idle' | 'waiting_for_wallet' | 'waiting_for_label' | 'waiting_for_edit_label';
    tempWalletAddress?: string;
    editingWalletId?: number;
    walletDetailMessageId?: number;
    labelPromptMessageId?: number;
}

export type MyContext = Context & SessionFlavor<SessionData>;
