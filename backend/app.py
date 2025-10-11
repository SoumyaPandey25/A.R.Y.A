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

        if summary_data.get("vague"):
            return {
                "query": query,
                "results": None,
                "summary": "",
                "message": "Your query is too broad. Use a suggestion to refine it.",
                "suggestions": summary_data.get("suggestions", []),
                "verified": None,
                "reliable": False
            }

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
            "suggestions": summary_data.get("suggestions", []),
            "verified": verification,
            "reliable": summary_data.get("reliable", True)
        }

    except Exception as e:
        return {"error": str(e)}