# Vertex AI / Gemini API Setup Guide

## 1. Google Cloud Console でAPI有効化

1. https://console.cloud.google.com/ にアクセス
2. プロジェクト: `compact-haiku-454409-j0` を選択
3. 「APIとサービス」→「ライブラリ」に移動
4. 「Generative AI API」を検索して有効化

## 2. APIキー取得

1. 「APIとサービス」→「認証情報」に移動
2. 「認証情報を作成」→「APIキー」をクリック
3. 生成されたAPIキーをコピー

## 3. 環境変数設定

`frontend/.env.local` ファイルを作成：

```env
VITE_GEMINI_API_KEY=YOUR_ACTUAL_API_KEY_HERE
VITE_GOOGLE_CLOUD_PROJECT_ID=compact-haiku-454409-j0
VITE_VERTEX_AI_LOCATION=asia-northeast1
```

## 4. ライブラリインストール

```bash
cd frontend
npm install @google/generative-ai
```

## 5. 動作確認

アプリを起動してAI分担計算をテスト：

```bash
npm run dev
```

「AI分担設定」→「AI分担を計算」で Vertex AI Enhanced が表示されることを確認

## セキュリティ注意

- APIキーは絶対にGitにコミットしない
- .env.local は .gitignore に含まれている
- 本番環境では環境変数で設定
