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
    text = remove_emojis(text)
    text = text.replace("**", "").replace("\n", "<br>") 
    is_reliable = "data unavailable" not in text.lower()

    suggestions = [
        f"More specific query on '{query}'",
        f"Try 'latest research on {query}'",
        f"Use keywords like 'report', 'summary', or 'findings'"
    ]

    return {
        "summary": remove_emojis(text),
        "reliable": is_reliable,
        "suggestions": suggestions
    }
