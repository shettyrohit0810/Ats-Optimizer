## ATS Optimizer – AI-Powered Resume & Job Match Analyzer

Transform your resume into an ATS-friendly, job-aligned profile. ATS Optimizer analyzes your resume and a target job description to generate actionable insights, keyword coverage, gap analysis, sentence-level feedback, and an overall job fit score—helping you stand out in competitive applications.

### Live Demo
- Frontend: https://ats-optimizer.netlify.app
- API: https://ats-optimizer.railway.app

### Recruiter Snapshot
Below are representative screenshots of the product experience.

1) Dashboard
![Dashboard](./Screenshot%202025-09-27%20213936.png)

2) Overall Score & Match
![Score](./Screenshot%202025-09-27%20221946.png)

3) Candidate Summary (Name, Contact, Email)
![Profile](./Screenshot%202025-09-27%20222000.png)

4) Skills Breakdown
![Skills](./Screenshot%202025-09-27%20222011.png)

5) Resume & Job Description Analysis
![Analysis](./Screenshot%202025-09-27%20222200.png)

### What It Does
- Parses resume text (or uploaded PDF/DOCX) and extracts structured data (contact info, skills, experience, projects, education)
- Analyzes a provided job description to extract role requirements and critical keywords
- Compares resume vs job description to produce:
  - Overall match score and grade
  - Keyword coverage and gaps
  - Experience alignment and seniority signals
  - Education and certifications fit
  - Sentence-level feedback with improvement suggestions

### Why It Helps Recruiters & Candidates
- Rapid, consistent screening with transparent breakdowns
- Actionable suggestions for candidates to improve alignment
- Standardized, ATS-friendly parsing to reduce ambiguity

### Tech Stack
- Frontend: Next.js (TypeScript), Tailwind CSS
- Backend: Node.js, Express (TypeScript)
- File Handling: Multer, pdf-parse, mammoth
- AI: OpenAI API (structured JSON outputs with strict prompts)
- Auth: Google OAuth (Passport.js)
- Hosting: Netlify (frontend), Railway (backend)

### Key Features
- Resume parsing to strict JSON schema
- Job description keyword extraction and weighting
- Resume-vs-JD matching with category-level breakdown
- Sentence scoring with improvement suggestions
- Comprehensive metrics and recruiter-ready summaries

### Getting Started (Local)
1. Clone repo and install
   - Backend: `cd backend && npm install && npm run dev`
   - Frontend: `cd frontend && npm install && npm run dev`
2. Env vars (examples)
   - BACKEND: `PORT=5000`, `SESSION_SECRET=...`, `OPENAI_API_KEY=...`, `GOOGLE_CLIENT_ID=...`, `GOOGLE_CLIENT_SECRET=...`, `FRONTEND_URL=http://localhost:3000`, `BACKEND_URL=http://localhost:5000`
   - FRONTEND: `NEXT_PUBLIC_API_BASE_URL=http://localhost:5000`

### Contact
- Name: Your Name
- Email: your.email@example.com
- LinkedIn: https://www.linkedin.com/in/your-profile
- Portfolio: https://your-portfolio.com

If you'd like a tailored demo, feel free to reach out.