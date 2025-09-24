# 🏠 SmartChoreApp

[![AI Platform](https://img.shields.io/badge/AI-Vertex%20AI-blue.svg)](https://cloud.google.com/vertex-ai)
[![React](https://img.shields.io/badge/React-18-61dafb.svg)](https://reactjs.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

> **Vertex AI駆動による次世代家事分担システム**

Google Vertex AIとGemini 1.5 Flashを活用し、各家族メンバーのスキルと作業負荷を分析して**公平性スコア88%以上**を実現する効率的な家事分担を自動提案します。

📱 **[デモを試す]https://smart-chore-app-dot-compact-haiku-454409-j0.an.r.appspot.com/**

---

## ✨ 主要機能

### 🤖 AI駆動家事分担
- **Vertex AI (Gemini 1.5 Flash)** による高度な分担最適化
- **スキルマッチング** - 各メンバーの得意分野を考慮した割り当て
- **負荷バランス** - 公平性スコア88%以上を実現
- **リアルタイム最適化** - 進捗に応じた動的再分散

### 👥 家族管理
- **詳細プロフィール** - アバター、年齢、10段階スキル評価
- **6つのスキルカテゴリ** - 料理・掃除・洗濯・買い物・育児・メンテナンス
- **学習機能** - 利用パターンから最適化を改善

### 📊 分析・レポート
- **公平性分析** - リアルタイム公平性スコア計算
- **ワークロード可視化** - メンバー別作業時間・タスク数
- **AI改善提案** - 具体的な分担改善アドバイス
- **パフォーマンス追跡** - 完了率・効率性の統計

---

## 🛠 技術スタック

<table>
<tr>
<td valign="top" width="33%">

### Frontend
- **React 18** - UIフレームワーク
- **Vite** - ビルドシステム
- **Tailwind CSS** - スタイリング
- **React Router 6** - SPAルーティング
- **React Context** - 状態管理
- **Lucide React** - アイコンライブラリ

</td>
<td valign="top" width="33%">

### AI/ML
- **Google Vertex AI** - エンタープライズAI
- **Gemini 1.5 Flash** - 生成AIモデル
- **カスタムアルゴリズム** - スキル考慮最適化
- **統計計算エンジン** - 公平性分析

</td>
<td valign="top" width="33%">

### Infrastructure
- **Google App Engine** - サーバーレス実行環境
- **Google Cloud Build** - CI/CDパイプライン
- **GitHub Actions** - 自動デプロイ
- **Local Storage** - クライアントサイド永続化

</td>
</tr>
</table>

---

## 📁 プロジェクト構成

```
SmartChoreApp/
├── 📁 frontend/
│   ├── 📁 src/
│   │   ├── 🧩 components/          # 再利用可能コンポーネント
│   │   │   ├── AIAnalysisDisplay.jsx
│   │   │   ├── Navigation.jsx
│   │   │   └── TaskCompletionCelebration.jsx
│   │   ├── 🎯 contexts/            # 状態管理
│   │   │   └── ChoreContext.jsx
│   │   ├── 📄 pages/              # ページコンポーネント
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── AssignmentPage.jsx
│   │   │   └── SetupPage.jsx
│   │   ├── ⚙️ services/           # ビジネスロジック
│   │   │   ├── vertexAI.js
│   │   │   ├── choreDatabase.js
│   │   │   └── calendar.js
│   │   └── 🔧 utils/              # ユーティリティ
│   ├── package.json
│   ├── app.yaml
│   └── vite.config.js
└── README.md
```

---

## 🚀 セットアップ

### 📋 前提条件

| 要件 | バージョン | 推奨 |
|------|-----------|------|
| Node.js | 18+ | 18.17.0以上 |
| npm/yarn | latest | npm 9+ |
| Google Cloud CLI | latest | デプロイ用 |
| Vertex AI API | 有効化済み | Google Cloud Project |

### 💻 ローカル開発

1. **📥 リポジトリクローン**
   ```bash
   git clone https://github.com/tenyyprn/SmartChoreApp.git
   cd SmartChoreApp/frontend
   ```

2. **📦 依存関係インストール**
   ```bash
   npm install
   ```

3. **🔐 環境変数設定**
   
   `.env.local` ファイルを作成:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   VITE_GOOGLE_CLOUD_PROJECT_ID=your_project_id
   VITE_VERTEX_AI_LOCATION=asia-northeast1
   VITE_MOCK_MODE=false
   ```

4. **🎯 開発サーバー起動**
   ```bash
   npm run dev
   ```

5. **🌐 ブラウザでアクセス**
   
   [http://localhost:5173](http://localhost:5173) を開く

---

## 🚢 デプロイメント

### Google App Engineへの自動デプロイ

1. **🔓 Google Cloud認証**
   ```bash
   gcloud auth login
   gcloud config set project compact-haiku-454409-j0
   ```

2. **⚡ 必要なAPI有効化**
   ```bash
   gcloud services enable aiplatform.googleapis.com
   gcloud services enable cloudbuild.googleapis.com
   ```

3. **🚀 デプロイ実行**
   ```bash
   cd frontend
   npm run build
   gcloud app deploy app.yaml
   ```

### 🔄 CI/CD Pipeline

| ステップ | 詳細 |
|----------|------|
| **トリガー** | GitHub main ブランチへのpush |
| **ビルド** | Google Cloud Build |
| **デプロイ** | App Engine Standard Environment |
| **URL** | https://smart-chore-app-dot-compact-haiku-454409-j0.an.r.appspot.com/ |

---

## 🌐 対応環境

### 🖥 デスクトップブラウザ
- ✅ Chrome 90+ (推奨)
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### 📱 モバイルブラウザ
- ✅ iOS Safari 14+
- ✅ Android Chrome 90+
- ✅ Samsung Internet 13+

---

## 📖 使用方法

### 🎯 初期設定

<table>
<tr>
<td width="30%">

#### 1️⃣ 家族メンバー登録
- "家族設定"ページから追加
- アバター、年齢、名前を設定

</td>
<td width="35%">

#### 2️⃣ スキル評価
- 各メンバーの得意分野を10段階で評価
- 6つのカテゴリを網羅

</td>
<td width="35%">

#### 3️⃣ 利用可能時間設定
- 平日・週末の時間帯を設定
- 4時間帯で管理（朝・昼・夕・夜）

</td>
</tr>
</table>

### 🤖 AI分担の実行

1. **▶️ 分担実行**
   - ダッシュボードの"AI分担実行"ボタンをクリック
   - Vertex AIが自動的に今日の家事を生成・分担

2. **📊 結果確認**
   - 公平性スコア（目標：88%以上）を確認
   - 各メンバーの作業時間とタスク数を確認
   - AI改善提案を参考に調整

### ✅ タスク管理

1. **📈 進捗更新**
   - タスクをタップして完了/未完了を切り替え
   - リアルタイムで統計が更新

2. **🎉 完了祝福**
   - タスク完了時に祝福アニメーション表示
   - 家族メンバーへの感謝メッセージ送信

3. **📊 分析確認**
   - "AI分担"ページで詳細分析を確認
   - ワークロード分析と改善提案を活用

---

## 🧠 主要アルゴリズム

### Vertex AI分担エンジン

| 要素 | 重み | 説明 |
|------|------|------|
| **スキルマッチング** | 70% | 各家事に最適なメンバーを選択 |
| **負荷バランス** | 30% | 全体的な作業量の均等化 |
| **公平性スコア** | - | リアルタイム計算で88%以上を維持 |
| **学習機能** | - | 利用履歴から分担パターンを最適化 |

### 📈 分析機能詳細

- **ワークロード可視化** - メンバー別作業時間・タスク数・利用率
- **スキル分析** - 得意分野マッピングと改善提案  
- **トレンド分析** - 時系列での効率性・満足度変化
- **改善提案** - AIによる具体的な分担調整アドバイス

---


## 🙏 クレジット

### 主要技術
- **Google Vertex AI** - AI分析エンジン
- **React** - UIフレームワーク  
- **Tailwind CSS** - スタイリングシステム
- **Lucide** - アイコンライブラリ

---

<div align="center">

**🏠 SmartChoreApp - AI技術で家族の協力を次のレベルへ 🚀**

[![GitHub stars](https://img.shields.io/github/stars/tenyyprn/SmartChoreApp?style=social)](https://github.com/tenyyprn/SmartChoreApp)

</div>
