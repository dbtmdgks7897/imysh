---
title: "EveryAI"
summary: "Generative AI marketplace for digital works and services"
stack: ["Java", "Spring Boot", "JPA", "Spring Security", "Next.js"]
status: "deployed"
period: "2023.10 ~ 2023.12"
order: 2
---

## 1. Background — WHY

### Theme

A platform for trading diverse works and services created using AI technology.

### Goals

- Enable consumers to access AI-powered services at reasonable prices through an open marketplace
- Create new monetization opportunities for both emerging and established creators leveraging AI

## 2. Process — HOW

### Tech Stack

**Frontend:**
- Next.js
- HTML, CSS, JS

**Backend:**
- Java (JDK 17)
- Spring Boot (3.1.4)
- JPA
- Spring Security

### Design

DB schema and UI designs are kept confidential as this was a professional project.

## 3. Results — WHAT

### My Contributions (Backend)

#### Authentication

- **Email Duplicate Check**

> [Screenshot: Email duplicate check — success (이메일_중복_체크_(성공).gif)]

> [Screenshot: Email duplicate check — failure (이메일_중복_체크.gif)]

- **Email Verification** — Sends a verification code to the user's email address (using spring-boot-starter-mail)

> [Screenshot: Verification code sent (이메일_인증.gif)]

- Validates the code against the stored verification record in the DB

> [Screenshot: Verification code validation (인증_코드_검증.gif)]

- **Sign Up** — Registration is only allowed when an email verification record exists in the DB. On success, a random nickname is generated automatically.

> [Screenshot: Sign up (회원가입.gif)]

- **Password Change** — Change password after email verification

> [Screenshot: Password change (비밀번호_변경.gif)]

- **Login (JWT)** — The backend issues a JWT, returns it to the frontend, and stores it in a cookie. Subsequent authenticated requests send the JWT via cookie, which is validated by JwtFilter. [(velog post)](https://velog.io/@dbtmdgks7897/Spring-Boot-Jwt-3-%EA%B5%AC%ED%98%84-%ED%9A%8C%EC%9B%90%EA%B0%80%EC%9E%85-%EB%A1%9C%EA%B7%B8%EC%9D%B8)

> [Screenshot: JWT login (로그인(JWT).gif)]

- **Token Refresh** — accessToken expires in 1 day; refreshToken in 7 days. On a 401 error, the client retries with the refreshToken. If the refreshToken is expired or invalid, the user is redirected to the login page.

- **Social Login** — Checks the server for existing user data from the social login provider, then performs sign-up or login accordingly.

> [Screenshot: Social login — sign up (소셜로그인(회원가입).gif)]

> [Screenshot: Social login — login (소셜로그인(로그인).gif)]

#### Service/Project CRUD

- **Create Service**

> [Screenshot: Service creation (서비스_등록.gif)]

- **Edit Service**

> [Screenshot: Service edit (서비스_수정.gif)]

- **Delete Service**

> [Screenshot: Service deletion (서비스_삭제.gif)]

#### Payment

- **Bootpay** integration [(velog post)](https://velog.io/@dbtmdgks7897/spring-boot-%EB%B6%80%ED%8A%B8%ED%8E%98%EC%9D%B4-4-%EA%B5%AC%ED%98%84)

> [Screenshot: Bootpay payment 1 (부트페이_1.gif)]

> [Screenshot: Bootpay payment 2 (부트페이_2.gif)]

#### Messaging

- **Room List**

> [Screenshot: Room list (방_리스트.png)]

- **Response Rate & Average Response Time**

> [Screenshot: Message response rate and average response time (메시지_응답률_평균_응답_시간.gif)]

- **Create Room** — Creates a new room or retrieves an existing one depending on whether a room already exists between the two users.

> [Screenshot: Message room creation (메시지_방_생성.gif)]

- **Load History & Info**

> [Screenshot: Load history and info (기록_정보_불러오기.gif)]

- **Leave Room**

> [Screenshot: Leave room (방_나가기.gif)]

- **Report Message**

> [Screenshot: Report message (메시지_신고.gif)]

- **Send Message**
  - Text message

> [Screenshot: Text message (일반_메시지.gif)]

  - File attachment message

> [Screenshot: File attachment message (첨부파일_메시지.gif)]

  - Escrow payment request message — shows list of own services / adopted projects

> [Screenshot: Escrow payment request screen (안전_결제_요청_메시지_내_서비스_프로젝트_리스트.gif)]

> [Screenshot: Escrow payment request sent (안전_결제_요청_메시지_전송.gif)]

  - Escrow payment success message

> [Screenshot: Escrow payment 1 (안전_결제_1.gif)]

> [Screenshot: Escrow payment success message sent (안전_결제_2.gif)]

- **Read Status** — Marks all messages from other users as read upon entering a message room

#### Wishlist

- **View List**

> [Screenshot: Wishlist (찜_목록_보기.png)]

- **Add/Remove from Wishlist**

> [Screenshot: Add/remove wishlist (찜(해제)하기.gif)]

#### Admin

- **Expert Tier** — Number of users per expert tier

> [Screenshot: Users by expert tier (전문가_등급별_유저_수.png)]

- Expert tier list

> [Screenshot: Expert tier list (전문가_등급_리스트.gif)]

- **User Management** — User list

> [Screenshot: User list (유저_리스트.png)]

- Restrict / unrestrict user

> [Screenshot: Restrict user (유저_제한.gif)]

> [Screenshot: Unrestrict user (유저_제한_해제.gif)]

- **Service & Project Management** — Count by service status

> [Screenshot: Service count by status (서비스_상태_별_개수.png)]

- Service list

> [Screenshot: Service list (서비스_리스트.gif)]

- Approve / reject service

> [Screenshot: Service approval (서비스_승인.gif)]

> [Screenshot: Service rejection (서비스_미승인.gif)]

- **Ad Banner Management** — Banner list

> [Screenshot: Ad banner list (광고_배너_리스트.png)]

- Delete banner

> [Screenshot: Delete banner (광고_배너_삭제.gif)]

- Create banner

> [Screenshot: Create banner (광고_배너_작성.gif)]

- Reorder banners

> [Screenshot: Reorder banners (광고_배너_순서_변경.gif)]

### Additional Features

- [FCM (Firebase Cloud Messaging)](https://velog.io/@dbtmdgks7897/spring-boot-fcm-4-%EA%B5%AC%ED%98%84) — Implemented but not shipped to production

## 4. Retrospective

- Unlike training programs, this project gave me real **industry experience** and invaluable insight into what companies actually need.
- Beyond basic CRUD, implementing **team collaboration** via Git, and real-world integrations like S3, Bootpay, and FCM deepened my understanding of the **theoretical foundations** behind each technology.
- More people don't always mean more productivity. It's essential to find and apply ways to **maximize each person's individual output**.
