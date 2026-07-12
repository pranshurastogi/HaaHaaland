# Threat Model

| Threat                           | Control                                                                                                                                              |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Direct API abuse                 | Private shared proxy secret, rate limits, body limits, request IDs                                                                                   |
| Prompt injection in public pages | Delimited untrusted evidence, fixed system rules, length limits, structured schema, one repair only                                                  |
| SSRF in Startup XI               | URL protocol/credential/port validation; block localhost, private/link-local/metadata/internal hosts; redirect revalidation required before P1 ships |
| Secret leakage                   | ignore rules, redacted scanner, server-only variables, no env logging                                                                                |
| Stored XSS                       | React escaping, schema length limits, no raw HTML                                                                                                    |
| Enumeration/PII                  | Opaque UUID public IDs, public response minimization, email excluded from public queries                                                             |
| Fake metrics                     | server-side immutable audit events; exclude failed/internal/test events                                                                              |
| Cost denial                      | caching, provider timeouts, rate limits, fallback generation                                                                                         |
| Agent tool abuse                 | no browser-to-Hermes path; constrained private VAR payload; no terminal/filesystem tools                                                             |

Residual risk: local in-memory state is not durable and is for development only. Production launch is blocked until Convex and persistent card storage are verified.
