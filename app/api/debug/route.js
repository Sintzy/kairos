export async function GET() {
    return new Response(JSON.stringify({
        MONGODB_URI: process.env.MONGODB_URI ? "✔️" : "❌",
        ORS_API_KEY: process.env.ORS_API_KEY ? "✔️" : "❌",
        OPENWEATHER_API_KEY: process.env.OPENWEATHER_API_KEY ? "✔️" : "❌",
        LOGSNAG_TOKEN: process.env.LOGSNAG_TOKEN ? "✔️" : "❌",
        NOW_PLAYING_ENDPOINT: process.env.NOW_PLAYING_ENDPOINT ? "✔️" : "❌",
        QUEUE_ENDPOINT: process.env.QUEUE_ENDPOINT ? "✔️" : "❌",
        TOKEN_ENDPOINT: process.env.TOKEN_ENDPOINT ? "✔️" : "❌",
        NEXT_PUBLIC_CLIENT_ID: process.env.NEXT_PUBLIC_CLIENT_ID ? "✔️" : "❌",
        NEXT_PUBLIC_CLIENT_SECRET: process.env.NEXT_PUBLIC_CLIENT_SECRET ? "✔️" : "❌",
        NEXT_PUBLIC_REFRESH_TOKEN: process.env.NEXT_PUBLIC_REFRESH_TOKEN ? "✔️" : "❌"
    }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
    });
}