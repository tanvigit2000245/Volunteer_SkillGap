# 🤝 6-Member Team Git Workflow & Conflict Prevention Guide

**Project:** Volunteer Skill-Gap Deployment Planner  
**Repository:** `tanvigit2000245/Volunteer_SkillGap`  
**Team Members:** Rohit Kumar, Tanvi Keshri, I Tanushree, Swastika Raj Kowar, Deepak Tiwari, Shreedhar Panday  

---

## 🎯 Goal: Zero Merge Conflicts & Zero Broken Code

When 6 developers collaborate on a multi-service codebase (Node.js Express + Python MILP Solver), conflicts happen when:
1. Members push directly to `main`.
2. Feature branches diverge from `main` without pulling upstream changes.
3. Tests aren't run locally before opening a Pull Request.

This guide outlines our **Git Flow + CI/CD pipeline rules** to keep our branches clean.

---

## 🚦 Golden Rules for Every Team Member

1. **NEVER push directly to `main`**. All work happens on feature branches.
2. **Pull before you code**: Always update your local `main` before starting work.
3. **Run tests before pushing**:
   - Backend tests: `cd backend && npm test`
   - Optimization tests: `python -m unittest discover -s optimization_engine`
4. **Always merge via Pull Request (PR)**: Wait for the automated CI check to pass (✅ green) and get at least 1 teammate approval.

---

## 🌿 Standard Daily Workflow

### 1. Start a New Feature or Fix
```bash
# Switch to main and get the absolute latest changes
git checkout main
git pull origin main

# Create your dedicated branch using the standard naming format
git checkout -b feature/auth-refresh-token
# or: git checkout -b fix/location-validator
```

### 2. Commit Clean Changes
Make small, atomic commits rather than one massive commit at the end:
```bash
git add backend/src/controllers/auth.controller.js
git commit -m "feat(auth): add refresh token validation handler"
```

### 3. Keep Your Branch Synced with Main (Conflict Prevention!)
Before you push your branch, sync any changes that other teammates merged to `main`:
```bash
git fetch origin
git rebase origin/main
```
> 💡 *Why rebase?* Rebase places your new commits right on top of the newest `main`, preventing messy merge bubbles and catching conflicts early on your local machine!

### 4. Run Tests Locally
```bash
# 1. Test Node.js Backend
cd backend
npm test

# 2. Test Python Microservice
cd ..
python -m unittest discover -s optimization_engine
```

### 5. Push and Open a Pull Request
```bash
git push -u origin feature/your-feature-name
```
- Go to GitHub and click **Compare & pull request**.
- Fill out the automated PR checklist (`.github/pull_request_template.md`).
- GitHub Actions CI will automatically test your code across:
  1. Syntax validation (Node.js & Python)
  2. Backend unit tests
  3. Python MILP optimizer tests
  4. End-to-end integration tests between services
- Once green (✅), ask a team member to review and approve.
- Merge using **Squash and merge** or **Rebase and merge**.

---

## ⚙️ How to Configure GitHub Branch Protection (Repository Admin)

To enforce that no one can push broken code or overwrite someone else's work, Tanvi (repository owner) should set up GitHub Branch Protection:

1. Open repository on GitHub: `https://github.com/tanvigit2000245/Volunteer_SkillGap`
2. Go to **Settings** ➡️ **Branches**.
3. Under **Branch protection rules**, click **Add branch ruleset** or **Add rule**.
4. Enter Branch name pattern: `main`
5. Enable the following checkboxes:
   - ✅ **Require a pull request before merging**
     - Require approvals: `1`
     - Dismiss stale pull request approvals when new commits are pushed
   - ✅ **Require status checks to pass before merging**
     - Search and select: `ci-status` (or `CI Pipeline Status Check`)
     - Require branches to be up to date before merging
   - ✅ **Do not allow bypassing the above settings**
6. Click **Save Changes**.

---

## 🛠️ How to Resolve a Merge Conflict If It Happens

If GitHub flags a conflict between your branch and `main`:
```bash
# 1. Fetch latest main
git fetch origin main

# 2. Rebase your branch onto main
git rebase origin/main

# Git will pause on conflicting files. Open the file in your editor:
# Look for <<<<<<< HEAD, =======, >>>>>>>
# Keep the correct combined code.

# 3. Mark conflict resolved
git add <filename>

# 4. Continue rebase
git rebase --continue

# 5. Push updated branch (force-with-lease is safe for personal feature branches)
git push --force-with-lease origin feature/your-feature-name
```

---

## 🐳 Quick Docker Run (Run the Entire System Locally)
Any teammate can start the full stack (Node + Python Solver + MongoDB) without installing Mongo or Python locally:
```bash
docker compose up --build
```
- Backend runs at: `http://localhost:8080`
- Optimization Engine runs at: `http://localhost:8000`
- MongoDB runs at: `mongodb://localhost:27017`

