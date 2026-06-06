import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 20 }, // Ramp up to 20 virtual users
    { duration: '20s', target: 20 }, // Stay at 20 VUs for 20 seconds
    { duration: '10s', target: 0 },  // Ramp down to 0 VUs
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'], // 95% of requests must complete within 1.0s
    http_req_failed: ['rate<0.05'],    // Less than 5% of requests should fail
  },
};

export default function () {
  const url = __ENV.API_URL || 'http://localhost:5000/api/v1';

  // 1. Validate Service Health
  const healthRes = http.get(`${url}/admin/health`);
  check(healthRes, {
    'health status is 200': (r) => r.status === 200,
    'health is healthy': (r) => r.json() && r.json().status === 'healthy',
  });

  // 2. Validate Liveness Endpoint
  const liveRes = http.get(`${url}/admin/live`);
  check(liveRes, {
    'liveness status is 200': (r) => r.status === 200,
  });

  // 3. Validate Readiness Endpoint
  const readyRes = http.get(`${url}/admin/ready`);
  check(readyRes, {
    'readiness status is 200': (r) => r.status === 200,
  });

  sleep(1);
}
