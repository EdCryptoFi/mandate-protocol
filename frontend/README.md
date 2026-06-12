# Mandate Protocol — Frontend

Next.js dashboard for [Mandate Protocol](../README.md): landing page, role-based login (Treasury / Compliance / Regulator), and three dashboards showing agent activity, session limits, margin calls and the on-chain AI audit trail.

**Live:** https://mandate-protocol.vercel.app

## Run locally

```bash
npm install
npm run dev
# → http://localhost:3000
```

## Build

```bash
npm run build
npm start
```

The dashboards currently render demo data that mirrors the Daml contract shapes (`AgentSession`, `CollateralPool`, `AgentAction`). Wiring them to the Canton JSON API is on the roadmap — see the main README.
