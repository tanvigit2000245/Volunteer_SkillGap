# Volunteer Skill Gap - Modern Authentication Interface

A modern, animated, and responsive authentication system built for the **Volunteer Skill Gap** platform using **React.js**, **Vite**, and **Tailwind CSS**.

---

## ✨ Features

### 1. Login View
- **Email Address Field**: Trims whitespace, validates email syntax, auto-converts to lowercase.
- **Password Field**: Minimum 8 characters validation with smooth show/hide password toggle.
- **Remember Me**: Option to persist session across browser reloads.
- **Forgot Password**: Interactive modal flow with animated email submission confirmation.
- **Submit Button**: Gradient-styled with loading spinner, hover elevation, and click transitions.
- **Seamless View Switching**: Instant tab and link switching to registration without page reload.
- **Discreet Demo Accounts**: Expandable helper drawer to auto-fill pre-seeded credentials for immediate evaluation.

### 2. Create Account View
- **Full Name Field**: Required, trims whitespace, enforces minimum length.
- **Email Address Field**: Required, validated against RFC email format, trimmed, lowercase.
- **Password Field**: Required, minimum 8 characters, visibility toggle, plus a **live 4-stage animated strength indicator** (Weak, Fair, Good, Strong).
- **Confirm Password Field**: Must match password, with separate visibility toggle.
- **Automatic Role Assignment**: Automatically assigns the default role `"volunteer"`. No role dropdown or selector is shown to the public user.
- **Schema Compatibility**: Conforms strictly to:
  ```typescript
  {
    email: String,      // required, unique, trim, lowercase
    fullName: String,   // required, trim
    password: String,   // required, min 8 characters (hashed with SHA-256)
    role: String        // enum ["admin", "volunteer", "coordinator"], required
  }
  ```

### 3. Animated Design & Visual Theme
- **Color Palette**: Deep Blue (`#0b1d3a`), Vibrant Teal (`#14b8a6`), Emerald, and Clean White accents.
- **Desktop Split-Screen**: Left panel features an animated community illustration with floating AI matching badges, volunteer counters, glowing orb, and real-time impact metrics.
- **Mobile Responsive**: Clean single-column layout that gracefully scales down for mobile and tablet screens.
- **Animations**:
  - Floating decorative badges with multi-speed CSS keyframes
  - Ambient radial background glow & pulse effects
  - Smooth form transition (fade + slide scale)
  - Interactive input focus rings and active button press states
  - Animated toast notifications with countdown progress bar

### 4. Frontend-Only Mock Authentication
- **Secure Mock Storage**: Passwords are **never** stored in plain text. They are hashed using the standard **Web Crypto API (SHA-256)** before writing to `localStorage`.
- **Pre-Seeded Accounts for Testing**:
  - `volunteer@skillgap.org` &mdash; Password: `Password123!` (Role: `volunteer`)
  - `coordinator@skillgap.org` &mdash; Password: `Password123!` (Role: `coordinator`)
  - `admin@skillgap.org` &mdash; Password: `Password123!` (Role: `admin`)
- **Authenticated Dashboard View**: Successfully logging in displays the user's role profile card, role-specific badge (Admin, Coordinator, or Volunteer), sample skill match statistics, conformant schema viewer, and sign-out button.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Installation
Dependencies are already installed. If running in a fresh clone:
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

### Run Validation Tests
```bash
npm test
```

### Production Build
```bash
npm run build
```
The optimized bundle will be generated in `dist/`.

---

## 📁 Project Structure

```
skillgap/
├── index.html                     # Entry HTML with custom fonts & metadata
├── package.json                   # Dependencies & scripts
├── postcss.config.js              # PostCSS configuration
├── tailwind.config.js             # Tailwind CSS theme & custom keyframe animations
├── vite.config.js                 # Vite configuration
├── src/
│   ├── main.jsx                   # React root entry
│   ├── App.jsx                    # Core authentication container & view manager
│   ├── index.css                  # Custom styling & glassmorphism utilities
│   ├── components/
│   │   ├── auth/
│   │   │   ├── LoginForm.jsx             # Separate Login component
│   │   │   ├── RegisterForm.jsx          # Separate Registration component
│   │   │   └── ForgotPasswordModal.jsx   # Animated password recovery modal
│   │   ├── common/
│   │   │   ├── InputField.jsx            # Reusable input with eye toggle & validation
│   │   │   ├── DecorativePanel.jsx       # Split-screen illustration & metrics
│   │   │   └── Toast.jsx                 # Animated status notifications
│   │   └── dashboard/
│   │       └── AuthenticatedView.jsx     # Logged-in view showing user & role badge
│   └── utils/
│       ├── authStorage.js         # Web Crypto SHA-256 hashing & validation logic
│       └── verifyAuth.mjs         # Unit verification tests
```

