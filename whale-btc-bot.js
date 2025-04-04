import { Telegraf } from 'telegraf';
import axios from 'axios';
import dotenv from 'dotenv';
import WebSocket from 'ws';
import fs from 'fs';

dotenv.config();
const bot = new Telegraf(process.env.BOT_TOKEN);
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// Constants
const MIN_BTC_THRESHOLD = 10; // Ngưỡng tối thiểu để thông báo (10 BTC)
const PRICE_UPDATE_INTERVAL = 300000; // Cập nhật giá mỗi 5 phút (300,000ms)
const PRICE_HISTORY_LIMIT = 100; // Giới hạn lịch sử giá

// Global variables
let WHALE_WALLETS;
let currentBtcPrice = null;
let priceHistory = [];

// Load whale wallets from JSON file
try {
    const data = fs.readFileSync('whale_wallets.json', 'utf8');
    WHALE_WALLETS = new Set(JSON.parse(data));
    console.log(`✅ Loaded ${WHALE_WALLETS.size} whale wallets.`);
} catch (err) {
    console.error('❌ Error loading whale wallets:', err.message);
    process.exit(1);
}

// 📡 Fetch Current BTC Price from Reliable APIs
async function getCurrentBitcoinPrice() {
    try {
        const response = await axios.get("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd");
        return response.data.bitcoin.usd;
    } catch (error) {
        console.error("⚠️ CoinGecko API failed. Switching to Binance...");
        try {
            const fallback = await axios.get("https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT");
            return parseFloat(fallback.data.price);
        } catch (fallbackError) {
            console.error("⚠️ Binance API also failed!", fallbackError.message);
            return null;
        }
    }
}

// 📊 Cache and Update BTC Price Periodically
async function updateBtcPrice() {
    try {
        const price = await getCurrentBitcoinPrice();
        if (price) {
            currentBtcPrice = price;
            priceHistory.push({ timestamp: Date.now(), price });
            if (priceHistory.length > PRICE_HISTORY_LIMIT) {
                priceHistory.shift(); // Giữ lịch sử giá trong giới hạn
            }
            console.log(`📈 Updated BTC Price: $${price}`);
        } else {
            console.error("❌ Failed to update BTC price.");
        }
    } catch (error) {
        console.error("❌ Error updating BTC price:", error.message);
    }
}

// Start price updates
setInterval(updateBtcPrice, PRICE_UPDATE_INTERVAL);
updateBtcPrice(); // Initial update

// 🔍 Determine Transaction Category (Small, Large, Very Large)
function categorizeTransaction(size) {
    if (size >= 10000) return '🔴 Very Large';
    if (size >= 1000) return '🟠 Large';
    if (size >= 100) return '🟡 Moderate';
    return '🟢 Small';
}

// 📊 Get BTC Price at a Specific Time
function getPriceAtTime(timestamp) {
    if (priceHistory.length === 0) return null;
    const closest = priceHistory.reduce((prev, curr) =>
        Math.abs(curr.timestamp - timestamp) < Math.abs(prev.timestamp - timestamp) ? curr : prev
    );
    return closest.price || null;
}

// 📡 Connect to WebSocket for Real-Time Whale Monitoring
const ws = new WebSocket("wss://ws.blockchain.info/inv");

ws.on("open", () => {
    console.log("✅ Connected to Blockchain API");
    ws.send(JSON.stringify({ "op": "unconfirmed_sub" }));
});

ws.on("error", (error) => {
    console.error("❌ WebSocket error:", error.message);
});

ws.on("close", () => {
    console.log("⚠️ WebSocket connection closed. Attempting to reconnect...");
    setTimeout(() => {
        const newWs = new WebSocket("wss://ws.blockchain.info/inv");
    }, 5000);
});

ws.on("message", async (data) => {
    try {
        const transaction = JSON.parse(data);
        if (transaction.op === "utx") {
            await processTransaction(transaction.x);
        }
    } catch (error) {
        console.error("❌ Error processing WebSocket message:", error.message);
    }
});

// Xử lý giao dịch với logic mới
async function processTransaction(transaction) {
    const { inputs, out, hash, time } = transaction;
    let totalSent = 0;
    let totalReceived = 0;
    let affectedWallets = new Set();

    // Tính tổng Sent từ các đầu vào
    inputs.forEach(input => {
        if (WHALE_WALLETS.has(input.prev_out.addr)) {
            affectedWallets.add(input.prev_out.addr);
            totalSent += (input.prev_out.value || 0) / 1e8; // Chuyển từ Satoshi sang BTC, fallback 0 nếu thiếu giá trị
        }
    });

    // Tính tổng Received từ các đầu ra
    out.forEach(output => {
        if (WHALE_WALLETS.has(output.addr)) {
            affectedWallets.add(output.addr);
            totalReceived += (output.value || 0) / 1e8;
        }
    });

    // Tính thay đổi ròng
    const netChange = totalReceived - totalSent;

    // Chỉ thông báo nếu |netChange| >= MIN_BTC_THRESHOLD
    if (affectedWallets.size > 0 && Math.abs(netChange) >= MIN_BTC_THRESHOLD) {
        const btcPriceAtTime = await getPriceAtTime(time);
        await notifyWhaleTransaction([...affectedWallets], totalSent, totalReceived, netChange, hash, btcPriceAtTime);
    } else {
      console.log(`Skipping transaction ${hash}: netChange ${netChange.toFixed(4)} BTC is below the threshold of ${MIN_BTC_THRESHOLD}.`);
    }
}

// 🚨 Send Whale Alert to Telegram
async function notifyWhaleTransaction(wallets, sent, received, netChange, txHash, btcPriceAtTime) {
    try {
        const currentPrice = currentBtcPrice || await getCurrentBitcoinPrice();
        const priceAtTransaction = btcPriceAtTime || currentPrice;

        let message = `
🚨 <b>Whale Alert!</b> 🚨
💰 <b>Wallets Involved:</b> ${wallets.join(", ")}
🔄 <b>Transaction Details:</b>
${sent > 0 ? `📉 <b>Sent:</b> ${sent.toFixed(4)} BTC (${categorizeTransaction(sent)})` : ""}
${received > 0 ? `📈 <b>Received:</b> ${received.toFixed(4)} BTC (${categorizeTransaction(received)})` : ""}
${netChange > 0 ? `📈 <b>Net Received:</b> ${netChange.toFixed(4)} BTC` : `📉 <b>Net Sent:</b> ${Math.abs(netChange).toFixed(4)} BTC`}
📊 <b>BTC Price at Transaction:</b> $${priceAtTransaction?.toLocaleString() || "N/A"}
📊 <b>Current BTC Price:</b> $${currentPrice?.toLocaleString() || "N/A"}
🔗 <a href="https://www.blockchain.com/btc/tx/${txHash}">View Transaction</a>
`;

        await bot.telegram.sendMessage(CHAT_ID, message, { parse_mode: "HTML" });
        console.log(`✅ Đã gửi thông báo cá voi cho giao dịch: ${txHash}`);
    } catch (error) {
        console.error("❌ Lỗi khi gửi thông báo cá voi:", error.message);
    }
}

// 📢 Automated Bitcoin Market Report
async function postBitcoinAnalysis() {
  try {
      const btcPrice = currentBtcPrice || await getCurrentBitcoinPrice();
      const pastPrice = priceHistory.length > 30
          ? priceHistory[priceHistory.length - 30].price
          : btcPrice;

      const priceChange = (((btcPrice - pastPrice) / pastPrice) * 100).toFixed(2);
      const trend = priceChange > 0 ? "📈 Uptrend" : "📉 Downtrend";

      const message = `
📢 <b>Bitcoin Market Report</b>
🕒 <b>Time:</b> ${new Date().toLocaleString()}
💰 <b>Current BTC Price:</b> $${btcPrice?.toLocaleString() || "N/A"}
📊 <b>2-Hour Change:</b> ${priceChange}% (${trend})
🔍 <b>Analysis:</b> ${analyzeMarket(priceChange)}
🔮 <b>Forecast:</b> ${predictTrend(priceChange)}
📡 <i>Data sourced from CoinGecko & Binance</i>
      `;

      await bot.telegram.sendMessage(CHAT_ID, message.trim(), {
          parse_mode: "HTML"
      });

      console.log("📡 Market report sent successfully.");
  } catch (error) {
      console.error("⚠️ Error while fetching market data:", error.message);
  }
}


// 📊 Market Analysis Logic
function analyzeMarket(priceChange) {
  if (priceChange > 2) return "🔥 Strong upward trend!";
  if (priceChange < -2) return "⚠️ Possible downward reversal!";
  return "🔄 Neutral market trend.";
}


// 🔮 Predict Next Move
function predictTrend(priceChange) {
  if (priceChange > 2) return "🚀 Có khả năng bứt phá!";
  if (priceChange < -2) return "📉 Có thể điều chỉnh giảm!";
  return "📊 Thị trường đang chờ tín hiệu.";
}

// ⏳ Schedule Market Reports Every 2 Hours
setInterval(postBitcoinAnalysis, 7200000); // 2 giờ = 7,200,000ms

// 🚀 Launch the Telegram Bot
bot.launch();
console.log("✅ Whale tracking bot is running!");

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log("⚠️ Đang tắt bot...");
    bot.stop();
    ws.close();
    process.exit(0);
});