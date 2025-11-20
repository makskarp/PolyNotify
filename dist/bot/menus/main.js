"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mainMenu = void 0;
const grammy_1 = require("grammy");
const i18n_1 = require("../../i18n");
exports.mainMenu = new grammy_1.Keyboard()
    .text(i18n_1.t.menu.add_wallet).text(i18n_1.t.menu.my_wallets).row()
    .text(i18n_1.t.menu.help).resized();
