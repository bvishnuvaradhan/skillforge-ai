// Bootstrap AI model providers for the frontend
import { createAIModelProvider, createExplanationProvider, createInsightProvider, createReflectionProvider } from './AIModelProvider';

// Default to same-origin API unless overridden by window.__API_BASE_URL
const apiBaseUrl = (typeof window !== 'undefined' && window.__API_BASE_URL) ? window.__API_BASE_URL : '';

const aiModelProvider = createAIModelProvider('user', apiBaseUrl);
const explanationProvider = createExplanationProvider('user', apiBaseUrl);
const insightProvider = createInsightProvider('user', apiBaseUrl);
const reflectionProvider = createReflectionProvider('user', apiBaseUrl);

export default {
  aiModelProvider,
  explanationProvider,
  insightProvider,
  reflectionProvider
};

export { aiModelProvider, explanationProvider, insightProvider, reflectionProvider };
