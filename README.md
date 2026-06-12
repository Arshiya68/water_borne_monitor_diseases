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

#### B. Database Configuration & MySQL Workbench Setup
Before seeding the database, make sure you configure your local MySQL instance using MySQL Workbench:

1. **Create the Database and Tables:**
   - Open **MySQL Workbench** and connect to your local MySQL instance.
   - Click the **Create a new SQL tab** button.
   - Copy the SQL DDL commands from the [create_tables.sql](./create_tables.sql) file located in the project root.
   - Paste the SQL script into the query editor and click **Execute** (lightning bolt icon).
   - This will create the `waterborne_db` database and all required tables: `users`, `water_quality`, `notifications`, `symptom_reports`, `household_visits` (Village Health Register), `alert_investigations`, `water_sources`, `incident_reports`, and `emergency_locations`.

2. **Configure Backend Environment:**
   - Open [backend/.env](./backend/.env) file.
   - Update `DATABASE_URL` with your local MySQL credentials:
     ```
     DATABASE_URL=mysql+pymysql://<mysql_user>:<mysql_password>@localhost:3306/waterborne_db
     ```

#### C. Seed Database
Once your MySQL tables are created, run the database seeder to insert baseline sample data (users, water sources, environmental parameters):
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

---

## 🐳 Docker Deployment & Containerization

The project is fully containerized, packaging the React frontend (served by Nginx) and Flask backend (served by Gunicorn) into a single, unified container running on port `80`.

### 1. Run Locally using Docker

If you have Docker Desktop installed, follow these steps to build and run the project locally.

#### A. Build the Unified Image
From the project root directory, run:
```bash
docker build -t <your-docker-username>/water_borne_monitor_diseases:latest .
```

#### B. Run the Container
Run the built container, mapping port `80` to your host:
```bash
docker run -d -p 80:80 --name waterborne-monitor <your-docker-username>/water_borne_monitor_diseases:latest
```
Access the application by opening `http://localhost` in your web browser.

#### C. Push Manually to Docker Hub
Log in to your Docker Hub account and push the tagged image:
```bash
docker login
docker push <your-docker-username>/water_borne_monitor_diseases:latest
```

---

### 2. Automated Cloud Push via GitHub Actions

A CI/CD pipeline is pre-configured in [.github/workflows/docker-build-push.yml](.github/workflows/docker-build-push.yml). Whenever you push new code to the `main` branch, GitHub will automatically build and push the Docker image to your Docker Hub.

To enable this:
1. Go to your repository on GitHub.
2. Navigate to **Settings** > **Secrets and variables** > **Actions**.
3. Create the following two **Repository Secrets**:
   - `DOCKER_USERNAME`: Your Docker Hub username.
   - `DOCKER_PASSWORD`: Your Docker Hub password (or Personal Access Token).
4. Run `git push` to upload your code to GitHub, and the image build/push will be triggered automatically.
