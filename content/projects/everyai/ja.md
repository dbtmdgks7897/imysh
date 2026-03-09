---
title: "EveryAI - AI作品・サービス取引プラットフォーム"
summary: "生成AIで制作された作品やサービスを取引できるプラットフォーム。6週間の実務プロジェクト。"
stack: ["Java 17", "Spring Boot 3.1", "JPA", "Spring Security", "Next.js", "JWT", "BootPay"]
status: "deployed"
period: "2023.10 – 2023.12"
order: 2
---

## 1. 背景 — WHY

AI技術で制作されたさまざまな作品やサービスを取引できるプラットフォームを構築する実務プロジェクト。
消費者は手頃な価格でAIサービスを利用でき、制作者は新たな収益チャネルを確保することが目標でした。

## 2. 成果物 — WHAT

バックエンド全体を担当しました。認証、サービスCRUD、リアルタイムメッセージング、決済、管理者機能まで実装しました。

### 認証システム

メール認証 → 会員登録 → JWTログイン → ソーシャルログインまで、認証フロー全体を実装しました。

- メールで認証番号を送信（spring-boot-starter-mail）、DBベースで検証
- JWT発行後にクッキーへ保存、JwtFilterでリクエストごとにトークン検証
- accessToken 1日 / refreshToken 7日、期限切れ時の自動再ログインフロー
- カカオなどのソーシャルログイン — 既存会員かどうかで登録/ログインを分岐

![会員登録](https://pub-72d7e584b9db493583cc4b36f541a9f8.r2.dev/everyai/signup.gif)

![JWTログイン](https://pub-72d7e584b9db493583cc4b36f541a9f8.r2.dev/everyai/login-jwt.gif)

![ソーシャルログイン](https://pub-72d7e584b9db493583cc4b36f541a9f8.r2.dev/everyai/social-login-signup.gif)

### サービス・プロジェクト管理

AIサービス/プロジェクトの登録・修正・削除CRUD。画像アップロード対応。

![サービス登録](https://pub-72d7e584b9db493583cc4b36f541a9f8.r2.dev/everyai/service-register.gif)

![サービス修正](https://pub-72d7e584b9db493583cc4b36f541a9f8.r2.dev/everyai/service-edit.gif)

### 決済（BootPay）

BootPay連携で安全決済を実装。メッセージルーム内で決済リクエスト → 決済処理 → 成功メッセージ送信までの全フロー。

![BootPay決済](https://pub-72d7e584b9db493583cc4b36f541a9f8.r2.dev/everyai/bootpay-1.gif)

![決済完了処理](https://pub-72d7e584b9db493583cc4b36f541a9f8.r2.dev/everyai/bootpay-2.gif)

### リアルタイムメッセージング

1:1メッセージルームの作成、テキスト・添付ファイル・安全決済リクエストメッセージの送信、既読処理、応答率統計まで実装しました。

- 2ユーザー間の既存ルームの有無に応じて新規作成/既存ルームを取得
- ルーム入室時に相手のメッセージを自動既読処理
- メッセージ通報機能

![メッセージルーム作成](https://pub-72d7e584b9db493583cc4b36f541a9f8.r2.dev/everyai/message-room-create.gif)

![通常メッセージ送信](https://pub-72d7e584b9db493583cc4b36f541a9f8.r2.dev/everyai/text-message.gif)

![安全決済リクエストメッセージ](https://pub-72d7e584b9db493583cc4b36f541a9f8.r2.dev/everyai/safe-payment-send.gif)

### 管理者機能

ユーザー管理（制限/解除）、サービス承認/否認、専門家グレード管理、広告バナー管理。

![ユーザー制限](https://pub-72d7e584b9db493583cc4b36f541a9f8.r2.dev/everyai/user-restrict.gif)

![サービス承認](https://pub-72d7e584b9db493583cc4b36f541a9f8.r2.dev/everyai/service-approve.gif)

## 3. 技術判断

### JWT認証設計

accessToken（1日）+ refreshToken（7日）の二重トークン戦略。
フロントエンドで401を受信した際にrefreshTokenで再ログインをリクエスト → 失敗時はログインページへリダイレクト。
Spring SecurityのフィルターチェーンにカスタムJwtFilterを追加し、すべてのリクエストでトークンを検証。

### ソーシャルログイン統合

ソーシャルログイン情報でサーバーDBを照会 → 既存会員ならログイン、新規ならランダムニックネームで自動会員登録。
通常ログインとソーシャルログインを同一のJWT発行フローに統合。

### 安全決済フロー

メッセージシステムと決済システムを連携。メッセージルーム内で自分のサービス/採択されたプロジェクトリストを取得し、決済リクエストメッセージを送信 → BootPay決済 → 決済成功メッセージを自動送信。

## 4. 振り返り

- 教育課程とは異なり、実務を体験できたことで、企業が実際に必要とすることについて貴重な経験を得られました。
- 基本的なCRUDだけでなく、セキュリティ、Gitを使った協業、S3、BootPay、FCMといった実務技術をプロジェクトに組み込む過程で、理論的な背景も深く学ぶことができました。
- 人数が多いからといって生産性が上がるわけではないと実感しました。各自の生産性を最大化する方法を模索し、実践することが重要でした。
- 追加実装したものの本番には組み込めなかった機能: FCMプッシュ通知
