# AITestbed

ユーザーの現在地や検索した都市の現在の天気情報と予報を提供するモダンな天気予報Webアプリケーションです。

## 開発コマンド

これはFresh/Denoプロジェクトです。以下の標準コマンドを使用してください：

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

## 重要：コード品質

**コミット前やプルリクエスト作成前には必ず以下を実行してください：**

```bash
deno fmt
deno lint
```

これにより、コードの一貫性が保たれ、潜在的な問題を早期に発見できます。

## クイックスタート

1. リポジトリをクローン
2. `deno task start` で開発サーバーを起動
3. ブラウザで `http://localhost:8000` を開く

## 技術スタック

- **フロントエンドフレームワーク**: Fresh (Preactベース)
- **スタイリング**: Tailwind CSS
- **状態管理**: Preact Signals
- **ランタイム**: Deno
- **言語**: TypeScript
- **外部API**: OpenWeatherMap API

## コントリビューション

変更を提出する前に、必ず `deno fmt` と `deno lint` を実行してください。

---

[English version](../README.md)