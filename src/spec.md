# Specification

## Summary
**Goal:** Replace the current referral commission with a fixed 7-level referral bonus that only triggers on delivered “Associate-ID” product orders, and track/display these bonuses separately from existing commissions.

**Planned changes:**
- Backend: Remove the old percentage-based referral commission creation on order delivery and implement a fixed 7-level referral bonus (Rs.100, 50, 25, 10, 10, 5, 5) that triggers only for delivered orders containing an admin-designated Associate-ID product.
- Backend: Add separate storage and APIs for referral-bonus totals and history (distinct from the existing commissions/earnings ledger), including event details needed for UI display.
- Backend + Frontend: Add support for admins to designate catalog products as “Associate-ID purchase” triggers (e.g., a flag) and expose/edit it in the Admin Catalog create/update UI.
- Frontend: Add a new “Referral Bonus” section to earnings-related UI (including summary and history list) and fetch data via new React Query hooks, while keeping existing commission UI functional and separate.

**User-visible outcome:** Admins can mark products as Associate-ID triggers; associates can see a separate “Referral Bonus” summary and history (with level, amount, date, and triggering order id) that is generated only when a referred associate’s Associate-ID order is delivered, without mixing into existing commissions.
