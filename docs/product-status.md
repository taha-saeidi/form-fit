# FormFit product pass — 2026-10-17

Implemented: federated Persian/English search, exact bilingual catalogue resolution, fuzzy suggestions requiring explicit selection, retry using aliases, four foreign sources (StrengthLog, Fitness Programer, wger, Free Exercise DB), provider failures isolated, licensed local text/metadata fallback, distinct video/article/image labels. Search is across connected providers, not a general web crawler. External Google link is explicitly a user-opened fallback, not an in-app search result.

Training: actual set logs with immutable exercise-name snapshots, weight/reps/RPE, idempotent set keys, date/ownership checks, feedback, prior performance, opt-in per-account offline queue for an already open workout, Screen Wake Lock where supported, optional start voice. History has up to 3,000 recent sets, monthly CSV, workload distribution by known muscle labels. Counts are not medical recovery estimates.

Coaching: consented recent history on new requests, real owner-only MCP draft writer and readback verified, owner review before publication, versioned structured prescriptions, user-controlled idempotent import, editable individual movements. No autonomous scheduled processing, medical clearance or rehabilitation prescribing. Existing consent snapshots are not silently expanded.

Privacy/mobile: guest loading state and onboarding, scoped flexible form layouts, privacy/account data deletion, install manifest and non-personal offline fallback. No private HTML/API caching. PWA does not make videos or initial account loading available offline. Browser/device visual QA unavailable; compile/build and meaningful integration tests used. Camera remains experimental local processing, 10 limited geometric modes, not validated injury prevention.

Not implemented in this pass: multiple independent coach accounts and invitations, paid subscriptions, wearable integration, QR device registry, friend challenges, clinical recovery map, autonomous paid AI API or a whole-web crawler. These are separate integrations, not advertised as working features. No paid source API enabled. MuscleWiki direct API is paid, so not used.

Sources: free-exercise-db (Unlicense; license included), wger API (per-record license/author retained), source websites (links and permitted embeds; no proprietary videos copied). Source metadata snapshots are dated 2026-10-17.
