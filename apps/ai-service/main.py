from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import os
from dotenv import load_dotenv
import uvicorn

load_dotenv()

app = FastAPI(
    title="Kurbağa AI Service",
    description="AI microservice for goal analysis and task prioritization",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class GoalAnalysisRequest(BaseModel):
    raw_input: str
    user_context: Optional[dict] = None

class SMARTAnalysis(BaseModel):
    specific: str
    measurable: str
    achievable: str
    relevant: str
    time_bound: str

class GoalAnalysisResponse(BaseModel):
    title: str
    category: str
    description: str
    estimated_hours: int
    suggested_deadline: Optional[str]
    smart_analysis: SMARTAnalysis
    suggested_priority: str

class TaskDecompositionRequest(BaseModel):
    goal_title: str
    goal_description: str
    estimated_hours: int
    deadline: Optional[str]

class SubTask(BaseModel):
    title: str
    description: str
    estimated_minutes: int
    priority: str
    order: int

class TaskDecompositionResponse(BaseModel):
    phases: List[dict]
    tasks: List[SubTask]

class PriorityCalculationRequest(BaseModel):
    task: dict
    user_profile: dict

class PriorityCalculationResponse(BaseModel):
    priority: str
    score: int
    reasoning: str

# Health check
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "ai-service",
        "version": "1.0.0"
    }

# AI Endpoints
@app.post("/ai/v1/nlp/analyze-goal", response_model=GoalAnalysisResponse)
async def analyze_goal(request: GoalAnalysisRequest):
    """
    Analyze a natural language goal input and convert it to structured format.
    Uses OpenAI GPT to extract SMART criteria.
    """
    try:
        # TODO: Implement OpenAI integration
        # For now, return a simple parse

        raw_input = request.raw_input

        # Simple category detection
        category = "personal"
        if any(word in raw_input.lower() for word in ["iş", "work", "proje", "project", "kariyer", "career"]):
            category = "career"
        elif any(word in raw_input.lower() for word in ["sağlık", "health", "spor", "fitness", "kilo"]):
            category = "health"
        elif any(word in raw_input.lower() for word in ["eğitim", "education", "öğren", "learn", "ders", "sınav"]):
            category = "education"

        # Extract title (first 100 chars or until period)
        title = raw_input.split('.')[0][:100]

        return GoalAnalysisResponse(
            title=title,
            category=category,
            description=raw_input,
            estimated_hours=40,  # Default estimate
            suggested_deadline=None,
            smart_analysis=SMARTAnalysis(
                specific=f"Goal: {title}",
                measurable="Progress can be tracked through completion of subtasks",
                achievable="With consistent effort, this goal is achievable",
                relevant=f"This goal falls under {category} category",
                time_bound="Suggested timeline: 8 weeks with regular progress checks"
            ),
            suggested_priority="B"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ai/v1/planning/decompose", response_model=TaskDecompositionResponse)
async def decompose_goal(request: TaskDecompositionRequest):
    """
    Decompose a goal into actionable tasks following the 2-hour rule.
    """
    try:
        # Simple decomposition logic
        total_minutes = request.estimated_hours * 60
        task_count = max(3, total_minutes // 120)  # 2-hour chunks

        tasks = []
        for i in range(task_count):
            tasks.append(SubTask(
                title=f"Task {i + 1} for {request.goal_title}",
                description=f"Subtask {i + 1} of the goal",
                estimated_minutes=min(120, total_minutes // task_count),
                priority="B",
                order=i
            ))

        phases = [
            {
                "id": "phase_1",
                "name": "Planning and Preparation",
                "duration": "1 week",
                "task_count": max(1, task_count // 3)
            },
            {
                "id": "phase_2",
                "name": "Execution",
                "duration": f"{request.estimated_hours // 2} weeks",
                "task_count": max(2, task_count // 2)
            },
            {
                "id": "phase_3",
                "name": "Review and Completion",
                "duration": "1 week",
                "task_count": max(1, task_count - (task_count // 3) - (task_count // 2))
            }
        ]

        return TaskDecompositionResponse(
            phases=phases,
            tasks=tasks
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ai/v1/prioritize/abcde", response_model=PriorityCalculationResponse)
async def calculate_priority(request: PriorityCalculationRequest):
    """
    Calculate task priority using ABCDE methodology.
    """
    try:
        score = 0
        reasoning_parts = []

        task = request.task

        # Deadline proximity
        if task.get("deadline"):
            score += 30
            reasoning_parts.append("Has deadline")

        # Blocks other tasks
        if task.get("blocks_tasks"):
            score += 25
            reasoning_parts.append("Blocks other tasks")

        # Part of top 3 goals
        if task.get("is_top_goal"):
            score += 35
            reasoning_parts.append("Part of top 3 goals")

        # Assign priority
        if score >= 70:
            priority = "A"
        elif score >= 50:
            priority = "B"
        elif score >= 30:
            priority = "C"
        else:
            priority = "D"

        return PriorityCalculationResponse(
            priority=priority,
            score=score,
            reasoning="; ".join(reasoning_parts) if reasoning_parts else "Standard priority task"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ai/v1/coach/suggest")
async def get_coaching_suggestion(request: dict):
    """
    Generate AI coaching suggestions based on user performance.
    """
    try:
        # TODO: Implement intelligent coaching logic
        return {
            "suggestion": "Focus on completing high-priority tasks first",
            "category": "time_management",
            "confidence": 0.85
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=True,
        log_level="info"
    )
