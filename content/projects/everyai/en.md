---
title: "EveryAI - AI Works & Services Marketplace"
summary: "A marketplace for trading works and services created with generative AI. A 6-week real-world project."
stack: ["Java 17", "Spring Boot 3.1", "JPA", "Spring Security", "Next.js", "JWT", "BootPay"]
status: "deployed"
period: "2023.10 – 2023.12"
order: 2
---

## 1. Background — WHY

A real-world project to build a platform where AI-generated works and services can be bought and sold.
The goal was to let consumers access AI services at reasonable prices while giving creators a new revenue channel.

## 2. Results — WHAT

I was responsible for the entire backend — authentication, service CRUD, real-time messaging, payments, and admin features.

### Authentication System

Implemented the full auth flow: email verification → sign-up → JWT login → social login.

- Email verification code sent via spring-boot-starter-mail, validated against DB
- JWT issued and stored in cookies; JwtFilter validates the token on every request
- accessToken (1 day) / refreshToken (7 days) with automatic re-authentication flow
- Social login (Kakao, etc.) — routes to sign-up or login based on whether the user already exists

![Sign Up](https://pub-72d7e584b9db493583cc4b36f541a9f8.r2.dev/everyai/signup.gif)

![JWT Login](https://pub-72d7e584b9db493583cc4b36f541a9f8.r2.dev/everyai/login-jwt.gif)

![Social Login](https://pub-72d7e584b9db493583cc4b36f541a9f8.r2.dev/everyai/social-login-signup.gif)

### Service & Project Management

Full CRUD for AI services and projects — including image upload.

![Register Service](https://pub-72d7e584b9db493583cc4b36f541a9f8.r2.dev/everyai/service-register.gif)

![Edit Service](https://pub-72d7e584b9db493583cc4b36f541a9f8.r2.dev/everyai/service-edit.gif)

### Payments (BootPay)

Integrated BootPay for secure payments. Full flow: payment request in a message room → payment processing → success message sent.

![BootPay Payment](https://pub-72d7e584b9db493583cc4b36f541a9f8.r2.dev/everyai/bootpay-1.gif)

![Payment Completion](https://pub-72d7e584b9db493583cc4b36f541a9f8.r2.dev/everyai/bootpay-2.gif)

### Real-Time Messaging

Built 1:1 message rooms with text, attachments, and secure payment request messages, plus read receipts and response rate stats.

- Creates a new room or loads an existing one based on whether the two users already have a conversation
- Automatically marks the other user's messages as read upon room entry
- Message reporting feature

![Create Message Room](https://pub-72d7e584b9db493583cc4b36f541a9f8.r2.dev/everyai/message-room-create.gif)

![Send Text Message](https://pub-72d7e584b9db493583cc4b36f541a9f8.r2.dev/everyai/text-message.gif)

![Secure Payment Request Message](https://pub-72d7e584b9db493583cc4b36f541a9f8.r2.dev/everyai/safe-payment-send.gif)

### Admin Features

User management (restrict/unrestrict), service approval/rejection, expert grade management, and ad banner management.

![Restrict User](https://pub-72d7e584b9db493583cc4b36f541a9f8.r2.dev/everyai/user-restrict.gif)

![Approve Service](https://pub-72d7e584b9db493583cc4b36f541a9f8.r2.dev/everyai/service-approve.gif)

## 3. Technical Decisions

### JWT Authentication Design

Dual-token strategy: accessToken (1 day) + refreshToken (7 days).
When the frontend receives a 401, it requests a re-login using the refreshToken; if that also fails, it redirects to the login page.
Added a custom JwtFilter to Spring Security's filter chain to validate the token on every request.

### Social Login Integration

Queries the server DB using social login credentials — logs in the user if they exist, or auto-registers them with a random nickname if they don't.
Unified both standard login and social login into the same JWT issuance flow.

### Secure Payment Flow

Linked the messaging system with the payment system. Within a message room, the user selects a service or an accepted project to send a payment request message → BootPay handles the payment → a success message is automatically sent.

## 4. Retrospective

- Getting to experience real-world development, rather than coursework, gave me invaluable insight into what companies actually need.
- Beyond basic CRUD, integrating real-world technologies like security, Git collaboration, S3, BootPay, and FCM into the project deepened my theoretical understanding of each.
- I came to realize that more people doesn't mean more productivity. Finding and applying ways to maximize each person's individual output is what matters.
- Implemented but not shipped: FCM push notifications
