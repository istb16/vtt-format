# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## コマンド

```bash
npm run dev          # 開発サーバー起動 (http://localhost:5173)
npm run build        # 本番ビルド → build/ に出力
npm run preview      # 本番ビルドをローカルでプレビュー
npm run check        # Svelte / TypeScript 型チェック
npm run check:watch  # 型チェック（ウォッチモード）
npm run lint         # Prettier + ESLint チェック
npm run format       # Prettier 自動整形
```

テストは存在しない。型チェックとビルドが品質確認の主な手段。

## アーキテクチャ

**単一ページの静的サイト**。SvelteKit の `adapter-static` でビルドし、`main` ブランチへのプッシュで GitHub Actions が Firebase Hosting へデプロイする。

### データフロー

```
ユーザー入力 (VTT テキスト or ファイルドロップ)
  → +page.svelte (状態管理・イベントハンドラ)
  → src/lib/vtt.ts の convert() を呼び出し
  → 変換結果を出力パネルに表示
```

### コンポーネント構成

`+page.svelte` がルートで、状態 (`$state`) とハンドラのみを持つ。UI は 3 つのコンポーネントに分割されている。

- **`AppHeader`** — ロゴ・タイトル表示のみ。プロパティで文言を受け取る
- **`TextPanel`** — 入力・出力両方に使う汎用パネル。`bind:value` で双方向バインド、`onFileDrop` コールバックでファイルドロップを処理、`action` スニペットでヘッダー右側のボタンを差し込む。ドラッグ状態 (`dragging`) はコンポーネント内部に閉じている
- **`ConvertButton`** — ラッパー `div` 込みで自己完結したグラデーションボタン

### VTT 変換ロジック (`src/lib/vtt.ts`)

公開 API は `convert(text: string): string` の 1 関数のみ。内部処理の順序：

1. 改行コード正規化
2. `WEBVTT` ヘッダー判定（非 VTT テキストはそのまま返す）
3. タイムスタンプ付きキューをパース（HTML タグ除去含む）
4. 開始時刻順にソート
5. ロールアップ字幕の除去（次のキューが現在のキューのテキストで始まる場合スキップ）
6. 1.5 秒以上のギャップで段落分け
7. 段落末尾に句読点補完（CJK 文字があれば `。`、なければ `.`）

### CSS 設計

デザイントークン（カラー変数）は `+page.svelte` の `:global(:root)` で定義し、全コンポーネントが `var(--color-primary)` 等で参照する。`TextPanel` の action スニペット内ボタンのスタイル (`btn-ghost`) は、スニペット定義元である `+page.svelte` のスコープが適用されるため、そこで定義している。
