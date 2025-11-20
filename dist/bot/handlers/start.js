"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startHandler = void 0;
const prisma_1 = __importDefault(require("../../core/prisma"));
const main_1 = require("../menus/main");
const i18n_1 = require("../../i18n");
const startHandler = async (ctx) => {
    ctx.session.step = 'idle';
    if (ctx.from) {
        await prisma_1.default.user.upsert({
            where: { id: ctx.from.id },
            update: { username: ctx.from.username },
            create: {
                id: ctx.from.id,
                username: ctx.from.username,
            },
        });
    }
    await ctx.reply(i18n_1.t.welcome, {
        parse_mode: 'Markdown',
        reply_markup: main_1.mainMenu,
    });
};
exports.startHandler = startHandler;
