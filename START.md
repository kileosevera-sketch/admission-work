# V3RA Admission Hub - Quick Start

## Start the frontend

Open a terminal in `D:\Admission_project\Admission\frontend` and run:

```powershell
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

## Enable predictions and CSV upload

Open a second terminal in `D:\Admission_project\Admission` and start the backend:

```powershell
.\start_backend.ps1
```

The frontend checks the backend at `http://127.0.0.1:8000`. The top bar shows whether the prediction API is online. Keep the backend running to upload a CSV and receive predictions.

Upload a CSV containing `Score1` and `Score2` columns. The backend returns predictions and the dashboard updates its student totals, admission rate, chart, and results table. The dashboard starts with zero metrics until a dataset is processed.
