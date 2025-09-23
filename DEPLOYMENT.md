# 🚀 Smart Chore App - ハッカソン デプロイメント手順

## 📋 事前準備

### 1. Google Cloud Project の作成
```bash
# 新しいプロジェクトを作成
gcloud projects create smart-chore-hackathon --name="Smart Chore Hackathon"

# プロジェクトを設定
gcloud config set project smart-chore-hackathon

# 課金アカウントを設定 (必要に応じて)
gcloud billing projects link smart-chore-hackathon --billing-account=YOUR_BILLING_ACCOUNT_ID
```

### 2. 必要なAPIの有効化
```bash
# 必要なAPIを一括有効化
gcloud services enable \
  cloudbuild.googleapis.com \
  run.googleapis.com \
  firestore.googleapis.com \
  aiplatform.googleapis.com \
  calendar-json.googleapis.com \
  containerregistry.googleapis.com
```

### 3. Firebase プロジェクトの設定
1. [Firebase Console](https://console.firebase.google.com) にアクセス
2. 「プロジェクトを追加」→ 既存のGCPプロジェクト(`smart-chore-hackathon`)を選択
3. Firestore Database を有効化 (テストモードで開始)
4. Authentication を有効化 (Google Provider を追加)
5. プロジェクト設定から Web アプリを追加
6. 設定情報をコピーして `.env.local` に保存

## 🔧 ローカル環境の設定

### 1. 環境変数の設定
```bash
# frontend/.env.local を作成
cp frontend/.env.example frontend/.env.local

# 以下の値を実際の値に置換
VITE_FIREBASE_API_KEY=your_actual_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=smart-chore-hackathon.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=smart-chore-hackathon
# ... 他の設定値
```

### 2. 依存関係のインストール
```bash
cd frontend
npm install
```

### 3. ローカルでのテスト
```bash
npm run dev
```

## 🚀 Cloud Run へのデプロイ

### 1. 自動デプロイスクリプトの実行
```bash
# デプロイスクリプトに実行権限を付与
chmod +x deploy.sh

# 環境変数を設定してデプロイ実行
export GOOGLE_CLOUD_PROJECT=smart-chore-hackathon
export REGION=us-central1
./deploy.sh
```

### 2. 手動デプロイ (詳細制御が必要な場合)
```bash
# Docker イメージをビルド
docker build -t gcr.io/smart-chore-hackathon/smart-chore-app:latest .

# Container Registry にプッシュ
docker push gcr.io/smart-chore-hackathon/smart-chore-app:latest

# Cloud Run にデプロイ
gcloud run deploy smart-chore-app \
  --image gcr.io/smart-chore-hackathon/smart-chore-app:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --max-instances 10 \
  --port 8080
```

## 🤖 Vertex AI の設定

### 1. サービスアカウントの作成
```bash
# サービスアカウントを作成
gcloud iam service-accounts create vertex-ai-service \
  --display-name="Vertex AI Service Account"

# 必要な権限を付与
gcloud projects add-iam-policy-binding smart-chore-hackathon \
  --member="serviceAccount:vertex-ai-service@smart-chore-hackathon.iam.gserviceaccount.com" \
  --role="roles/aiplatform.user"

# キーファイルを生成
gcloud iam service-accounts keys create vertex-ai-key.json \
  --iam-account=vertex-ai-service@smart-chore-hackathon.iam.gserviceaccount.com
```

### 2. 認証設定
```bash
# 環境変数として設定
export GOOGLE_APPLICATION_CREDENTIALS="./vertex-ai-key.json"
```

## 📅 Google Calendar API の設定

### 1. API認証情報の作成
1. [Google Cloud Console](https://console.cloud.google.com) → API とサービス → 認証情報
2. 「認証情報を作成」→ API キー
3. API キーの制限を設定 (Calendar API のみ)
4. OAuth 2.0 クライアント ID も作成 (Webアプリケーション)

### 2. 環境変数の更新
```bash
# .env.local に追加
VITE_GOOGLE_CALENDAR_API_KEY=your_calendar_api_key
VITE_GOOGLE_OAUTH_CLIENT_ID=your_oauth_client_id
```

## 🧪 ハッカソン用の追加設定

### 1. デモデータの準備
```bash
# Firebase でデモ用の家族データを設定
# (Firestore Console から手動で追加 または スクリプトで自動生成)
```

### 2. モニタリング設定
```bash
# Cloud Run のログ監視
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=smart-chore-app" --limit 50

# エラー追跡の設定
gcloud error-reporting events list --service=smart-chore-app
```

## 🔍 デバッグとトラブルシューティング

### よくある問題と解決策

1. **Docker ビルドエラー**
```bash
# キャッシュをクリアして再ビルド
docker system prune -f
docker build --no-cache -t smart-chore-app .
```

2. **Firebase 接続エラー**
```bash
# プロジェクト設定を確認
firebase projects:list
firebase use smart-chore-hackathon
```

3. **Vertex AI API エラー**
```bash
# クォータ制限を確認
gcloud ai-platform quotas list --filter="service:aiplatform.googleapis.com"
```

## 📊 ハッカソン本番運用

### 1. パフォーマンス最適化
- Cloud Run の自動スケーリング設定
- CDN によるアセット配信最適化
- Firebase キャッシュ戦略

### 2. 監視とアラート
- Cloud Monitoring でメトリクス監視
- Error Reporting でエラー追跡
- カスタムダッシュボードの作成

### 3. セキュリティ設定
- Firestore セキュリティルールの最適化
- API キーの制限強化
- CORS設定の確認

## 🎯 ハッカソン デモ用の機能

以下の機能が実装済み：
- ✅ リアルタイム AI 家事分担
- ✅ Firebase でのデータ永続化
- ✅ Google Calendar 自動連携
- ✅ レスポンシブ Web UI
- ✅ 毎日の3食自動生成
- ✅ 手動タスク追加
- ✅ 公平性スコア計算
- ✅ 日付変更時の自動リセット

## 🏆 最終チェックリスト

- [ ] Cloud Run サービスが稼働中
- [ ] Firebase Firestore でデータ保存確認
- [ ] Vertex AI でのAI分担動作確認
- [ ] Google Calendar 連携動作確認
- [ ] モバイル対応確認
- [ ] エラー処理確認
- [ ] パフォーマンス確認

---

**🎉 ハッカソン頑張ってください！**
