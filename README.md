# Community-Based Early Warning System (EWS) for Water-Borne Diseases

An AI-powered, crowdsourced **Early Warning System (EWS)** designed to detect localized waterborne outbreaks at the source. The platform bridges clinical health telemetry (gastrointestinal symptoms) and environmental indicators (turbidity, pH, dissolved oxygen) to predict outbreak risks and trigger automatic warning alerts.

---

## 🚀 Key Features

* **Crowdsourced Symptom Logs:** Villagers can report gastrointestinal symptoms and log unsafe water characteristics.
* **Optimized ML Risk Assessor:** Machine learning classifier (Gradient Boosting) correlating clinical and physical features in real-time.
* **Explainable AI (XAI):** Clear impact bars displaying risk drivers (e.g. turbidity spikes) directly to users.
* **Automated Cluster Triggers:** Backend checks 7-day case counts. Spawns high-risk alerts automatically when 3+ cases occur in a village/district.
* **ASHA Field Care Logs:** A tabbed ground-truth verification workbook with household status checklists and clinical diagnosis forms.
* **Official Surveillance Dashboard:** Features GIS Leaflet hotspot maps, manual SMS warning dispatches, and an interactive Outbreak Simulator.

---

## 🛠️ Tech Stack

* **Frontend:** React (Vite), TailwindCSS, Recharts, React-Leaflet.
* **Backend:** Python, Flask, Flask-SQLAlchemy (ORM), Flask-JWT-Extended (Auth).
* **Machine Learning:** Scikit-Learn (Gradient Boosting Classifier), Pandas, NumPy, Joblib.
* **Database:** Relational SQL (SQLite/MySQL).

---

## ⚙️ Project Setup & Execution Commands

Follow these steps to run the backend REST API and frontend dev servers.

### 1. Prerequisites
Ensure you have the following installed on your machine:
* **Python 3.10+** (verify with `python --version`)
* **Node.js 18+** (verify with `node -v`)

---

### 2. Backend Setup & Run

Open a terminal window and navigate to the `backend` directory:

```bash
cd backend
```

#### A. Setup Virtual Environment
Create a Python virtual environment and activate it:

**On Windows (Command Prompt / PowerShell):**
```powershell
python -m venv venv
venv\Scripts\activate
```

**On macOS / Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

#### B. Install Dependencies
Install all required Python packages:
```bash
pip install -r requirements.txt
```

#### C. Seed Database
Create database tables and seed baseline sample data (users, water sources, parameters):
```bash
python sample_data.py
```

#### D. Start Backend Server
Run the Flask API development server (runs on `http://127.0.0.1:5000`):
```bash
python run.py
```

---

### 3. Frontend Setup & Run

Open a **new** terminal window and navigate to the `frontend` directory:

```bash
cd frontend
```

#### A. Install Node Packages
Install all required Node.js dependencies:
```bash
npm install
```

#### B. Start Frontend Dev Server
Run the Vite development server (runs on `http://localhost:5173`):
```bash
npm run dev
```

---

## 🧪 Verification & Testing

To test and verify the EWS warning triggers, execute these Python scripts from the `backend/` directory:

* **Symptom Report Submission Test:**
  Registers a mock user and submits symptom parameters.
  ```bash
  python test_report_submit.py
  ```

* **7-Day Outbreak Cluster Trigger Test:**
  Registers multiple users and submits 3 consecutive symptom reports. Verifies that the backend automatically triggers a high-priority cluster warning notification.
  ```bash
  python test_cluster.py
  ```

---

## 📄 Documentation Reports

Text-only documentation files are available in your workspace root directory for evaluator briefings:
* [PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md) (Markdown)
* [EWS_Project_Evaluator_Report.pdf](./EWS_Project_Evaluator_Report.pdf) (PDF briefing report)
