// Telegram webhook for the Alem dispatch bot.
// Handles the "Confirm ride" button on new-request messages: marks the booking confirmed,
// which makes the database send the customer's confirmation email and the "Ride confirmed"
// message. Deployed as a Supabase Edge Function named `telegram-webhook` with JWT
// verification turned OFF (Telegram cannot send a Supabase JWT).
//
// Secrets (Edge Functions -> Secrets):
//   TELEGRAM_BOT_TOKEN       the bot token from BotFather
//   TELEGRAM_CHAT_ID         the dispatch chat id; button presses from any other chat are ignored
//   TELEGRAM_WEBHOOK_SECRET  any long random string; the same value is given to Telegram's setWebhook
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided automatically.

Deno.serve(async (req) => {
  const secret = Deno.env.get("TELEGRAM_WEBHOOK_SECRET");
  if (secret && req.headers.get("x-telegram-bot-api-secret-token") !== secret) {
    return new Response("forbidden", { status: 403 });
  }
  const update = await req.json().catch(() => null);
  const cq = update?.callback_query;
  if (!cq) return new Response("ok");

  const token = Deno.env.get("TELEGRAM_BOT_TOKEN") ?? "";
  const tg = (method: string, body: unknown) =>
    fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });

  const match = /^confirm:([0-9a-f-]{36})$/.exec(String(cq.data ?? ""));
  if (!match) {
    await tg("answerCallbackQuery", { callback_query_id: cq.id });
    return new Response("ok");
  }

  const allowedChat = Deno.env.get("TELEGRAM_CHAT_ID");
  const chatId = cq.message?.chat?.id;
  if (allowedChat && String(chatId) !== allowedChat) {
    await tg("answerCallbackQuery", { callback_query_id: cq.id, text: "Not allowed from this chat." });
    return new Response("ok");
  }

  const url = Deno.env.get("SUPABASE_URL") ?? "";
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const r = await fetch(`${url}/rest/v1/bookings?id=eq.${match[1]}&status=eq.new`, {
    method: "PATCH",
    headers: {
      apikey: key,
      authorization: `Bearer ${key}`,
      "content-type": "application/json",
      prefer: "return=representation",
    },
    body: JSON.stringify({ status: "confirmed" }),
  });
  const rows = await r.json().catch(() => []);
  const who = [cq.from?.first_name, cq.from?.last_name].filter(Boolean).join(" ") || "dispatcher";
  const messageId = cq.message?.message_id;

  if (Array.isArray(rows) && rows.length > 0) {
    await tg("answerCallbackQuery", { callback_query_id: cq.id, text: "Ride confirmed. The customer has been notified." });
    await tg("editMessageText", {
      chat_id: chatId,
      message_id: messageId,
      text: `${cq.message?.text ?? ""}\n\nConfirmed by ${who}.`,
    });
  } else {
    await tg("answerCallbackQuery", { callback_query_id: cq.id, text: "This ride was already confirmed or is no longer pending." });
    await tg("editMessageReplyMarkup", { chat_id: chatId, message_id: messageId, reply_markup: { inline_keyboard: [] } });
  }
  return new Response("ok");
});
