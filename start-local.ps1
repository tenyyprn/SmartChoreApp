# 🚀 Smart Chore App - Quick Local Development Setup
# ハッカソン用の確実なローカル開発環境

Write-Host "🎯 Smart Chore App - ハッカソン用ローカル開発" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host "🛡️ 既存アプリケーションには一切影響しません" -ForegroundColor Yellow

# フロントエンドディレクトリに移動
Set-Location frontend

# 環境設定確認
if (!(Test-Path ".env.local")) {
    Copy-Item ".env.example" ".env.local"
    Write-Host "✅ 環境設定ファイルを作成しました" -ForegroundColor Green
} else {
    Write-Host "✅ 環境設定ファイルが存在します" -ForegroundColor Green
}

# 依存関係確認
Write-Host "📦 依存関係を確認中..." -ForegroundColor Cyan
npm install

# ローカル開発サーバー起動
Write-Host ""
Write-Host "🚀 ローカル開発サーバーを起動します..." -ForegroundColor Green
Write-Host "🌐 ブラウザで http://localhost:5173 を開いてください" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎪 ハッカソンデモ機能:" -ForegroundColor Yellow
Write-Host "  ✅ 家族メンバー管理" -ForegroundColor White
Write-Host "  ✅ AI分担アルゴリズム (モック)" -ForegroundColor White
Write-Host "  ✅ リアルタイム更新" -ForegroundColor White
Write-Host "  ✅ 音声コマンド対応" -ForegroundColor White
Write-Host "  ✅ レスポンシブデザイン" -ForegroundColor White
Write-Host "  ✅ 統計・グラフ表示" -ForegroundColor White
Write-Host ""
Write-Host "🏆 Ctrl+C で停止" -ForegroundColor Yellow

npm run dev
