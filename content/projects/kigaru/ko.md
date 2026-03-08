---
title: "kigaru"
summary: "AI 기반 운세·관상 서비스 플랫폼"
stack: ["Next.js", "FastAPI", "React", "Tailwind CSS", "Gemini Flash"]
status: "in-progress"
period: "2026.03~"
githubUrl: "https://github.com/dbtmdgks7897"
order: 1
---

## 배경 — WHY

일본어 "気軽(きがる)"에서 이름을 따온 kigaru는 "부담 없이, 가볍게"라는 뜻이다.
운세·관상 서비스를 통해 사용자에게 가벼운 재미와 자기 탐색의 경험을 제공하는 것을 목표로 한다.

## 프로세스 — HOW

Next.js App Router + Static Export 기반 프론트엔드와 FastAPI 백엔드로 구성된다.
Gemini Flash API를 활용해 이미지 분석 및 자연어 결과 생성을 처리한다.

```typescript
// Gemini Flash API 호출 예시
const response = await model.generateContent([
  { inlineData: { mimeType: "image/jpeg", data: imageBase64 } },
  "이 사람의 관상을 분석해 주세요.",
]);
```

## 결과물 — WHAT

| 기능 | 설명 |
|------|------|
| 관상 진단 | 사진 업로드 → AI 분석 → 결과 카드 |
| 결과 공유 | SNS 공유용 이미지 생성 |
| 모바일 최적화 | 반응형 UI |

## 기술 판단

| 선택 | 기술 | 이유 |
|------|------|------|
| Frontend | Next.js | Static Export + SEO 최적화 |
| Backend | FastAPI | 비동기 처리, Gemini API 연동 용이 |
| AI | Gemini Flash | 빠른 응답 속도, 멀티모달 지원 |

## 회고

Gemini Flash의 멀티모달 능력을 실험하면서 프롬프트 엔지니어링의 중요성을 체감했다.
서비스 특성상 결과의 일관성을 유지하는 것이 핵심 과제였다.
