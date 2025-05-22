## 🌟 What is this?

The resident portal is an open source project actively developed by SimpleFi (aka p2planes) jointly with the support of EdgeCity and Esmeralda and (hopefully) you!
 
## 🚀 Our Story

We build technology to accelerate the experimentation rate of new forms of human cooperation. We do this by leveraging frontier technologies such as cryptocurrencies, ZK and AI as part of the tool stack of orgs doing the groundwork. After working closely with EdgeCity and Crecimiento, we understood that current tools, both closed and open source were not optimized for our desired use case, so we decided to build our own.

We hope that builders and companies within the pop-up city movement will recognize the value of this project and choose to contribute. We openly welcome the likes of Cursive, ZuPass, RaveApp, Sovs/Consensys, SocialLayer, etc. to join us in this effort.

---

## How to run locally

1. (Optional) Clone and run the backend locally from [EdgeOS_API](https://github.com/p2p-lanes/EdgeOS_API)
2. Install dependencies and start the frontend:
```bash
npm install
npm run dev
```
3. If running the backend locally, set the following environment variable:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## How to run with Docker Compose

1. Create a `.env` file in the root directory with the following variables:
```bash
# Development Mode
NEXT_PUBLIC_DEVELOP = true

# API URL for Portal
NEXT_PUBLIC_API_URL = http://localhost:8000  # Set this if running backend locally

# API Key for Portal
NEXT_PUBLIC_X_API_KEY =
```

2. Build and start the containers:
```bash
docker compose up --build
```

The application will be available at http://localhost:3000

## Looking to contribute?

We'd love to have you!
Hit us up on Telegram at @tulezao or via email at tule@simplefi.tech

---

# Network State Infrastructure

## Table of Contents
- [Introduction](#introduction)
- [Infrastructure Overview](#infrastructure-overview)
  - [User Portal](#user-portal)
  - [Backoffice (NocoDB)](#backoffice-nocodb)
  - [Backend API](#backend-api)
- [Database Tables](#database-tables)
- [Coupon Codes](#coupon-codes)
- [Approval Flow](#approval-flow)


## Introduction
This document describes the infrastructure and functionalities of the software developed for managing a Network State with pop-up cities. The system allows users to apply to different temporary cities, manage their participation, and purchase passes and housing with various payment methods, including cryptocurrencies. Additionally, it provides administrative tools for efficient attendee management, application approvals, and automation of key processes.

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
The system's backend ([EdgeOS_API](https://github.com/p2p-lanes/EdgeOS_API)) serves as the **core infrastructure**, connecting the user portal with the backoffice. Its main functions include:
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
- Discounts for VIPs / companies / groups, which don't require an application. This will be a separate feature.
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

# Approval Flow

## Overview
This documentation explains how an application's final status is determined. The process involves two key steps:

1. **Calculated Status**: This status is derived from what the approvers have voted. In other words, it reflects the outcome of the review process based solely on the decisions made by the reviewers.
2. **Final Status**: Beyond the calculated status, additional logic is applied. This extra step takes into account factors such as whether the applicant requested a discount, if the city requires approval, and whether the application has been submitted. This ensures that the final status accurately reflects both the approvers' decision and any supplementary criteria.

The sections below provide a detailed, easy-to-understand explanation of how these statuses are determined.

---

## Calculated Status
The calculated status is determined by the votes of reviewers. Each reviewer can vote in one of several ways, such as **"yes", "no", "strong yes", or "strong no"**. Based on these votes, the system decides on a preliminary outcome using these simple rules:

### Accepted
The application is marked as **accepted** if:
- Any reviewer votes **"strong yes"**.
  - *(This decisive vote for acceptance wins over any negative votes.)*
- Or if there are at least **two "yes" votes** from the reviewers.
  - *(There are specific combinations that satisfy this, but simply put, enough positive votes lead to acceptance.)*

### Rejected
The application is marked as **rejected** if:
- Any reviewer votes **"strong no"**.
- Or if there are at least **two "no" votes** from the reviewers.

### Undecided
If neither of the above conditions is met, the calculated status remains **empty (no decision).**

#### Key Point
The system checks for acceptance first. This means that even if there are negative votes (for example, one "strong no" or "no"), a single "strong yes" vote will cause the application to be marked as **accepted**. For instance:
- **1 "strong no", 1 "no", and 1 "strong yes" → Accepted** *(because "strong yes" takes precedence).*

---

## Final Status

### When the City Does Not Require Approval
The final status of an application is determined by combining the calculated status from the reviewers' votes with additional logic based on discount requests and approval requirements. Here's how it works:

#### **Rejection Takes Precedence**
- If the calculated status is marked as **REJECTED** (meaning the reviewers have strongly voted against the application), then the final status is immediately set to **REJECTED**, regardless of any discount considerations.

#### **Handling Cities That Do Not Require Approval**
- In some cities ("pop-up cities"), discount approval isn't needed.
- If **no discount was requested** in these cases, the application is **automatically set to ACCEPTED**.

#### **Handling Discount Requests and Missing Discounts**
When approval is required:
- The system checks if the applicant **requested a discount**. This check depends on the type of discount request:
  - For cities that **require approval**: Only an **explicit scholarship discount request** is considered.
  - For cities that **do not require approval**: Being a **renter** or requesting a **scholarship discount** qualifies as a discount request.

#### **Missing Discount Scenario**
- If a discount was requested but **has not yet been assigned**, it is considered **"missing."**
- When a discount is missing, even if there's no definitive reviewer outcome yet, the application status is set to:
  - **IN REVIEW** if the application **has been submitted**.
  - **DRAFT** if the application **has not been submitted**.

#### **Default Outcome**
If none of the above conditions apply—meaning the review outcome is neither a clear rejection nor the discount conditions are causing a delay—the final status will simply be **the outcome provided by the reviewers (the calculated status).**

## Notification to the Applicant
Once the **final status** is set to **accepted**, an email notification is sent to the applicant. However, to prevent immediate emails in case of accidental clicks or missteps that might affect the final status, the system waits for **2 minutes** before sending out the email. 

This delay is **configurable**, allowing adjustments if needed to ensure that notifications are only sent when the decision is truly final.



