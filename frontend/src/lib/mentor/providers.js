// Bootstrap DataProviders singleton for the frontend
import { createDataProviders } from './DataProviders';

// Let `createDataProviders` decide mock vs real API:
// - If `useMock` is explicitly provided it will be honored.
// - Otherwise `createDataProviders` will consult `NEXT_PUBLIC_USE_MOCK` and NODE_ENV.
// To override the API base in development, set `window.__API_BASE_URL = 'http://localhost:3001'`.
const apiBaseUrl = (typeof window !== 'undefined' && window.__API_BASE_URL) ? window.__API_BASE_URL : '';

const dataProviders = createDataProviders(undefined, apiBaseUrl);

export default dataProviders;
export { dataProviders };
