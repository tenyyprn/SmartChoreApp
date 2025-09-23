# 必要な依存関係を一括インストール

## 1. 現在のnode_modulesをクリア
cd frontend
rm -rf node_modules
rm -f package-lock.json

## 2. 必要なパッケージをインストール
npm install

## 3. TailwindCSSとVertex AI関連を追加
npm install tailwindcss@^3.3.0 autoprefixer@^10.4.14 postcss@^8.4.24
npm install @google/generative-ai@^0.2.1

## 4. 開発サーバー起動
npm run dev
