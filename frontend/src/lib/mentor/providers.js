// Bootstrap DataProviders singleton for the frontend
import { createDataProviders } from './DataProviders';

// By default we wire to real API endpoints (same-origin).
// If you want to use a different base URL in dev, set window.__API_BASE_URL = 'http://localhost:3001'
const useMock = false;
const apiBaseUrl = (typeof window !== 'undefined' && window.__API_BASE_URL) ? window.__API_BASE_URL : '';

const dataProviders = createDataProviders(useMock, apiBaseUrl);

export default dataProviders;
export { dataProviders };
