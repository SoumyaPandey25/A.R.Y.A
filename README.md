<div align="center">

# 🤖 A.R.Y.A.
### AI Research Assistant for Reliable, Verified & Actionable Insights

<p>
An intelligent research assistant that searches the web, summarizes information using Generative AI, and verifies responses to provide trustworthy research results in seconds.
</p>

![Python](https://img.shields.io/badge/Python-3.12-blue?style=for-the-badge&logo=python)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi)
![Gemini](https://img.shields.io/badge/Google-Gemini-orange?style=for-the-badge&logo=google)
![JavaScript](https://img.shields.io/badge/JavaScript-yellow?style=for-the-badge&logo=javascript)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3)

</div>

---

# 📌 Overview

**A.R.Y.A. (AI Research Assistant)** is a full-stack AI-powered research platform that automates the process of finding, summarizing, and validating information from the web.

Instead of manually browsing multiple websites, users simply enter a research topic, and A.R.Y.A.:

- 🔍 Searches relevant web sources
- 🧠 Generates concise AI-powered summaries
- ✅ Verifies the generated information
- 💡 Suggests refined search queries
- 📚 Presents clean, structured research insights

The goal is to make research **faster, smarter, and more reliable.**

---

# ✨ Features

### 🔎 Intelligent Web Research
Searches multiple online sources relevant to the user's query.

### 🤖 AI-Powered Summarization
Uses Google's Gemini API to generate concise, human-readable summaries.

### ✅ Fact Verification
Validates generated summaries to improve reliability.

### 💬 Modern Chat Interface
Interactive research experience with a clean UI.

### 🎯 Query Refinement
Detects vague queries and recommends better prompts.

### ⚡ Fast Backend
Powered by FastAPI for high-performance API responses.

### 🧩 Modular Architecture
Well-separated frontend and backend for scalability.

---

# 🏗️ Architecture

```text
                User
                  │
                  ▼
          Frontend (HTML/CSS/JS)
                  │
                  ▼
            FastAPI Backend
                  │
      ┌───────────┼────────────┐
      │           │            │
      ▼           ▼            ▼
 Web Search   Gemini AI   Verification
      │           │            │
      └───────────┼────────────┘
                  ▼
        Structured Research Output
```

---

# 🛠 Tech Stack

## Frontend

- HTML5
- CSS3
- JavaScript

## Backend

- FastAPI
- Python

## AI

- Google Gemini API

## Libraries

- BeautifulSoup
- Readability-LXML
- HTTPX
- DiskCache
- Python Dotenv

---

# 📂 Project Structure

```
A.R.Y.A
│
├── backend
│   ├── app.py
│   ├── utils
│   │     ├── search.py
│   │     ├── summarize.py
│   │     ├── verify.py
│   │     └── scrape.py
│   └── requirements.txt
│
├── frontend
│   ├── index.html
│   ├── script.js
│   ├── styles.css
│   └── assets
│
└── README.md
```

---

# 🚀 Getting Started

## Clone Repository

```bash
git clone https://github.com/SoumyaPandey25/A.R.Y.A.git
```

---

## Backend Setup

```bash
cd backend

pip install -r requirements.txt
```

Create a `.env`

```env
GEMINI_API_KEY=YOUR_API_KEY
```

Run

```bash
uvicorn app:app --reload
```

---

## Frontend

Simply open

```
frontend/index.html
```

or serve it using Live Server.

---

# 💻 How It Works

1. User enters a research topic.
2. Backend searches the web.
3. Relevant pages are scraped.
4. Gemini generates a concise summary.
5. The summary is verified.
6. Results are returned with suggestions for better research.

---

# 🎯 Key Highlights

✔ AI-powered Research Assistant

✔ Intelligent Search Pipeline

✔ Automated Summarization

✔ Response Verification

✔ FastAPI REST API

✔ Responsive UI

✔ Modular Backend Design

✔ Scalable Architecture

---

# 🔮 Future Improvements

- Voice-based research assistant
- PDF generation
- Citation support
- Research history
- User authentication
- Multi-language support
- Vector Database integration
- RAG Architecture
- AI Agent workflow
- Docker deployment

---

# 📈 Why This Project?

Modern researchers spend significant time collecting and validating information.

A.R.Y.A. reduces this effort by combining:

- Web Search
- Large Language Models
- Automated Summarization
- Response Verification

into a single intelligent workflow.

---

# 🧠 Skills Demonstrated

- Artificial Intelligence
- Prompt Engineering
- REST API Development
- FastAPI
- Python
- JavaScript
- Frontend Development
- API Integration
- Information Retrieval
- LLM Integration
- Backend Development
- Software Architecture

---

## 🌟 If this project helped you, don't forget to Star the repository!
