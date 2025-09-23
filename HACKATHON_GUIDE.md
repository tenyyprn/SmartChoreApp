# 🏃‍♂️ ハッカソン当日の実行手順

## ⚡ クイックスタート (10分で開始)

### 1. Google Cloud Project 作成 (2分)
```bash
# プロジェクト作成
gcloud projects create smart-chore-hackathon-YOURNAME

# プロジェクト設定
gcloud config set project smart-chore-hackathon-YOURNAME
```

### 2. Firebase セットアップ (3分)
1. [Firebase Console](https://console.firebase.google.com) → プロジェクト追加
2. 既存のGCPプロジェクトを選択
3. Firestore Database 有効化 (テストモードで開始)
4. Web アプリ作成 → 設定をコピー

### 3. 環境変数設定 (2分)
```bash
cd frontend
cp .env.example .env.local
# Firebase設定を.env.localに貼り付け
```

### 4. ローカル起動 (2分)
```bash
npm install
npm run dev
```

### 5. 基本動作確認 (1分)
- ブラウザで http://localhost:5173 を開く
- 家族メンバー登録
- AI分担実行テスト

## 🚀 本格デプロイ (15分で本番環境)

### 1. API有効化 (3分)
```bash
gcloud services enable \
  cloudbuild.googleapis.com \
  run.googleapis.com \
  firestore.googleapis.com \
  aiplatform.googleapis.com \
  calendar-json.googleapis.com
```

### 2. Cloud Run デプロイ (10分)
```bash
# プロジェクトIDを設定
export GOOGLE_CLOUD_PROJECT=smart-chore-hackathon-YOURNAME

# デプロイ実行
chmod +x deploy.sh
./deploy.sh
```

### 3. 動作確認 (2分)
- デプロイされたURLでアクセス
- Firebase データ保存確認
- レスポンシブ動作確認

## 🎯 デモ準備 (20分で完璧)

### 1. デモ用家族データ作成 (5分)
```javascript
// Firestore Console または アプリから登録
const demoFamily = [
  { name: "お父さん", avatar: "👨", skills: { cooking: 7, cleaning: 5 } },
  { name: "お母さん", avatar: "👩", skills: { cooking: 9, cleaning: 8 } },
  { name: "太郎", avatar: "👦", skills: { cooking: 3, cleaning: 4 } },
  { name: "花子", avatar: "👧", skills: { cooking: 4, cleaning: 6 } }
]
```

### 2. デモシナリオ準備 (10分)
1. **オープニング** - アプリの価値提案説明
2. **家族登録** - 4人家族の設定デモ
3. **AI分担実行** - リアルタイム最適化
4. **手動調整** - 柔軟性のアピール
5. **カレンダー連携** - 実用性の証明
6. **統計表示** - データ活用の価値

### 3. トラブル対策 (5分)
- **ネットワークエラー時**: ローカル環境での実行
- **API制限時**: 静的デモデータの準備
- **画面共有問題時**: スクリーンショット準備

## 🏆 プレゼンテーション戦略

### 核心メッセージ
**"家事分担の悩みを、AIで公平・効率的に解決"**

### デモの流れ (5分)
1. **問題提起** (30秒)
   - 家事分担は多くの家庭の悩み
   - 不公平感・非効率性・ストレス

2. **ソリューション** (1分)
   - AI による最適分担計算
   - カレンダー連携で実用性
   - リアルタイムで調整可能

3. **技術革新** (1分30秒)
   - Google Vertex AI の活用
   - Firebase でのリアルタイム同期
   - レスポンシブデザイン

4. **実際のデモ** (1分30秒)
   - 家族登録 → AI分担 → カレンダー追加

5. **ビジネス価値** (30秒)
   - 家族のストレス軽減
   - 時間の最適化
   - 継続的な学習改善

### 技術的アピールポイント
- **スケーラビリティ**: Cloud Run での自動スケール
- **データ永続化**: Firestore での確実な保存
- **AI活用**: Vertex AI での高度な最適化
- **ユーザー体験**: 直感的なインターフェース
- **実用性**: Google Calendar との完全統合

## 🔧 当日のトラブルシューティング

### よくある問題と即座の対処

#### Firebase 接続エラー
```bash
# プロジェクト確認
firebase projects:list
firebase use [PROJECT_ID]

# ルール確認
firebase firestore:rules get
```

#### Cloud Run デプロイエラー
```bash
# ログ確認
gcloud run services logs read smart-chore-app --region=us-central1

# 再デプロイ
gcloud run deploy smart-chore-app --source .
```

#### Vertex AI API エラー
```bash
# クォータ確認
gcloud ai quotas list --filter="service:aiplatform.googleapis.com"

# フォールバック有効化
# vertexAI.js の fallbackAssignment() が自動実行
```

## 📊 ハッカソン向け追加機能

以下の機能が既に実装済みで、即座にデモ可能：

### 🎨 **ビジュアル要素**
- レスポンシブデザイン
- アニメーション効果
- 統計チャート
- プログレスバー

### 🧠 **AI機能**
- 公平性スコア計算
- スキル考慮分担
- カレンダー回避機能
- 継続学習対応

### 📱 **ユーザー体験**
- ワンクリック分担
- ドラッグ&ドロップ調整
- リアルタイム更新
- オフライン対応

## 🎯 最終チェックリスト

**デプロイ前確認**
- [ ] Google Cloud Project 作成済み
- [ ] Firebase プロジェクト設定済み
- [ ] 環境変数設定済み
- [ ] ローカル動作確認済み

**デプロイ後確認**
- [ ] Cloud Run サービス稼働中
- [ ] Firebase データ保存確認
- [ ] レスポンシブ動作確認
- [ ] エラー処理動作確認

**プレゼン準備**
- [ ] デモシナリオ練習済み
- [ ] トラブル対策準備済み
- [ ] バックアップ環境準備済み
- [ ] 核心メッセージ明確化

---

## 🏁 **準備完了！**

あなたのSmart Chore Appは、以下の最先端技術を駆使したハッカソン準備万端のアプリケーションです：

- **🤖 Google Vertex AI** - 高度なAI分担アルゴリズム
- **🔥 Firebase** - リアルタイムデータベース
- **📅 Google Calendar** - シームレスなカレンダー統合
- **☁️ Cloud Run** - スケーラブルなインフラ
- **🎨 React + Tailwind** - モダンなUI/UX

**ハッカソンでの成功を心から応援しています！！** 🎉🏆
