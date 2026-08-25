# MaaSuraksha — Current State

_Snapshot generated 2026-08-25 from git history and repo inspection. Read-only inventory._

## 1. What the application currently does

- A maternal/child health tracking web app with four role-based portals: **mother**, **doctor**, **hospital**, **admin**.
- Frontend (React + TS + Vite) has a fully built-out UI for all four roles: dashboards, appointments, medications, vaccinations, growth/milestones, child profile, care/nutrition timeline, hospital directory, doctor messaging, notifications, QR identity card, settings, hospital ops (beds, deliveries, neonatal care, referrals, vaccine inventory), and admin oversight (facilities, high-risk monitoring, immunization coverage, analytics, reports, alerts).
- Backend (Express + PostgreSQL/Neon) currently implements **only** identity/auth plus a mother-domain data API — see §2. No doctor/hospital/admin backend routes exist yet.
- Real JWT-based login was just wired end-to-end for the frontend login screen (Phase 6 Part 3, commit `79b3207`).

## 2. Backend

Routes mounted in `backend/src/routes/index.ts`: `/health`, `/auth`, `/mother`, `/test`.

| Area | Status | Evidence |
|---|---|---|
| Auth: register/login/forgot-reset-change password | **Implemented** | `authController.ts`, `authRoutes.ts`, `authService.ts` |
| Auth: current-user (`GET /me`), profile update (`PATCH /me`) | **Implemented** | `authController.ts` (`getMe`, `updateMe`), `profileService.ts` |
| Mother: emergency contact, settings, children list | **Implemented** | `authController.ts` (`getMyEmergencyContact` etc.), `emergencyContactService.ts`, `settingsService.ts`, `childProfileService.ts` |
| Mother: growth measurements, milestones | **Implemented** | `motherController.ts`, `growthMeasurementService.ts`, `milestoneService.ts` |
| Mother: vaccinations (list + toggle reminder) | **Implemented** | `motherController.ts`, `vaccinationService.ts` |
| Mother: daily goals, nutrition reminders | **Implemented** | `motherController.ts`, `dailyGoalService.ts`, `nutritionReminderService.ts` |
| Mother: appointments (list/request/cancel/reschedule) | **Implemented** | `motherController.ts`, `appointmentService.ts` |
| Doctor domain API | **Missing** | No `doctorRoutes.ts` / `doctorController.ts`; not in `routes/index.ts` |
| Hospital domain API | **Missing** | No `hospitalRoutes.ts`; hospital tables exist (migration 003) but no controller/service |
| Admin domain API | **Missing** | No `adminRoutes.ts`; admin tables exist (migration 004) but no controller/service |
| Messaging/notifications API | **Missing** | Tables exist (`conversations`, `messages`, `notifications`, `alerts`, migration 003) but no routes/controllers |
| `/test` routes | **Mock/placeholder** | `testController.ts` — comment says "Verification-only endpoints for the auth middleware (Part 3). Not real [feature] endpoints" |

Every mother endpoint uses `authenticate` + `requireRole('mother')` middleware (`backend/src/middleware/`).

## 3. Frontend

| Page/feature area | Status | Evidence |
|---|---|---|
| Login (`LoginPage.tsx`) | **Connected to backend** (real login via `authApi.ts` + `useMockAuth.loginWithCredentials`, falls back to mock only if backend unreachable) | `frontend/src/hooks/useMockAuth.ts`, `frontend/src/services/authApi.ts` |
| Session restore (token → current user on app load) | **Connected to backend** | `useMockAuth.ts` `useEffect` calling `fetchCurrentUser` |
| Mother appointments, medications, vaccinations, growth/milestones, care/nutrition, hospital, doctor, notifications, QR, settings pages | **Mock/demo** — despite matching backend APIs existing for several of these (appointments, vaccinations, growth, milestones, daily goals, nutrition reminders), these pages still import from `@/data/*MockData.ts`, not from any service that calls the backend | e.g. `MotherAppointmentsPage.tsx` imports `motherAppointmentsMockData`; no `frontend/src/services/motherService.ts` exists at all |
| Doctor pages (dashboard, patients, appointments, messages, reports, settings, hospital) | **Mock/demo** | Import from `@/data/mockData`, `@/data/doctorPatientsMockData` |
| Hospital pages | **Mock/demo**, but architected for a future swap | `hospitalService.ts` header comment: "src/data/hospitalMockData.ts (mock data NOW) ... fetch('/api/hospitals/...') (future)" |
| Admin pages | **Mock/demo**, same pattern | `adminService.ts` header comment, same structure |
| Assistant (`MaaSurakshaAssistant.tsx`) | **Mock/demo** | `assistantService.ts` |

Only 4 files under `frontend/src/services/`: `authApi.ts` (real), `hospitalService.ts`, `adminService.ts`, `assistantService.ts` (all in-memory mock stores). No mother-, doctor-domain service file exists — meaning none of the mother backend API work (§2) is consumed by the UI yet.

## 4. Database

6 migrations, all applied per `backend/migrations/`:

- **001 core identity**: `users`, `hospital_profiles`, `doctor_profiles`, `mother_profiles`, `admin_profiles`, `child_profiles`, `emergency_contacts`, `patient_care_records`
- **002 clinical records**: `care_cards`, `appointments`, `medications`, `vaccine_catalog`, `vaccinations`, `growth_measurements`, `milestones`, `consultation_notes`, `care_recommendations`, `documents`
- **003 hospital communication**: `doctor_contact_options`, `conversations`, `messages`, `notifications`, `alerts`, `hospital_activity_log`, `hospital_beds`, `hospital_admissions`, `delivery_records`, `neonatal_records`, `vaccine_inventory`, `hospital_referrals`, `hospital_services`, `care_team_members`
- **004 wellness/admin/settings**: `nutrition_plans`, `food_guidance_items`, `exercise_guidance_items`, `daily_goals`, `nutrition_reminders`, `high_risk_cases`, `immunization_coverage_targets`, `mother_settings`, `doctor_settings`, `hospital_settings`, `admin_settings`
- **005**: adds password-reset columns to `users`
- **006**: adds `users.name` (self-heals rows created before this migration with an email-derived placeholder — see `seedDemoData.ts` and migration comment)

**Gaps visible from code**: multiple backend services (`growthMeasurementService.ts`, `milestoneService.ts`, `vaccinationService.ts`, `dailyGoalService.ts`, `nutritionReminderService.ts`, `emergencyContactService.ts`, `childProfileService.ts`, `settingsService.ts`, `appointmentService.ts`) contain repeated comments about an "orphan user" state — a `users` row with role `mother` but no matching `mother_profiles` row — treated as a 404, implying this is a known/expected edge case rather than one prevented at the schema level (no `NOT NULL`/trigger enforcing a profile row exists per user). A large portion of tables from migrations 003–004 (hospital ops, messaging, admin/wellness) have no backend service/controller reading or writing them yet (§2), so their real data shape is untested beyond the SQL definitions.

## 5. Authentication

- **Registration**: `POST /api/auth/register` → `authService.registerUser` creates a `users` row + role-specific profile row together.
- **Login**: `POST /api/auth/login` → validates credentials, issues JWT.
- **Current user**: `GET /api/auth/me` (authenticated) → returns identity used to restore a session.
- **Password flows**: forgot/reset/change password all implemented (`authController.ts`, migration 005).
- **Frontend**: `useMockAuth.ts` now supports both the original mock role-switch flow (`loginAsRole`, still used as a fallback) and real login (`loginWithCredentials`, calling `authApi.ts`). `LoginPage.tsx` submits real credentials first; on `AuthNetworkError` (backend unreachable) it silently falls back to the mock flow; on any other failure (e.g. bad credentials) it shows an inline error and does **not** grant access.
- **Phase 6 completed so far** (per code comments and commits): Part 1 = auth module foundation (JWT, role profiles, orphan-user handling pattern); Part 2 = authenticated self-service endpoints (profile/settings/emergency-contact/children) with a "partial-update convention" referenced by later services; Part 3 = frontend wiring to real login/current-user (just merged, commit `79b3207`).
- Demo/seed accounts exist via `backend/src/scripts/seedDemoData.ts` (one shared password, printed by the script — not committed anywhere in frontend or backend source).

## 6. Phase 6 — DONE SO FAR

| Part | What was implemented | Relevant commits/files | Verification status |
|---|---|---|---|
| **Part 1** | Auth module foundation: JWT middleware, register/login, role-specific profile creation, orphan-user (`user` row without profile row) handling pattern used by every later mother service | `8261613` add authentication module part 1, `66fda77` add role-specific profiles, `27b919e` add JWT authorization middleware, `98c1821` add password reset flow, `7b30eee` add authenticated change password | Backend-only; no automated test suite in repo. `4cab026` (persist user display names, migration 006) is a follow-up fix from a "Part 1 investigation." |
| **Part 2** | Authenticated self-service endpoints: current-user, profile update, emergency contact, settings, children list — establishes the "partial-update convention" other services reference | `82b34b7` add authenticated current user endpoint, `752fa0b` add authenticated profile updates, `deafe90` add mother emergency contact API, `81afb0a` add authenticated user settings, `838da5a` add authenticated children endpoint | Backend-only; not consumed by frontend yet. |
| **Part 3** | Wired the frontend login screen to the real backend: `authApi.ts` client, `useMockAuth.loginWithCredentials`, `LoginPage.tsx` real-login-first flow with unreachable-backend fallback | `79b3207` feat: wire frontend to real authentication (`frontend/src/services/authApi.ts`, `frontend/src/hooks/useMockAuth.ts`, `frontend/src/pages/auth/LoginPage.tsx`, `frontend/src/vite-env.d.ts`) | `tsc --noEmit` and `npm run build` both passed clean at the time of this commit (per this session's history). No automated tests exist. |

Note: the mother-domain data APIs (growth measurements, milestones, vaccinations, daily goals, nutrition reminders, appointments — commits `fdc45a1` through `d75e944`) are **not** labeled with a Phase 6 Part number anywhere in commit messages or code comments. They're built on the Part 1 orphan-user pattern but the repo doesn't establish which Phase 6 Part (if any) they belong to.

## 7. Known incomplete/missing areas

- No frontend service layer for any mother backend endpoint beyond auth (`authApi.ts` only) — `motherService.ts`-equivalent does not exist.
- No doctor, hospital, or admin backend routes/controllers/services at all, despite full frontend UI and full DB schema (migrations 003–004) for those domains.
- No messaging/notifications backend (tables exist, no API).
- `register` endpoint exists but no frontend registration/sign-up page was found under `frontend/src/pages` (only `LoginPage.tsx` under `pages/auth`).
- No automated test suite in either `frontend/` or `backend/` (`package.json` scripts contain no `test` command besides ad hoc scripts like `testConnection.ts`).
- `backend/src/routes/testRoutes.ts` / `testController.ts` are explicitly non-production ("Verification-only endpoints... Not real feature endpoints").

## 8. Current project status

- **Definitely working**: backend auth (register/login/me/password flows), backend mother-domain CRUD-ish APIs (growth, milestones, vaccinations, goals, nutrition reminders, appointments), full frontend UI for all 4 roles (as a demo/mock experience), real login wired into the login screen with a safe fallback.
- **Definitely incomplete**: doctor/hospital/admin backend APIs (don't exist), frontend-to-backend wiring for every mother data screen except login (services layer missing), messaging/notifications backend.
- **Still unclear**: whether the mother-domain backend APIs (§2) have been exercised against real data beyond whatever ad hoc script testing happened at the time each was built — no test suite to confirm; DB migration/seed state on any given environment is unverified from static inspection alone.

## 9. Candidate areas for the NEXT phase

1. **Wire mother pages to the real backend** — a `motherService.ts` (or similar) doesn't exist; every mother data page still imports mock data despite matching backend endpoints already existing (§2, §3).
2. **Frontend registration/sign-up flow** — `POST /api/auth/register` exists backend-side with no corresponding frontend page found.
3. **Doctor backend API** — full DB tables and frontend UI exist; no `doctorController`/`doctorRoutes`.
4. **Hospital backend API** — same gap; `hospitalService.ts` frontend comments explicitly mark this as future work.
5. **Admin backend API** — same gap; `adminService.ts` frontend comments explicitly mark this as future work.
6. **Messaging/notifications backend** — `conversations`, `messages`, `notifications`, `alerts` tables exist unused by any controller.
7. **Logout wiring** — `useMockAuth.logout` clears local storage only; unclear if a backend session/token-invalidation endpoint is needed (not found in `authRoutes.ts`).
8. **Automated tests** — no test framework configured anywhere in the repo; Module 14 ("Testing and Deployment") in `MAASURAKSHA_PROJECT_RULES.md` is explicitly future work.
9. **Password-field default UX just fixed for demo login (this session)** — confirms real login round-trips against seeded accounts is now a viable smoke test surface if a test framework is added later.
