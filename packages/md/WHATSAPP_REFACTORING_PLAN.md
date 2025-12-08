# WhatsApp Refactoring Plan (Technical)

Purpose
-------
Detailed developer plan for migrating the backend to use WhatsApp Business Platform (multi-tenant). Focus on minimal-risk incremental changes so existing functionality continues to work until businesses are migrated.

Migrations (FASE 1)
-------------------
- `add_whatsapp_fields_to_businesses`:
  - business.settings.communications.whatsapp -> keep for backwards compatibility
  - Add top-level columns (nullable): `whatsapp_enabled` (boolean), `whatsapp_phone_number` (string), `whatsapp_phone_number_id` (string), `whatsapp_platform_metadata` (jsonb)
  - Store pointer to token record instead of raw token (future).
- `create_whatsapp_message_templates` (id, business_id, template_name, language, body, status, created_at, updated_at)
- `create_whatsapp_messages` (id, business_id, to, phone_number_id, message_type, payload, provider_message_id, status, sent_at, delivered_at, created_at)
- `create_whatsapp_webhook_events` (id, business_id, event_type, payload jsonb, received_at)
- `create_whatsapp_opt_ins` (id, business_id, client_id, channel, opt_in_value, created_at)

Service contracts
-----------------
- EncryptionService
  - encrypt(plaintext) => { iv, tag, ciphertext }
  - decrypt({ iv, tag, ciphertext }) => plaintext
- WhatsAppTokenManager
  - storeToken(businessId, token, meta) => tokenRecordId
  - getToken(businessId) => { token, meta }
  - rotateToken(businessId) => boolean
- WhatsAppService (refactored)
  - sendText(businessId, to, text, opts)
  - sendTemplate(businessId, to, templateName, vars)
  - sendQueued(businessId, messagePayload)
  - listTemplates(businessId)
  - testConnection(businessId)
  - handleWebhookEvent(req) // validate signature and enqueue

Webhooks
--------
- Add POST /api/webhooks/whatsapp (authenticated via app secret / verify token)
- Validate signature using app secret; persist event to `whatsapp_webhook_events` and enqueue processing job.

Backward compatibility
----------------------
- If business has no token record or platform metadata, fallback to existing `business.settings.communications.whatsapp` behavior.
- Feature-flag new behavior per business.

Testing
-------
- Unit tests for EncryptionService (roundtrip + tamper detection).
- Unit tests for TokenManager storing and retrieving tokens.
- Integration tests mocking WhatsApp endpoints and validating webhook processing.

Developer tasks (first sprint)
-----------------------------
1. Add migrations and run locally.
2. Implement EncryptionService and basic TokenManager with DB table `whatsapp_tokens` (id, business_id, encrypted_token, meta, created_at).
3. Add minimal refactor to WhatsAppService to read token via TokenManager and send a test message (feature-flagged).
4. Add webhook route and basic persistence.
5. Run sandbox E2E.

Notes
-----
- Keep changes small and reversible.
- Document migration steps and rollback.

Branch: feature/whatsapp-platform
