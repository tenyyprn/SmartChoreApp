#!/bin/bash
# Smart Chore App デプロイメントスクリプト

set -e

echo "🚀 Smart Chore App デプロイメント開始"

# 現在のディレクトリを確認
if [ ! -f "package.json" ]; then
    echo "❌ package.jsonが見つかりません。frontendディレクトリで実行してください。"
    exit 1
fi

# 1. 依存関係のインストール
echo "📦 依存関係をインストール中..."
npm install

# 2. プロダクションビルド
echo "🔨 プロダクションビルドを作成中..."
npm run build

# 3. ビルドファイルの確認
if [ ! -d "dist" ]; then
    echo "❌ ビルドに失敗しました。distディレクトリが見つかりません。"
    exit 1
fi

echo "✅ ビルド完了！"

# 4. Google App Engineにデプロイ
echo "☁️ Google App Engineにデプロイ中..."

# プロジェクトIDを設定
gcloud config set project compact-haiku-454409-j0

# デプロイ実行
gcloud app deploy app.yaml --quiet --promote

# 5. デプロイ完了
echo "🎉 デプロイ完了！"
echo "📱 アプリURL: https://compact-haiku-454409-j0.appspot.com"

# 6. ブラウザでアプリを開く（オプション）
read -p "ブラウザでアプリを開きますか？ (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    gcloud app browse
fi

echo "✨ デプロイメント完了！"
