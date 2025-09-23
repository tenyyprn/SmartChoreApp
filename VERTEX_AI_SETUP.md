# Vertex AI Setup Instructions

## 1. Google Cloud Console設定

### API有効化
```bash
gcloud services enable aiplatform.googleapis.com
```

### 環境変数設定
```bash
# .env.localに追加
VITE_GOOGLE_CLOUD_PROJECT_ID=compact-haiku-454409-j0
VITE_VERTEX_AI_LOCATION=asia-northeast1
VITE_GOOGLE_APPLICATION_CREDENTIALS=./smart-chore-key.json
```

### 認証ファイル確認
既存のsmart-chore-key.jsonにVertex AI権限があることを確認

## 2. 必要なライブラリインストール
```bash
cd frontend
npm install @google-cloud/aiplatform
```

## 3. Vertex AI Test
```javascript
// テスト用簡単なAPI呼び出し
import { PredictionServiceClient } from '@google-cloud/aiplatform';

const client = new PredictionServiceClient({
  apiEndpoint: 'asia-northeast1-aiplatform.googleapis.com',
  keyFilename: './smart-chore-key.json'
});
```

次のステップ: Vertex AI統合サービス実装
