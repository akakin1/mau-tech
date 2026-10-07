# 2001Y.me 復元版

田村義希 / 2001Y の公開サイトを、既存のデザインとコンテンツを保ちながら修復したソースです。

指定されたCodexチャット「FTZメンバーサイトを再制作」（`01a107cc-e64b-7810-84f8-3898f2ec2e63`）の復元プロジェクトを、2026-10-08に取り込みました。復元の基準は [`2001Y/portfolio2022`](https://github.com/2001Y/portfolio2022) のコミット `6c7a4006ba3933cd0ffb67f14d17afa127646f30`。取り込み元の最新コミットは `b4dcffab39305434949db75825e2063513ee5a25` です。

[公開サイト](https://y2001-portfolio-completed.aka-kin1.chatgpt.site/) · [復元・修復記録](RESTORATION.md)

## 内容

- `restored/`: Next.js 15 / React 18 のサイト本体。Works 71件、Blog 327件の公開CMS保存データ、公開素材、既存テストを含みます。
- `scripts/`: 保存データを使う静的ビルドと配信用ファイルの準備・検証。
- `worker/`: 公開先の旧URL転送と静的ページ配信。

初期の別デザイン案、作業チャットの全文、ローカル設定、依存関係、ビルド済みファイルは取り込んでいません。

## 起動

Node.js 24を使用します。このフォルダを起点に実行してください。

```sh
npm ci --prefix restored
npm run dev --prefix restored
```

開発サイトは `http://localhost:3000` で開けます。

## 静的ビルド

```sh
npm run build
node scripts/verify-routing.mjs
```

サイト本体は `out/`、公開先用の構成は `dist/` に生成されます。公開画像の控えは既存の [画像キャッシュ](https://y2001-restoration-media.aka-kin1.chatgpt.site/) を使用します。

## 既存テスト

Node.jsで実行できます：

```sh
cd restored
node --test tests/*.test.mjs
```

この取り込みで元サイトの公開先、CMS、Contact送信先は変更していません。実機でのブラウザ終了とContactメールの到達は未検証です。以前の検証内容と限界は [RESTORATION.md](RESTORATION.md) に記録されています。
