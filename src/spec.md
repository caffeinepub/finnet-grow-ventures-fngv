# Specification

## Summary
**Goal:** Replace the onboarding “Referral Code” input with a conditional, validated “Upline Associate ID Number” flow for users joining via referral.

**Planned changes:**
- Update the profile setup/onboarding modal to remove “Your Referral Code” and conditionally show/require an input labeled exactly “Upline Associate ID Number” only when a referral context is present (e.g., URL `ref` parameter).
- Adjust onboarding submit behavior to validate the upline associate ID on the client (required when in referral context) and show clear English success/error messages, including handling backend validation failures.
- Add a new backend registration entry point that accepts `(profile: UserProfile, uplineAssociateId: Text)`, validates the ID exists in the `associateIds` index, and links the new user to the upline (sets `referredBy` and updates referrals mapping); keep existing `registerWithReferral(profile, referrerCode)` behavior unchanged.
- Update the frontend React Query layer to call the new backend registration method for referral-based onboarding while preserving the existing `useRegisterWithReferral` hook for other flows.

**User-visible outcome:** Users who open onboarding via a referral link must enter an “Upline Associate ID Number” to complete registration (with clear English validation feedback); users not joining via referral see no referral/upline field and can complete onboarding normally.
