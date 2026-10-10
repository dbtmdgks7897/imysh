---
title: "My Asset Manager"
summary: "내 자산을 기록하고 분석해서, 지금 상태를 한눈에 보는 웹사이트."
role: "개인 프로젝트 (혼자 기획·설계·개발)"
---

## 왜 시작했나

대학 교수님의 특강에서 만든 개인 프로젝트다.

자산을 효율적으로 기록하고 분석해서, 지금 상태를 쉽게 파악하고 싶었다.

기술 쪽 목표도 있었다. 스프링부트에 익숙해지기. 서버와 화면 사이에서 데이터가 오가는 과정을 이해하기.

그리고 시험 하나. 그때 적어 둔 말 그대로다.

> 챗GPT를 사용하여 내가 알지 못하던 기술에 얼마나 잘 적응할 수 있는지 테스트 해 보기 위함.

Vue를 고른 이유도 이것이다.

## 무엇을 만들었나

실제 자산이나 연습용 포트폴리오를 등록해 두고 지켜보는 웹사이트.

- 주식·외화·암호화폐 검색과 상세
- 포트폴리오 비중 그래프와 분석
- 거래 내역, 즐겨찾기
- 게시판, 회원가입, 관리자 페이지

![포트폴리오 상세 — 2026년에 데모 데이터로 다시 실행한 화면](/images/projects/my-asset-manager/portfolio-detail.webp)

![분석 화면](/images/projects/my-asset-manager/analyze.webp)

![암호화폐 상세](/images/projects/my-asset-manager/bitcoin-detail.webp)

기능을 하나씩 ChatGPT와 토론하며 정했다. DB는 GPT 초안 → 내가 다시 그림 → GPT 피드백 순서로 다듬었다.

데모 영상: [자산 기능](https://youtu.be/nK9Wwt1JDaI) · [게시판·로그인 등](https://youtu.be/Gmr1G4QhKCk)

## 기술 이야기

- 흐름: 기능 설계(ChatGPT와 토론) → 화면 구상(목업 도구) → ERD → API 구상(ChatGPT와 토론) → 구현.
- 기능 설계는 v1에서 v3까지, DB 설계도 v1에서 v3까지 고쳤다. v3에서는 관리자 여부 컬럼을 역할·권한 테이블 구조로 바꿨다.
- 1차 구현은 자산 기능 없이 게시판·계정·관리부터, 2차에 자산 기능을 넣었다.
- 배운 점: 정지된 계정 확인은 UserDetailsService에서. 사용자와 게시물은 지우지 않고 `deleted_at`으로 남긴다.

![처음 그린 화면 목업](/images/projects/my-asset-manager/mockup.webp)

![DB 설계 v3](/images/projects/my-asset-manager/db-v3.webp)

## 생각한 것

3주 남짓 만에 끝냈다. 처음 보는 기술도 ChatGPT와 함께라면 따라갈 수 있었다.

2023년 8월 20일, 데모 영상 두 개를 남기고 마무리했다. 마지막에 배포까지 했고, 지금은 내려가 있다. 그 특강을 하신 교수님이 인턴을 추천해 주셨고, 거기서 everyai를 만들었다.

2026년에 다시 돌려 보니 동작은 했지만, 지금 보면 고칠 곳이 많다.
