# WhatsApp Business Platform — Executive Plan

Status: Recreated on feature/whatsapp-platform branch

Overview
--------
Migrate from current per-business manual Meta Cloud setup to an official multi-tenant integration using the WhatsApp Business Platform (Embedded Signup). Goal: enable secure per-business onboarding, centralized token management, webhooks, message tracking, and template lifecycle management.

High-level phases
-----------------
- Phase 0 — Prep & sandbox
  - Create Meta sandbox and test phone numbers.
  - Create feature branch `feature/whatsapp-platform` (already created).
- Phase 1 — Data model & migrations (FASE 1)
  - Add whatsapp fields to `businesses`.
  - Create `whatsapp_message_templates`, `whatsapp_messages`, `whatsapp_webhook_events`, `whatsapp_opt_ins` tables.
- Phase 2 — Security & token management
  - Implement `EncryptionService` (AES-256-GCM) for tokens.
  - Implement `WhatsAppTokenManager` to manage per-business tokens and refresh/rotation.
- Phase 3 — Service refactor & webhooks
  - Refactor `WhatsAppService` to be multi-tenant and use TokenManager.
  - Add webhook endpoint to ingest and persist events.
  - Add template management APIs and approve/track flow.
- Phase 4 — Tests & sandbox E2E
  - Integration tests using sandbox + unit tests for encryption and token manager.
  - QA run sending appointment reminders and message templates.
- Phase 5 — Rollout
  - Feature flag the new integration and enable for pilot businesses.
  - Monitor metrics and rollback plan.

Success criteria
----------------
- Businesses can onboard via Embedded Signup (or admin can link a business) and have tokens stored encrypted.
- Appointment reminders and templates are sent using platform tokens; delivery and webhook events are recorded.
- No disruption to existing businesses that remain on the old method until migration completes.

Risks & mitigations
-------------------
- Token leakage: mitigate with AES-256-GCM encryption, strict DB access, and key rotation.
- Template approval delays: maintain a fallback path to current message sending until template approvals propagate.
- Rollout complexity: use feature flags and staged pilot.

Immediate next steps
--------------------
1. Recreate this plan file on disk (done).
2. Create DB migrations (FASE 1) — start now.
3. Implement EncryptionService & TokenManager.

Branch: feature/whatsapp-platform
Owner: backend team

(For detailed implementation steps see `WHATSAPP_REFACTORING_PLAN.md`)
