import express from "express";
import fetch from "node-fetch";

const PORT = process.env.PORT || 3000;
const COMMISSION = parseFloat(process.env.COMMISSION || "0.0001");
const UPDATE_INTERVAL = parseInt(process.env.UPDATE_INTERVAL || "10000", 10);

const SYMBOL = "BTCUSDT";
let latestData = { bid: null, ask: null, mid: null, updatedAt: null };

// получение цены с Binance
async function fetchPrice() {
    try {
        const res = await fetch(`https://api.binance.com/api/v3/ticker/bookTicker?symbol=${SYMBOL}`);
        if (!res.ok) throw new Error(`Ошибка Binance API: ${res.status}`);
        const data = await res.json();

        const bid = parseFloat(data.bidPrice);
        const ask = parseFloat(data.askPrice);

        // Применяем комиссию: повышаем ask, понижаем bid
        const bidWithCommission = bid * (1 - COMMISSION);
        const askWithCommission = ask * (1 + COMMISSION);

        const mid = (bidWithCommission + askWithCommission) / 2;

        latestData = {
            bid: bidWithCommission,
            ask: askWithCommission,
            mid,
            updatedAt: new Date().toISOString(),
        };
        console.log(`Цена обновлена: bid=${bidWithCommission}, ask=${askWithCommission}, mid=${mid}`);
    } catch (err) {
        console.error("Ошибка при получении цены:", err.message);
    }
}

fetchPrice();

setInterval(fetchPrice, UPDATE_INTERVAL);

const app = express();

app.get("/", (req, res) => {
    if (!latestData.bid || !latestData.ask) {
        return res.status(503).json({ error: "Данные ещё не загружены" });
    }
    res.json(latestData);
});

app.listen(PORT, () => {
    console.log(`Сервис запущен на порту ${PORT}`);
});
