# SkillForge AI - Phase 1 Setup & Architecture

## Project Overview

SkillForge AI is a futuristic AI SaaS platform featuring a premium, responsive frontend built with Next.js, React, and Tailwind CSS, paired with a secure Node.js/Express backend using MongoDB for persistence.

**Phase 1 Status**: ✅ Foundation-level design complete. Production-ready authentication, theming, and landing page implemented.

---

## Quick Start

### Prerequisites

- **Node.js** 18+ (LTS recommended)
- **MongoDB** 5.0+ (local or MongoDB Atlas connection string)
- **npm** or yarn

### Installation & Running

#### 1. Frontend Setup

```bash
cd frontend
npm install  # Skip if already done
npm run dev  # Runs on http://localhost:3000
```

#### 2. Backend Setup

```bash
cd backend
npm install  # Skip if already done
npm run dev  # Runs on http://localhost:5000
```

#### 3. MongoDB Setup

**Option A: Local MongoDB**
- Install MongoDB Community Edition: https://www.mongodb.com/try/download/community
- Ensure MongoDB is running: `mongod`
- Update `.env` if needed (default: `mongodb://127.0.0.1:27017/skillforge`)

**Option B: MongoDB Atlas (Cloud)**
- Create free cluster at https://cloud.mongodb.com
- Get connection string: `mongodb+srv://user:pass@cluster.mongodb.net/skillforge`
- Update `backend/.env` with your connection string

---

## Architecture

### Frontend Structure

```
frontend/src/
├── app/                    # Next.js app directory
│   ├── page.jsx           # Landing page
│   ├── login/page.jsx     # Login
│   ├── signup/page.jsx    # Signup
│   ├── dashboard/page.jsx # Protected dashboard
│   ├── settings/page.jsx  # User settings
│   ├── globals.css        # Theme system & core styles
│   ├── layout.jsx         # Root layout
│   └── providers.jsx      # Theme & Auth providers
├── components/
│   ├── brand/             # Animated logo (3D with Three.js)
│   ├── ui/                # Reusable UI components
│   ├── Layout.jsx         # Shell layout (sidebar/header)
│   └── ThreeScene.jsx     # 3D hero background
├── screens/               # Page-level components
├── context/               # Auth context & hooks
├── lib/                   # API client
├── services/              # Business logic
├── store/                 # Zustand state (UI)
└── utils/                 # Helpers
```

### Backend Structure

```
backend/src/
├── config/                # Configuration (env validation)
├── lib/                   # Database connection
├── middleware/            # Auth middleware, etc.
├── models/                # MongoDB schemas
├── routes/                # API endpoints
└── index.js               # Express app entry
```

---

## Theme System

### Light Mode
- Bright cyan/lavender gradients
- White surfaces with glassmorphism
- Soft shadows and glow effects

### Dark Mode
- Deep navy/indigo backgrounds
- Neon cyan/purple glow
- Holographic UI feel

### Theme Toggle
- Uses `next-themes` with localStorage persistence
- Accessible via theme selector in settings
- System preference detection available

---

## Authentication Flow

### Signup
```
POST /api/auth/signup
Body: { email, password, fullName, targetRole, goals }
Returns: { token, user }
```

### Login
```
POST /api/auth/login
Body: { email, password }
Returns: { token, user }
```

### Profile Update
```
PATCH /api/auth/profile (protected)
Body: { fullName, targetRole, avatarUrl, codingProfiles, goals, theme }
Returns: { user }
```

### Logout
```
POST /api/auth/logout (protected)
Returns: { ok: true }
```

### Session Persistence
- JWT tokens stored in HTTP-only cookies
- Automatic token validation on app load via `/api/auth/me`
- Session TTL: 7 days
- Secure CORS headers configured

---

## Design System

### Colors

**Accents:**
- Cyan: `#18d8ff`
- Violet: `#8b5cf6`
- Lime: `#34d399`
- Pink: `#f472b6`

**Surfaces:**
- Glassmorphism with 18px blur
- Soft borders with 35% opacity
- Gradient overlays for depth

### Typography

- **Heading**: Poppins 600–800
- **Body**: Inter 400–600
- **Code**: Monospace (future integrations)

### Components

- **Buttons**: Primary (gradient), Secondary (glass)
- **Cards**: Glassmorphic with optional glow
- **Fields**: Custom inputs with cyan focus ring
- **Modal**: Centered with backdrop blur

### Responsive Breakpoints

- Mobile: < 720px (single column layouts)
- Tablet: 720px – 1200px (sidebar hidden)
- Desktop: > 1200px (full layout)

---

## 3D Elements

### Animated Logo (Landing & Navbar)
- React Three Fiber + Drei
- Holographic intelligence core
- Orbital rings & sparkles
- Mouse-reactive rotation
- Optimized for mid-range GPUs

### Hero Three Scene
- Floating orbs with emissive materials
- Rotating rings (cyan/purple)
- Ambient sparkles
- Auto-rotating orbit controls
- Performance: ~60fps on integrated GPUs

### Optimization Techniques
- Lazy loading via dynamic imports
- Selective SSR disabling (3D scenes)
- Optimized particle counts
- Reduced shadow maps on low-end devices

---

## Database Schema

### User Model
```javascript
{
  email: String (unique, required),
  passwordHash: String (bcrypt, required),
  role: "learner" | "admin" (default: learner),
  profile: {
    fullName: String,
    targetRole: String,
    avatarUrl: String,
    goals: [String],
    codingProfiles: {
      leetcode: String,
      codechef: String,
      github: String
    },
    theme: "light" | "dark" | "system"
  },
  timestamps: true
}
```

### Session Model
```javascript
{
  userId: ObjectId (required),
  tokenHash: String (required, indexed),
  userAgent: String,
  ipAddress: String,
  expiresAt: Date,
  lastUsedAt: Date,
  revokedAt: Date (nullable)
}
```

### Settings Model
```javascript
{
  userId: ObjectId (unique),
  theme: "light" | "dark" | "system",
  avatarUrl: String
}
```

---

## Security

### Implemented
- ✅ Password hashing (bcryptjs)
- ✅ JWT authentication
- ✅ HTTP-only cookies
- ✅ CORS validation
- ✅ Helmet security headers
- ✅ Input validation (Zod on backend)
- ✅ Environment variable isolation

### Future Enhancements (Phase 2+)
- Rate limiting
- OAuth integration (GitHub, Google)
- Email verification
- 2FA support
- API key authentication for external services

---

## Environment Variables

### Frontend (`.env.local`)
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
```

### Backend (`.env`)
```
PORT=5000
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:3000
JWT_SECRET=skillforge-dev-secret-32-chars-min
MONGODB_URI=mongodb://127.0.0.1:27017/skillforge
```

---

## Testing the Application

### Manual Testing Checklist

1. **Landing Page**
   - [ ] 3D logo displays and animates
   - [ ] "Login" / "Signup" buttons visible
   - [ ] Theme toggle works (light ↔ dark)
   - [ ] Responsive on mobile/tablet

2. **Signup Flow**
   - [ ] Form accepts input
   - [ ] Password requirement enforced
   - [ ] Duplicate email rejected
   - [ ] Redirects to dashboard on success

3. **Authentication**
   - [ ] Login with created account works
   - [ ] Invalid credentials show error
   - [ ] JWT token persisted in cookies
   - [ ] `/me` endpoint validates session

4. **Dashboard**
   - [ ] Protected route (redirects if not logged in)
   - [ ] User profile displays correctly
   - [ ] Goals render as list
   - [ ] Logout button works

5. **Settings**
   - [ ] Profile form pre-fills current data
   - [ ] Avatar preview displays
   - [ ] Theme selector updates
   - [ ] Save profile persists changes

6. **Theme Switching**
   - [ ] Light/dark toggle responsive
   - [ ] Smooth transitions
   - [ ] Persists across page reloads
   - [ ] Logo glow adapts to theme

---

## Performance Metrics (Target)

- **Lighthouse Performance**: > 85
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 2.5s
- **3D Scene FPS**: 55–60fps
- **Bundle Size**: Frontend ~180KB (gzip)

---

## Known Limitations (Phase 1)

- Avatar upload: local preview only (no server storage yet)
- No analytics or AI features
- No real-time notifications
- No recommendation engine
- 3D scenes disabled on very low-end devices

---

## Next Steps (Phase 2+)

1. **Analytics Integration**
   - Skill tracking dashboard
   - Progress visualization
   - Learning path recommendations

2. **AI Systems**
   - Resume generation
   - Skill gap analysis
   - Personalized learning paths

3. **Social Features**
   - User profiles
   - Leaderboards
   - Community chat

4. **Mobile App**
   - React Native version
   - Offline support

---

## Troubleshooting

### MongoDB Connection Failed
- Ensure MongoDB is running: `mongod`
- Check connection string in `.env`
- For Atlas: verify IP whitelist includes your machine

### Frontend Shows "API not found"
- Verify backend is running on port 5000
- Check `NEXT_PUBLIC_API_BASE_URL` in frontend `.env.local`
- Clear browser cookies and restart

### Theme Not Persisting
- Check localStorage is enabled
- Browser not in private/incognito mode
- Clear cache and cookies for localhost

### 3D Logo Not Rendering
- WebGL not supported (rare)
- Try different browser (Chrome recommended)
- Disable browser hardware acceleration and re-enable

---

## Tech Stack Reference

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend Framework | Next.js | 15.5+ |
| UI Library | React | 19.1+ |
| Styling | Tailwind CSS | 4.0+ |
| Animations | Framer Motion | 12.0+ |
| 3D Rendering | Three.js / R3F | 0.184+ / 9.6+ |
| State Management | Zustand | 5.0+ |
| Theming | next-themes | 0.4+ |
| Backend | Express.js | 5.2+ |
| Database | MongoDB | 5.0+ |
| ORM | Mongoose | 9.6+ |
| Auth | JWT + bcryptjs | Latest |
| Validation | Zod | 4.4+ |
| Security | Helmet | 8.1+ |

---

## Support & Questions

Refer to specific component documentation in `src/components/ui/` for reusable component props and usage.

For architecture questions, check `/backend/src/routes/` for API endpoint details.
