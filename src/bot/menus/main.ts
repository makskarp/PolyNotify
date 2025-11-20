import { Keyboard } from 'grammy';
import { t } from '../../i18n';

export const mainMenu = new Keyboard()
    .text(t.menu.add_wallet).text(t.menu.my_wallets).row()
    .text(t.menu.help).resized();
