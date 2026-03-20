# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development server
yarn start          # webpack serve --mode development
yarn dev            # webpack serve --mode development --open

# Production build
yarn build          # webpack --mode production
```

There is no test or lint command configured.

## Architecture Overview

**ApnaLabourAdmin** is a React 18 admin dashboard for the "Apna Labour" (Genie-branded) labor marketplace platform.

### Tech Stack
- **React 18** with JSX components (no TypeScript in components)
- **Webpack 5** for bundling (no Vite or CRA)
- **Tailwind CSS** for styling
- **AWS Amplify** (Cognito for auth, AppSync for GraphQL)
- **Firebase** (FCM for push notifications, Remote Config)
- **Axios** for some REST calls alongside GraphQL

### Routing
The app uses **custom client-side routing** — no React Router. `App.js` manages routing via:
- `getPageFromRoute()` / `getRouteForPage()` — maps URL paths to page names
- `window.history.pushState()` and `popstate` events for browser navigation
- `activePage` state prop drilled to all components for conditional rendering

When adding new pages, update both route mapping functions in `App.js` and add the component to the conditional render block.

### State Management
No Redux or Context API — state is managed via `useState` hooks with **props drilling** from `App.js` down. `App.js` (~819 lines) is the central hub holding most shared state (selected IDs, active page, etc.).

### Service Layer (`src/services/`)
All API calls are encapsulated in service modules — components should not make API calls directly:
- `ordersAPI.js`, `labourAPI.js`, `usersAPI.js`, `categoryAPI.js` — GraphQL via AppSync
- `amplifyAuth.js` — Cognito auth (signup, OTP verify, signin)
- `notificationAPI.js`, `firebaseAPI.js` — FCM token management and push notifications
- `dashboardAPI.js` — analytics/metrics
- `remoteConfigBackendAPI.js` — custom backend remote config (REST)

### GraphQL
Auto-generated TypeScript files in `src/graphql/` (queries, mutations, subscriptions) — do not edit these manually. They are generated from the AppSync schema.

### Key Config Files
- `src/config.js` — API base URLs (Render.com backend, AWS Lambda)
- `src/amplifyconfiguration.json` — AWS Amplify/AppSync settings
- `src/firebase.js` — Firebase initialization and FCM setup
- `.env` — API keys and Firebase config (not committed)

### Notifications
Push notifications use Firebase FCM + a **Service Worker** (`public/firebase-messaging-sw.js`). The service worker handles background notifications with Web Audio API for alert sounds. FCM tokens are stored in Firebase Realtime Database.
