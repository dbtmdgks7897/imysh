---
title: "kigaru"
summary: "AIベースの運勢・観相サービスプラットフォーム"
stack: ["Next.js", "FastAPI", "React", "Tailwind CSS", "Gemini Flash"]
status: "in-progress"
period: "2026.03~"
githubUrl: "https://github.com/dbtmdgks7897"
order: 1
---

## 背景 — WHY

日本語の「気軽（きがる）」から名前を取ったkigaruは、「気軽に、軽やかに」という意味だ。
運勢・観相サービスを通じて、ユーザーに軽い楽しさと自己探求の体験を提供することを目標とする。

## プロセス — HOW

Next.js App Router + Static Export ベースのフロントエンドと、FastAPI バックエンドで構成される。
Gemini Flash API を活用し、画像解析および自然言語による結果生成を処理する。

```typescript
// Gemini Flash API 呼び出し例
const response = await model.generateContent([
  { inlineData: { mimeType: "image/jpeg", data: imageBase64 } },
  "この人の観相を分析してください。",
]);
```

## 成果物 — WHAT

| 機能 | 説明 |
|------|------|
| 観相診断 | 写真アップロード → AI解析 → 結果カード |
| 結果シェア | SNSシェア用画像生成 |
| モバイル最適化 | レスポンシブUI |

## 技術的判断

| 選択 | 技術 | 理由 |
|------|------|------|
| Frontend | Next.js | Static Export + SEO最適化 |
| Backend | FastAPI | 非同期処理、Gemini API連携が容易 |
| AI | Gemini Flash | 高速レスポンス、マルチモーダル対応 |

## 振り返り

Gemini Flashのマルチモーダル能力を実験しながら、プロンプトエンジニアリングの重要性を実感した。
サービスの特性上、結果の一貫性を保つことが核心的な課題だった。
