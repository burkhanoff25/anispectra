import { webhookCallback } from "grammy";
import { bot } from "@/server/bot/bot";
import { NextResponse } from "next/server";

export const POST = webhookCallback(bot, "std/http");
