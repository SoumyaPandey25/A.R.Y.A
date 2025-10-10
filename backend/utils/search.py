import os
import requests
from dotenv import load_dotenv

load_dotenv()
SERPER_API_KEY = os.getenv("SERPER_API_KEY")

def search_web(query: str):
    if not SERPER_API_KEY:
        raise ValueError("SERPER_API_KEY not found in .env file")

    url = "https://google.serper.dev/search"
    payload = {"q": query}
    headers = {"X-API-KEY": SERPER_API_KEY, "Content-Type": "application/json"}

    response = requests.post(url, headers=headers, json=payload)
    if response.status_code != 200:
        raise Exception(f"Search failed: {response.text}")

    results = response.json().get("organic", [])
    return [
        {"title": item.get("title"), "link": item.get("link"), "snippet": item.get("snippet")}
        for item in results[:5]
    ]
