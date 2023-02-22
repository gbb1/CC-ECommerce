import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';
// import { randomIntBetween, }

export const options = {
  scenarios: {
    constant_request_rate: {
      executor: 'constant-arrival-rate',
      rate: 1000,
      timeUnit: '1s',
      duration: '30s',
      preAllocatedVUs: 1000,
      maxVUs: 1000,
    },
  },
};

export default function() {
  const page = randomIntBetween(0, 5);
  const count = randomIntBetween(0, 10);
  const product = randomIntBetween(1, 1000010);
  console.log(page, count, product);

  http.get(`http://127.0.0.1:3000/r/reviews?page=${page}&count=${count}&sort=newest&product_id=1000010`);
}
