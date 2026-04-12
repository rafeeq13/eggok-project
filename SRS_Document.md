# Software Requirements Specification (SRS)

# EggOk - Restaurant Ordering Platform

**Version:** 1.0  
**Date:** April 12, 2026  
**Project:** EggOk (Philadelphia Breakfast Restaurant)

---

## 1. Introduction

### 1.1 Purpose
Yeh document EggOk restaurant ordering platform ka complete Software Requirements Specification (SRS) hai. Is mein tamam features, modules, aur system requirements ko detail mein describe kiya gaya hai.

### 1.2 Project Overview
EggOk aik full-featured restaurant ordering platform hai jo customers ko online food ordering (pickup & delivery), loyalty program, aur order tracking ki suvidha deta hai. Admin dashboard ke zariye restaurant staff orders, menu, customers, aur business analytics manage kar sakti hai.

### 1.3 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend (Website)** | Next.js 16.2, React 19.2, Tailwind CSS 4, TypeScript 5 |
| **Frontend (Admin)** | Next.js 16.2, React 19.2, Tailwind CSS 4, TypeScript 5 |
| **Backend** | NestJS 11, TypeScript 5 |
| **Database** | MySQL (TypeORM 0.3.28) |
| **Authentication** | JWT (Passport.js) |
| **Payment** | Stripe |
| **Delivery** | Uber Direct API |
| **Maps** | Google Maps API |
| **Email** | Nodemailer (EJS Templates) |
| **Charts** | Recharts |

### 1.4 Architecture
Monorepo architecture with 4 services:

| Service | Port | Technology |
|---------|------|-----------|
| Gateway | 3000 | Node.js (Main entry point, routing, static files) |
| Backend API | 29001 | NestJS REST API |
| Website | 29002 | Next.js (Customer-facing) |
| Admin Dashboard | 29003 | Next.js (Admin panel) |

---

## 2. Database Entities (14 Tables)

| # | Entity | Key Fields |
|---|--------|-----------|
| 1 | **Customer** | id, name, email, phone, totalOrders, totalSpent, points, tier, savedAddresses, pointsHistory, status, password |
| 2 | **Order** | id, orderNumber, customerInfo, orderType (pickup/delivery), scheduleType (asap/scheduled), deliveryAddress, items (JSON), subtotal, tax, deliveryFee, tip, total, status, promoCode, discount, deliveryTracking |
| 3 | **Item** | id, name, description, pickupPrice, deliveryPrice, image, isAvailable, isPopular, isDeleted, sortOrder, categoryId, modifiers (JSON) |
| 4 | **Category** | id, name, description, sortOrder, isActive, isDeleted, image |
| 5 | **ModifierGroup** | id, name, required, minSelections, maxSelections, isDeleted, options |
| 6 | **ModifierOption** | id, name, price, isDefault, modifierGroupId |
| 7 | **ItemModifierGroup** | id, itemId, modifierGroupId, sortOrder |
| 8 | **Review** | id, customer, email, rating (1-5), title, body, orderType, orderId, status (Published/Hidden/Flagged), reply |
| 9 | **Promotion** | id, code, name, type (Percentage/Fixed/Free Item), value, minOrder, startDate, endDate, usageLimit, usedCount, status |
| 10 | **Reward** | id, name, description, pointsCost, type (discount/freeItem/freeDelivery), value, active, redemptions |
| 11 | **Transaction** | uuid, id, customer, type, orderTotal, stripeFee, deliveryFee, netRevenue, status (Paid/Refunded/Partial Refund), refundAmount |
| 12 | **User (Staff)** | id, name, email, password, role (Super Admin/Manager/Staff), status (Active/Invited/Suspended), inviteToken |
| 13 | **Submission** | id, type (hiring/catering/contact), name, email, phone, data (JSON), status (new/reviewed/archived), adminNotes |
| 14 | **Settings** | id, key, value (JSON) |

---

## 3. Feature List - Customer Website (12 Pages)

### 3.1 Home Page (`/`)
- [x] Featured items carousel
- [x] Menu categories display
- [x] Customer testimonials
- [x] FAQ section
- [x] Business hours display
- [x] Schema.org SEO markup

### 3.2 Order Page (`/order`)
- [x] Full menu browsing by category
- [x] Item selection with images & descriptions
- [x] Item customization with modifiers (add-ons, toppings, etc.)
- [x] Pickup price vs Delivery price display
- [x] Cart management (add, remove, update quantity)
- [x] Popular items highlight

### 3.3 Checkout Page (`/checkout`)
- [x] Cart review & summary
- [x] Customer information form
- [x] Pickup vs Delivery toggle
- [x] ASAP vs Scheduled ordering
- [x] Delivery address with Google Maps autocomplete
- [x] Delivery fee calculation
- [x] Promo code validation & discount
- [x] Tax calculation
- [x] Tip selection
- [x] Stripe card payment integration
- [x] Order submission

### 3.4 Confirmation Page (`/confirmation`)
- [x] Order confirmation with order number
- [x] Estimated ready time
- [x] Order tracking link
- [x] Order details summary

### 3.5 Order Tracking Page (`/order-tracking`)
- [x] Real-time order status tracking
- [x] Delivery status (when applicable)
- [x] Driver information (name, phone)
- [x] ETA display

### 3.6 Public Track Page (`/track`)
- [x] Public order tracking (no login required)

### 3.7 Account Page (`/account`) - Multi-tab Interface
- [x] **Login/Register Tab** - Email & password authentication
- [x] **Account Settings Tab** - Profile edit (name, email, phone)
- [x] **Order History Tab** - Past orders list, reorder functionality
- [x] **Saved Addresses Tab** - Add/edit/delete delivery addresses
- [x] **Loyalty Points Tab** - Points balance, tier status, points history
- [x] **Rewards Tab** - Available rewards, redeem points

### 3.8 Review Page (`/review`)
- [x] 5-star rating selection
- [x] Review title & body text
- [x] Order type & order ID linking

### 3.9 Contact Page (`/contact`)
- [x] Contact form (name, email, phone, message)
- [x] Form submission saved as submission record

### 3.10 Catering Page (`/catering`)
- [x] Catering inquiry form
- [x] Event date, event type, guest count
- [x] Location, special requests
- [x] Budget information

### 3.11 Hiring Page (`/hiring`)
- [x] Job application form
- [x] Position selection, experience
- [x] Resume upload

### 3.12 Gift Cards Page (`/gift-cards`)
- [x] Gift card purchase/request

### 3.13 Story/About Page (`/story`)
- [x] Restaurant information & story

### 3.14 Reset Password Page (`/reset-password`)
- [x] Customer password reset via token

---

## 4. Feature List - Admin Dashboard

### 4.1 Authentication
- [x] Admin login (email/password)
- [x] Set password for invited staff
- [x] Password reset for staff
- [x] JWT-based session management

### 4.2 Analytics Dashboard
- [x] Daily revenue chart
- [x] Order count chart
- [x] Average order value
- [x] Historical data comparison
- [x] Today's stats (total orders, revenue)

### 4.3 Orders Management
- [x] All orders list with pagination
- [x] Active orders tab
- [x] Scheduled orders tab
- [x] Order search functionality
- [x] Order status updates (New → Preparing → Ready → Completed)
- [x] Order cancellation
- [x] Delivery dispatch (Uber Direct)
- [x] Delivery quote fetching
- [x] Delivery tracking & driver info
- [x] Cancel delivery dispatch

### 4.4 Menu Management
- [x] **Categories**: Create, edit, delete, reorder
- [x] **Items**: Create, edit, delete with image upload
- [x] **Item Pricing**: Separate pickup & delivery prices
- [x] **Modifiers**: Create modifier groups with options & pricing
- [x] **Link Modifiers**: Assign modifier groups to items
- [x] **Availability**: Toggle item availability
- [x] **Popular Items**: Mark items as popular
- [x] **Soft Delete**: Items/categories soft-deleted (not permanently removed)
- [x] **Sort Order**: Drag & drop reordering
- [x] **Menu Seed**: Seed menu data for initial setup

### 4.5 Customer Management
- [x] Customer list with pagination
- [x] Customer search
- [x] Customer detail view (order history, points, tier)
- [x] Create/edit/delete customers
- [x] Customer status management

### 4.6 Promotions Management
- [x] Create promo codes
- [x] Discount types: Percentage, Fixed Amount, Free Item
- [x] Minimum order requirement
- [x] Start/end date scheduling
- [x] Usage limit tracking
- [x] Status management: Active, Scheduled, Expired, Paused

### 4.7 Payments & Transactions
- [x] Transaction history with pagination
- [x] Revenue breakdown (order total, Stripe fees, delivery fees, net revenue)
- [x] Payment stats & analytics
- [x] Refund management (Full/Partial refund)
- [x] Stripe fee calculation (2.9% + $0.30)

### 4.8 Loyalty Program
- [x] Create/edit/delete rewards
- [x] Reward types: Discount, Free Item, Free Delivery
- [x] Points cost configuration
- [x] Loyalty member list
- [x] Points & tier tracking per customer

### 4.9 Reviews Management
- [x] Review list with moderation
- [x] Status management: Published, Hidden, Flagged
- [x] Reply to reviews
- [x] Delete reviews

### 4.10 Submissions Management
- [x] View contact form submissions
- [x] View catering inquiry submissions
- [x] View hiring/job application submissions
- [x] Status tracking: New, Reviewed, Archived
- [x] Admin notes on submissions
- [x] Submission counts by type

### 4.11 Store Settings
- [x] Business hours configuration (per day)
- [x] Store open/close status
- [x] Tax rate configuration
- [x] Delivery settings (fee, radius, minimum order)

### 4.12 Delivery Settings
- [x] Uber Direct integration (OAuth credentials)
- [x] DoorDash integration (credentials)
- [x] Delivery zone management

### 4.13 Integrations Configuration
- [x] Stripe payment credentials
- [x] Square payment credentials
- [x] Uber Direct delivery credentials
- [x] DoorDash delivery credentials
- [x] Email SMTP settings
- [x] FCM (Firebase) push notification key
- [x] Google Maps API key

### 4.14 Team Management
- [x] Manage staff users
- [x] Roles: Super Admin, Manager, Staff
- [x] Invite new staff members
- [x] Activate/Suspend users
- [x] Password management

### 4.15 Business Profile
- [x] Store name, address, phone, email
- [x] Operating hours

### 4.16 Email Notifications
- [x] Mail settings configuration
- [x] Test email sending
- [x] Email templates (EJS): Order confirmation, password reset, welcome, contact, catering, hiring, gift card

---

## 5. API Endpoints Summary (70+ Endpoints)

| Module | Public Endpoints | Admin Endpoints | Total |
|--------|-----------------|-----------------|-------|
| Auth (Customer) | 6 | 0 | 6 |
| Auth (Customer Profile) | 4 | 0 | 4 |
| Menu (Public) | 9 | 0 | 9 |
| Menu (Admin) | 0 | 10 | 10 |
| Orders | 2 | 10 | 12 |
| Payments | 2 | 2 | 4 |
| Promotions | 2 | 3 | 5 |
| Reviews | 2 | 3 | 5 |
| Customers | 0 | 4 | 4 |
| Loyalty | 1 | 4 | 5 |
| Submissions | 0 | 5 | 5 |
| Mail | 4 | 3 | 7 |
| Settings | 3 | 2 | 5 |
| Users (Staff) | 3 | 5 | 8 |
| **Total** | **38** | **51** | **89** |

---

## 6. Third-Party Integrations (7 Services)

| # | Service | Purpose | Status |
|---|---------|---------|--------|
| 1 | **Stripe** | Credit card payment processing | Integrated |
| 2 | **Square** | Alternative payment processing | Credentials stored |
| 3 | **Uber Direct** | Delivery dispatch, quotes, tracking, webhooks | Integrated |
| 4 | **DoorDash** | Delivery service alternative | Credentials stored |
| 5 | **Google Maps** | Address autocomplete, delivery zone validation | Integrated |
| 6 | **Nodemailer (SMTP)** | Email notifications (6+ templates) | Integrated |
| 7 | **Firebase (FCM)** | Push notifications | Credentials stored |

---

## 7. Security Features

- [x] JWT-based authentication with token expiry
- [x] Separate auth systems for Customers vs Admin Staff
- [x] Role-based access control (Super Admin / Manager / Staff)
- [x] AdminGuard on all admin endpoints
- [x] CustomerGuard on customer profile endpoints
- [x] Password hashing
- [x] Password reset via secure token + email
- [x] Invite-based staff onboarding
- [x] CORS configuration (frontend/admin URLs)

---

## 8. Business Logic Features

- [x] Dual pricing model (Pickup price vs Delivery price)
- [x] ASAP & Scheduled ordering
- [x] Delivery fee calculation based on zone/distance
- [x] Tax calculation on orders
- [x] Promo code validation with min order, date range, usage limit checks
- [x] Loyalty points earn on order (configurable)
- [x] Loyalty tier system
- [x] Points redemption for rewards
- [x] Business hours validation (prevent orders when closed)
- [x] Delivery address validation (within delivery zone)
- [x] Soft delete for menu items/categories (data preservation)
- [x] Order status workflow: New → Preparing → Ready → Completed/Cancelled
- [x] Stripe fee calculation for net revenue reporting

---

## 9. Complete Module Summary

| # | Module | Description | Features Count |
|---|--------|-------------|---------------|
| 1 | **Home Page** | Landing page with highlights | 6 |
| 2 | **Online Ordering** | Menu browse, cart, item customization | 6 |
| 3 | **Checkout & Payment** | Address, promo, Stripe payment | 11 |
| 4 | **Order Confirmation** | Confirmation & tracking link | 4 |
| 5 | **Order Tracking** | Real-time status & delivery tracking | 4 |
| 6 | **Customer Account** | Login, profile, orders, addresses, loyalty | 6 tabs |
| 7 | **Reviews** | Star rating & review submission | 3 |
| 8 | **Contact Forms** | Contact, catering, hiring submissions | 3 forms |
| 9 | **Gift Cards** | Gift card purchase | 1 |
| 10 | **Admin - Analytics** | Charts, stats, revenue tracking | 5 |
| 11 | **Admin - Orders** | Order management, delivery dispatch | 10 |
| 12 | **Admin - Menu** | Categories, items, modifiers management | 10 |
| 13 | **Admin - Customers** | Customer CRUD & insights | 5 |
| 14 | **Admin - Promotions** | Promo codes management | 6 |
| 15 | **Admin - Payments** | Transactions, revenue, refunds | 5 |
| 16 | **Admin - Loyalty** | Rewards & points management | 5 |
| 17 | **Admin - Reviews** | Review moderation & replies | 4 |
| 18 | **Admin - Submissions** | Form submissions management | 5 |
| 19 | **Admin - Settings** | Store hours, tax, delivery config | 4 |
| 20 | **Admin - Integrations** | 7 third-party service configs | 7 |
| 21 | **Admin - Team** | Staff management & roles | 5 |
| 22 | **Admin - Email** | Email templates & notifications | 3 |
| 23 | **Authentication** | Customer & Admin auth systems | 9 |
| 24 | **Business Logic** | Pricing, tax, delivery zones, hours | 13 |
| | **TOTAL** | | **~140+ features** |

---

## 10. Non-Functional Requirements

| Requirement | Implementation |
|-------------|---------------|
| **Scalability** | Monorepo with separate services, independent scaling |
| **SEO** | Next.js SSR, schema.org markup, meta tags |
| **Responsiveness** | Tailwind CSS responsive design |
| **Performance** | Eager loading for modifiers, pagination for lists |
| **Data Integrity** | Soft deletes, foreign key constraints, unique constraints |
| **Maintainability** | TypeScript strict typing, modular NestJS architecture |
| **Deployment** | Gateway-based routing, environment-based configuration |

---

*Document generated on April 12, 2026*  
*Total Features: ~140+ across 24 modules*  
*Total API Endpoints: 89*  
*Total Database Tables: 14*  
*Total Website Pages: 12*
