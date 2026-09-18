# security

Sessions, responder and admin authentication, route protection, input
validation and log sanitisation.

**Task:** 12 (security and session framework).

**Boundary.** Protects the responder and admin surface. The bystander
emergency flow stays anonymous and session-based — nobody should have to
create an account before asking for help.

Roles are `USER`, `RESPONDER`, `ADMIN` (specification section 19).

Secrets are never returned in an API response and never committed. Log
redaction lives in `common/logger.ts`.
