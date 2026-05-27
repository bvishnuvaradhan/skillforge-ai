# Phase 5 Mentor System - Integration Guide

## Overview
Phase 5 introduces an AI-powered mentor system with contextual guidance, coaching, reflections, and autonomous features. All mentor functions require:
- ✅ Backend API routes (implemented)
- ✅ Frontend data providers (implemented)
- ✅ Claude AI integration (implemented)
- ⏳ Environment configuration (this guide)
- ⏳ E2E testing

## Setup Instructions

### 1. Backend Dependencies
```bash
cd backend
npm install @anthropic-ai/sdk
```

### 2. Environment Configuration

Add to `backend/.env`:
```
ANTHROPIC_API_KEY=sk-ant-...your-api-key-here...
```

To get an API key:
1. Visit https://console.anthropic.com/
2. Sign in or create account
3. Create API key in account settings
4. Add to .env file

### 3. Frontend Configuration

Update `frontend/src/lib/mentor/MentorIntegration.js` to enable AI model provider:

```javascript
import { createAIModelProvider } from './AIModelProvider';

export function initializeMentor(userId, apiBaseUrl) {
  const aiProvider = createAIModelProvider(userId, apiBaseUrl);
  
  return new MentorIntegration(
    userId,
    dataProviders,
    aiProvider  // Enable Claude AI
  );
}
```

### 4. API Base URL Configuration

Ensure frontend knows backend URL:
```javascript
// In your dashboard/app initialization
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
```

## Testing the Integration

### 1. Start Backend
```bash
cd backend
npm install  # Install @anthropic-ai/sdk if not done
npm run dev
```

### 2. Test API Endpoints
```bash
# Get mentor context
curl http://localhost:5000/api/mentor/user_123/roadmap

# Generate mentor response
curl -X POST http://localhost:5000/api/mentor/user_123/response \
  -H "Content-Type: application/json" \
  -d '{
    "systemPrompt": "You are a learning mentor...",
    "userPrompt": "Why did you recommend this topic?"
  }'
```

### 3. Start Frontend
```bash
cd frontend
npm run dev
```

### 4. Test in UI
1. Navigate to dashboard
2. Click "Why?" button on recommendation (Phase 5.0)
3. Open mentor panel and ask questions (Phase 5.1)
4. Request coaching insights (Phase 5.2)
5. Check admin console > Mentor Metrics for gate status

## System Architecture

```
User Interface (React)
    ↓
MentorIntegration.js (orchestration)
    ├─ ExplainabilityEngine
    ├─ MentorEngine (uses AIModelProvider)
    ├─ CoachingEngine
    ├─ ReflectionEngine
    ├─ SessionMonitor
    └─ ReinforcementPlanner
    ↓
AIModelProvider (calls backend)
    ↓
Backend API Routes (/api/mentor/:userId/*)
    ├─ GET /roadmap, /retention, /mastery, /dna, /forecast, /governance, /activity, /recommendation-history
    ├─ POST /response (Claude generation)
    ├─ POST /explain (Claude explanation)
    ├─ POST /insight (Claude coaching)
    └─ POST /reflection (Claude reflection)
    ↓
Claude API (Claude 3.5 Sonnet)
    ↓
Database (MongoDB - user learning data)
```

## Mentor System Features

### Phase 5.0 - Conversational Explainability ✅
- "Why?" buttons on recommendations
- Explanation types: Recommendation, Roadmap, Dependency, Retention, Forecast, Governance
- Uncertainty communication in all responses
- Evidence-based explanations

### Phase 5.1 - Mentor Core System ✅
- Full mentor conversation interface
- Context loading with 5-minute cache
- Confidence scoring (0-1 range)
- Governance constraint checking

### Phase 5.2 - Coaching & Reflection ✅
- Adaptive coaching insights (pull-based, never interrupting)
- Weekly reflections with concrete metrics
- Burnout prevention and pacing analysis
- Session planning and strategy recommendations

### Phase 5.5-5.6 - Autonomous Systems (GATED) ✅
- Reinforcement bundling (requires gate pass)
- Session intelligence with fatigue detection (requires gate pass)
- Human override controls fully implemented

### Admin Console ✅
- Mentor Metrics tab with gate validation
- Trust score tracking
- Tone compliance monitoring
- Feature status display

## Gate Validation Criteria

Before Phase 5.3+ autonomous features launch, verify:

```javascript
✓ Trust Score ≥ 0.7       (confidence consistency)
✓ User Satisfaction ≥ 60% (rating feedback)
✓ Governance Violations = 0 (policy compliance)
✓ Tone Compliance < 5%    (no guilt/pressure/manipulative)
```

Check gate status in Admin Console > Mentor Metrics

## Troubleshooting

### "Claude API not available"
- Check ANTHROPIC_API_KEY is set in backend/.env
- Verify API key is valid at console.anthropic.com
- Check backend is running on correct port

### "Cannot fetch mentor data"
- Verify backend /api/mentor/:userId/* endpoints are accessible
- Check MongoDB connection string (MONGODB_URI)
- Verify user is authenticated (JWT token valid)

### "Mentor responses are generic/mock"
- Check if Claude API key is configured
- Look for error logs in backend console
- Verify AIModelProvider is passed to MentorIntegration

### "Admin console shows no metrics"
- Mentor must generate at least one response first
- Trust metrics are calculated after responses
- Check browser console for errors

## Next Steps

1. **Environment Setup**: Add ANTHROPIC_API_KEY to backend
2. **Dependency Installation**: `npm install @anthropic-ai/sdk` in backend
3. **E2E Testing**: Test all mentor flows end-to-end
4. **User Testing**: Collect feedback for gate validation
5. **Gate Launch**: Once criteria met, enable Phase 5.3+ autonomous features

## Reference Files

- Backend routes: `backend/src/routes/mentor.js`
- AI service: `backend/src/services/mentor-ai.service.js`
- Frontend integration: `frontend/src/lib/mentor/MentorIntegration.js`
- AI provider: `frontend/src/lib/mentor/AIModelProvider.js`
- Admin console: `frontend/src/components/dashboard/AdminGovernanceConsole.jsx`
- Implementation tracker: `PHASE5_IMPLEMENTING.md`
