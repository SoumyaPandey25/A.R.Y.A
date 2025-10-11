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

def is_vague_query(query: str) -> bool:
    vague_terms = ["growth", "price", "trend", "data", "report", "system", "analysis", "info", "string"]
    return len(query.split()) < 3 or query.lower().strip() in vague_terms

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def summarize_results(query: str, search_results: list):
    if is_vague_query(query):
        base_topic = query.strip().capitalize() or "Topic"
        return {
            "summary": "",
            "reliable": False,
            "suggestions": [
                f"{base_topic} market overview (India, 2020–2025)",
                f"Recent studies on {base_topic} and its impact",
                f"Future scope of {base_topic} in technology or business"
            ],
            "vague": True
        }

    if not search_results:
        return {
            "summary": f"No results found for '{query}'. Please try rephrasing your question.",
            "reliable": False,
            "suggestions": [f"{query} in 2025 context"],
            "vague": False
        }

    context = "\n\n".join(
        [f"Title: {r['title']}\nSnippet: {r['snippet']}" for r in search_results]
    )

    prompt = f"""
Focus suggestions on Indian context first, and global context second. Prefer insights or studies from 2020–2025.
You are a professional AI Research Assistant summarizing data for Indian and global business professionals.

Create a structured, factual summary:
1. Overview (3–4 lines summarizing key findings)
2. Trends (past 5–7 years if data available)
3. Limitations (if data is missing)
Keep tone factual, avoid repetition or suggestions.

Query: {query}

Search Data:
{context}
"""

    model = genai.GenerativeModel("gemini-2.0-flash")
    response = model.generate_content(prompt)
    text = response.text.strip() if hasattr(response, "text") else "No summary generated."
    text = remove_emojis(text)
    text = text.replace("**", "").replace("\n", "<br>")
    is_reliable = "data unavailable" not in text.lower()

    base_topic = query.split()[0].capitalize()
    suggestion_prompt = f"""
You are an AI assistant helping a business researcher.
Based on the topic "{query}" and the following summarized context:
{context}

Generate 3 short and distinct research prompts that the user can explore next.
Each should be specific, insightful, and directly related to the topic (not generic like "latest trends").
Avoid repeating the same structure or phrases.
Respond only with a numbered list, e.g.:
1. ...
2. ...
3. ...
"""

    try:
        suggestion_response = model.generate_content(suggestion_prompt)
        suggestion_text = suggestion_response.text.strip()
        suggestion_lines = [
            line.strip("1234567890. ") for line in suggestion_text.split("\n") if line.strip()
        ]
        suggestions = [remove_emojis(s) for s in suggestion_lines[:3]] or [
            f"Recent developments in {query}",
            f"Challenges and opportunities of {query} in India",
            f"Applications of {query} (2020–2025)"
        ]
    except Exception:
        suggestions = [
            f"Recent developments in {query}",
            f"Challenges and opportunities of {query} in India",
            f"Applications of {query} (2020–2025)"
        ]

    return {
        "summary": text,
        "reliable": is_reliable,
        "suggestions": suggestions,
        "vague": False
    }