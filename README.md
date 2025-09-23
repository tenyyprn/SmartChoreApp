# Smart Chore App 🏠

AI技術を活用した公平で効率的な家事分担システム

## 🌟 機能

- **AI家事分担**: スキルや負荷を考慮した自動タスク割り当て
- **リアルタイム進捗管理**: タスクの完了状況をリアルタイムで追跡
- **家族メンバー管理**: アバター・スキル・年齢層設定
- **統計・分析**: 完了率、作業時間、公平性の分析
- **レスポンシブデザイン**: PC・スマートフォン対応

## 🛠 技術スタック

### フロントエンド
- **React 18** - ユーザーインターフェース
- **TypeScript** - 型安全性
- **Tailwind CSS** - スタイリング
- **Vite** - ビルドツール
- **React Router** - ルーティング

### バックエンド
- **React Context API** - 状態管理
- **localStorage** - データ永続化

### デプロイ
- **Google App Engine** - ホスティング
- **GitHub** - ソースコード管理

## 📁 プロジェクト構成

```
SmartChoreApp/
├── frontend/                 # フロントエンドアプリケーション
│   ├── src/
│   │   ├── components/       # Reactコンポーネント
│   │   ├── contexts/         # Context API
│   │   ├── pages/           # ページコンポーネント
│   │   └── utils/           # ユーティリティ関数
│   ├── public/              # 静的ファイル
│   ├── dist/                # ビルド成果物
│   ├── package.json         # 依存関係
│   ├── app.yaml            # Google App Engine設定
│   └── vite.config.js      # Vite設定
└── README.md               # このファイル
```

## 🚀 セットアップ

### 前提条件
- Node.js 18以上
- npm または yarn
- Google Cloud CLI（デプロイ用）

### ローカル開発

1. **リポジトリのクローン**
   ```bash
   git clone https://github.com/yourusername/SmartChoreApp.git
   cd SmartChoreApp/frontend
   ```

2. **依存関係のインストール**
   ```bash
   npm install
   ```

3. **開発サーバーの起動**
   ```bash
   npm run dev
   ```

4. **ブラウザでアクセス**
   ```
   http://localhost:5173
   ```

### ビルド

```bash
npm run build
```

## 🌐 デプロイ

### Google App Engineへのデプロイ

1. **Google Cloud CLIの設定**
   ```bash
   gcloud auth login
   gcloud config set project [YOUR_PROJECT_ID]
   ```

2. **ビルド**
   ```bash
   npm run build
   ```

3. **デプロイ**
   ```bash
   gcloud app deploy app.yaml
   ```

## 📱 対応ブラウザ

- **PC**: Chrome, Firefox, Safari, Edge
- **スマートフォン**: iOS Safari, Android Chrome
- **タブレット**: 各種対応

## 🎯 使い方

1. **家族設定**: 家族メンバーを登録し、スキルや年齢を設定
2. **AI分担実行**: ボタンをクリックして今日のタスクを自動生成
3. **タスク管理**: タスクをタップして完了/未完了を切り替え
4. **進捗確認**: 統計画面で家族の貢献度を確認

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/AmazingFeature`)
3. 変更をコミット (`git commit -m 'Add some AmazingFeature'`)
4. ブランチにプッシュ (`git push origin feature/AmazingFeature`)
5. プルリクエストを作成

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 👨‍💻 作者

- **開発者**: [tenyyprn]
- **Email**: [tenyyprn@gmail.com]
- **GitHub**: [@tenyyprn]

## 🙏 謝辞

- React チーム - 素晴らしいフレームワーク
- Tailwind CSS - 美しいデザインシステム
- Lucide React - アイコンライブラリ
