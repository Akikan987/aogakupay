# aogakupay
青山祭用電子決済アプリ青学ペイ紹介サイト

## CSSキャッシュバスター自動更新

GitHub Pages のキャッシュでデプロイ直後に表示崩れが起きるのを防ぐため、`style.css` のハッシュ値を使って全HTMLの `style.css?v=...` を自動更新できます。

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\update-css-cache-buster.ps1
```

`style.css` を変更したら、`git push` 前にこのコマンドを実行してください。

## pre-push 自動化（推奨）

一度だけ以下を実行すると、`git push` 時に自動でキャッシュバスター更新スクリプトが走ります。

```powershell
git config core.hooksPath .githooks
```

フック実行でHTML更新が発生した場合、push は自動で停止します。
その場合は変更をコミットしてから再度 push してください。
