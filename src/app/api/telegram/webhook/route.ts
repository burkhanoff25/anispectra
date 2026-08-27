import { webhookCallback } from "grammy";
import { bot } from "@/server/bot/bot";

export const POST = webhookCallback(bot, "std/http");
