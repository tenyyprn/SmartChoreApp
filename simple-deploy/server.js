const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 8080;

console.log(`🚀 Starting Smart Chore App on port ${port}`);

// Serve static files
app.use(express.static('public'));

// Simple test route
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Smart Chore App</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; text-align: center; }
            .container { max-width: 600px; margin: 0 auto; }
            .status { color: green; font-size: 18px; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🏠 Smart Chore App</h1>
            <div class="status">✅ Cloud Run デプロイ成功！</div>
            <p>既存アプリケーションには影響していません。</p>
            <p>プロジェクト: compact-haiku-454409-j0</p>
            <p>リージョン: asia-northeast1 (Tokyo)</p>
            <p>サービス: smart-chore-app</p>
            <hr>
            <p>🎯 ハッカソン準備完了</p>
        </div>
    </body>
    </html>
  `);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`✅ Smart Chore App running on http://0.0.0.0:${port}`);
});
