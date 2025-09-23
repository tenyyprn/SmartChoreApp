# SmartChoreApp バックエンド起動確認

## 1. バックエンド起動
```powershell
cd backend
npm start
```

## 2. ヘルスチェック確認
ブラウザで以下にアクセス：
- http://localhost:5000/health

期待される応答：
```json
{
  "status": "OK",
  "timestamp": "2024-XX-XX...",
  "service": "SmartChoreApp Backend"
}
```

## 3. API テスト
```powershell
# PowerShellでAPI呼び出しテスト
Invoke-RestMethod -Uri "http://localhost:5000/api/chore/calculate" -Method POST -ContentType "application/json" -Body '{}'
```

## 現在の構成
- **フロントエンド**: Firebase直接接続で完全動作
- **バックエンド**: 軽量API（将来拡張用）
- **デプロイ**: フロントエンドのみCloud Runで本番稼働

## 本番環境
現在の本番アプリはフロントエンドのみで完全機能：
https://smart-chore-app-612941701640.asia-northeast1.run.app/
