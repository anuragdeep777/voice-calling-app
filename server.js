addEventListener("fetch", event => {
    event.respondWith(handleRequest(event.request));
});

const TELEGRAM_BOT_TOKEN ="7703516205:AAGezZg7fkW17xOSuKbvUMV1Jsz5TloshGw";
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

async function handleRequest(request) {
    if (request.method === "POST") {
        let update = await request.json();

        // Handle messages
        if (update.message) {
            let chat_id = update.message.chat.id;
            let text = update.message.text;

            // Reply to user
            await sendMessage(chat_id, `You said: ${text}`);
        }

        return new Response("OK", { status: 200 });
    }

    // Webhook setup route
    if (request.method === "GET" && new URL(request.url).pathname === "/set-webhook") {
        const webhookUrl = `https://your-cloudflare-worker-url/`;  // Cloudflare Worker URL
        const setWebhookUrl = `${TELEGRAM_API_URL}/setWebhook?url=${webhookUrl}`;

        let response = await fetch(setWebhookUrl);
        let result = await response.json();
        return new Response(JSON.stringify(result), { status: 200 });
    }

    return new Response("Invalid request", { status: 400 });
}

async function sendMessage(chat_id, text) {
    let url = `${TELEGRAM_API_URL}/sendMessage`;
    let body = JSON.stringify({ chat_id, text });

    await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body
    });
}
