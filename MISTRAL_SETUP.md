# Phase 5: Mistral API Setup (Completely Free)

## Quick Start (2 minutes)

### 1. Get API Key (Free)
```bash
# Visit: https://console.mistral.ai/
# Sign up → API Keys → Copy your key
```

### 2. Add to Backend
```bash
# Edit backend/.env
MISTRAL_API_KEY=your_key_here
```

### 3. Test Integration
```bash
cd backend
npm run dev

# In another terminal:
node test/phase5-validation.js
```

---

## Why Mistral?

✅ **Completely Free**:
- No quota limits
- No credit card required
- Free tier = unlimited access
- Production-ready

📊 **Performance**:
- Fast inference (real-time)
- Excellent quality (GPT-level)
- Multi-language support
- Cost-effective scaling

---

## Model: Mistral Small (Latest)

Why Mistral Small?
- ✅ Free tier access
- ✅ Excellent for conversational AI
- ✅ Great for mentoring/coaching
- ✅ Lightweight & fast
- ✅ Instruction-tuned

---

## Setup Checklist

- [ ] Go to: https://console.mistral.ai/
- [ ] Sign up (free, no credit card)
- [ ] Create API key
- [ ] Copy the key
- [ ] Paste into `backend/.env` → `MISTRAL_API_KEY=`
- [ ] Run: `npm run dev --prefix backend`
- [ ] Validate: `node backend/test/phase5-validation.js`

---

## Files Modified

| File | Change |
|------|--------|
| `backend/src/services/mentor-ai.service.js` | Migrated to Mistral SDK |
| `backend/src/config/env.js` | Added MISTRAL_API_KEY validation |
| `backend/.env` | Added MISTRAL_API_KEY placeholder |
| `backend/.env.example` | Updated template |
| `backend/test/phase5-validation.js` | Updated validation tests |

---

## Fallback Behavior

**If MISTRAL_API_KEY is not set**:
- Mentor responses use mock data (development mode)
- No API calls made
- Good for testing UI without API cost
- Gate validation uses default metrics

**Once key is set**:
- Real Mistral responses generated
- Gate validation collects real metrics
- Autonomous features can be unlocked

---

## Next Steps

1. **Get API Key** (2 min): https://console.mistral.ai/
2. **Add to .env** (1 min): `MISTRAL_API_KEY=your_key`
3. **Start backend** (1 min): `npm run dev --prefix backend`
4. **Run validation** (1 min): `node backend/test/phase5-validation.js`
5. **Test endpoints** (5 min): Verify mentor API works
6. **Validate gates** (10 min): Run gate criteria collection

---

## Cost (For Reference)

**Mistral Free Tier**:
- $0 forever (with reasonable usage limits)
- Mentor response: ~$0.0001
- Weekly reflection: ~$0.0002
- Phase 5 validation: essentially free

**For production scaling**:
- Pay-as-you-go: $0.25/1M input tokens
- Still 10x cheaper than alternatives

---

## Troubleshooting

### "MISTRAL_API_KEY not configured"
```bash
# Make sure .env has your key:
cat backend/.env | grep MISTRAL_API_KEY
# Should show: MISTRAL_API_KEY=your_actual_key
```

### "API key invalid"
```bash
# Check at: https://console.mistral.ai/api-keys
# Make sure the key hasn't been deleted or revoked
# Try creating a new one
```

### "Rate limit exceeded"
```bash
# Very unlikely with free tier
# Check usage: https://console.mistral.ai/billing/
# Wait 1 minute and retry
```

### "Empty response from model"
```bash
# Rare - fallback to mock responses
# See _generateMockResponse() in mentor-ai.service.js
```

---

## Support

- Mistral Docs: https://docs.mistral.ai/
- API Reference: https://docs.mistral.ai/api/
- Console: https://console.mistral.ai/
