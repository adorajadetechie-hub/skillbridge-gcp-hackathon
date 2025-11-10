# 💼 SkillBridge — AI-Powered Career Gap Analyzer

> 🚀 Built for **Google Cloud Run Hackathon 2025** — **AI Studio Category**  
> _Partially vibe-coded using Google AI Studio, deployed on Cloud Run._

SkillBridge is a serverless, AI-powered assistant that analyzes resumes using **Gemini models**, identifies career gaps, missing skills, certifications, and suggests learning resources — all deployed seamlessly on **Google Cloud Run**.

---

## 🌟 Overview

In today’s fast-evolving job market, professionals often struggle to identify what’s missing between their current skills and their dream role.  
SkillBridge solves this using **Google Gemini** and **AI Studio**, transforming resumes into **actionable career insights** — instantly and securely.

---

## 🧠 Core Features

- 📝 **Resume Input** — Paste or upload text extracted from a resume (PDF/DOC)
- 🎯 **Target Role Analysis** — Specify your target job title (e.g., “Data Scientist”, “Frontend Engineer”)
- 🤖 **Gemini-Powered Analysis** — Uses Gemini 1.5/2.5 Pro model via AI Studio API
- 🧩 **Gap Summary** — Identifies experience or skills missing for the target role
- 🧰 **Skill Recommendations** — Highlights both technical and soft skills to improve
- 🎓 **Certifications** — Suggests certifications to strengthen your profile
- 📚 **Learning Resources** — Provides curated courses, links, and books for upskilling
- ⚡ **Serverless & Scalable** — Built and deployed on Google Cloud Run
- 🔐 **Secure API Key Handling** — Managed via Secret Manager or environment variables

---

## 🧠 AI Studio (Vibe-Coded Portion)

The AI logic that performs resume analysis was **vibe-coded in AI Studio** using the Gemini API.  
This script uses `google-generativeai` to analyze resume text and output structured JSON with career gaps and learning suggestions.

🔗 **AI Studio App Link:** _(Add your “Share App” link from AI Studio here)_

---

## 🧰 Local Development

### 🔹 UI Setup
```bash
cd app
npm install
npm run dev