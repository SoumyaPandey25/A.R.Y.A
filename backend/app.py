from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from utils.search import search_web
from utils.summarize import summarize_results
from utils.verify import verify_summary

app = FastAPI(title="AI Researcher Agent")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/research")
def research_topic(query: str = Query(..., description="Enter your research query")):
    try:
        search_results = search_web(query)

        summary_data = summarize_results(query, search_results)
        summary_text = summary_data.get("summary", "")

        verification = verify_summary(query, summary_text)


        return {
            "query": query,
            "results": search_results,
            "summary": summary_text,
            "message": (
                "Your query seems quite broad. Try being more specific, or use one of the suggestions below as prompts."
                if "broad" in summary_text.lower() or len(search_results) > 3 else
                "Here are your refined research insights."
            ),
            "suggestions": [
                f"Try being more specific about '{query}'",
                f"Look for '{query} latest research 2025'",
                f"Explore '{query} industry reports or case studies 2025'"
            ],
            "verified": verification,
            "reliable": True
        }

    except Exception as e:
        return {"error": str(e)}
