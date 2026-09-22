# ADR 0003 — MVP protocol is unresponsive adult

**Status:** Accepted  
**Date:** 2026-09-22  
**Task:** 6 (MVP emergency protocol)

## Decision

The first published protocol is an unresponsive / collapsed adult. It is
the only emergency type the engine will guide in the MVP.

## Why

Unresponsive adult is the standard lay-rescuer Basic Life Support path:
check response, call emergency services, open the airway, check breathing,
then either chest compressions or the recovery position. The steps are
short, sequential, and already written for an untrained helper.

Other candidate scenarios from specification section 10 stay on
`EmergencyType` but have no published protocol, so the engine will not
improvise guidance for them.

## Source

European Resuscitation Council Guidelines 2021: Basic Life Support, adult
lay-rescuer path. Compression-only chest compressions are used because the
bystander is untrained. This is not a substitute for local emergency
service instructions.

## Consequences

- Infants and children are out of this protocol. If age is later
  established as infant or child, the engine escalates instead of inventing
  pediatric CPR.
- Missing or contradictory answers follow the more conservative BLS path
  (treat as unresponsive / not breathing normally).
- Food, drink, leaving the person, and extra pillows under the head are
  contraindicated.
