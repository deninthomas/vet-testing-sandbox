# TailWise API & Documentation Guide

Welcome to the TailWise Developer & QA API Documentation guide. This repository contains the backend route endpoints for the TailWise platform, designed with mock fallback engines and deliberate bugs to test validation flows inside sandboxed environments.

---

## How to Access the Swagger API Documentation

### 1. Interactive Swagger UI
You can access a styled, interactive Swagger UI documentation directly inside the running application:
- **URL**: `http://localhost:3000/api/docs` (when running locally)
- **Features**:
  - Full list of all endpoints grouped by category.
  - Interactive "Try it out" feature to execute requests on the sandbox server.
  - Complete schemas, status codes, and built-in **dummy data/examples** for every request and response.

### 2. Static OpenAPI Spec
The raw, complete OpenAPI 3.0.0 JSON specification is served statically:
- **URL / Path**: `http://localhost:3000/link.json` (also saved in [link.json](file:///c:/Users/HP/Downloads/Testing/public/link.json))
- **File Name**: `link.json` (as requested)

---

## Markdown API Reference Documents

For offline reading or quick reference, the API endpoints have been detailed in separate Markdown files located in the `docs/` folder:

1. 🔐 **[Authentication & Users Docs](file:///c:/Users/HP/Downloads/Testing/docs/auth.md)**: Logins, user registration, user listing, role updates, and deletions.
2. 🐾 **[Adoption Board Docs](file:///c:/Users/HP/Downloads/Testing/docs/adoption.md)**: Querying listing boards, creating animal profiles, and adoption applications.
3. 🚨 **[Rescue Incidents Docs](file:///c:/Users/HP/Downloads/Testing/docs/incidents.md)**: Reporting stray animals in distress, uploading images, tracking GPS coordinates, and resolving incidents.
4. 🛠️ **[Services & Auxiliary Docs](file:///c:/Users/HP/Downloads/Testing/docs/services.md)**: Pet shop products and checkouts, veterinary clinic bookings, AI/ML species identification classification, console logging, and database resets.

---

## Sandbox Environments & QA Testing

The backend is built to work under two environments:
1. **Mock Fallback (Default)**: Runs when the MongoDB URI is absent. State is stored in-memory and can be reset at any time using `POST /api/reset`.
2. **MongoDB database**: Connects to your database instance when `MONGODB_URI` is provided in `.env.local`.

### Deliberate QA Sandbox Bugs

To assist quality assurance testers, several deliberate bugs have been left in place in the API routes:
- **Auth**: Passwords are lowercased before comparison (case insensitivity), long passwords are truncated during registration, and role updates always target the first database user.
- **Adoption**: Adoption board listings do not filter out already-adopted pets, and double-adopting a pet triggers a simulated `500 NullPointerException` crash.
- **Incidents**: Latitude/Longitude GPS values are swapped when storing, and incident resolution utilizes an off-by-one index selection.
- **Pet Shop**: Cart checkouts allow negative quantities, resulting in negative total pricing and stock increments.
- **Veterinary**: Searching for clinic city `"Suburbs"` returns 0 results and triggers a client-side interface layout crash.
- **AI Classifier**: Identifies species purely by looking for the letter `'d'` in the uploaded file name.
