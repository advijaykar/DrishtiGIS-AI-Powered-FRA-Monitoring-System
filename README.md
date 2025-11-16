<<<<<<< HEAD
# DrishtiGIS AI Powered FRA Monitoring System

Modern, end-to-end platform for monitoring Forest Rights Act (FRA) activities. The project bundles multiple web clients, services, and infrastructure tooling to support data collection, analytics, and public reporting.

## Overview

- **Tech stack**: React 18 + Vite + TypeScript, TailwindCSS, Supabase, Node.js services, Python OCR microservice, MQTT consumer.
- **Goal**: deliver a unified dashboard for administrators, field users, and community stakeholders with AI-assisted tooling for claims, mapping, and decision support.

## Key Packages

- `FRA-Atlas-main/` – main monorepo containing:
	- `src/` – primary React SPA for the Atlas dashboard and AI tooling.
	- `drishti-gis-admin/` – admin portal (Node/Express backend, OCR service, MQTT consumer).
	- `drishti-gis-user/` – lightweight citizen-facing client.
	- `supabase/` – database configuration and SQL migrations.
- `.github/workflows/` – CI/CD pipelines (e.g., GitHub Pages deployment).

## Getting Started

```bash
git clone https://github.com/gunjan-creates/DrishtiGIS-AI-Powered-FRA-Monitoring-System.git
cd DrishtiGIS-AI-Powered-FRA-Monitoring-System/FRA-Atlas-main
npm install
npm run dev
```

The dev server defaults to `http://localhost:8080`.

## Build & Deploy

```bash
npm run build
```

Artifacts land in `FRA-Atlas-main/dist`. GitHub Pages deployment is automated via `.github/workflows/deploy.yml`.

## Contributing

1. Fork the repository and clone locally.
2. Create a branch for your feature/fix.
3. Run formatting and linting (`npm run lint`).
4. Open a pull request describing the change.

## License

Distributed under the MIT License. See `LICENSE` for details.
