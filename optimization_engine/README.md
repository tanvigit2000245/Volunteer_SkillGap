# Volunteer Skill-Gap Advanced Optimization Service
## MCA-SP-029: Python Global MILP Assignment Engine

This microservice provides mathematically optimal, globally-scoped assignment solving for the Volunteer Skill-Gap Deployment Planner using **Mixed-Integer Linear Programming (MILP)** powered by **PuLP** and **FastAPI**.

### Problem Formulation
- **Decision Variables:** Binary decision $x_{v, r} \in \{0, 1\}$ indicating assignment of volunteer $v$ to requirement $r$.
- **Hard Constraints:**
  - Shift time-window coverage and availability.
  - Required skills and minimum proficiency levels.
  - Mandatory language fluencies and mobility tiers.
  - Non-overlapping shifts / strictly zero double-booking per volunteer.
  - Headcount capacity quotas per task requirement.
- **Multi-Objective Global Utility:**
  $$\max \sum_{v \in V} \sum_{r \in R} (M + \text{score}_{v, r}) \cdot x_{v, r}$$
  where $M = 1000$ prioritizes filling maximum headcount quotas before optimizing soft suitability preferences.

### Running the Service
```bash
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload

```

