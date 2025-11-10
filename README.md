# 💼 SkillBridge — AI-Powered Resume Gap Analyzer
🚀 *Built for the Google Cloud Run Hackathon 2025 (AI Studio Category)*

SkillBridge is an AI-driven, serverless career assistant that helps professionals identify **career gaps**, **missing skills**, **certifications**, and **learning resources** — all powered by **Gemini models** and deployed seamlessly on **Google Cloud Run**.

---

## 🌟 Overview

In today’s rapidly evolving job market, professionals often struggle to understand what skills or certifications they lack to reach their dream roles.  
SkillBridge bridges this gap using **Google AI Studio (Gemini)**, transforming your resume into actionable, personalized career insights.

---

## 🧠 Core Features

- 📝 **Resume Upload** — Upload `.pdf`, `.doc`, `.docx`, or `.txt` resumes  
- 🎯 **Target Role Analysis** — Analyze your profile against any job title  
- 🤖 **Gemini-Powered Intelligence** — Built with Gemini Pro via AI Studio  
- 🧩 **Gap Summary** — Identifies missing experience or weak skill areas  
- 🎓 **Certifications & Learning Resources** — Suggests courses and credentials  
- ⚡ **Serverless & Scalable** — Runs fully on **Google Cloud Run**  
- 🔐 **Secure API Key Handling** — No secrets committed to source  

---

## 🧰 Tech Stack

| Component | Technology |
|------------|-------------|
| **Frontend** | React (Vite + Tailwind CSS) |
| **Backend (AI logic)** | Python / Gemini API (AI Studio generated) |
| **AI Model** | Google Gemini 1.5 Pro (via AI Studio API) |
| **Hosting** | Google Cloud Run (serverless) |
| **Container Registry** | Artifact Registry |
| **Auth & Secrets** | Google Cloud Secret Manager |

---

## ⚙️ Prerequisites

### 1️⃣ Enable Google Cloud APIs
Enable required APIs in your GCP Console:
```
https://console.cloud.google.com/flows/enableapi?apiid=run.googleapis.com,artifactregistry.googleapis.com,cloudbuild.googleapis.com,secretmanager.googleapis.com
```

### 2️⃣ Create a Project
```bash
gcloud projects create skillbridge-<unique-id>
gcloud config set project skillbridge-<unique-id>
```

### 3️⃣ Get a Gemini API Key (AI Studio)
1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)  
2. Click **Create API Key** → select your Google Cloud Project  
3. Copy the generated key (e.g., `AIzaSyC1234...`)  
4. Save it securely for environment configuration.

### 4️⃣ Install Google Cloud SDK
- Install: https://cloud.google.com/sdk/docs/install  
- Verify setup:
```bash
gcloud --version
gcloud auth login
```

---

## 🧑‍💻 Local Development

### 1️⃣ Clone the Repo
```bash
git clone https://github.com/AdoraJade/skillbridge-gcp-hackathon.git
cd skillbridge-gcp-hackathon
```

### 2️⃣ Add Environment Variable
Create a `.env` file in your project root:
```bash
GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

> ⚠️ Do **not** commit `.env` to GitHub. Cloud Run will manage secrets securely.

### 3️⃣ Install Dependencies
```bash
npm install
```

### 4️⃣ Run Locally
```bash
npm run dev
```
App runs at 👉 [http://localhost:5173](http://localhost:5173)

---

## 🐳 Dockerfile (for Cloud Run)
Add a `Dockerfile` in your project root:

```Dockerfile
# Stage 1: Build Vite React app
FROM node:20 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve static build
FROM node:20-slim
WORKDIR /app
RUN npm install -g serve
COPY --from=builder /app/dist ./dist
EXPOSE 8080
CMD ["serve", "-s", "dist", "-l", "8080"]
```

---

## ☁️ Deploy to Cloud Run

### 1️⃣ Authenticate
```bash
gcloud auth login
gcloud config set project skillbridge-<your-project-id>
```

### 2️⃣ Create Artifact Registry
```bash
gcloud artifacts repositories create containers \
  --repository-format=docker \
  --location=us-central1
```

### 3️⃣ Build Image
```bash
gcloud builds submit \
  --tag us-central1-docker.pkg.dev/<YOUR_PROJECT_ID>/containers/skillbridge-ui:v1 .
```

### 4️⃣ Deploy to Cloud Run
```bash
gcloud run deploy skillbridge-ui \
  --image us-central1-docker.pkg.dev/<YOUR_PROJECT_ID>/containers/skillbridge-ui:v1 \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --port 8080 \
  --update-env-vars GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

---

## ✅ Verify Deployment
After deployment, you’ll see a public URL like:
```
https://skillbridge-ui-xxxxxx-uc.a.run.app
```
Visit it to view your live AI-powered resume analyzer 🎉

---

## 🧩 AI Studio (Vibe-Coded Portion)
A portion of this project — the **resume analysis logic** — was generated in **Google AI Studio** using the `google-generativeai` library and Gemini models.

🔗 Example AI Studio App Link:  
https://aistudio.google.com/app/<your-app-id>

---

## 💻 Usage
1. Upload your resume (`.pdf`, `.doc`, `.docx`, or `.txt`)
2. Enter your target job role (e.g., *Data Scientist*)
3. Click **Start Analysis**
4. Copy or Download results as `.txt`
5. Click **Reset** to start a new session

---

## 📄 Example Output
```json
{
  "gap_summary": "Candidate lacks advanced MLOps and deployment experience for the Senior ML Engineer role.",
  "missing_skills": ["Kubernetes", "TensorFlow Extended", "Model Deployment"],
  "certifications": ["Google Cloud ML Engineer", "TensorFlow Developer"],
  "learning_resources": [
    "Coursera: MLOps Specialization",
    "Book: Hands-On Machine Learning",
    "Website: freeCodeCamp - Advanced Machine Learning"
  ]
}
```

---

## 🪄 License
This project is licensed under the **Apache 2.0 License** — free for use, modification, and extension.

---

## 🏆 Credits
- Built by **Adora Jade** ✨  
- Powered by **Gemini (Google AI Studio)**  
- Deployed on **Google Cloud Run**  
- Submission for **Google Cloud Run Hackathon 2025 (AI Studio Category)**


## 🧭 Architecture Diagram

```mermaid
flowchart LR
  U[End User\n(Browser)] -->|HTTPS| CR[Cloud Run Service:\nSkillBridge UI (React/Vite)]
  CR -->|REST + API Key| GEM[Gemini API\n(Google AI Studio, gemini-2.5-pro)]
  subgraph CICD[CI/CD]
    CB[Cloud Build] --> AR[Artifact Registry]
    AR -->|Deploy| CR
  end
  subgraph Ops[Ops]
    SEC[Config / Secrets\n(GEMINI_API_KEY env var / Secret Manager)]
    LOG[Cloud Logging & Monitoring]
  end
  SEC --> CR
  CR --> LOG
