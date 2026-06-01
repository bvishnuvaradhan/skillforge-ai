# Phase 5: Together.ai Setup Guide

## Quick Start (2 minutes)

### 1. Get API Key
```bash
# Visit: https://www.together.ai/
# Sign up → Dashboard → API Keys → Copy your key
```

### 2. Add to Backend
```bash
# Edit backend/.env
TOGETHER_AI_KEY=your_key_here
```

### 3. Test Integration
```bash
cd backend
npm run dev

# In another terminal:
node test/phase5-validation.js
```

---

## What Changed

### Before (Anthropic)
- Model: Claude 3.5 Sonnet
- SDK: `@anthropic-ai/sdk`
- Key: `ANTHROPIC_API_KEY`
- Cost: $0.003/1K input tokens

### After (Together.ai)
- Model: Llama 2 70B Chat (free tier)
- Method: HTTP API + axios
- Key: `TOGETHER_AI_KEY`
- Cost: **FREE** (with free credits)

---

## Together.ai Free Credits

✅ **What you get**:
- **$5 free credits** when you sign up
- ~500+ mentor interactions with free credits
- No credit card required to start
- Credits valid for 3 months

📊 **Cost estimates**:
- Single mentor response: ~0.001 credits
- Weekly reflections (4 users): ~0.004 credits
- Gate validation run (100 interactions): ~0.1 credits

---

## Files Modified

| File | Change |
|------|--------|
| `backend/src/services/mentor-ai.service.js` | Migrated to Together.ai API |
| `backend/src/config/env.js` | Added TOGETHER_AI_KEY validation |
| `backend/.env` | Added TOGETHER_AI_KEY placeholder |
| `backend/.env.example` | Updated template |
| `backend/test/phase5-validation.js` | Updated validation tests |

---

## Setup Checklist

- [ ] Sign up at https://www.together.ai/
- [ ] Copy API key from dashboard
- [ ] Paste key into `backend/.env` → `TOGETHER_AI_KEY=`
- [ ] Run backend: `npm run dev --prefix backend`
- [ ] Validate setup: `node backend/test/phase5-validation.js`
- [ ] Check mentor endpoints respond
- [ ] Test mentor response generation
- [ ] Verify gate criteria collection

---

## Fallback Behavior

**If TOGETHER_AI_KEY is not set**:
- Mentor responses use mock data (development mode)
- No API calls made
- Good for testing UI without API cost
- Gate validation uses default metrics

**Once key is set**:
- Real Llama 2 responses generated
- Gate validation collects real metrics
- Autonomous features can be unlocked

---

## Model Choice: Llama 2 70B

Why Llama 2?
- ✅ Free on Together.ai
- ✅ Good quality for mentoring
- ✅ 70B parameter model (strong reasoning)
- ✅ Conversational and educational
- ✅ Respects system prompts well

Alternative models (if you want to upgrade):
- `meta-llama/Llama-3-70b-chat-hf` (newer, better quality)
- `mistralai/Mistral-7B-Instruct-v0.1` (faster, lighter)
- `NousResearch/Nous-Hermes-2-Mixtral-8x7B-DPO` (stronger reasoning)

---

## Troubleshooting

### "TOGETHER_AI_KEY not configured"
```bash
# Make sure .env has your key:
cat backend/.env | grep TOGETHER_AI_KEY
# Should show: TOGETHER_AI_KEY=your_actual_key
```

### "API call failed: 401 Unauthorized"
```bash
# Key is invalid or has invalid format
# Check dashboard: https://www.together.ai/dashboard/keys
# Make sure it starts with a valid pattern
```

### "Rate limit exceeded"
```bash
# You've exceeded free tier (unlikely)
# Check usage: https://www.together.ai/dashboard/usage
# Wait 24 hours or upgrade plan
```

### "Empty response from model"
```bash
# Model occasionally returns empty responses
# Mentor service has fallback mock responses
# Check mentor-ai.service.js _generateMockResponse()
```

---

## Next Steps

1. **Setup** (now): Get API key and paste into .env
2. **Validate** (5 min): Run validation test
3. **Test Endpoints** (10 min): Test mentor API endpoints
4. **Collect Metrics** (30 min): Run gate validation
5. **Phase 5 Complete** ✅

---

## Support

- Together.ai Docs: https://docs.together.ai/
- API Reference: https://docs.together.ai/reference/
- Model Library: https://www.together.ai/models
