# 🚀 Smart Chore App - プロジェクト evident-pattern-4h7j0 デプロイガイド

## ⚡ 1. 即座に開始 (5分でローカル起動)

### gcloud設定
```bash
# プロジェクト設定
gcloud config set project evident-pattern-4h7j0

# 認証確認
gcloud auth list
gcloud auth application-default login  # 必要に応じて
```

### Firebase プロジェクト作成
1. [Firebase Console](https://console.firebase.google.com) にアクセス
2. 「プロジェクトを追加」をクリック
3. **「既存のGoogle Cloudプロジェクトを選択」** を選択
4. **`evident-pattern-4h7j0`** を選択
5. Firebase の利用規約に同意
6. Google Analytics は **スキップ** (時短のため)

### Firestore Database 有効化
1. Firebase Console で「Firestore Database」
2. 「データベースの作成」
3. **「テストモードで開始」** を選択 (ハッカソン用)
4. ロケーション: **asia-northeast1 (東京)** を選択

### Web アプリ設定
1. Firebase Console でプロジェクト設定 (⚙️アイコン)
2. 「アプリを追加」→ Web アプリ (</>) 
3. アプリ名: **Smart Chore App**
4. Firebase Hosting は **チェックしない**
5. 設定をコピー

### 環境変数設定
```bash
cd frontend
cp .env.example .env.local

# .env.local を開いてFirebase設定を貼り付け
# 以下の形式:
# VITE_FIREBASE_API_KEY=AIzaSy...
# VITE_FIREBASE_AUTH_DOMAIN=evident-pattern-4h7j0.firebaseapp.com
# VITE_FIREBASE_PROJECT_ID=evident-pattern-4h7j0
# ... 他の設定
```

### ローカル起動
```bash
npm install
npm run dev
```

ブラウザで http://localhost:5173 を開いて動作確認！

## 🚀 2. Cloud Run デプロイ (10分で本番環境)

### 必要なAPIを有効化
```bash
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com  
gcloud services enable firestore.googleapis.com
gcloud services enable aiplatform.googleapis.com
gcloud services enable calendar-json.googleapis.com
```

### Docker設定
```bash
# Docker が起動していることを確認
docker --version

# gcloud認証ヘルパーの設定
gcloud auth configure-docker
```

### デプロイ実行
```bash
# デプロイスクリプトに実行権限付与
chmod +x deploy.sh

# デプロイ実行
./deploy.sh
```

または手動でのデプロイ:
```bash
# イメージをビルド
docker build -t gcr.io/evident-pattern-4h7j0/smart-chore-app:latest .

# Container Registry にプッシュ
docker push gcr.io/evident-pattern-4h7j0/smart-chore-app:latest

# Cloud Run にデプロイ  
gcloud run deploy smart-chore-app \
  --image gcr.io/evident-pattern-4h7j0/smart-chore-app:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 512Mi \
  --port 8080
```

## 🤖 3. Vertex AI 設定 (5分でAI機能有効化)

### サービスアカウント作成
```bash
# サービスアカウント作成
gcloud iam service-accounts create vertex-ai-chore \
  --display-name="Vertex AI for Chore App" \
  --project=evident-pattern-4h7j0

# Vertex AI 権限付与
gcloud projects add-iam-policy-binding evident-pattern-4h7j0 \
  --member="serviceAccount:vertex-ai-chore@evident-pattern-4h7j0.iam.gserviceaccount.com" \
  --role="roles/aiplatform.user"

# キーファイル生成
gcloud iam service-accounts keys create vertex-ai-key.json \
  --iam-account=vertex-ai-chore@evident-pattern-4h7j0.iam.gserviceaccount.com
```

### 環境変数更新
```bash
# .env.local に追加
echo "VITE_GOOGLE_APPLICATION_CREDENTIALS=./vertex-ai-key.json" >> frontend/.env.local
```

## 📅 4. Google Calendar API 設定 (3分でカレンダー連携)

### API有効化とキー作成
1. [Google Cloud Console - APIs](https://console.cloud.google.com/apis/dashboard?project=evident-pattern-4h7j0)
2. 「APIとサービスを有効にする」
3. 「Google Calendar API」を検索して有効化
4. 「認証情報」→「認証情報を作成」→「APIキー」
5. 作成されたAPIキーをコピー

### OAuth 2.0 設定
1. 同じく「認証情報を作成」→「OAuth 2.0 クライアントID」
2. アプリケーションの種類: **Webアプリケーション**
3. 名前: **Smart Chore Calendar Integration**
4. 承認済みのJavaScript生成元: 
   - `http://localhost:5173` (開発用)
   - Cloud Run のURL (本番用)
5. クライアントIDをコピー

### 環境変数に追加
```bash
# .env.local に追加
echo "VITE_GOOGLE_CALENDAR_API_KEY=YOUR_API_KEY" >> frontend/.env.local
echo "VITE_GOOGLE_OAUTH_CLIENT_ID=YOUR_CLIENT_ID" >> frontend/.env.local
```

## 🎯 5. デモ準備 (2分で完璧)

### デモ用データ
アプリで以下の家族を登録:
- 👨 お父さん (料理スキル: 7, 掃除スキル: 5)
- 👩 お母さん (料理スキル: 9, 掃除スキル: 8)  
- 👦 太郎 (料理スキル: 3, 掃除スキル: 4)
- 👧 花子 (料理スキル: 4, 掃除スキル: 6)

### デモシナリオ
1. **家族登録** (30秒)
2. **AI分担実行** (30秒) - 「AIが30秒で最適分担完了」
3. **結果確認** (1分) - 公平性スコア、時間配分
4. **カレンダー連携** (1分) - Google Calendar 自動追加
5. **音声操作** (30秒) - 「分担して」で再実行
6. **手動調整** (30秒) - 必要に応じてタスク追加

## 🔗 管理用リンク

- **Cloud Run Console**: https://console.cloud.google.com/run?project=evident-pattern-4h7j0
- **Firebase Console**: https://console.firebase.google.com/project/evident-pattern-4h7j0
- **Vertex AI Console**: https://console.cloud.google.com/ai?project=evident-pattern-4h7j0
- **Calendar API Console**: https://console.cloud.google.com/apis/api/calendar-json.googleapis.com?project=evident-pattern-4h7j0

## 🆘 トラブルシューティング

### よくある問題

**認証エラー**
```bash
gcloud auth login
gcloud auth application-default login
```

**Docker プッシュエラー**
```bash
gcloud auth configure-docker
```

**Firestore権限エラー**
→ Firebase Console でセキュリティルールを確認

**Vertex AI クォータエラー**  
→ Google Cloud Console でクォータ申請

## ✅ 最終チェックリスト

- [ ] gcloud プロジェクト設定済み (`evident-pattern-4h7j0`)
- [ ] Firebase プロジェクト作成済み
- [ ] Firestore Database 有効化済み
- [ ] 環境変数設定済み (.env.local)
- [ ] ローカル動作確認済み
- [ ] 必要なAPI有効化済み
- [ ] Cloud Run デプロイ済み
- [ ] Vertex AI 設定済み
- [ ] Calendar API 設定済み
- [ ] デモシナリオ準備済み

**🎉 ハッカソン準備完了！頑張ってください！**
