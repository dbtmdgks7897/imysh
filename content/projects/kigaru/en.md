---
title: "kigaru"
summary: "AI-powered fortune & face reading service platform"
stack: ["Next.js", "FastAPI", "React", "Tailwind CSS", "Gemini Flash"]
status: "in-progress"
period: "2026.03~"
githubUrl: "https://github.com/dbtmdgks7897"
order: 1
---

## Background — WHY

Named after the Japanese word "気軽 (kigaru)," meaning "casual" or "effortless," kigaru aims to provide users with lighthearted entertainment and a journey of self-discovery through fortune-telling and face-reading services.

## Process — HOW

Built with a Next.js App Router + Static Export frontend and a FastAPI backend.
Gemini Flash API handles image analysis and natural language result generation.

```typescript
// Gemini Flash API call example
const response = await model.generateContent([
  { inlineData: { mimeType: "image/jpeg", data: imageBase64 } },
  "Please analyze this person's facial features.",
]);
```

## Outcome — WHAT

| Feature | Description |
|---------|-------------|
| Face Reading | Photo upload → AI analysis → result card |
| Result Sharing | SNS-shareable image generation |
| Mobile Optimized | Responsive UI |

## Technical Decisions

| Choice | Technology | Reason |
|--------|------------|--------|
| Frontend | Next.js | Static Export + SEO optimization |
| Backend | FastAPI | Async processing, easy Gemini API integration |
| AI | Gemini Flash | Fast response, multimodal support |

## Retrospective

Working with Gemini Flash's multimodal capabilities highlighted the critical importance of prompt engineering.
Maintaining consistency of results was the key challenge, given the nature of the service.
