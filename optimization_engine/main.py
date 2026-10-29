from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import logging

from schemas import OptimizationRequest, OptimizationResponse
from solver import solve_global_assignment

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
logger = logging.getLogger("OptimizationEngine")

app = FastAPI(
    title="Volunteer Skill-Gap Advanced Optimization Service",
    description="Mixed-Integer Linear Programming (MILP) solver for global volunteer matching and constraint optimization",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "status": "online",
        "service": "Volunteer Skill-Gap Optimization Engine",
        "version": "1.0.0",
        "solver": "HiGHS Mixed-Integer Linear Programming (MILP) with Greedy Fallback",
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "timestamp": logging.Formatter().formatTime(logging.LogRecord("", 0, "", 0, "", (), None)),
        "solver": "HiGHS_MILP",
    }

@app.post("/api/optimize", response_model=OptimizationResponse)
@app.post("/optimize", response_model=OptimizationResponse)
def optimize_deployment(request: OptimizationRequest):
    try:
        total_reqs = sum(len(loc.requirements) for loc in request.locations)
        logger.info(
            f"Received optimization request: {len(request.locations)} locations, "
            f"{total_reqs} task requirements, {len(request.volunteers)} volunteers"
        )

        response = solve_global_assignment(request)

        logger.info(
            f"Optimization finished: status={response.status}, solver={response.solver}, "
            f"assigned={response.stats.totalAssigned}/{response.stats.totalRequiredSlots}, "
            f"coverage={response.stats.globalCoverageRate}%, gaps={response.stats.totalGaps}, "
            f"time={response.stats.computationTimeMs}ms"
        )

        return response
    except Exception as e:
        logger.error(f"Optimization error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Optimization solver failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
