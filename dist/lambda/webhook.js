"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const grammy_1 = require("grammy");
const bot_1 = require("../bot");
const bot = (0, bot_1.createBot)();
// AWS Lambda handler for Telegram Webhook
exports.handler = (0, grammy_1.webhookCallback)(bot, 'aws-lambda');
