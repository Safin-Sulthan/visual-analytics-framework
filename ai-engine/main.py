import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import analysis, prediction, insights

app = FastAPI(
    title="Visual Analytics AI Engine",
    description="FastAPI-based AI analytics service for the Visual Analytics Framework",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analysis.router,   prefix="/analysis",   tags=["Analysis"])
app.include_router(prediction.router, prefix="/prediction", tags=["Prediction"])
app.include_router(insights.router,   prefix="/insights",   tags=["Insights"])


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "ok", "service": "ai-engine"}


if __name__ == "__main__":
    import os
    uvicorn.run(
        "main:app",
        host=os.getenv("HOST", "0.0.0.0"),
        port=int(os.getenv("PORT", 8000)),
        reload=True,
    )
