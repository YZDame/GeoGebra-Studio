// Test setup file
import 'dotenv/config';

// Set test environment variables
process.env['NODE_ENV'] = 'test';
process.env['LOG_LEVEL'] = 'error'; // Reduce log noise during tests

// Global test timeou
jest.setTimeout(10000);
// Unit tests do not launch/download browsers. Real runtime checks live in scripts/verify-*.cjs.
jest.mock('../src/studio/browser',()=>({resolveBrowser:()=>'/mock/chrome',prepareBrowser:jest.fn()}));

jest.mock('puppeteer-core',()=>({launch:jest.fn()}));
