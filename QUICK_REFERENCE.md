# SkillForge AI - Developer Quick Reference

## 🚀 Running the App

```bash
# Terminal 1: Frontend (Port 3000)
cd frontend && npm run dev

# Terminal 2: Backend (Port 5000)
cd backend && npm run dev

# Make sure MongoDB is running
mongod
```

**URLs**:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- API: http://localhost:5000/api

---

## 📝 Core Endpoints

### Authentication
```
POST   /api/auth/signup        Create account
POST   /api/auth/login         User login
GET    /api/auth/me            Get current user (protected)
PATCH  /api/auth/profile       Update profile (protected)
POST   /api/auth/logout        Logout (protected)
```

### Health
```
GET    /api/health             Service status
GET    /api/v1                 API version
```

---

## 🔑 Adding Features

### New Page
```bash
# 1. Create page file
touch frontend/src/app/my-feature/page.jsx

# 2. Export default component
export default function MyFeaturePage() {
  return <div>Content</div>
}
```

### New API Endpoint
```javascript
// backend/src/routes/myfeature.js
const router = Router();

router.get('/endpoint', async (req, res) => {
  // Your logic
  res.json({ data: 'response' });
});

// Add to backend/src/index.js
app.use('/api/myfeature', myFeatureRouter);
```

### New Component
```jsx
// frontend/src/components/MyComponent.jsx
export function MyComponent({ title }) {
  return <div className="sf-card">{title}</div>
}

// Use in page
import { MyComponent } from '@/components/MyComponent';
<MyComponent title="Hello" />
```

---

## 🎨 Using the Design System

### Buttons
```jsx
import { Button } from '@/components/ui/Button';

// Primary
<Button variant="primary">Click me</Button>

// Secondary
<Button variant="secondary">Secondary</Button>

// With loading
<Button disabled={loading}>{loading ? 'Loading...' : 'Submit'}</Button>
```

### Cards
```jsx
import { Card } from '@/components/ui/Card';

// Regular
<Card className="page-card">Content</Card>

// With glow
<Card glow>Premium card</Card>
```

### Form Fields
```jsx
import { Field } from '@/components/ui/Field';

<Field label="Email" hint="Optional helper text">
  <input type="email" />
</Field>
```

### Themes
```jsx
import { useTheme } from 'next-themes';

function MyComponent() {
  const { theme, setTheme } = useTheme();
  
  return (
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      Toggle Theme
    </button>
  )
}
```

---

## 🔐 Authentication

### Check if User is Logged In
```jsx
import { useAuth } from '@/context/useAuth';

function MyComponent() {
  const { auth } = useAuth();
  
  if (!auth.ready) return <div>Loading...</div>;
  
  if (!auth.user) return <div>Not logged in</div>;
  
  return <div>Welcome, {auth.user.email}</div>
}
```

### Protect a Route
```jsx
// frontend/src/app/protected/page.jsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/useAuth';

export default function ProtectedPage() {
  const router = useRouter();
  const { auth } = useAuth();
  
  useEffect(() => {
    if (auth.ready && !auth.user) {
      router.replace('/login');
    }
  }, [auth.ready, router, auth.user]);
  
  return <div>Protected content</div>
}
```

### Signup
```jsx
const { signup, loading, error } = useAuth();

async function handleSignup() {
  try {
    await signup({
      email: 'user@example.com',
      password: 'password123',
      fullName: 'John Doe'
    });
    router.push('/dashboard');
  } catch (err) {
    console.error(err);
  }
}
```

### Update Profile
```jsx
const { saveProfile } = useAuth();

await saveProfile({
  fullName: 'New Name',
  targetRole: 'Backend Developer',
  theme: 'dark',
  goals: ['Learn Node.js', 'Build APIs']
});
```

---

## 📚 API Calls

### Using the API Client
```jsx
import { updateProfile } from '@/lib/api';

const result = await updateProfile({
  fullName: 'John',
  targetRole: 'Backend'
});
```

### Making Custom Requests
```jsx
const response = await fetch('http://localhost:5000/api/endpoint', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include', // For cookies
  body: JSON.stringify({ data: 'value' })
});

const data = await response.json();
```

---

## 💾 Database Queries (Backend)

### Find User
```javascript
const user = await UserModel.findOne({ email: 'test@example.com' });
```

### Update User
```javascript
const updated = await UserModel.findByIdAndUpdate(
  userId,
  { $set: { 'profile.fullName': 'John' } },
  { returnDocument: 'after' }
);
```

### Create Session
```javascript
const session = await SessionModel.create({
  userId: user._id,
  tokenHash: hashedToken,
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
});
```

---

## 🎯 Common Patterns

### Error Handling
```javascript
// Backend
router.post('/endpoint', async (req, res) => {
  try {
    // Logic
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Frontend
try {
  await someAsyncFunction();
} catch (err) {
  setError(err instanceof Error ? err.message : 'Error');
}
```

### Protected Middleware
```javascript
// backend/src/middleware/auth.js already has requireAuth
router.get('/protected', requireAuth, (req, res) => {
  const userId = req.auth.payload.userId;
  // User is authenticated
});
```

### Conditional Rendering
```jsx
{condition ? <Component /> : null}

{auth.user && <Dashboard />}

{loading && <Spinner />}
```

---

## 🧪 Testing

### Test Auth Flow
1. Signup: http://localhost:3000/signup
2. Enter test email & password
3. Should redirect to /dashboard
4. Visit /settings to change theme
5. Logout and redirect to /login

### Test API Directly
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

---

## 📂 File Organization

```
Frontend Structure:
- app/           Pages & routing
- components/    Reusable UI
- screens/       Page-level components
- context/       State management
- lib/           Utilities & API
- utils/         Helpers
- store/         Zustand state

Backend Structure:
- routes/        API endpoints
- models/        Database schemas
- middleware/    Request processors
- lib/           Utilities
- config/        Configuration
```

---

## 🔧 Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
```

### Backend (.env)
```
PORT=5000
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:3000
JWT_SECRET=your-secret-32-chars-minimum
MONGODB_URI=mongodb://127.0.0.1:27017/skillforge
```

---

## 🚨 Common Issues

### MongoDB Connection Failed
- Ensure MongoDB is running: `mongod`
- Check connection string in `.env`
- For Atlas: verify IP whitelist

### Frontend Blank Page
- Check browser console for errors
- Ensure backend is running (http://localhost:5000/api/health)
- Clear cache: `Ctrl+Shift+Delete`

### Theme Not Switching
- Check localStorage is enabled
- Not in private browsing
- Clear cookies for localhost

### 3D Logo Not Showing
- Check WebGL support: https://get.webgl.org/
- Try different browser (Chrome recommended)

---

## 📖 Documentation Files

- `SETUP_GUIDE.md` - Comprehensive setup & architecture
- `PHASE1_CHECKLIST.md` - Implementation verification
- `README.md` - Project overview
- `DELIVERY_SUMMARY.md` - What was delivered

---

## 🎓 Learning Resources

- Next.js Docs: https://nextjs.org/docs
- React Docs: https://react.dev
- Express Docs: https://expressjs.com
- MongoDB Docs: https://docs.mongodb.com
- Tailwind Docs: https://tailwindcss.com
- Framer Motion: https://www.framer.com/motion
- React Three Fiber: https://docs.pmnd.rs/react-three-fiber

---

## 🆘 Getting Help

1. Check documentation files
2. Look at existing components for patterns
3. Check `.env` files are set correctly
4. Ensure all services are running
5. Check browser console for errors
6. Run `npm install` if dependencies seem missing

---

**Last Updated**: 2026-05-07
**SkillForge AI - Phase 1 Production Ready**
