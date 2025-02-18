## 🌟 What is this?

The resident portal is an open source project actively developed by SimpleFi (aka p2planes) jointly with the support of EdgeCity and Esmeralda and (hopefully) you!

## 🚀 Our Story

We build technology to accelerate the experimentation rate of new forms of human cooperation. We do this by leveraging frontier technologies such as cryptocurrencies, ZK and AI as part of the tool stack of orgs doing the groundwork. After working closely with EdgeCity and Crecimiento, we understood that current tools, both closed and open source were not optimized for our desired use case, so we decided to build our own.

e hope that builders and companies within the pop-up city movement will recognize the value of this project and choose to contribute. We openly welcome the likes of Cursive, ZuPass, RaveApp, Sovs/Consensys, SocialLayer, etc. to join us in this effort.

## How to run locally

```bash
npm install
npm run dev
```

## Looking to contribute?

We'd love to have you!
Hit us up on Telegram at @tulezao or via email at tule@simplefi.tech

# Network State Infrastructure

## Table of Contents
- [Introduction](#introduction)
- [Infrastructure Overview](#infrastructure-overview)
  - [User Portal](#user-portal)
  - [Backoffice (NocoDB)](#backoffice-nocodb)
  - [Backend API](#backend-api)
- [Database Tables](#database-tables)
- [Coupon Codes](#coupon-codes)
- [Further Documentation](#further-documentation)

---

## Introduction
This document describes the infrastructure and functionalities of the software developed for managing a Network State with pop-up cities. The system allows users to apply to different temporary cities, manage their participation, and purchase passes and housing with various payment methods, including cryptocurrencies. Additionally, it provides administrative tools for efficient attendee management, application approvals, and automation of key processes.

---

## Infrastructure Overview
The system consists of the following main modules:

### User Portal
The web portal serves as the primary interface for attendees, enabling them to:
- Register and log in to access their profile.
- Apply to different pop-up cities and check the status of their application.
- Purchase individual or group passes, assigning the latter to different attendees within their company or organization.
- Select housing options and apply discount codes at checkout.
- Make payments via **Stripe** or **cryptocurrencies**, with automatic ticket issuance.
- Receive email notifications when their application status changes.

### Backoffice (NocoDB)
The administrative system, based on **NocoDB**, allows organizers to manage all event aspects, including:
- Attendee management and assignment of personalized discount codes.
- Tracking and modifying application statuses based on predefined rules, such as **approval by voting** (requiring "m" out of "n" positive votes, a "strong yes" for immediate approval, or a "strong no" for immediate rejection). See [Approval Flow](#).
- Control of flags and internal notes to facilitate application management.
- Automated email notifications based on application and purchase status changes.
- Management of database tables with the ability for staff users to create filtered views for their convenience.

### Backend API
The system's backend serves as the **core infrastructure**, connecting the user portal with the backoffice. Its main functions include:
- Business logic management and process validation to ensure data consistency.
- Integration with **NocoDB** and the **PostgreSQL** database for efficient data handling.
- Payment processing via **Stripe** and **cryptocurrencies**, ensuring secure transactions and ticket issuance.
- Automated email notifications when applications or transactions change.

---

## Database Tables
The system's database consists of the following tables:
- `applications`: Stores user applications to pop-up cities.
- `attendees`: Contains details of users who submitted an application.
- `citizens`: Holds information about registered users.
- `email_logs`: Logs system-generated emails and notifications.
- `payment_products`: Defines available payment options and products.
- `payments`: Stores transaction details.
- `popups`: Manages pop-up city information and settings.
- `products`: Contains information on purchasable items (e.g., passes, housing).
- `popup_email_templates`: Stores pre-configured email templates for system communications.
- `discount_codes`: Allows for the creation of discount codes that affect the final price of products.

For each table, staff users can create **custom views with specific filters** to streamline their workflow and enhance data management efficiency.

---

## Coupon Codes
**Date:** January 29th, 2025  

### Overview
This feature enables Edge City to create and manage promotional coupon codes within the Noco environment, giving customers discounts to complete purchases. It simplifies the application of discounts at checkout and tracking of active codes.

### Objective
This feature aims to increase customer engagement, boost sales, and provide promotional offers to targeted communities. These discounts will not be applicable to Patron tickets but will be applicable to all other products.

### Scope
#### Included:
- Generation of unique coupon codes
- Percentage-based and fixed-amount discounts
- Optional Start/Expiry date and usage limitations
- Code validation at checkout
- Management through Noco

#### Not Included:
- Discounts for VIPs / companies / groups, which don’t require an application. This will be a separate feature.
- Fixed-based coupon codes.

### User Stories
- **As a customer,** I want to enter a coupon code at checkout so that I can receive a price reduction on my purchase.
- **As an Edge City staff member,** I want to generate coupon codes so that I can attract new and returning organizations, movements, etc.

### Database Schema
**Table:** `coupon_codes` (Stored in NocoDB)

**Columns:**
- `code` (Unique identifier for the coupon code)
- `is_active` (true / false)
- `discount_value` (number representing discount percentage)
- `max_uses` (optional - maximum number of times the code can be used)
- `current_uses` (calculated - number of times the code has been used)
- `start_date` (optional)
- `end_date` (optional)
- `popup_city_id` (popup where coupon code applies)

### UX/UI
#### UI Components
- Coupon code entry field in the passes section
- Validation message display
- Discount summary in cart reflecting the applied discount

### User Flow
1. User enters a coupon code
2. System validates the code
3. Discount is applied if valid, otherwise an error is shown
4. Discount is reflected in the final price

### FAQs
#### Does fixed discounts make sense? Or only percentage-based?
As it's not a must-have, we won't add the fixed-amount coupons. It usually makes more sense to have percentage-based discounts, and adding the fixed-based logic entails considerably more effort.

#### Should attendees be able to use the coupon code more than once?
We decided that attendees can use the coupon code more than once within the same application, but it counts as one use per application.  
For example, I use 'crecimiento10' and buy my ticket with 10% off. A week later, I buy my spouse's ticket, using the same code. This will count as one usage in the discount codes table.

#### What happens if the application has more than one kind of discount?
Currently, we have three types of discounts: **discount assigned in application, Coupon Codes, and Group Passes**. If one application has more than one discount, we will take into account the highest.  
For example, if he has been awarded with a 20% off in his application, but then applies a coupon of 50% off, he will have a 50% discount at checkout.

---

## Further Documentation
For additional technical details on the implementation of each module, refer to the specific component documentation:
- [User Portal Documentation](#)
- [Backoffice Documentation](#)
- [Backend API Documentation](#)



