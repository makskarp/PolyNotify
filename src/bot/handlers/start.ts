import { MyContext } from '../context';
import prisma from '../../core/prisma';
import { mainMenu } from '../menus/main';
import { t } from '../../i18n';

export const startHandler = async (ctx: MyContext) => {
    ctx.session.step = 'idle';
    if (ctx.from) {
        await prisma.user.upsert({
            where: { id: ctx.from.id },
            update: { username: ctx.from.username },
            create: {
                id: ctx.from.id,
                username: ctx.from.username,
            },
        });
    }

    await ctx.reply(t.welcome, {
        parse_mode: 'Markdown',
        reply_markup: mainMenu,
    });
};
