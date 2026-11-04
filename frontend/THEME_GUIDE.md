# Volunteer Skill-Gap Deployment Planner - Theme & UI Guide

## 🎨 Separate Theme File Architecture

All color palettes, typography, shadows, 3D card tilt behaviors, and component overrides are organized in an isolated, dedicated directory:

```
frontend/src/theme/
├── theme.js           <-- MAIN THEME FILE (Colors, Palettes, Overrides)
├── useAppTheme.js     <-- Theme Context & Hook
└── ThemeContext.jsx   <-- ThemeProvider & Persistence
```

---

## 🚀 How to Easily Change or Add a Theme

Open `frontend/src/theme/theme.js`:

### 1. Change the Default Theme
Set `DEFAULT_THEME` to any palette key (e.g., `'emerald'`, `'ocean'`, `'sunset'`, or `'amethyst'`):
```javascript
export const DEFAULT_THEME = 'ocean'; // or 'emerald', 'sunset', 'amethyst'
```

### 2. Change Palette Colors
Each theme defines both `light` and `dark` modes. Simply edit the hex codes in `THEME_PALETTES`:
```javascript
export const THEME_PALETTES = {
  emerald: {
    name: 'Emerald Trust',
    description: 'Community, health, and humanitarian mission green',
    swatch: '#059669',
    light: {
      primary: { main: '#059669', light: '#34d399', dark: '#047857', contrastText: '#ffffff' },
      secondary: { main: '#0284c7', ... },
      background: { default: '#f8fafc', paper: '#ffffff' },
    },
    dark: {
      primary: { main: '#10b981', ... },
      ...
    }
  }
}
```

### 3. Add a Brand-New Theme Palette
Add a new key directly inside `THEME_PALETTES` in `src/theme/theme.js`:
```javascript
THEME_PALETTES.cyberpunk = {
  name: 'Cyberpunk Neon',
  description: 'High-contrast electric violet & neon cyan',
  swatch: '#8b5cf6',
  light: {
    primary: { main: '#7c3aed', light: '#a78bfa', dark: '#5b21b6', contrastText: '#ffffff' },
    secondary: { main: '#06b6d4', light: '#22d3ee', dark: '#0891b2', contrastText: '#ffffff' },
    background: { default: '#faf5ff', paper: '#ffffff' },
  },
  dark: {
    primary: { main: '#a78bfa', light: '#c4b5fd', dark: '#6d28d9', contrastText: '#0f172a' },
    secondary: { main: '#22d3ee', light: '#67e8f9', dark: '#0e7490', contrastText: '#0f172a' },
    background: { default: '#0d0714', paper: '#190e29' },
  },
};
```
The application will automatically detect the new palette in the **Navbar theme selector menu** and the **Theme Settings Drawer**!

---

## ⚡ Built-in Features of the Application

1. **3D Depth & Modern Design**:
   - Elevated perspective cards with hover scaling & glow effects (`.card-3d-hover`)
   - Pulsing emergency deficit indicators (`.pulse-critical`)
   - Custom modern scrollbars and Google Font typography (`Plus Jakarta Sans` & `Inter`).

2. **Live Theme Switcher & Dark/Light Mode**:
   - One-click palette selection in the top navigation bar.
   - Sun/Moon icon toggle for Light/Dark appearance.
   - Slide-out Theme Settings Drawer with color previews and direct code tips.
   - Preferences automatically persist in `localStorage`.

3. **Dynamic Operational Matrix & Diagnostics**:
   - Live location cards with staffing progress bars.
   - Mandatory language fluencies and mobility tier requirements.
   - Explainable Skill-Gap diagnostics (explains exact rule failure).

4. **Volunteer Suitability Pool**:
   - Multi-dimensional skill proficiencies rated 1 to 5 with star ratings.
   - Live search by volunteer name, skill, or language.
   - Status filters (`All`, `Available`, `Assigned`).

5. **Constraint-Matching Optimizer Simulator**:
   - Interactive objective weight sliders (Proficiency, Experience).
   - Real-time LP solver simulation log matching `optimization_engine/solver.py`.
   - "Auto-Resolve Gaps" button to simulate dynamic remediation.

6. **Coordinator Review & Manual Override**:
   - Interactive dialog to assign candidates with mandatory operational justification.
   - Permanent audit log table with safety clearance status.
   - One-click "Export Deployment Sheet" (JSON schedule).

