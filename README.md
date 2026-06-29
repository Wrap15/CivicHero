# 🏛️ CivicHero: AI-Powered Hyperlocal Problem Solver

CivicHero is a production-grade, highly scalable, AI-powered civic technology platform built to bridge the gap between local citizens and municipal government organizations. 

Communities frequently face infrastructure defects (like potholes, water leakages, broken streetlights, or garbage overflow) that are currently managed by slow, fragmented, non-transparent systems. CivicHero offers a modern, gamified, and hyper-transparent SaaS platform where citizens can report issues, community members verify them, officials resolve them, and everyone can track municipal progress in real-time.

---

## 🚀 Key Platform Features

### 1. Citizen Portal & Dashboard
*   **Multimedia Reporting:** Citizens can drag and drop photo uploads, geolocate coordinates using interactive maps, and record voice note descriptions.
*   **GIS Proximity Duplicate Prevention:** When reporting a concern, a Haversine distance scanner checks the database for unresolved tickets of the same category within a **100-meter radius**. If found, the user is prompted to **"Vote & Verify Existing (+15 XP)"** instead of creating duplicate tickets.
*   **Gamification Loop:** Citizens earn experience points (XP), unlock ranks, and claim achievements (e.g. *Pothole Patrol*) for participating in verifications.
*   **Neighborhood Civic Trust Score:** Users start with a baseline Trust Score of `70%`. Community confirmations raise it (+1), fake reports decrease it (-5), and official resolutions boost it (+5). Users with a Trust Score of `85%` or above (Trusted Sentries) bypass verification votes entirely, fast-tracking reports directly to officials.

### 2. Intelligent AI Integrations (Google Gemini 2.5 Flash)
*   **Automatic Categorization (`/api/analyze`):** Instantly grades severity, extracts descriptive titles, parses address locations, and identifies spam or fraudulent photo uploads.
*   **Predictive Trends (`/api/predict`):** Leverages historical municipal ticket frequencies and meteorological trends to project seasonal blockages and road defect hotspots.
*   **Natural Language Search (`/api/search`):** Translates conversational queries (e.g. *"Show me critical road blocks near downtown"*) into structured database query parameters.

### 3. Government Dispatch & Analytics
*   **Municipal Work Queue:** Officials can assign tickets to specific department workers, progress tasks through resolution phases, and upload visual resolution proofs.
*   **Analytics Dashboard:** Implements interactive Recharts modules tracking department backlogs, ticket distribution, and average resolution times.

### 4. Admin Command Center
*   **Roster Management:** Overview of user privilege configurations, account restriction triggers, and audit trails.
*   **Audit Logger:** Captures authorized operator activities (`ADMIN_FORCE_RESOLVE`, `ADMIN_DELETE_ISSUE`) with detailed action payloads.

---

## 🛠️ Technology Stack

*   **Framework:** Next.js 15 (React 19 App Router)
*   **Styling:** Vanilla TailwindCSS
*   **Animation System:** Framer Motion (Apple-style easing, spring bouncers, infinite marquees)
*   **GIS & Map Renderers:** OpenStreetMap Leaflet, Google Maps Web API
*   **Database & Auth Core:** Firebase (Firestore DB, Firebase Authentication, Cloud Storage)
*   **AI Engine:** Google AI Studio Gemini API Connector
*   **Data Visualizations:** Recharts Charts Engine

---

## 🏛️ Clean Architecture & Transparent Fallback

CivicHero is built following a clean **Service-Repository** pattern. 

To enable immediate, out-of-the-box evaluation without backend setups, the platform contains a **Transparent Mock Local Fallback Mode**. If live Firebase or Gemini credentials are not detected in your configuration, the application automatically runs offline, storing user records, tickets, comments, and audit logs inside `localStorage` and `sessionStorage` in your browser.

---

## ⚙️ Getting Started & Installation

### 1. Clone & Install Dependencies
Navigate to your workspace directory and run:
```bash
npm install
```

### 2. Configure Environment Keys (For Production Sync)
Create a `.env.local` file in the root folder and add the following keys:
```env
# Google Gemini AI Key
GEMINI_API_KEY=your_gemini_api_key_here
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here

# Firebase Web Client Credentials
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 3. Spin Up the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Demo mode Test Accounts

When running in local mock fallback mode, you can log in instantly with the following pre-seeded developer accounts (Passwords for all mock profiles: `password123`):

*   **Citizen Account:** `citizen@civichero.org` (Simulates Jane Citizen, Level 3, 92% Trust Score)
*   **Government Official:** `official@civichero.org` (Simulates municipal department worker)
*   **System Administrator:** `admin@civichero.org` (Accesses global audit logs & overrides)

---

## 💜 Credits
Designed & Built with love by **[DHAVAL PANCHAL](https://my-portfolio-nine-eta-63.vercel.app/)**
