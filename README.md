💼 SkillBridge — AI-Powered Career Gap Analyzer

🚀 Built for the Google Cloud Run Hackathon 2025 (AI Studio Category)

SkillBridge is a serverless, AI-driven career assistant that analyzes resumes using Gemini models, identifies career gaps, missing skills, certifications, and recommends learning resources — all deployed seamlessly on Google Cloud Run.

⸻

🌟 Overview

In today’s fast-evolving job market, professionals often struggle to understand what skills or certifications they lack to reach their dream roles.
SkillBridge solves this problem using Google Gemini and AI Studio, turning your resume into actionable insights — instantly and securely.

⸻

🧠 Core Features
	•	📝 Resume Upload / Paste Support — Analyze resumes directly in text form
	•	🎯 Target Role Analysis — Specify any desired job title (e.g., “Data Scientist”, “Frontend Engineer”)
	•	🤖 Gemini-Powered Analysis — Uses Gemini Pro / 2.5 Pro model via AI Studio API
	•	🧩 Gap Summary — Identifies missing experience or weak skill areas
	•	🧰 Skill Recommendations — Suggests technical and soft skills to acquire
	•	🎓 Certification Suggestions — Provides top credentials to strengthen the profile
	•	📚 Learning Resources — Curated courses, links, and books for upskilling
	•	⚡ Serverless & Scalable — Deployed fully on Google Cloud Run
	•	🔐 Secure API Key Handling via Secret Manager or environment variables

⸻
 ┌────────────────────┐
 │   React Frontend   │  ← (Vite + Tailwind)
 │  Deployed on Run   │
 └────────┬───────────┘
          │ (POST /analyze)
          ▼
 ┌────────────────────┐
 │  Cloud Function    │ ← Serverless Gemini API
 │  (Python + Flask)  │
 │  Uses google-generativeai │
 └────────┬───────────┘
          │
          ▼
 ┌────────────────────┐
 │  Gemini Model API  │ ← via AI Studio (vibe-coded portion)
 └────────────────────┘


 Deployment

Build Docker image
gcloud builds submit --tag gcr.io/<YOUR_PROJECT_ID>/skillbridge-ui

Deploy to Cloud Run
gcloud run deploy skillbridge-ui \
  --image gcr.io/<YOUR_PROJECT_ID>/skillbridge-ui \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --update-env-vars GEMINI_API_KEY=YOUR_KEY_HERE

  Verify

Visit your deployed app URL: https://skillbridge-ui-<random>-uc.a.run.app

Example Output
{
  "gap_summary": "Candidate lacks advanced data modeling and deployment experience required for a Senior Data Scientist role.",
  "missing_skills": ["TensorFlow", "Kubernetes", "MLOps"],
  "certifications": ["TensorFlow Developer Certificate", "Google Cloud ML Engineer"],
  "learning_resources": [
    "Coursera: MLOps Specialization",
    "Book: Hands-On Machine Learning with Scikit-Learn",
    "Website: freeCodeCamp - Advanced Data Science"
  ]
}

Local Development
# Clone repo
git clone https://github.com/AdoraJade/skillbridge-gcp-hackathon.git
cd skillbridge-gcp-hackathon

# Install dependencies
npm install
# or for Python backend
pip install -r requirements.txt

# Run locally
npm run dev

Set environment variable in .env:
GEMINI_API_KEY=YOUR_API_KEY
