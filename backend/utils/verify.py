import os
import google.generativeai as genai
from dotenv import load_dotenv
import re

def remove_emojis(text: str) -> str:
    emoji_pattern = re.compile("["
        u"\U0001F600-\U0001F64F"
        u"\U0001F300-\U0001F5FF"
        u"\U0001F680-\U0001F6FF"
        u"\U0001F1E0-\U0001F1FF"
        "]+", flags=re.UNICODE)
    return emoji_pattern.sub(r'', text)

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def verify_summary(query: str, summary: str):
    prompt = f"""
You are a factual verification agent.
Evaluate whether the summary below about "{query}" appears accurate and credible based on general public and research data.
Provide a short, factual verdict in the following format:

Verdict: Verified / Partially Verified / Not Verified
Confidence: High / Moderate / Low
Reason: (brief reason in 1-2 lines)

Summary:
{summary}
"""

    model = genai.GenerativeModel("gemini-2.0-flash")
    response = model.generate_content(prompt)
    verdict = response.text.strip()

    verdict = remove_emojis(verdict)
    verdict = verdict.replace("**", "").replace("*", "")

    return verdict