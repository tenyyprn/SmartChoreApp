# SmartChoreApp バックエンド

## 概要
SmartChoreAppのNode.js + Express バックエンドAPI

## 主要機能
- AI家事分担計算エンドポイント
- CORS対応
- レート制限
- ヘルスチェック

## API エンドポイント

### GET /health
ヘルスチェック

### POST /api/chore/calculate
家事分担の計算

## 環境変数
- `PORT`: ポート番号（デフォルト: 5000）
- `NODE_ENV`: 環境（development/production）

## 起動方法
```bash
npm start       # 本番環境
npm run dev     # 開発環境
```