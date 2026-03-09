---
title: "EveryAI - AI 작품·서비스 거래 플랫폼"
summary: "생성 AI로 만든 작품과 서비스를 거래할 수 있는 플랫폼. 6주 실무 프로젝트."
stack: ["Java 17", "Spring Boot 3.1", "JPA", "Spring Security", "Next.js", "JWT", "BootPay"]
status: "deployed"
period: "2023.10 – 2023.12"
order: 2
---

## 1. 배경 — WHY

AI 기술로 만든 다양한 작품과 서비스를 거래할 수 있는 플랫폼을 구축하는 실무 프로젝트.
소비자는 합리적인 가격에 AI 서비스를 이용하고, 제작자는 새로운 수익 채널을 확보하는 것이 목표였다.

## 2. 결과물 — WHAT

백엔드 전체를 담당했다. 인증, 서비스 CRUD, 실시간 메시징, 결제, 관리자 기능까지 구현.

### 인증 시스템

이메일 인증 → 회원가입 → JWT 로그인 → 소셜 로그인까지 전체 인증 플로우를 구현했다.

- 이메일로 인증번호 발송(spring-boot-starter-mail), DB 기반 검증
- JWT 발급 후 쿠키 저장, JwtFilter로 요청마다 토큰 검증
- accessToken 1일 / refreshToken 7일, 만료 시 자동 재발급 플로우
- 카카오 등 소셜 로그인 — 기존 회원 여부에 따라 가입/로그인 분기

![회원가입](https://pub-72d7e584b9db493583cc4b36f541a9f8.r2.dev/everyai/signup.gif)

![JWT 로그인](https://pub-72d7e584b9db493583cc4b36f541a9f8.r2.dev/everyai/login-jwt.gif)

![소셜 로그인](https://pub-72d7e584b9db493583cc4b36f541a9f8.r2.dev/everyai/social-login-signup.gif)

### 서비스·프로젝트 관리

AI 서비스/프로젝트의 등록·수정·삭제 CRUD. 이미지 업로드 포함.

![서비스 등록](https://pub-72d7e584b9db493583cc4b36f541a9f8.r2.dev/everyai/service-register.gif)

![서비스 수정](https://pub-72d7e584b9db493583cc4b36f541a9f8.r2.dev/everyai/service-edit.gif)

### 결제 (BootPay)

부트페이 연동으로 안전 결제 구현. 메시지 방 내에서 결제 요청 → 결제 처리 → 성공 메시지 전송까지의 전체 플로우.

![부트페이 결제](https://pub-72d7e584b9db493583cc4b36f541a9f8.r2.dev/everyai/bootpay-1.gif)

![결제 완료 처리](https://pub-72d7e584b9db493583cc4b36f541a9f8.r2.dev/everyai/bootpay-2.gif)

### 실시간 메시징

1:1 메시지 방 생성, 텍스트·첨부파일·안전결제 요청 메시지 전송, 읽음 처리, 응답률 통계까지 구현.

- 두 유저 간 기존 방 유무에 따라 새 방 생성 / 기존 방 불러오기
- 방 진입 시 상대 메시지 자동 읽음 처리
- 메시지 신고 기능

![메시지 방 생성](https://pub-72d7e584b9db493583cc4b36f541a9f8.r2.dev/everyai/message-room-create.gif)

![일반 메시지 전송](https://pub-72d7e584b9db493583cc4b36f541a9f8.r2.dev/everyai/text-message.gif)

![안전 결제 요청 메시지](https://pub-72d7e584b9db493583cc4b36f541a9f8.r2.dev/everyai/safe-payment-send.gif)

### 관리자 기능

유저 관리(제한/해제), 서비스 승인/반려, 전문가 등급 관리, 광고 배너 관리.

![유저 제한](https://pub-72d7e584b9db493583cc4b36f541a9f8.r2.dev/everyai/user-restrict.gif)

![서비스 승인](https://pub-72d7e584b9db493583cc4b36f541a9f8.r2.dev/everyai/service-approve.gif)

## 3. 기술 판단

### JWT 인증 설계

accessToken(1일) + refreshToken(7일) 이중 토큰 전략.
프론트에서 401 수신 시 refreshToken으로 재로그인 요청 → 실패 시 로그인 페이지로 리다이렉트.
Spring Security의 필터 체인에 커스텀 JwtFilter를 추가하여 모든 요청에서 토큰 검증.

### 소셜 로그인 통합

소셜 로그인 정보로 서버 DB 조회 → 기존 회원이면 로그인, 신규면 자동 회원가입 + 랜덤 닉네임 생성.
일반 로그인과 소셜 로그인을 동일한 JWT 발급 플로우로 통합.

### 안전 결제 플로우

메시지 시스템과 결제 시스템을 연동. 메시지 방 내에서 내 서비스/채택된 프로젝트 리스트를 불러와 결제 요청 메시지 전송 → 부트페이 결제 → 결제 성공 메시지 자동 전송.

## 4. 회고

- 교육 과정과 달리 실무를 경험할 수 있어서 회사에서 실제로 필요로 하는 것에 대한 값진 경험이었다.
- 기본 CRUD 외에 보안, Git 협업, S3, 부트페이, FCM 같은 실무 기술을 프로젝트에 통합하면서 이론적 배경도 깊게 공부할 수 있었다.
- 인원이 많다고 생산성이 올라가지 않는다는 걸 체감. 각자의 생산성을 최대화할 방법을 모색하고 적용하는 게 중요했다.
- 추가 구현했지만 넣지 못한 기능: FCM 푸시 알림
