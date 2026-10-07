This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.js`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.js`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.



## Works assets

作品ページの公開画像とPDFは、ページ表示時や通常のproduction build時にFigmaから取得しません。Figmaのフレームを更新したときだけ、secret注入済みの環境で同期します。

```sh
FIGMA_TOKEN=... bun run assets:sync -- \
  --slug ci-works \
  --file G8jmXOQKLj1y2EjEg8214k \
  --page 'Page 1'
```

このコマンドは、FigmaのFRAMEをJPGとして`public/images/works/<slug>/`へ保存し、同じ画像から`public/works/<slug>.pdf`を生成し、`content/work-assets.mjs`を更新します。同期後は、画像枚数とPDFページ数が同じになることを確認してからbuildします。Figmaのtemporary export URLを公開データへ保存しないでください。

現時点で未同期の作品はWordPressの表紙へフォールバックします。表紙だけの状態を、全ポスターが復元済みとは扱いません。
