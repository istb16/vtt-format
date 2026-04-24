# VTT Formatter

VTT（Web Video Text Tracks）形式の字幕テキストを、読みやすい文章形式に変換するWebツールです。

## 機能

- VTTファイルのドラッグ＆ドロップまたはテキスト直接入力に対応
- タイムスタンプ順のソート
- ロールアップ字幕の重複テキスト除去
- タイムギャップに基づく段落分け（1.5秒以上の間隔で改段落）
- 行末句読点の自動補完（日本語: `。` / 英語: `.`）
- 変換結果のクリップボードコピー

## 技術スタック

| カテゴリ | ライブラリ |
|---|---|
| フレームワーク | [Svelte 5](https://svelte.dev/) / [SvelteKit 2](https://kit.svelte.dev/) |
| ビルドツール | [Vite 8](https://vitejs.dev/) |
| 言語 | TypeScript 5 |
| Linter | ESLint 10 + typescript-eslint 8 |
| Formatter | Prettier 3 |
| CI/CD | GitHub Actions |

## 開発環境のセットアップ

```bash
npm install
npm run dev
```

ブラウザで http://localhost:5173 を開いてください。

## スクリプト

| コマンド | 内容 |
|---|---|
| `npm run dev` | 開発サーバー起動 |
| `npm run build` | 本番ビルド（`build/` ディレクトリに出力） |
| `npm run preview` | 本番ビルドのプレビュー |
| `npm run check` | Svelte / TypeScript の型チェック |
| `npm run check:watch` | 型チェック（ウォッチモード） |
| `npm run lint` | Prettier + ESLint によるコードチェック |
| `npm run format` | Prettier によるコード自動整形 |

## デプロイ

`main` ブランチにプッシュすると GitHub Actions が自動的にビルド・デプロイします。

```bash
git push origin main
```
