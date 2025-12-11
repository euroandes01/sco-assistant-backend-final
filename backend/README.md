# SCO Assistant — Full production package (Frontend + Backend)

## Overview
This repository contains:
- `frontend/` — Chrome extension (Manifest v3) used to upload SCO documents and display analysis.
- `backend/` — FastAPI service that analyzes SCO text and returns a structured report.

## Quick local test (backend)
1. Create a Python venv: `python -m venv .venv && . .venv/bin/activate` (Windows: `.venv\Scripts\activate`)
2. Install: `pip install -r backend/requirements.txt`
3. Run: `uvicorn backend.app:app --reload --port 8080`
4. Test: `curl -F "file=@backend/example_sco.txt" -F "mode=free" http://localhost:8080/api/analyze`

## Quick extension test (frontend)
1. Open Chrome → `chrome://extensions/`
2. Enable Developer mode
3. Load unpacked → select the `frontend/` folder
4. In settings tab, set backend URL (e.g. http://localhost:8080)
5. Upload `example_sco.txt` and click Analyze.

## Deployment
- Backend: deploy `backend/` to Railway, Render, or any container service. Use Procfile or uvicorn start command.
- Frontend: pack extension for Chrome Web Store or load unpacked during dev.

## Notes
- The scoring logic is heuristic and conservative. Do NOT rely solely on it for high-value transactions.
- Replace CORS allow_origins in production with your extension endpoint or domain.
