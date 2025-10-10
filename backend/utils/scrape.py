import httpx
from readability import Document
from bs4 import BeautifulSoup
from typing import Dict
import re

USER_AGENT = "ai-researcher-agent/1.0 (+https://example.com)"

async def fetch_and_extract(url: str, timeout: int = 15) -> Dict:
    
    try:
        headers = {"User-Agent": USER_AGENT}
        async with httpx.AsyncClient(timeout=timeout) as client:
            resp = await client.get(url, headers=headers)
            resp.raise_for_status()
            html = resp.text
    except Exception as e:
        return {"title": "", "text": "", "snippet": "", "error": str(e)}

    try:
        doc = Document(html)
        title = doc.title()
        content_html = doc.summary()
        
        soup = BeautifulSoup(content_html, "lxml")   
        text = soup.get_text(separator="\n").strip()
        
        snippet = text[:800] if text else ""
    except Exception:
        
        soup = BeautifulSoup(html, "lxml") # fallback to basic HTML parsing
        title = soup.title.string.strip() if soup.title else ""
        meta = soup.find("meta", attrs={"name": "description"}) or soup.find("meta", attrs={"property": "og:description"})
        snippet = meta["content"].strip() if meta and meta.get("content") else ""
        text = snippet


    publish = "" # try to find publish date
    try:
        soup = BeautifulSoup(html, "lxml")
        for tag in ["article:published_time", "pubdate", "date", "dc.date"]:
            meta = soup.find("meta", attrs={"property": tag}) or soup.find("meta", attrs={"name": tag})
            if meta and meta.get("content"):
                publish = meta["content"]
                break
       
        if not publish: # try <time> tag    
            times = soup.find_all("time")
            if times:
                publish = times[0].get("datetime") or times[0].text
    except Exception:
        publish = ""

    
    text = re.sub(r"\s+", " ", text).strip()    # normalize whitespace
    snippet = snippet.strip()

    return {"title": title, "text": text, "snippet": snippet, "publish": publish}
