import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def summarize_results(query: str, search_results: list):
    if not search_results:
        return {
            "summary": f"No results found for '{query}'. Please try rephrasing your question.",
            "reliable": False,
            "suggestions": [f"Try being more specific: '{query} in 2025 context'"]
        }

    context = "\n\n".join(
        [f"Title: {r['title']}\nSnippet: {r['snippet']}" for r in search_results]
    )

    prompt = f"""
You are an AI research assistant. Analyze the following web search data and produce:
1. A short, factual summary (3-5 sentences max)
2. Avoid speculation. If data seems vague, explicitly warn the user.
3. Suggest a few improved query variations if the data is incomplete.

Query: {query}

Search Data:
{context}
"""

    model = genai.GenerativeModel("gemini-2.0-flash")
    response = model.generate_content(prompt)

    text = response.text.strip() if hasattr(response, "text") else "No summary generated."
    is_reliable = "data unavailable" not in text.lower()

    suggestions = [
        f"More specific query on '{query}'",
        f"Try 'latest research on {query}'",
        f"Use keywords like 'report', 'summary', or 'findings'"
    ]

    return {
        "summary": text,
        "reliable": is_reliable,
        "suggestions": suggestions
    }
