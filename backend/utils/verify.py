import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def verify_summary(query: str, summary: str):
    prompt = f"""
You are a verification agent.
Check if the following summary about "{query}" seems factually correct and consistent.
Reply only with: "Verified ✅" if consistent, or "Unreliable ⚠️" if not.
Then briefly explain why (1-2 lines).

Summary:
{summary}
"""

    model = genai.GenerativeModel("gemini-2.0-flash")
    response = model.generate_content(prompt)
    verdict = response.text.strip()

    return verdict
