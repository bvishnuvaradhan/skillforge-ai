# Phase 5: Google Gemini Setup (Completely Free)

## Quick Start (2 minutes)

### 1. Get API Key (Free)
```bash
# Visit: https://aistudio.google.com/apikey
# Click "Get API Key" → Create new API key
# Copy the key
```

### 2. Add to Backend
```bash
# Edit backend/.env
GOOGLE_GEMINI_KEY=your_key_here
```

### 3. Test Integration
```bash
cd backend
npm run dev

# In another terminal:
node test/phase5-validation.js
```

---

## What is Google Gemini?

✅ **Completely Free Tier**:
- Unlimited API calls (soft limit: 15 requests/minute)
- No credit card required
- Never expires
- Google's latest 2.0 Flash model
- Excellent quality for mentoring

📊 **Limits**:
- 15 requests/minute (plenty for Phase 5)
- 1 million tokens/day (enough for 1000+ interactions)
- Free forever with no upgrade required

---

## Model: Gemini 2.0 Flash

Why Gemini 2.0?
- ✅ Latest Google AI model
- ✅ Fastest inference (real-time)
- ✅ Excellent reasoning for mentoring
- ✅ Better than Claude for most tasks
- ✅ Completely free tier
- ✅ Supports system prompts

---

## Setup Checklist

- [ ] Go to: https://aistudio.google.com/apikey
- [ ] Click "Get API Key"
- [ ] Create new API key
- [ ] Copy the key
- [ ] Paste into `backend/.env` → `GOOGLE_GEMINI_KEY=`
- [ ] Run: `npm run dev --prefix backend`
- [ ] Validate: `node backend/test/phase5-validation.js`

---

## Files Modified

| File | Change |
|------|--------|
| `backend/src/services/mentor-ai.service.js` | Migrated to Google Gemini SDK |
| `backend/src/config/env.js` | Added GOOGLE_GEMINI_KEY validation |
| `backend/.env` | Added GOOGLE_GEMINI_KEY placeholder |
| `backend/.env.example` | Updated template |
| `backend/test/phase5-validation.js` | Updated validation tests |

---

## Fallback Behavior

**If GOOGLE_GEMINI_KEY is not set**:
- Mentor responses use mock data (development mode)
- No API calls made
- Good for testing UI without API cost
- Gate validation uses default metrics

**Once key is set**:
- Real Gemini 2.0 responses generated
- Gate validation collects real metrics
- Autonomous features can be unlocked

---

## Next Steps

1. **Get API Key** (2 min): https://aistudio.google.com/apikey
2. **Add to .env** (1 min): `GOOGLE_GEMINI_KEY=your_key`
3. **Start backend** (1 min): `npm run dev --prefix backend`
4. **Run validation** (1 min): `node backend/test/phase5-validation.js`
5. **Test endpoints** (5 min): Verify mentor API works
6. **Validate gates** (10 min): Run gate criteria collection

---

## Troubleshooting

### "GOOGLE_GEMINI_KEY not configured"
```bash
# Make sure .env has your key:
cat backend/.env | grep GOOGLE_GEMINI_KEY
# Should show: GOOGLE_GEMINI_KEY=AIzaSy...
```

### "API key invalid or not found"
```bash
# Check at: https://aistudio.google.com/apikey
# Make sure the key hasn't been deleted or revoked
# Try creating a new one
```

### "Quota exceeded"
```bash
# Unlikely with free tier (15 req/min limit)
# Wait a minute and retry
# Check usage at: https://aistudio.google.com/
```

### "Empty response from model"
```bash
# Rare - Gemini occasionally returns empty responses
# Mentor service has fallback mock responses
# See _generateMockResponse() in mentor-ai.service.js
```

---

## Cost Comparison

| Provider | Cost | Setup | Quality |
|----------|------|-------|---------|
| **Google Gemini** | **FREE** | **2 min** | **Excellent** |
| Anthropic Claude | $0.003/1K tokens | $5 credits | Excellent |
| Together.ai | FREE (with $5) | 5 min | Good |
| Local Ollama | FREE | 15 min | Good |

---

## What You Can Do (Free)

✅ Complete Phase 5 implementation
✅ Test all mentor features
✅ Validate gate criteria
✅ Collect real metrics
✅ Run user testing (100+ interactions)
✅ Deploy to production
✅ Scale to thousands of users

All completely free with Google Gemini's free tier!

---

## Support

- Google Gemini Docs: https://ai.google.dev/
- API Reference: https://ai.google.dev/docs
- API Key Dashboard: https://aistudio.google.com/apikey
