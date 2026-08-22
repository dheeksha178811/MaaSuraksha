# MaaSuraksha Project Rules

## Project

MaaSuraksha – Maternal and Child Health Program Beneficiary Tracking and Immunization Reminder System.

## Current Development Stage

Module 0 – Frontend Foundation.

The project is being developed incrementally.

Never attempt to build the entire project in one operation.

## Technology

Frontend:

* React
* TypeScript
* Vite
* Tailwind CSS
* React Router
* Lucide React

Future backend:

* Node.js
* Express.js
* MongoDB
* Mongoose

The backend is NOT implemented during Module 0.

## Design Identity

MaaSuraksha must maintain a warm, peaceful, motherly healthcare aesthetic.

Primary visual direction:

* Soft sandal
* Warm terracotta
* Peach
* Cream
* Ivory
* Muted sage
* Warm brown

The interface must never drift into bright orange, neon colors, generic blue healthcare UI, or purple SaaS styling.

## Design Tokens

Primary Sandal:
#B97863

Deep Terracotta:
#9E6252

Soft Peach:
#EAC7B8

Very Soft Peach:
#F3DED5

Warm Ivory:
#FCF8F4

Warm Cream:
#F7F0EA

Deep Warm Brown:
#4E3A33

Muted Brown:
#806D64

Soft Sage:
#DCE8DE

Sage Text:
#667B6B

White:
#FFFFFF

These colors should be centralized and reused.

## Typography

Display:
Cormorant Garamond or Playfair Display

Interface:
Inter or DM Sans

Use serif typography primarily for major headings and sans-serif typography for UI elements.

## Architecture Rules

* Keep components modular.
* Do not put the entire application into App.tsx.
* Reuse existing components.
* Keep routes organized.
* Keep mock data separate from UI components.
* Use TypeScript interfaces/types.
* Do not duplicate components unnecessarily.

## AI Development Rules

Before changing existing code:

1. Inspect the current project structure.
2. Understand existing components.
3. Reuse existing components where possible.
4. Do not rewrite unrelated files.
5. Do not change the design system without explicit approval.
6. Do not change existing routes unnecessarily.
7. Do not install dependencies unless required.
8. Do not delete working functionality.
9. Do not modify completed modules simply to implement a new module.
10. Preserve responsive behavior.

## Module Development Strategy

Build the project in modules:

Module 0:
Frontend Foundation

Module 1:
Mother Dashboard

Module 2:
Mother Profile & Child Profile

Module 3:
Schedule & Immunization

Module 4:
Appointments & Notifications

Module 5:
Doctor Module

Module 6:
Hospital Module

Module 7:
Admin Module

Module 8:
Government Schemes

Module 9:
Nutrition & Exercise

Module 10:
Documents & Health Timeline

Module 11:
Backend

Module 12:
Database

Module 13:
Frontend-Backend Integration

Module 14:
Testing and Deployment

Never implement multiple major modules at once unless explicitly instructed.

## Stability Rules

After every module:

* Run the application.
* Check compilation.
* Check browser console.
* Check all routes affected.
* Check responsive layouts.
* Fix errors before moving forward.

Do not leave the project in a broken state.

## Mock Data Rule

Until backend integration begins:

* Use fictional demo data.
* Do not use real patient information.
* Keep mock data centralized.
* Do not create fake API implementations unnecessarily.

## Healthcare Safety

MaaSuraksha is a healthcare coordination and information platform.

It must not claim to:

* Diagnose medical conditions.
* Replace doctors.
* Prescribe medication.
* Provide emergency medical treatment.

Nutrition and exercise information must be treated as general wellness guidance and should encourage professional consultation where appropriate.

## UI Quality Standard

Every completed page should feel like part of the same product.

Maintain:

* Consistent spacing
* Consistent typography
* Consistent border radius
* Consistent shadows
* Consistent colors
* Consistent icon style
* Consistent responsive behavior

The application should feel premium, calm, warm, and trustworthy.
