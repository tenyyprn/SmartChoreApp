# Smart Chore App デプロイメントスクリプト (PowerShell)

Write-Host "🚀 Smart Chore App デプロイメント開始" -ForegroundColor Green

# 現在のディレクトリを確認
if (-not (Test-Path "package.json")) {
    Write-Host "❌ package.jsonが見つかりません。frontendディレクトリで実行してください。" -ForegroundColor Red
    exit 1
}

try {
    # 1. 依存関係のインストール
    Write-Host "📦 依存関係をインストール中..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) { throw "npm install failed" }

    # 2. プロダクションビルド
    Write-Host "🔨 プロダクションビルドを作成中..." -ForegroundColor Yellow
    npm run build
    if ($LASTEXITCODE -ne 0) { throw "Build failed" }

    # 3. ビルドファイルの確認
    if (-not (Test-Path "dist")) {
        throw "ビルドに失敗しました。distディレクトリが見つかりません。"
    }

    Write-Host "✅ ビルド完了！" -ForegroundColor Green

    # 4. Google App Engineにデプロイ
    Write-Host "☁️ Google App Engineにデプロイ中..." -ForegroundColor Yellow

    # プロジェクトIDを設定
    gcloud config set project compact-haiku-454409-j0
    if ($LASTEXITCODE -ne 0) { throw "Failed to set project" }

    # デプロイ実行
    gcloud app deploy app.yaml --quiet --promote
    if ($LASTEXITCODE -ne 0) { throw "Deployment failed" }

    # 5. デプロイ完了
    Write-Host "🎉 デプロイ完了！" -ForegroundColor Green
    Write-Host "📱 アプリURL: https://compact-haiku-454409-j0.appspot.com" -ForegroundColor Cyan

    # 6. ブラウザでアプリを開く（オプション）
    $response = Read-Host "ブラウザでアプリを開きますか？ (y/n)"
    if ($response -eq "y" -or $response -eq "Y") {
        gcloud app browse
    }

    Write-Host "✨ デプロイメント完了！" -ForegroundColor Green

} catch {
    Write-Host "❌ デプロイメントエラー: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
