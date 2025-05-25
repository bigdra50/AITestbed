# AITestbed - 天気予報Webアプリケーション

[![CI](https://github.com/bigdra50/AITestbed/actions/workflows/ci.yml/badge.svg)](https://github.com/bigdra50/AITestbed/actions/workflows/ci.yml)

[English README is here / 英語版READMEはこちら](../README.md)

## 概要

AITestbedは、ユーザーが現在地や検索した都市の現在の天気情報と予報を簡単に確認できるモダンな天気予報Webアプリケーションです。モバイルとデスクトッププラットフォームの両方をサポートするレスポンシブデザインを備え、モダンなUI/UXに焦点を当てています。

## 機能

- **現在地の天気表示**: ブラウザのGeolocation APIを使用した自動位置検出
- **都市検索**: オートコンプリート機能付きの検索機能
- **5日間予報**: 時間別詳細を含む詳細な天気予報
- **ダーク/ライトテーマ**: ダークモードとライトモードの切り替え
- **PWA対応**: Service Workerによるオフライン機能
- **レスポンシブデザイン**: モバイル、タブレット、デスクトップデバイス対応
- **チャート**: 気温と降水量の可視化
- **検索履歴**: 最近検索した10都市まで記憶

## 技術スタック

- **フロントエンドフレームワーク**: Fresh (Preactベース)
- **スタイリング**: Tailwind CSS
- **状態管理**: Preact Signals
- **ランタイム**: Deno
- **言語**: TypeScript
- **外部API**: OpenWeatherMap API

## クイックスタート

### 前提条件

- Deno 1.x以降
- OpenWeatherMap APIキー

### インストール

1. リポジトリをクローン:
```bash
git clone https://github.com/bigdra50/AITestbed.git
cd AITestbed
```

2. 環境変数を設定:
```bash
# .envファイルを作成してOpenWeatherMap APIキーを追加
echo "OPENWEATHER_API_KEY=your_api_key_here" > .env
```

3. 開発サーバーを起動:
```bash
deno task start
```

アプリケーションは `http://localhost:8000` で利用できます。

## 開発コマンド

```bash
# 開発サーバーを起動
deno task start

# テストを実行
deno test

# コードをフォーマット
deno fmt

# Lintを実行
deno lint

# 型チェックを実行
deno check **/*.ts
```

## アーキテクチャ

- **APIルート**: OpenWeatherMap API連携を処理
- **天気データインターフェース**: `docs/requirement.md:200`で定義
- **エラーハンドリング**: ネットワーク、位置情報、API障害に対する適切な処理
- **キャッシュ**: パフォーマンス最適化のためAPIレスポンスを5分間キャッシュ
- **パフォーマンス**: Core Web Vitals「Good」評価とLighthouseスコア90+を目標
- **セキュリティ**: Geolocation API アクセスにはHTTPSが必要

## プロジェクト構造

```
├── components/          # 再利用可能なUIコンポーネント
├── islands/            # インタラクティブなクライアントサイドコンポーネント
├── routes/             # アプリケーションルートとAPIエンドポイント
│   └── api/           # APIルートハンドラー
├── static/            # 静的アセット
├── types/             # TypeScript型定義
├── docs/              # ドキュメント
└── tailwind.config.ts # Tailwind CSS設定
```

## API制限

OpenWeatherMap APIは無料プランで1日1000回の呼び出しに制限されています。

## 貢献

1. リポジトリをフォーク
2. フィーチャーブランチを作成: `git checkout -b feature/your-feature-name`
3. 変更をコミット: `git commit -m 'feat: add some feature'`
4. ブランチにプッシュ: `git push origin feature/your-feature-name`
5. プルリクエストを提出

## Gitワークフロー

このプロジェクトでは **GitHub Flow** を使用します：

1. **メインブランチ**: `main` ブランチは常にデプロイ可能な状態を保つ
2. **フィーチャーブランチ**: 新機能や修正のために `main` から新しいブランチを作成
3. **ブランチ命名規則**: 
   - `feature/機能名` (新機能)
   - `fix/修正内容` (バグ修正)
   - `refactor/リファクタリング内容` (リファクタリング)
4. **プルリクエスト**: 作業完了後、`main` ブランチに向けてプルリクエストを作成
5. **レビュー**: コードレビュー後にマージ
6. **CI/CD**: プルリクエストとマージ時に自動テスト・フォーマット・Lintを実行

## パフォーマンス目標

- 初回読み込み時間: 3秒以内
- ページ遷移時間: 1秒以内
- Core Web Vitals: 「Good」評価
- Lighthouseスコア: 90点以上

## ブラウザサポート

- モダンブラウザ (Chrome、Firefox、Safari、Edge最新版)
- ES2020以降の機能
- モバイルブラウザサポート

## ライセンス

MIT License - 詳細は [LICENSE](../LICENSE) ファイルを参照してください。

## サポート

問題が発生した場合や質問がある場合は、GitHubで [issue を作成](https://github.com/bigdra50/AITestbed/issues) してください。